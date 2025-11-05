# AWS Bedrock AI Platform

The most comprehensive AWS Bedrock platform with every advanced feature you could want! Access 25+ AI models with streaming responses, cost tracking, model comparison, workflows, RAG, and much more.

## 🚀 All Features Included

### Core Features
- ⚡ **Real-time Streaming** - See responses as they generate
- 💾 **Conversation History** - Save, search, and manage all conversations
- 🔄 **Model Comparison** - Compare responses from different models side-by-side
- 🎛️ **Advanced Parameters** - Control temperature, tokens, top-p, and more
- 💰 **Cost Tracking** - Real-time usage and cost monitoring
- 📎 **File Upload** - Upload and analyze code, documents, and more
- 🌙 **Dark Mode** - Beautiful dark theme with persistence
- 📥 **Export** - Export conversations as Markdown, JSON, or TXT
- 🔗 **Multi-Agent Workflows** - Chain agents together for complex tasks
- 🧠 **RAG** - Upload documents to create knowledge bases
- ⌨️ **Keyboard Shortcuts** - Ctrl+Enter to send messages
- 🎨 **Markdown Rendering** - Beautiful markdown with code syntax highlighting
- 📋 **Copy Buttons** - One-click copy for all messages
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- ⚠️ **Error Handling** - Comprehensive error messages and retry logic

### 🤖 25+ AI Models
Access models from leading providers:
- **Anthropic Claude** (3.5 Sonnet v2, Opus, Sonnet, Haiku)
- **Meta Llama** (3.2 90B, 3.1 405B, 70B, 8B)
- **Amazon Titan** (Premier, Express, Lite)
- **Mistral AI** (Large 2, Small, Mixtral)
- **Cohere** (Command R+, Command R)
- **AI21 Labs** (Jamba, Jurassic-2)

### 💻 Autonomous Coding Agents
- 🔧 Code Generator with file upload
- 🔍 Code Review & Debug with file upload
- 🏗️ Architecture Design
- 🧪 Test Generator

### 📝 Article Composition
- ✍️ Blog Writer
- 📚 Technical Writer
- 📰 News Writer
- ✏️ Content Editor

### 🔍 Research Tools
- 🔬 Research Assistant
- 📊 Data Analyst
- 📈 Market Research
- 🎓 Academic Research

### ⚖️ Legal Document Assistant
- 📄 Contract Drafter
- 🔍 Legal Reviewer
- 📋 Terms & Conditions Generator
- 🤐 NDA Generator

### 👥 AI Employees & Autonomous Agents
- 🎧 Customer Support Agent
- 💼 Sales Assistant
- 📅 Project Manager
- 👔 HR Assistant
- 📢 Marketing Specialist
- 📧 Executive Assistant

### 💬 Chatbot Builder
- 🛍️ E-commerce Bot
- 📚 Educational Bot
- 🎮 Entertainment Bot
- ⚙️ Support Bot

### 🌐 Website Builder
- 🚀 Landing Page Builder
- 🧩 Component Generator
- 🌐 Full Website Builder
- 🎨 UI/UX Designer

### 🔄 Model Comparison
Compare responses from two models simultaneously to find the best one for your needs

### 🔗 Multi-Agent Workflows
Pre-built workflows:
- Research → Write → Edit
- Code → Test → Review
- Outline → Draft → Refine

### 🧠 RAG (Retrieval Augmented Generation)
- Upload documents (PDF, TXT, MD, etc.)
- AI uses your documents as context
- Get accurate, sourced answers

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure AWS Credentials

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Edit `.env` and add your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here
AWS_REGION=us-east-1
```

### 3. Get AWS Credentials

1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to IAM → Users → Your User → Security Credentials
3. Create an Access Key
4. Copy the Access Key ID and Secret Access Key
5. Ensure your IAM user has permissions for `bedrock:InvokeModel` and `bedrock:InvokeModelWithResponseStream`

### 4. Enable Bedrock Models

1. Go to [AWS Bedrock Console](https://console.aws.amazon.com/bedrock/)
2. Navigate to "Model access" in the left sidebar
3. Click "Enable specific models" or "Enable all models"
4. Request access for the models you want to use
5. Wait for approval (usually instant for most models)

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Required AWS Permissions

Your IAM user or role needs these permissions:

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

## Usage

1. **Select a Model**: Start by choosing an AI model from the Models tab
2. **Choose a Feature**: Navigate to any feature tab (Coding, Articles, Research, etc.)
3. **Interact**: Use the chat interfaces to interact with the AI
4. **Switch Models**: Change models anytime to compare results

## Architecture

- **Frontend**: Next.js 16 with React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **AI Provider**: AWS Bedrock Runtime SDK
- **Model Support**: 25+ models from 6 providers

## Cost Management

AWS Bedrock charges based on:
- Input tokens (text you send)
- Output tokens (text generated)

Pricing varies by model. Check your AWS Bedrock console for current pricing.

## Free Tier / Credits

If you have AWS free credits:
- They will automatically apply to Bedrock usage
- Monitor usage in AWS Cost Explorer
- Set up billing alerts to avoid surprises

## Troubleshooting

### "Access Denied" Errors
- Verify AWS credentials in `.env`
- Check IAM permissions
- Ensure Bedrock is available in your region

### "Model Not Found" Errors
- Enable the model in Bedrock console
- Wait for model access approval
- Check model ID matches available models

### No Response from Model
- Check AWS region configuration
- Verify model is enabled
- Check CloudWatch logs for errors

## Development

Build for production:

```bash
npm run build
```

Start production server:

```bash
npm start
```

Run linter:

```bash
npm run lint
```

## Deploy

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

Add environment variables in Vercel dashboard:
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`

### Deploy to AWS

Use AWS Amplify or Elastic Beanstalk for deployment.

## Security Notes

- Never commit `.env` file to version control
- Use IAM roles instead of access keys when possible
- Rotate credentials regularly
- Monitor usage for unexpected activity
- Use least privilege principle for IAM permissions

## License

MIT

## Support

For issues or questions:
1. Check AWS Bedrock documentation
2. Review AWS IAM permissions
3. Verify model availability in your region
