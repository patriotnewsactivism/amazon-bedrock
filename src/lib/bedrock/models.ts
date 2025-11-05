export interface BedrockModel {
  id: string;
  name: string;
  provider: string;
  description: string;
  capabilities: string[];
  pricing?: {
    input: string;
    output: string;
  };
}

export const BEDROCK_MODELS: BedrockModel[] = [
  // Anthropic Claude Models
  {
    id: "anthropic.claude-3-5-sonnet-20241022-v2:0",
    name: "Claude 3.5 Sonnet v2",
    provider: "Anthropic",
    description: "Most intelligent model with improved reasoning and coding",
    capabilities: ["text", "vision", "code", "analysis", "reasoning"],
    pricing: { input: "$3.00/MTok", output: "$15.00/MTok" },
  },
  {
    id: "anthropic.claude-3-5-sonnet-20240620-v1:0",
    name: "Claude 3.5 Sonnet v1",
    provider: "Anthropic",
    description: "Balanced intelligence and speed",
    capabilities: ["text", "vision", "code", "analysis"],
    pricing: { input: "$3.00/MTok", output: "$15.00/MTok" },
  },
  {
    id: "anthropic.claude-3-opus-20240229-v1:0",
    name: "Claude 3 Opus",
    provider: "Anthropic",
    description: "Most capable model for complex tasks",
    capabilities: ["text", "vision", "code", "analysis", "research"],
    pricing: { input: "$15.00/MTok", output: "$75.00/MTok" },
  },
  {
    id: "anthropic.claude-3-sonnet-20240229-v1:0",
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    description: "Balanced performance and intelligence",
    capabilities: ["text", "vision", "code"],
    pricing: { input: "$3.00/MTok", output: "$15.00/MTok" },
  },
  {
    id: "anthropic.claude-3-haiku-20240307-v1:0",
    name: "Claude 3 Haiku",
    provider: "Anthropic",
    description: "Fastest and most compact model",
    capabilities: ["text", "vision"],
    pricing: { input: "$0.25/MTok", output: "$1.25/MTok" },
  },

  // Meta Llama Models
  {
    id: "meta.llama3-2-90b-instruct-v1:0",
    name: "Llama 3.2 90B Instruct",
    provider: "Meta",
    description: "Large multimodal model with vision capabilities",
    capabilities: ["text", "vision", "code", "multimodal"],
    pricing: { input: "$0.265/MTok", output: "$0.354/MTok" },
  },
  {
    id: "meta.llama3-2-11b-instruct-v1:0",
    name: "Llama 3.2 11B Instruct",
    provider: "Meta",
    description: "Efficient multimodal model",
    capabilities: ["text", "vision", "multimodal"],
    pricing: { input: "$0.16/MTok", output: "$0.24/MTok" },
  },
  {
    id: "meta.llama3-1-405b-instruct-v1:0",
    name: "Llama 3.1 405B Instruct",
    provider: "Meta",
    description: "Largest and most capable Llama model",
    capabilities: ["text", "code", "reasoning"],
    pricing: { input: "$0.532/MTok", output: "$1.6/MTok" },
  },
  {
    id: "meta.llama3-1-70b-instruct-v1:0",
    name: "Llama 3.1 70B Instruct",
    provider: "Meta",
    description: "High performance open model",
    capabilities: ["text", "code"],
    pricing: { input: "$0.265/MTok", output: "$0.354/MTok" },
  },
  {
    id: "meta.llama3-1-8b-instruct-v1:0",
    name: "Llama 3.1 8B Instruct",
    provider: "Meta",
    description: "Efficient and fast model",
    capabilities: ["text", "code"],
    pricing: { input: "$0.22/MTok", output: "$0.22/MTok" },
  },

  // Amazon Titan Models
  {
    id: "amazon.titan-text-premier-v1:0",
    name: "Titan Text Premier",
    provider: "Amazon",
    description: "Advanced text generation with RAG support",
    capabilities: ["text", "rag", "summarization"],
    pricing: { input: "$0.50/MTok", output: "$1.50/MTok" },
  },
  {
    id: "amazon.titan-text-express-v1",
    name: "Titan Text Express",
    provider: "Amazon",
    description: "Fast and efficient text generation",
    capabilities: ["text", "summarization"],
    pricing: { input: "$0.20/MTok", output: "$0.60/MTok" },
  },
  {
    id: "amazon.titan-text-lite-v1",
    name: "Titan Text Lite",
    provider: "Amazon",
    description: "Lightweight text generation",
    capabilities: ["text"],
    pricing: { input: "$0.15/MTok", output: "$0.20/MTok" },
  },

  // Mistral AI Models
  {
    id: "mistral.mistral-large-2407-v1:0",
    name: "Mistral Large 2",
    provider: "Mistral AI",
    description: "Top-tier reasoning and code generation",
    capabilities: ["text", "code", "reasoning", "multilingual"],
    pricing: { input: "$3.00/MTok", output: "$9.00/MTok" },
  },
  {
    id: "mistral.mistral-small-2402-v1:0",
    name: "Mistral Small",
    provider: "Mistral AI",
    description: "Efficient model for simpler tasks",
    capabilities: ["text", "code"],
    pricing: { input: "$1.00/MTok", output: "$3.00/MTok" },
  },
  {
    id: "mistral.mixtral-8x7b-instruct-v0:1",
    name: "Mixtral 8x7B Instruct",
    provider: "Mistral AI",
    description: "Mixture of experts model",
    capabilities: ["text", "code", "multilingual"],
    pricing: { input: "$0.45/MTok", output: "$0.70/MTok" },
  },

  // Cohere Models
  {
    id: "cohere.command-r-plus-v1:0",
    name: "Command R+",
    provider: "Cohere",
    description: "Advanced RAG and tool use capabilities",
    capabilities: ["text", "rag", "tool-use", "multilingual"],
    pricing: { input: "$3.00/MTok", output: "$15.00/MTok" },
  },
  {
    id: "cohere.command-r-v1:0",
    name: "Command R",
    provider: "Cohere",
    description: "Balanced RAG and conversational AI",
    capabilities: ["text", "rag", "tool-use"],
    pricing: { input: "$0.50/MTok", output: "$1.50/MTok" },
  },
  {
    id: "cohere.command-text-v14",
    name: "Command",
    provider: "Cohere",
    description: "Conversational AI model",
    capabilities: ["text", "conversation"],
    pricing: { input: "$1.50/MTok", output: "$2.00/MTok" },
  },

  // AI21 Labs Models
  {
    id: "ai21.jamba-instruct-v1:0",
    name: "Jamba Instruct",
    provider: "AI21 Labs",
    description: "Hybrid SSM-Transformer model with long context",
    capabilities: ["text", "long-context"],
    pricing: { input: "$0.50/MTok", output: "$0.70/MTok" },
  },
  {
    id: "ai21.j2-ultra-v1",
    name: "Jurassic-2 Ultra",
    provider: "AI21 Labs",
    description: "Most capable Jurassic model",
    capabilities: ["text", "instruction-following"],
    pricing: { input: "$0.0188/1K", output: "$0.0188/1K" },
  },
  {
    id: "ai21.j2-mid-v1",
    name: "Jurassic-2 Mid",
    provider: "AI21 Labs",
    description: "Balanced Jurassic model",
    capabilities: ["text"],
    pricing: { input: "$0.0125/1K", output: "$0.0125/1K" },
  },
];

export function getModelsByProvider(provider: string): BedrockModel[] {
  return BEDROCK_MODELS.filter((model) => model.provider === provider);
}

export function getModelById(id: string): BedrockModel | undefined {
  return BEDROCK_MODELS.find((model) => model.id === id);
}

export function getAllProviders(): string[] {
  return Array.from(new Set(BEDROCK_MODELS.map((model) => model.provider)));
}

export function getModelsByCapability(capability: string): BedrockModel[] {
  return BEDROCK_MODELS.filter((model) =>
    model.capabilities.includes(capability)
  );
}
