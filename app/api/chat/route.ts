import { NextRequest, NextResponse } from "next/server";
import { BedrockRuntimeClient, InvokeModelWithResponseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatRequest {
  messages: Message[];
  provider?: "bedrock" | "openai" | "anthropic";
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

type BedrockModelFamily = "anthropic" | "meta" | "mistral" | "cohere" | "unknown";

function getBedrockModelFamily(modelId: string): BedrockModelFamily {
  if (modelId.startsWith("anthropic.")) return "anthropic";
  if (modelId.startsWith("meta.")) return "meta";
  if (modelId.startsWith("mistral.")) return "mistral";
  if (modelId.startsWith("cohere.")) return "cohere";
  return "unknown";
}

function buildMetaPrompt(conversation: Message[], systemMessage?: string) {
  const segments: string[] = ["<|begin_of_text|>"];

  if (systemMessage) {
    segments.push(`<|start_header_id|>system<|end_header_id|>\n${systemMessage}<|eot_id|>`);
  }

  for (const message of conversation) {
    const headerRole = message.role === "assistant" ? "assistant" : "user";
    segments.push(
      `<|start_header_id|>${headerRole}<|end_header_id|>\n${message.content}<|eot_id|>`
    );
  }

  segments.push(`<|start_header_id|>assistant<|end_header_id|>\n`);

  return segments.join("");
}

function buildBedrockBody(
  family: BedrockModelFamily,
  messages: Message[],
  temperature?: number,
  max_tokens?: number
) {
  const systemMessage = messages.find(m => m.role === "system")?.content;
  const conversation = messages.filter(m => m.role !== "system");

  switch (family) {
    case "anthropic": {
      const anthropicMessages = conversation.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const body: Record<string, unknown> = {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: max_tokens || 4096,
        temperature: temperature ?? 0.7,
        messages: anthropicMessages,
      };

      if (systemMessage) {
        body.system = systemMessage;
      }

      return body;
    }
    case "meta": {
      const prompt = buildMetaPrompt(conversation, systemMessage);
      return {
        prompt,
        temperature: temperature ?? 0.7,
        top_p: 0.9,
        max_gen_len: max_tokens || 1024,
      };
    }
    case "mistral": {
      const mistralMessages = [] as { role: string; content: string }[];
      if (systemMessage) {
        mistralMessages.push({ role: "system", content: systemMessage });
      }
      for (const message of conversation) {
        mistralMessages.push({ role: message.role, content: message.content });
      }
      return {
        messages: mistralMessages,
        max_tokens: max_tokens || 4096,
        temperature: temperature ?? 0.7,
        top_p: 0.9,
      };
    }
    case "cohere": {
      const chatHistory = [] as { role: string; message: string }[];
      const history = conversation.slice(0, -1);
      for (const item of history) {
        chatHistory.push({
          role: item.role === "assistant" ? "CHATBOT" : "USER",
          message: item.content,
        });
      }

      const latest = conversation[conversation.length - 1];
      const body: Record<string, unknown> = {
        message: latest?.content || "",
        chat_history: chatHistory,
        temperature: temperature ?? 0.7,
        max_tokens: max_tokens || 4096,
      };

      if (systemMessage) {
        body.preamble = systemMessage;
      }

      return body;
    }
    default: {
      return {
        inputText: conversation.map(m => `${m.role}: ${m.content}`).join("\n"),
        temperature: temperature ?? 0.7,
        maxTokens: max_tokens || 4096,
      };
    }
  }
}

function extractTextDelta(chunk: any): string | undefined {
  if (!chunk || typeof chunk !== "object") {
    return undefined;
  }

  if (typeof chunk.generation === "string" && chunk.generation) {
    return chunk.generation;
  }

  if (typeof chunk.text === "string" && chunk.text) {
    return chunk.text;
  }

  if (typeof chunk.delta === "string" && chunk.delta) {
    return chunk.delta;
  }

  if (chunk.delta?.text) {
    return chunk.delta.text;
  }

  if (chunk.delta?.type === "text_delta" && chunk.delta?.text) {
    return chunk.delta.text;
  }

  if (Array.isArray(chunk.outputs)) {
    const textFromOutputs = chunk.outputs
      .map((item: any) => item?.content || item?.text)
      .filter((value: unknown): value is string => typeof value === "string");
    if (textFromOutputs.length > 0) {
      return textFromOutputs.join("");
    }
  }

  if (chunk.type === "text-generation" && typeof chunk?.text === "string") {
    return chunk.text;
  }

  if (chunk.message?.content && Array.isArray(chunk.message.content)) {
    const textPieces = chunk.message.content
      .map((part: any) => part?.text)
      .filter((value: unknown): value is string => typeof value === "string");
    if (textPieces.length > 0) {
      return textPieces.join("");
    }
  }

  return undefined;
}

function shouldEndStream(chunk: any): boolean {
  if (!chunk || typeof chunk !== "object") {
    return false;
  }

  if (chunk.type === "message_stop" || chunk.type === "stream_end") {
    return true;
  }

  if (typeof chunk.stop_reason === "string" && chunk.stop_reason) {
    return true;
  }

  if (chunk.type === "output_text" && chunk.stop_reason) {
    return true;
  }

  if (chunk.event_type === "message_end") {
    return true;
  }

  return false;
}

async function handleBedrock(messages: Message[], model?: string, temperature?: number, max_tokens?: number) {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  const modelId = model || process.env.BEDROCK_MODEL || "anthropic.claude-3-5-sonnet-20241022-v2:0";
  const family = getBedrockModelFamily(modelId);
  const body = buildBedrockBody(family, messages, temperature, max_tokens);

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await client.send(command);

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!response.body) {
          throw new Error("No response body");
        }

        for await (const event of response.body) {
          if (!event.chunk?.bytes) {
            continue;
          }

          const raw = decoder.decode(event.chunk.bytes);
          if (!raw.trim()) {
            continue;
          }

          let chunk: any;
          try {
            chunk = JSON.parse(raw);
          } catch (parseError) {
            console.warn("Unable to parse Bedrock chunk", parseError);
            continue;
          }

          const textDelta = extractTextDelta(chunk);
          if (textDelta) {
            controller.enqueue(encoder.encode(textDelta));
          }

          if (shouldEndStream(chunk)) {
            break;
          }
        }
      } catch (error) {
        console.error("Bedrock streaming error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

async function handleOpenAI(messages: Message[], model?: string, temperature?: number, max_tokens?: number) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured");
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: model || "gpt-4o",
    messages: messages as any,
    temperature: temperature ?? 0.7,
    max_tokens: max_tokens || 4096,
    stream: true,
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
      } catch (error) {
        console.error("OpenAI streaming error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

async function handleAnthropic(messages: Message[], model?: string, temperature?: number, max_tokens?: number) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Anthropic API key not configured");
  }

  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const systemMessage = messages.find(m => m.role === "system")?.content;
  const anthropicMessages = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role,
    content: m.content,
  }));

  const stream = await anthropic.messages.stream({
    model: model || "claude-3-5-sonnet-20241022",
    max_tokens: max_tokens || 4096,
    temperature: temperature ?? 0.7,
    messages: anthropicMessages as any,
    ...(systemMessage && { system: systemMessage }),
  });

  const encoder = new TextEncoder();
  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const chunk of stream) {
          if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
            controller.enqueue(encoder.encode(chunk.delta.text));
          }
        }
      } catch (error) {
        console.error("Anthropic streaming error:", error);
        controller.error(error);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { messages, provider = "bedrock", model, temperature, max_tokens } = body;

    if (!messages || messages.length === 0) {
      return NextResponse.json(
        { error: "Messages are required" },
        { status: 400 }
      );
    }

    switch (provider) {
      case "bedrock":
        return await handleBedrock(messages, model, temperature, max_tokens);
      case "openai":
        return await handleOpenAI(messages, model, temperature, max_tokens);
      case "anthropic":
        return await handleAnthropic(messages, model, temperature, max_tokens);
      default:
        return NextResponse.json(
          { error: `Unsupported provider: ${provider}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    providers: ["bedrock", "openai", "anthropic"],
    message: "Multi-provider AI Chat API",
  });
}
