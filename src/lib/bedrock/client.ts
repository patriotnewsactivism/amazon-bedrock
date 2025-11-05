import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

export interface BedrockConfig {
  region: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

export interface ModelInvokeParams {
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export class BedrockClient {
  private client: BedrockRuntimeClient;

  constructor(config?: BedrockConfig) {
    this.client = new BedrockRuntimeClient({
      region: config?.region || process.env.AWS_REGION || "us-east-1",
      credentials: config?.credentials || {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
      },
    });
  }

  async invokeModel(modelId: string, prompt: string, params?: ModelInvokeParams) {
    const body = this.formatRequestBody(modelId, prompt, params);

    const command = new InvokeModelCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    try {
      const response = await this.client.send(command);
      const responseBody = JSON.parse(new TextDecoder().decode(response.body));
      return this.formatResponse(modelId, responseBody);
    } catch (error) {
      console.error("Error invoking model:", error);
      throw error;
    }
  }

  async invokeModelStream(
    modelId: string,
    prompt: string,
    params?: ModelInvokeParams,
    onChunk?: (text: string) => void
  ) {
    const body = this.formatRequestBody(modelId, prompt, params);

    const command = new InvokeModelWithResponseStreamCommand({
      modelId,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(body),
    });

    try {
      const response = await this.client.send(command);
      let fullText = "";

      if (response.body) {
        for await (const chunk of response.body) {
          if (chunk.chunk?.bytes) {
            const chunkData = JSON.parse(
              new TextDecoder().decode(chunk.chunk.bytes)
            );
            const text = this.extractTextFromChunk(modelId, chunkData);
            if (text) {
              fullText += text;
              onChunk?.(text);
            }
          }
        }
      }

      return fullText;
    } catch (error) {
      console.error("Error streaming model:", error);
      throw error;
    }
  }

  private formatRequestBody(modelId: string, prompt: string, params?: ModelInvokeParams) {
    // Claude models (Anthropic)
    if (modelId.includes("anthropic.claude")) {
      return {
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: params?.maxTokens || 4096,
        temperature: params?.temperature || 0.7,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      };
    }

    // Llama models (Meta)
    if (modelId.includes("meta.llama")) {
      return {
        prompt,
        max_gen_len: params?.maxTokens || 2048,
        temperature: params?.temperature || 0.7,
        top_p: params?.topP || 0.9,
      };
    }

    // Titan models (Amazon)
    if (modelId.includes("amazon.titan")) {
      return {
        inputText: prompt,
        textGenerationConfig: {
          maxTokenCount: params?.maxTokens || 4096,
          temperature: params?.temperature || 0.7,
          topP: params?.topP || 0.9,
        },
      };
    }

    // Mistral models
    if (modelId.includes("mistral")) {
      return {
        prompt,
        max_tokens: params?.maxTokens || 4096,
        temperature: params?.temperature || 0.7,
        top_p: params?.topP || 0.9,
      };
    }

    // Cohere models
    if (modelId.includes("cohere")) {
      return {
        prompt,
        max_tokens: params?.maxTokens || 4096,
        temperature: params?.temperature || 0.7,
      };
    }

    // AI21 models
    if (modelId.includes("ai21")) {
      return {
        prompt,
        maxTokens: params?.maxTokens || 4096,
        temperature: params?.temperature || 0.7,
      };
    }

    // Default fallback
    return {
      prompt,
      max_tokens: params?.maxTokens || 4096,
      temperature: params?.temperature || 0.7,
    };
  }

  private formatResponse(modelId: string, responseBody: Record<string, unknown>) {
    // Claude models
    if (modelId.includes("anthropic.claude")) {
      const content = responseBody.content as Array<{ text: string }> | undefined;
      return {
        text: content?.[0]?.text || "",
        raw: responseBody,
      };
    }

    // Llama models
    if (modelId.includes("meta.llama")) {
      return {
        text: (responseBody.generation as string) || "",
        raw: responseBody,
      };
    }

    // Titan models
    if (modelId.includes("amazon.titan")) {
      const results = responseBody.results as Array<{ outputText: string }> | undefined;
      return {
        text: results?.[0]?.outputText || "",
        raw: responseBody,
      };
    }

    // Mistral models
    if (modelId.includes("mistral")) {
      const outputs = responseBody.outputs as Array<{ text: string }> | undefined;
      return {
        text: outputs?.[0]?.text || "",
        raw: responseBody,
      };
    }

    // Cohere models
    if (modelId.includes("cohere")) {
      const generations = responseBody.generations as Array<{ text: string }> | undefined;
      return {
        text: generations?.[0]?.text || "",
        raw: responseBody,
      };
    }

    // AI21 models
    if (modelId.includes("ai21")) {
      const completions = responseBody.completions as Array<{ data: { text: string } }> | undefined;
      return {
        text: completions?.[0]?.data?.text || "",
        raw: responseBody,
      };
    }

    return {
      text: (responseBody.completion as string) || (responseBody.text as string) || "",
      raw: responseBody,
    };
  }

  private extractTextFromChunk(modelId: string, chunkData: Record<string, unknown>): string {
    // Claude models
    if (modelId.includes("anthropic.claude")) {
      if (chunkData.type === "content_block_delta") {
        const delta = chunkData.delta as { text?: string } | undefined;
        return delta?.text || "";
      }
      return "";
    }

    // Llama models
    if (modelId.includes("meta.llama")) {
      return (chunkData.generation as string) || "";
    }

    // Titan models
    if (modelId.includes("amazon.titan")) {
      return (chunkData.outputText as string) || "";
    }

    // Mistral models
    if (modelId.includes("mistral")) {
      const outputs = chunkData.outputs as Array<{ text: string }> | undefined;
      return outputs?.[0]?.text || "";
    }

    return (chunkData.text as string) || (chunkData.completion as string) || "";
  }
}

export const bedrockClient = new BedrockClient();
