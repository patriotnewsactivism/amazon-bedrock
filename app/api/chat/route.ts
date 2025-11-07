export const runtime = 'edge';

import { AwsClient } from 'aws4fetch';

const MODEL_ID = process.env.MODEL_ID ?? 'anthropic.claude-3-5-sonnet-20240620-v1:0';
const BEDROCK_REGION =
  process.env.BEDROCK_REGION ?? process.env.AWS_REGION ?? 'us-east-1';
const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
const AWS_SESSION_TOKEN = process.env.AWS_SESSION_TOKEN; // optional

// Why: Bedrock Runtime requires SigV4 with service name "bedrock" even on bedrock-runtime endpoint.
const aws = new AwsClient({
  accessKeyId: AWS_ACCESS_KEY_ID!,
  secretAccessKey: AWS_SECRET_ACCESS_KEY!,
  sessionToken: AWS_SESSION_TOKEN,
  region: BEDROCK_REGION,
  service: 'bedrock'
});

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json' }
  });
}

export async function POST(req: Request) {
  try {
    if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY) {
      return json(500, { error: 'AWS credentials not configured on server.' });
    }

    const input = await req.json().catch(() => ({}));
    let messages = input?.messages as
      | Array<{ role: 'user' | 'assistant' | 'system'; content: Array<{ type: 'text'; text: string }> }>
      | undefined;

    if (!messages) {
      const prompt = String(input?.prompt ?? '');
      messages = [{ role: 'user', content: [{ type: 'text', text: prompt }] }];
    }

    const max_tokens = Number(input?.max_tokens ?? 512);
    const temperature = Number(input?.temperature ?? 0.7);

    const body = {
      anthropic_version: 'bedrock-2023-05-31',
      max_tokens,
      temperature,
      messages
    };

    const url = `https://bedrock-runtime.${BEDROCK_REGION}.amazonaws.com/model/${encodeURIComponent(
      MODEL_ID
    )}/invoke`;

    const resp = await aws.fetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json'
      },
      body: JSON.stringify(body)
    });

    if (!resp.ok) {
      const errText = await resp.text().catch(() => '');
      return json(resp.status, {
        error: `Bedrock error ${resp.status}`,
        detail: errText
      });
    }

    const raw = await resp.json();
    let text = '';
    for (const c of raw?.content ?? []) {
      if (c?.type === 'text' && typeof c.text === 'string') text += c.text;
    }

    return json(200, {
      model: MODEL_ID,
      region: BEDROCK_REGION,
      output: text,
      raw
    });
  } catch (e: any) {
    return json(500, { error: `${e?.name ?? 'Error'}: ${e?.message ?? String(e)}` });
  }
}
