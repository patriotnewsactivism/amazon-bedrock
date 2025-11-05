import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi-AI Chat - Bedrock, OpenAI, Anthropic",
  description: "Chat with multiple AI providers including Amazon Bedrock, OpenAI, and Anthropic Claude",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
