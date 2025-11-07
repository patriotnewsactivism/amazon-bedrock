'use client';

import { useState } from 'react';

type ChatResp = { model: string; region: string; output: string; raw: unknown; error?: string };

export default function Home() {
  const [input, setInput] = useState('');
  const [out, setOut] = useState<string>('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    setBusy(true);
    setErr(null);
    setOut('');
    try {
      const r = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ prompt: input })
      });
      const j: ChatResp = await r.json();
      if (!r.ok || j?.error) {
        setErr(j?.error ?? `HTTP ${r.status}`);
      } else {
        setOut(j.output);
      }
    } catch (e: any) {
      setErr(e?.message ?? String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main
      style={{
        margin: '0 auto',
        maxWidth: '640px',
        padding: '24px'
      }}
    >
      <h1 style={{ fontSize: '24px', fontWeight: 600, marginBottom: '16px' }}>
        Bedrock Chat (Edge)
      </h1>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '12px'
        }}
      >
        <input
          style={{
            flex: 1,
            border: '1px solid #cbd5f5',
            borderRadius: '8px',
            padding: '10px 12px'
          }}
          placeholder="Ask something…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          style={{
            border: '1px solid #1d4ed8',
            backgroundColor: '#1d4ed8',
            color: '#fff',
            borderRadius: '8px',
            padding: '10px 16px'
          }}
          onClick={send}
          disabled={busy || !input.trim()}
        >
          {busy ? '…' : 'Send'}
        </button>
      </div>
      {err && (
        <pre
          style={{
            color: '#b91c1c',
            whiteSpace: 'pre-wrap'
          }}
        >
          {err}
        </pre>
      )}
      {out && (
        <section style={{ marginTop: '16px' }}>
          <h2 style={{ fontWeight: 500, marginBottom: '8px' }}>Response</h2>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{out}</pre>
        </section>
      )}
      <p style={{ fontSize: '14px', color: '#64748b', marginTop: '32px' }}>
        Model ID and region are configured on the server.
      </p>
    </main>
  );
}
