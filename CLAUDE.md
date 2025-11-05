# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 16 application that provides a web interface for interacting with AWS Bedrock AI models. The application supports multiple AI model providers (Anthropic, Meta, Amazon, Mistral AI, Cohere, and AI21 Labs) through a unified API interface.

## Development Commands

```bash
# Run development server (uses webpack instead of turbopack)
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The development server runs on http://localhost:3000 by default. The `--webpack` flag is explicitly used for both dev and build commands.

## Environment Variables

Required environment variables (create `.env.local` file):
- `AWS_REGION` - AWS region for Bedrock (defaults to "us-east-1")
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key

## Architecture

### Core Components

**Bedrock Client** (`src/lib/bedrock/client.ts`):
- `BedrockClient` class handles all AWS Bedrock API interactions
- Supports both streaming and non-streaming inference via `invokeModel()` and `invokeModelStream()`
- Model-specific request/response formatting for different providers (Claude, Llama, Titan, Mistral, Cohere, AI21)
- Each model provider has different request body formats and response structures that must be handled differently

**Model Configuration** (`src/lib/bedrock/models.ts`):
- `BEDROCK_MODELS` array contains comprehensive metadata for all supported models
- Helper functions: `getModelsByProvider()`, `getModelById()`, `getAllProviders()`, `getModelsByCapability()`
- Model metadata includes pricing, capabilities, descriptions, and provider information

**API Routes**:
- `/api/invoke` - POST endpoint for invoking models (supports both streaming and non-streaming via `stream` parameter)
- `/api/models` - GET endpoint for fetching available models and providers

**UI Components**:
- `ChatInterface` - Main chat UI with message history and auto-scroll
- `ModelSelector` - Provider-filtered model selection interface with capability badges

### Type System

All shared types are defined in `src/lib/types.ts`. Key interfaces include:
- `Message` - Chat message structure
- `ConversationHistory` - Conversation tracking
- `AgentTask` - Task execution tracking
- `CodingAgent`, `AIEmployee`, `Chatbot` - Agent configurations
- `ArticleTemplate`, `ResearchQuery`, `LegalDocument`, `WebsiteConfig` - Domain-specific types

These types suggest the codebase is designed to support multiple AI-powered use cases beyond simple chat (coding agents, research, legal documents, website generation, etc.).

### Styling

- Uses Tailwind CSS v4 with custom theme configuration in `globals.css`
- Dark mode support via `prefers-color-scheme`
- Geist Sans and Geist Mono fonts from Google Fonts
- Custom CSS variables: `--background`, `--foreground`, `--font-geist-sans`, `--font-geist-mono`

## Key Implementation Details

### Model Request Formatting

When adding support for new models or modifying existing ones, note that each provider requires different request body formats:
- **Anthropic Claude**: Uses `messages` array with `anthropic_version`
- **Meta Llama**: Uses `prompt` with `max_gen_len`
- **Amazon Titan**: Uses `inputText` with nested `textGenerationConfig`
- **Mistral**: Uses `prompt` with `max_tokens`
- **Cohere**: Uses `prompt` with `max_tokens`
- **AI21**: Uses `prompt` with `maxTokens`

Refer to `formatRequestBody()` in `client.ts` for exact schemas.

### Streaming Response Handling

Streaming is implemented using Server-Sent Events (SSE). The `/api/invoke` endpoint:
1. Checks for `stream` parameter in request body
2. Creates a `ReadableStream` that encodes chunks as `data: {JSON}\n\n`
3. Sends `data: [DONE]\n\n` when complete
4. Different models return chunks in different formats (handled by `extractTextFromChunk()`)

### Path Aliases

The project uses `@/*` path alias mapping to `./src/*` (configured in `tsconfig.json`). Always use this alias for imports from the src directory.

## Testing AWS Bedrock Integration

Since this app interfaces with AWS Bedrock:
1. Ensure AWS credentials are properly configured in `.env.local`
2. Verify the AWS account has Bedrock model access enabled (models must be enabled in AWS Console)
3. Test with smaller/cheaper models first (e.g., Claude Haiku, Titan Text Lite)
4. Check AWS region supports the desired models
