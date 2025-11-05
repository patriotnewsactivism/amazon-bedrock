# Multi-AI Chat Application

A production-ready, multi-provider AI chat application built with Next.js 14, featuring Amazon Bedrock, OpenAI, and Anthropic Claude integration. Optimized for easy deployment to Vercel.

## Features

✨ **Multiple AI Providers**
- Amazon Bedrock (Claude 3.5 Sonnet, Claude 3 Opus, Haiku)
- OpenAI (GPT-4o, GPT-4 Turbo, GPT-4o Mini)
- Anthropic Direct API (Claude 3.5 Sonnet, Opus, Haiku)

🚀 **Production Ready**
- Streaming responses for real-time interaction
- Responsive, modern UI with Tailwind CSS
- Dark mode support
- Markdown rendering for AI responses
- TypeScript for type safety
- Edge-optimized for Vercel deployment

🔧 **Easy Configuration**
- Environment variable-based setup
- Model selection in the UI
- Provider switching without code changes

## Quick Start

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- At least one AI provider API key:
  - AWS account with Bedrock access (recommended)
  - OpenAI API key (optional)
  - Anthropic API key (optional)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd amazon-bedrock
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Edit `.env.local` with your credentials**
   ```env
   # Amazon Bedrock (Required for Bedrock provider)
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=your_aws_access_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret_key
   BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0

   # OpenAI (Optional)
   OPENAI_API_KEY=your_openai_api_key

   # Anthropic (Optional)
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Deploy to Vercel

### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/amazon-bedrock)

### Manual Deployment

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Set environment variables in Vercel**

   Go to your Vercel project settings and add the following environment variables:

   **For Amazon Bedrock:**
   - `AWS_REGION` (e.g., `us-east-1`)
   - `AWS_ACCESS_KEY_ID`
   - `AWS_SECRET_ACCESS_KEY`
   - `BEDROCK_MODEL` (e.g., `anthropic.claude-3-5-sonnet-20241022-v2:0`)

   **For OpenAI (optional):**
   - `OPENAI_API_KEY`

   **For Anthropic (optional):**
   - `ANTHROPIC_API_KEY`

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Using Vercel Dashboard

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your Git repository
4. Add environment variables in the project settings
5. Click "Deploy"

## Configuration

### Available Models

**Amazon Bedrock:**
- `anthropic.claude-3-5-sonnet-20241022-v2:0` (Latest Claude 3.5 Sonnet)
- `anthropic.claude-3-5-sonnet-20240620-v1:0` (Claude 3.5 Sonnet v1)
- `anthropic.claude-3-opus-20240229-v1:0` (Claude 3 Opus)
- `anthropic.claude-3-sonnet-20240229-v1:0` (Claude 3 Sonnet)
- `anthropic.claude-3-haiku-20240307-v1:0` (Claude 3 Haiku)

**OpenAI:**
- `gpt-4o` (GPT-4 Omni)
- `gpt-4o-mini` (GPT-4 Omni Mini)
- `gpt-4-turbo` (GPT-4 Turbo)

**Anthropic Direct:**
- `claude-3-5-sonnet-20241022` (Latest)
- `claude-3-opus-20240229` (Most capable)
- `claude-3-sonnet-20240229` (Balanced)
- `claude-3-haiku-20240307` (Fastest)

### AWS Bedrock Setup

1. **Enable Bedrock in your AWS account**
   - Go to AWS Console → Bedrock
   - Request model access for Claude models
   - Wait for approval (usually instant for Claude models)

2. **Create IAM credentials**
   - Create an IAM user with `bedrock:InvokeModel` permissions
   - Generate access keys
   - Use these keys in your environment variables

3. **Supported Regions**
   - `us-east-1` (N. Virginia) - Recommended
   - `us-west-2` (Oregon)
   - `eu-west-1` (Ireland)
   - Check AWS documentation for the latest supported regions

## API Reference

### POST /api/chat

Chat with AI models using streaming responses.

**Request Body:**
```json
{
  "messages": [
    {
      "role": "user",
      "content": "Hello, how are you?"
    }
  ],
  "provider": "bedrock",
  "model": "anthropic.claude-3-5-sonnet-20241022-v2:0",
  "temperature": 0.7,
  "max_tokens": 4096
}
```

**Parameters:**
- `messages` (required): Array of message objects with `role` and `content`
- `provider` (optional): `"bedrock"`, `"openai"`, or `"anthropic"` (default: `"bedrock"`)
- `model` (optional): Specific model ID (uses default if not provided)
- `temperature` (optional): 0.0 to 1.0 (default: 0.7)
- `max_tokens` (optional): Maximum response tokens (default: 4096)

**Response:**
Streaming text/plain response with AI-generated content.

### GET /api/chat

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "providers": ["bedrock", "openai", "anthropic"],
  "message": "Multi-provider AI Chat API"
}
```

## Project Structure

```
amazon-bedrock/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts          # Multi-provider chat API
│   ├── globals.css               # Global styles
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Main chat interface
├── public/                       # Static assets
├── .env.example                  # Environment variable template
├── .eslintrc.json               # ESLint configuration
├── .gitignore                   # Git ignore rules
├── next.config.js               # Next.js configuration
├── package.json                 # Dependencies
├── postcss.config.js            # PostCSS configuration
├── README.md                    # This file
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── vercel.json                  # Vercel deployment configuration
```

## Troubleshooting

### Bedrock: "Access Denied" Error
- Ensure you've requested model access in AWS Bedrock console
- Verify IAM permissions include `bedrock:InvokeModel`
- Check that you're using the correct AWS region

### OpenAI: "Invalid API Key"
- Verify your API key is correct
- Check that you have available credits
- Ensure the API key has proper permissions

### Deployment Issues
- Verify all required environment variables are set in Vercel
- Check build logs for specific errors
- Ensure Node.js version is 18 or higher

### Streaming Not Working
- Check browser console for errors
- Verify API route is accessible
- Test with `curl` to isolate frontend vs backend issues

## Security Notes

- Never commit `.env.local` or actual API keys to version control
- Use Vercel environment variables for production secrets
- Rotate API keys regularly
- Monitor usage to prevent unexpected charges
- Implement rate limiting for production use

## Performance Optimization

- Streaming responses reduce perceived latency
- Edge runtime on Vercel for global low latency
- Efficient token usage with appropriate `max_tokens` settings
- Response caching disabled for real-time interactions

## Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Open a GitHub issue
- Check existing issues for solutions
- Review AWS Bedrock, OpenAI, and Anthropic documentation

## Roadmap

- [ ] Add support for more AI providers (Google Gemini, Cohere, etc.)
- [ ] Implement conversation history persistence
- [ ] Add user authentication
- [ ] Support for image inputs
- [ ] Function calling/tool use
- [ ] Cost tracking and usage analytics
- [ ] Multi-language support

## Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Powered by:
  - [Amazon Bedrock](https://aws.amazon.com/bedrock/)
  - [OpenAI](https://openai.com/)
  - [Anthropic](https://anthropic.com/)
