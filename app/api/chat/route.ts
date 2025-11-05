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

async function handleBedrock(messages: Message[], model?: string, temperature?: number, max_tokens?: number) {
  const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  });

  const modelId = model || process.env.BEDROCK_MODEL || "anthropic.claude-3-5-sonnet-20241022-v2:0";

  // Convert messages to Anthropic format (Bedrock Claude models use Anthropic format)
  const anthropicMessages = messages.filter(m => m.role !== "system").map(m => ({
    role: m.role,
    content: m.content,
  }));

  const systemMessage = messages.find(m => m.role === "system")?.content;

  const body: any = {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: max_tokens || 4096,
    temperature: temperature ?? 0.7,
    messages: anthropicMessages,
  };

  if (systemMessage) {
    body.system = systemMessage;
  }

  const command = new InvokeModelWithResponseStreamCommand({
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify(body),
  });

  const response = await client.send(command);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      try {
        if (!response.body) {
          throw new Error("No response body");
        }

        for await (const event of response.body) {
          if (event.chunk?.bytes) {
            const chunk = JSON.parse(new TextDecoder().decode(event.chunk.bytes));

            if (chunk.type === "content_block_delta" && chunk.delta?.text) {
              controller.enqueue(encoder.encode(chunk.delta.text));
            } else if (chunk.type === "message_stop") {
              break;
            }
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
