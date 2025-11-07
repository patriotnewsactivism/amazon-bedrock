import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Bedrock Chat (Edge)',
  description: 'Minimal Amazon Bedrock chat UI running on a Next.js Edge route.'
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
