# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 14 application that provides a web interface for interacting with multiple AI providers:
- **AWS Bedrock** - Access to Claude models via AWS Bedrock (supports various Claude 3.x models, Llama, Mistral, Cohere)
- **OpenAI** - Direct access to GPT-4 and GPT-3.5 models
- **Anthropic** - Direct API access to Claude models

The application features:
- Real-time streaming chat interface
- Conversation history with localStorage persistence
- Model selection per provider
- Advanced settings (temperature, max tokens, system prompts)
- Dark mode support
- Conversation export functionality

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint
```

The development server runs on http://localhost:3000 by default.

## Environment Variables

Required environment variables (create `.env.local` file):

**For AWS Bedrock (required for Bedrock provider):**
- `AWS_REGION` - AWS region for Bedrock (defaults to "us-east-1")
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret access key
- `BEDROCK_MODEL` - Default Bedrock model (optional, defaults to "anthropic.claude-3-5-sonnet-20241022-v2:0")

**For OpenAI (optional, required for OpenAI provider):**
- `OPENAI_API_KEY` - OpenAI API key

**For Anthropic Direct (optional, required for Anthropic provider):**
- `ANTHROPIC_API_KEY` - Anthropic API key

**App Configuration:**
- `NEXT_PUBLIC_DEFAULT_PROVIDER` - Default provider selection (optional)

## Architecture

### Core Components

**API Route** (`app/api/chat/route.ts`):
- Single unified endpoint handling all three providers
- POST `/api/chat` - Main chat endpoint with streaming support
  - Accepts: `messages`, `provider`, `model`, `temperature`, `max_tokens`
  - Returns streaming text response
- GET `/api/chat` - Health check endpoint
- Three provider handlers:
  - `handleBedrock()` - AWS Bedrock integration using `@aws-sdk/client-bedrock-runtime`
  - `handleOpenAI()` - OpenAI integration using `openai` SDK
  - `handleAnthropic()` - Anthropic Direct API using `@anthropic-ai/sdk`

**Main Page** (`app/page.tsx`):
- Full-featured chat interface with:
  - Provider selection (Bedrock, OpenAI, Anthropic)
  - Dynamic model selection based on provider
  - Conversation history sidebar with localStorage persistence
  - Settings panel for temperature, max tokens, and system prompts
  - Markdown rendering for assistant responses (using react-markdown)
  - Real-time streaming message display
  - Conversation export to JSON

**Layout** (`app/layout.tsx`):
- Root layout with metadata configuration
- Imports global styles from `globals.css`

### Type System

Types are defined inline within each file:
- `Message` - Chat message with role ("user" | "assistant" | "system") and content
- `Conversation` - Conversation with id, title, messages array, and timestamp
- `ChatRequest` - API request interface with messages, provider, model, and parameters

### Styling

- Uses Tailwind CSS v3 with custom theme configuration in `globals.css`
- Dark mode support via `prefers-color-scheme` media query
- Custom CSS variables: `--background`, `--foreground`
- Custom scrollbar styling for better UX
- Responsive gradient backgrounds

## Key Implementation Details

### Bedrock Integration (app/api/chat/route.ts:22-96)

The Bedrock handler currently only supports Anthropic Claude models using the Anthropic message format:
- Uses `@aws-sdk/client-bedrock-runtime` with `InvokeModelWithResponseStreamCommand`
- Converts messages to Anthropic format (filters out system messages from array, passes as separate `system` parameter)
- Request body format:
  ```typescript
  {
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: number,
    temperature: number,
    messages: Array<{role: string, content: string}>,
    system?: string  // optional system prompt
  }
  ```
- Streams responses by parsing `content_block_delta` events with `delta.text` chunks
- Terminates on `message_stop` event

**Note:** While the UI lists other models (Llama, Mistral, Cohere), the current API implementation only properly handles Anthropic Claude models. Other models would require different request/response formats.

### OpenAI Integration (app/api/chat/route.ts:98-141)

- Uses the official `openai` npm package
- Supports all message types including system messages
- Streams responses using the OpenAI streaming API
- Extracts text from `chunk.choices[0]?.delta?.content`

### Anthropic Direct Integration (app/api/chat/route.ts:143-191)

- Uses the official `@anthropic-ai/sdk` package
- Separates system messages from the messages array (same format as Bedrock)
- Uses the Anthropic streaming API via `anthropic.messages.stream()`
- Extracts text from `content_block_delta` events with `delta.text`

### Streaming Response Handling

All three providers return streaming text responses:
1. Create a `ReadableStream` with TextEncoder
2. Stream chunks directly as plain text (not JSON or SSE format)
3. Client reads the stream using `response.body.getReader()`
4. Client decodes chunks with `TextDecoder` and appends to message
5. Stream automatically closes when complete

### Path Aliases

The project uses `@/*` path alias mapping to the project root (configured in `tsconfig.json`). This allows imports like `@/app/globals.css`.

## Available Models

**Bedrock Models** (only Claude models fully supported in current implementation):
- Claude 3.5 Sonnet v2, Claude 3.5 Sonnet v1
- Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- Llama 3.2 (90B, 11B), Llama 3.1 (405B, 70B) - listed but not fully implemented
- Mistral Large 2, Mixtral 8x7B - listed but not fully implemented
- Cohere Command R+, Command R - listed but not fully implemented

**OpenAI Models:**
- GPT-4 Omni, GPT-4 Omni Mini, GPT-4 Turbo, GPT-3.5 Turbo

**Anthropic Models:**
- Claude 3.5 Sonnet (Oct 2024, June 2024)
- Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku

## Testing

### Prerequisites
1. **AWS Bedrock**: Ensure AWS credentials are configured in `.env.local` and models are enabled in AWS Console
2. **OpenAI**: Add `OPENAI_API_KEY` to `.env.local`
3. **Anthropic**: Add `ANTHROPIC_API_KEY` to `.env.local`

### Running Tests
```bash
# Lint the code
npm run lint

# Build and check for type errors
npm run build

# Run development server
npm run dev
```

### Manual Testing
1. Start the dev server and open http://localhost:3000
2. Select a provider and model
3. Send a test message
4. Verify streaming response works correctly
5. Test conversation history, export, and settings features
