# Deployment Guide

## Vercel Deployment (Recommended)

This application is optimized for deployment on Vercel with zero configuration required.

### Prerequisites

1. A GitHub, GitLab, or Bitbucket account
2. A Vercel account (free tier available at [vercel.com](https://vercel.com))
3. At least one AI provider configured:
   - AWS account with Bedrock access, OR
   - OpenAI API key, OR
   - Anthropic API key

### Step-by-Step Deployment

#### 1. Push Code to Git Repository

```bash
# Initialize git (if not already initialized)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Multi-AI chat application"

# Add your remote repository
git remote add origin https://github.com/yourusername/your-repo.git

# Push to main branch
git push -u origin main
```

#### 2. Import to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your Git repository
4. Vercel will automatically detect Next.js configuration

#### 3. Configure Environment Variables

In the Vercel project setup, add your environment variables:

**Required for Amazon Bedrock:**
```
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0
```

**Optional for OpenAI:**
```
OPENAI_API_KEY=sk-...
```

**Optional for Anthropic:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

#### 4. Deploy

Click "Deploy" and wait for the build to complete (usually 1-2 minutes).

### Updating Your Deployment

Simply push changes to your Git repository:

```bash
git add .
git commit -m "Your changes"
git push
```

Vercel will automatically rebuild and redeploy.

### Environment Variables After Deployment

To add or update environment variables after deployment:

1. Go to your project in Vercel dashboard
2. Click "Settings" → "Environment Variables"
3. Add or update variables
4. Redeploy for changes to take effect

### Custom Domain Setup

1. Go to project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions
5. SSL certificate is automatically provisioned

## AWS Bedrock Setup

### Enable Model Access

1. Log in to AWS Console
2. Navigate to Amazon Bedrock
3. Go to "Model access" in the left sidebar
4. Click "Manage model access"
5. Select the models you want to use:
   - Anthropic Claude 3.5 Sonnet v2
   - Anthropic Claude 3.5 Sonnet
   - Anthropic Claude 3 Opus
   - Anthropic Claude 3 Sonnet
   - Anthropic Claude 3 Haiku
6. Click "Request model access"
7. Access is usually granted instantly

### Create IAM User for Bedrock

1. Go to IAM in AWS Console
2. Click "Users" → "Add users"
3. Enter username (e.g., `bedrock-chat-app`)
4. Select "Access key - Programmatic access"
5. Click "Next: Permissions"
6. Create or attach policy with these permissions:

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

7. Complete user creation
8. Save the Access Key ID and Secret Access Key
9. Use these credentials in your environment variables

### Supported AWS Regions

Amazon Bedrock is available in these regions:
- `us-east-1` (US East N. Virginia) - Recommended
- `us-west-2` (US West Oregon)
- `ap-southeast-1` (Asia Pacific Singapore)
- `ap-northeast-1` (Asia Pacific Tokyo)
- `eu-central-1` (Europe Frankfurt)
- `eu-west-1` (Europe Ireland)
- `eu-west-3` (Europe Paris)

Check [AWS Regional Services](https://aws.amazon.com/about-aws/global-infrastructure/regional-product-services/) for the latest list.

## Alternative Deployment Options

### Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Docker Deployment

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine AS base

# Install dependencies
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Build application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

Build and run:

```bash
docker build -t multi-ai-chat .
docker run -p 3000:3000 \
  -e AWS_REGION=us-east-1 \
  -e AWS_ACCESS_KEY_ID=your_key \
  -e AWS_SECRET_ACCESS_KEY=your_secret \
  -e BEDROCK_MODEL=anthropic.claude-3-5-sonnet-20241022-v2:0 \
  multi-ai-chat
```

### Other Platforms

The application can also be deployed to:
- **Netlify**: Similar to Vercel, import from Git
- **AWS Amplify**: Connect GitHub repository
- **Railway**: One-click deployment
- **Render**: Static site + API deployment
- **Self-hosted**: Any Node.js hosting with Next.js support

## Performance Optimization

### Vercel Edge Functions

The application is configured to run on Vercel's Edge Network for optimal performance:
- Low latency globally
- Automatic scaling
- Edge caching where appropriate

### Environment-Specific Optimizations

**Production:**
- Enable SWC minification (already configured)
- React strict mode for better error catching
- Streaming responses for faster perceived performance

**Development:**
- Hot module replacement
- Fast refresh
- Source maps for debugging

## Monitoring and Logging

### Vercel Analytics

Enable in Vercel dashboard:
1. Go to project settings
2. Click "Analytics"
3. Enable Web Analytics

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Datadog for comprehensive monitoring

### Cost Monitoring

Monitor API usage:
- AWS CloudWatch for Bedrock usage
- OpenAI usage dashboard
- Anthropic console for API usage

## Security Best Practices

1. **Never commit secrets**
   - Use `.gitignore` for `.env.local`
   - Store secrets in Vercel environment variables

2. **Rotate credentials regularly**
   - Change AWS keys quarterly
   - Rotate API keys when team members leave

3. **Implement rate limiting**
   - Add middleware to limit requests per IP
   - Use Vercel's built-in DDoS protection

4. **Monitor usage**
   - Set up billing alerts in AWS
   - Monitor API usage in provider dashboards
   - Set budget limits

5. **Use environment-specific keys**
   - Different keys for development/staging/production
   - Separate AWS accounts for production

## Troubleshooting

### Build Failures

**Error: "Module not found"**
- Run `npm install` locally
- Ensure `package-lock.json` is committed
- Check for typos in import statements

**Error: "Type error in route.ts"**
- Verify TypeScript configuration
- Run `npm run build` locally first
- Check for missing type definitions

### Runtime Errors

**Error: "Access denied" from Bedrock**
- Verify model access is enabled
- Check IAM permissions
- Confirm correct AWS region

**Error: "API key invalid"**
- Double-check environment variables
- Ensure no extra spaces in keys
- Verify key is active in provider console

### Performance Issues

**Slow response times**
- Check AWS region (use closest to users)
- Verify Vercel deployment region
- Consider using smaller models for faster responses

**High latency**
- Enable Edge functions
- Use streaming responses (already implemented)
- Optimize frontend bundle size

## Support

For deployment issues:
- Vercel: [vercel.com/support](https://vercel.com/support)
- AWS Bedrock: AWS Support or AWS Forums
- Community: GitHub Issues in this repository
