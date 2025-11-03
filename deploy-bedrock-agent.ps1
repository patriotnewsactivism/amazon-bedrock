# deploy-bedrock-agent.ps1
# Streamlines setup for a Vercel + Amazon Bedrock AI coding agent

Write-Host "🚀 Starting Bedrock AI setup..." -ForegroundColor Cyan

# --- Check prerequisites ---
$tools = @("node", "npm", "git", "aws", "vercel")
foreach ($tool in $tools) {
    if (-not (Get-Command $tool -ErrorAction SilentlyContinue)) {
        Write-Host "❌ Missing $tool. Please install it and rerun this script." -ForegroundColor Red
        exit 1
    }
}

# --- Ask for user input ---
$projectName = Read-Host "Enter your Vercel project name"
$awsRegion = Read-Host "Enter AWS region (e.g., us-east-1)"
$modelId = Read-Host "Enter Bedrock model ID (e.g., anthropic.claude-3-sonnet-20240229-v1:0)"
$repoUrl = Read-Host "Enter GitHub repo URL (or press Enter to skip)"

# --- AWS credentials ---
Write-Host "Setting AWS environment variables..." -ForegroundColor Yellow
$AWS_ACCESS_KEY_ID = Read-Host "AWS_ACCESS_KEY_ID"
$AWS_SECRET_ACCESS_KEY = Read-Host "AWS_SECRET_ACCESS_KEY"

# --- Setup local folder ---
if (-not (Test-Path $projectName)) {
    npx create-next-app@latest $projectName --typescript
}
Set-Location $projectName

# --- Install dependencies ---
npm install @aws-sdk/client-bedrock-runtime @octokit/rest

# --- Create .env.local file ---
@"
AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY
AWS_REGION=$awsRegion
BEDROCK_MODEL=$modelId
"@ | Out-File -Encoding utf8 .env.local

# --- Setup GitHub repo if provided ---
if ($repoUrl -ne "") {
    git init
    git remote add origin $repoUrl
    git add .
    git commit -m "Initial Bedrock Agent setup"
    git branch -M main
    git push -u origin main
}

# --- Add sample API route for Bedrock ---
$apiDir = "app/api/chat"
New-Item -ItemType Directory -Force -Path $apiDir | Out-Null

@"
import {{ NextRequest }} from "next/server";
import {{ BedrockRuntimeClient, InvokeModelWithResponseStreamCommand }} from "@aws-sdk/client-bedrock-runtime";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {{
  const {{ messages }} = await req.json();
  const client = new BedrockRuntimeClient({{ region: process.env.AWS_REGION }});
  const modelId = process.env.BEDROCK_MODEL;

  const body = {{
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 800,
    temperature: 0.3,
    messages,
  }};

  const cmd = new InvokeModelWithResponseStreamCommand({{
    modelId,
    contentType: "application/json",
    accept: "application/json",
    body: Buffer.from(JSON.stringify(body))
  }});

  const res = await client.send(cmd);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({{
    async start(controller) {{
      for await (const evt of res.body) {{
        if (evt.chunk) {{
          const json = JSON.parse(new TextDecoder().decode(evt.chunk.bytes));
          if (json.type === "content_block_delta" && json.delta?.text) {{
            controller.enqueue(encoder.encode(json.delta.text));
          }}
        }}
      }}
      controller.close();
    }}
  }});

  return new Response(stream, {{
    headers: {{ "Content-Type": "text/plain; charset=utf-8" }}
  }});
}}
"@ | Out-File -Encoding utf8 "$apiDir/route.ts"

# --- Vercel login & deploy ---
Write-Host "Deploying to Vercel..." -ForegroundColor Green
vercel login
vercel link --project $projectName
vercel env add AWS_ACCESS_KEY_ID production <# will prompt user to paste #>
vercel env add AWS_SECRET_ACCESS_KEY production
vercel env add AWS_REGION production
vercel env add BEDROCK_MODEL production
vercel deploy --prod

Write-Host "`n✅ Deployment complete! Your Bedrock agent API is live on Vercel." -ForegroundColor Green
Write-Host "You can now call it at /api/chat for streaming responses."
