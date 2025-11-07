# Bedrock on Vercel (Next.js Edge)

## Deploy
1. **Enable Bedrock + model access** in your AWS account for `BEDROCK_REGION`.
2. Create IAM user/role with `iam/bedrock-invoke-policy.json`. Attach policy.
3. On **Vercel → Project → Settings → Environment Variables**:
   - `MODEL_ID`, `BEDROCK_REGION`
   - `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_SESSION_TOKEN` (if STS).  
   Mark them available to **Edge**.
4. Push to Vercel. Visit `/` and test.

## cURL test
```bash
curl -s -X POST https://<your-vercel-domain>/api/chat \
  -H 'content-type: application/json' \
  -d '{"messages":[{"role":"user","content":[{"type":"text","text":"Say hi"}]}]}'
```

Notes
•The Edge route signs a POST to:
https://bedrock-runtime.$BEDROCK_REGION.amazonaws.com/model/$MODEL_ID/invoke (SigV4 service = bedrock).
•Keep requests under Edge execution time. For long generations, consider streaming.
•If Edge ever blocks your package, switch the route to Node runtime and use @aws-sdk/client-bedrock-runtime.
