# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **minimal Next.js 14 application** optimized for edge deployment that provides a web interface for interacting with AWS Bedrock AI models. The application uses a lightweight, edge-compatible approach with `aws4fetch` for request signing instead of the full AWS SDK, making it ideal for serverless and edge environments.

**Key Characteristics:**
- Single-page chat interface with simple UI
- Edge runtime API route for AWS Bedrock integration
- Python CLI tool for command-line Bedrock access
- Production-ready deployment configurations (Docker, Google Cloud, Vercel)
- No complex component libraries or state management
- Minimal dependencies for fast cold starts

## Development Commands

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

The development server runs on http://localhost:3000 by default.

**Note:** There is no linter script configured in package.json. ESLint config exists but `npm run lint` will fail.

## Environment Variables

Required environment variables (create `.env.local` file):

```bash
# Primary environment variables
MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0
BEDROCK_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_SESSION_TOKEN=  # Optional, for temporary credentials

# Alternative naming (for compatibility)
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20240620-v1:0
AWS_REGION=us-east-1
```

The API route will check for environment variables in this order of precedence:
1. `MODEL_ID` or `BEDROCK_MODEL` (for model selection)
2. `BEDROCK_REGION` or `AWS_REGION` (for region)

## Architecture

### Directory Structure

```
/home/user/amazon-bedrock/
├── app/                        # Next.js App Router
│   ├── api/
│   │   └── chat/
│   │       └── route.ts        # Edge API route (POST /api/chat)
│   ├── bedrock_cli.py          # Python CLI tool
│   ├── globals.css             # Minimal global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Chat UI (home page)
├── iam/
│   └── bedrock-invoke-policy.json  # IAM policy for Bedrock access
├── .claude/                    # Claude Code configuration
├── Dockerfile                  # Multi-stage production build
├── cloudbuild.yaml            # Google Cloud Build configuration
├── vercel.json                # Vercel deployment config
├── deploy-bedrock-agent.ps1   # Windows PowerShell deployment script
├── DEPLOYMENT.md              # Comprehensive deployment guide
└── [config files]             # Standard Next.js configs
```

### Core Components

#### API Route: `/api/chat` (app/api/chat/route.ts)

**Runtime:** Edge (Vercel Edge Functions / Cloudflare Workers compatible)

**Key Implementation Details:**
- Exports `export const runtime = 'edge'` for edge deployment
- Uses `aws4fetch` library for AWS Signature Version 4 signing
- No AWS SDK dependency (edge-compatible approach)
- Makes direct HTTPS requests to Bedrock Runtime API
- Endpoint: `https://bedrock-runtime.{region}.amazonaws.com/model/{modelId}/invoke`

**Request Format:**
```typescript
POST /api/chat
Content-Type: application/json

{
  "prompt": "Hello, how are you?",
  // OR
  "messages": [
    { "role": "user", "content": "Hello" }
  ]
}
```

**Response Format:**
```json
{
  "response": "I'm doing well, thank you for asking!",
  "modelId": "anthropic.claude-3-5-sonnet-20240620-v1:0"
}
```

**Error Handling:**
- Returns 400 for missing prompt/messages
- Returns 500 for AWS credential or API errors
- Includes error messages in response body

**Model Support:**
Currently hardcoded to use Claude 3.5 Sonnet but can be changed via `MODEL_ID` environment variable. The API constructs Bedrock request bodies in Claude's message format:

```typescript
{
  anthropic_version: "bedrock-2023-05-31",
  max_tokens: 2048,
  messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
}
```

**Important:** This implementation is Claude-specific. To support other model providers (Llama, Titan, Mistral, etc.), you'll need to add request body formatting logic for each provider's schema.

#### Frontend: Home Page (app/page.tsx)

**Component Type:** Client Component (`'use client'`)

**Features:**
- Simple textarea input for user prompts
- Send button with loading state
- Display area for AI responses
- Error message display
- Inline styles (no component library)

**State Management:**
```typescript
const [prompt, setPrompt] = useState('')
const [response, setResponse] = useState('')
const [loading, setLoading] = useState(false)
const [error, setError] = useState('')
```

**Styling Approach:**
- Inline style objects
- No Tailwind classes used (despite Tailwind being configured)
- Simple centered layout with max-width container
- Minimal design with focus on functionality

#### Python CLI Tool (app/bedrock_cli.py)

A standalone command-line interface for AWS Bedrock that uses boto3.

**Features:**
- Streaming and non-streaming inference
- Converse API (provider-agnostic)
- Environment diagnostics with `--doctor` flag
- Colored output for better readability
- Comprehensive error handling with hints

**Usage:**
```bash
# Basic usage
python app/bedrock_cli.py "What is the capital of France?"

# Streaming mode
python app/bedrock_cli.py "Tell me a story" --stream

# Specify model
python app/bedrock_cli.py "Hello" --model-id anthropic.claude-3-haiku-20240307-v1:0

# Environment check
python app/bedrock_cli.py --doctor
```

**Requirements:**
- boto3
- AWS credentials configured (env vars or ~/.aws/credentials)
- Bedrock model access enabled in AWS Console

### Styling

**Current State:**
- Minimal CSS in `app/globals.css` (26 lines)
- System font stack (no custom fonts despite Geist references in config)
- Light background: #f9fafb
- No dark mode implementation
- **Tailwind CSS is configured but NOT used**

**Tailwind Configuration:**
- `tailwind.config.ts` exists with custom colors
- `postcss.config.js` includes Tailwind plugin
- BUT: No Tailwind classes in actual components
- If adding Tailwind, you'll need to replace inline styles in page.tsx

### TypeScript Configuration

**Important:** The project does NOT use path aliases despite what older documentation might suggest.

**Import Style:**
```typescript
// Correct - use relative paths
import { Component } from '../components/Component'
import { util } from '../../lib/util'

// Incorrect - @/* aliases are NOT configured
import { Component } from '@/components/Component'  // ❌ Won't work
```

**tsconfig.json Settings:**
- Target: ES2022
- Module resolution: Bundler
- Strict mode: enabled
- No path aliases in compilerOptions.paths

## Deployment

This repository includes production-ready deployment configurations for multiple platforms.

### 1. Vercel (Recommended)

**Why:** Zero-config deployment, automatic HTTPS, edge network, environment variable management.

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Configure environment variables in Vercel dashboard
```

Configuration file: `vercel.json`

### 2. Docker

**Multi-stage Dockerfile optimized for production:**

```bash
# Build image
docker build -t bedrock-app .

# Run container
docker run -p 3000:3000 \
  -e MODEL_ID=anthropic.claude-3-5-sonnet-20240620-v1:0 \
  -e BEDROCK_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=... \
  -e AWS_SECRET_ACCESS_KEY=... \
  bedrock-app
```

**Dockerfile Features:**
- Three-stage build (deps, builder, runner)
- Node.js 20 Alpine base image
- Standalone output mode for smaller images
- Non-root user (nextjs:nodejs)
- Health check endpoint

**⚠️ Known Issue:** Health check references `/api/models` which doesn't exist. Should be changed to `/api/chat` or removed.

### 3. Google Cloud (Cloud Run / GKE)

**Cloud Build Pipeline:** `cloudbuild.yaml`

```bash
# Trigger build
gcloud builds submit --config cloudbuild.yaml

# Or use automatic GitHub integration
```

**Features:**
- Automatic Docker image build
- Push to Google Container Registry
- Deploy to Cloud Run (us-central1)
- Secret Manager integration for AWS credentials
- Configurable via substitution variables

**Environment Variables (set in Cloud Build triggers):**
- `_MODEL_ID`
- `_BEDROCK_REGION`
- `_AWS_ACCESS_KEY_ID_SECRET` (Secret Manager reference)
- `_AWS_SECRET_ACCESS_KEY_SECRET` (Secret Manager reference)

### 4. Other Platforms

See `DEPLOYMENT.md` for detailed instructions on:
- Netlify
- AWS Amplify
- Railway
- Render
- Self-hosted Node.js

## IAM Permissions

Minimum required IAM policy for AWS Bedrock access:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}
```

Full policy available at: `iam/bedrock-invoke-policy.json`

**Security Best Practices:**
- Use least-privilege IAM policies
- Restrict resources to specific model ARNs when possible
- Use IAM roles with temporary credentials (avoid long-lived access keys)
- Enable CloudTrail logging for Bedrock API calls
- Rotate access keys regularly

## Testing and Validation

### Manual Testing

**Test the API endpoint:**
```bash
# Using cURL
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello, who are you?"}'

# Expected response
{"response":"I am Claude...","modelId":"anthropic.claude-3-5-sonnet-20240620-v1:0"}
```

**Test the UI:**
1. Run `npm run dev`
2. Open http://localhost:3000
3. Type a prompt and click "Send"
4. Verify response appears

**Test Python CLI:**
```bash
# Environment check
python app/bedrock_cli.py --doctor

# Simple query
python app/bedrock_cli.py "What is 2+2?"
```

### Common Issues

**1. Missing AWS Credentials**
```
Error: Missing AWS credentials
```
**Fix:** Set `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` in `.env.local`

**2. Model Not Enabled**
```
Error: Model access denied
```
**Fix:** Enable the model in AWS Bedrock console (Model access → Enable specific models)

**3. Region Mismatch**
```
Error: Could not connect to endpoint
```
**Fix:** Verify `BEDROCK_REGION` matches where your models are enabled

**4. Edge Runtime Limitations**
```
Error: Module not found or dynamic require
```
**Fix:** Avoid Node.js-specific modules in edge routes (fs, path, crypto with dynamic requires)

### Automated Testing

**Current State:** No testing infrastructure exists.

**To Add Tests:**
1. Install test framework: `npm install --save-dev jest @testing-library/react @testing-library/jest-dom`
2. Add test script to package.json: `"test": "jest"`
3. Create `__tests__` directory
4. Add test files: `app/api/chat/route.test.ts`, `app/page.test.tsx`

**Recommended Test Coverage:**
- API route request/response handling
- Error scenarios (missing credentials, invalid requests)
- UI component rendering
- Form submission flow

## Key Development Guidelines

### When Modifying the API Route

**Current Limitation:** The API only supports Claude models because the request body is hardcoded to Claude's format.

**To Add Multi-Model Support:**

1. Create a model registry with request formatters:
```typescript
const MODEL_FORMATS = {
  'anthropic': (prompt: string) => ({
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 2048,
    messages: [{ role: "user", content: [{ type: "text", text: prompt }] }]
  }),
  'meta': (prompt: string) => ({
    prompt,
    max_gen_len: 2048,
    temperature: 0.7
  }),
  'amazon': (prompt: string) => ({
    inputText: prompt,
    textGenerationConfig: {
      maxTokenCount: 2048,
      temperature: 0.7
    }
  })
  // Add more providers...
}
```

2. Detect provider from model ID:
```typescript
const provider = modelId.split('.')[0] // 'anthropic', 'meta', 'amazon', etc.
```

3. Use appropriate formatter:
```typescript
const body = MODEL_FORMATS[provider](prompt)
```

4. Parse response based on provider (responses also differ by provider)

### When Modifying the UI

**Current Approach:** Inline styles for simplicity and zero dependencies.

**If Adding Tailwind:**
1. Remove inline styles from `page.tsx`
2. Add Tailwind classes: `className="max-w-2xl mx-auto p-6"`
3. Ensure `globals.css` includes Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

**If Adding a Component Library:**
- Consider bundle size impact (edge functions have size limits)
- Test cold start performance
- Recommended: shadcn/ui (tree-shakeable) or Radix UI

### When Adding Features

**Keep It Lightweight:**
- Edge functions have size limits (~1MB compressed)
- Minimize dependencies
- Avoid large libraries (prefer `aws4fetch` over `aws-sdk`)
- Use dynamic imports for optional features

**Maintain Edge Compatibility:**
- No Node.js-specific APIs (fs, crypto, child_process)
- No dynamic requires
- Use Web APIs: `fetch`, `Response`, `Request`, `Headers`
- Check compatibility: https://edge-runtime.vercel.app/features/available-apis

### Common Pitfalls to Avoid

1. **Don't use AWS SDK in edge routes** - It's too large and not edge-compatible. Use `aws4fetch` instead.

2. **Don't assume path aliases work** - Use relative imports (`../` and `../../`)

3. **Don't reference `/api/models` endpoint** - It doesn't exist (legacy documentation error)

4. **Don't expect Tailwind classes to work** - The CSS isn't included; use inline styles or add Tailwind setup

5. **Don't commit `.env.local`** - It's gitignored and contains secrets

6. **Don't skip model enablement in AWS** - Models must be explicitly enabled in Bedrock console before use

## AWS Bedrock Model IDs

**Common Models:**
- `anthropic.claude-3-5-sonnet-20240620-v1:0` - Claude 3.5 Sonnet (current default)
- `anthropic.claude-3-haiku-20240307-v1:0` - Claude 3 Haiku (faster, cheaper)
- `anthropic.claude-3-opus-20240229-v1:0` - Claude 3 Opus (most capable)
- `meta.llama3-70b-instruct-v1:0` - Llama 3 70B
- `amazon.titan-text-express-v1` - Titan Text Express
- `mistral.mistral-7b-instruct-v0:2` - Mistral 7B

**Note:** Different models require different request/response formats. Current implementation only supports Claude models.

## Useful Resources

- **AWS Bedrock Documentation:** https://docs.aws.amazon.com/bedrock/
- **Bedrock Model IDs:** https://docs.aws.amazon.com/bedrock/latest/userguide/model-ids.html
- **Next.js Edge Runtime:** https://nextjs.org/docs/api-reference/edge-runtime
- **aws4fetch Documentation:** https://github.com/mhart/aws4fetch
- **Deployment Guide:** See `DEPLOYMENT.md` in this repository

## Contributing

When making changes:

1. **Test locally first:** `npm run dev` and verify functionality
2. **Check environment variables:** Ensure `.env.local` is properly configured
3. **Test production build:** `npm run build && npm start`
4. **Update documentation:** Keep CLAUDE.md and README.md in sync
5. **Verify deployment configs:** If changing env vars, update `vercel.json`, `cloudbuild.yaml`, and Dockerfile

## License

This project is open source. Check repository for license details.
