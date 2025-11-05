import { Message, ConversationHistory } from "./types";

export function saveConversation(conversation: ConversationHistory): void {
  const conversations = getAllConversations();
  const index = conversations.findIndex((c) => c.id === conversation.id);

  if (index >= 0) {
    conversations[index] = conversation;
  } else {
    conversations.push(conversation);
  }

  localStorage.setItem("conversations", JSON.stringify(conversations));
}

export function getAllConversations(): ConversationHistory[] {
  const stored = localStorage.getItem("conversations");
  if (!stored) return [];
  return JSON.parse(stored).map((conv: any) => ({
    ...conv,
    createdAt: new Date(conv.createdAt),
    updatedAt: new Date(conv.updatedAt),
    messages: conv.messages.map((msg: any) => ({
      ...msg,
      timestamp: new Date(msg.timestamp),
    })),
  }));
}

export function getConversationById(id: string): ConversationHistory | null {
  const conversations = getAllConversations();
  return conversations.find((c) => c.id === id) || null;
}

export function deleteConversation(id: string): void {
  const conversations = getAllConversations();
  const filtered = conversations.filter((c) => c.id !== id);
  localStorage.setItem("conversations", JSON.stringify(filtered));
}

export function searchConversations(query: string): ConversationHistory[] {
  const conversations = getAllConversations();
  const lowerQuery = query.toLowerCase();

  return conversations.filter((conv) => {
    const titleMatch = conv.title.toLowerCase().includes(lowerQuery);
    const messageMatch = conv.messages.some((msg) =>
      msg.content.toLowerCase().includes(lowerQuery)
    );
    return titleMatch || messageMatch;
  });
}

export function exportConversation(
  conversation: ConversationHistory,
  format: "json" | "markdown" | "txt"
): string {
  if (format === "json") {
    return JSON.stringify(conversation, null, 2);
  }

  if (format === "markdown") {
    let markdown = `# ${conversation.title}\n\n`;
    markdown += `Created: ${conversation.createdAt.toLocaleDateString()}\n\n`;
    markdown += `---\n\n`;

    conversation.messages.forEach((msg) => {
      markdown += `## ${msg.role === "user" ? "User" : "Assistant"}\n\n`;
      markdown += `${msg.content}\n\n`;
      markdown += `---\n\n`;
    });

    return markdown;
  }

  // txt format
  let text = `${conversation.title}\n`;
  text += `Created: ${conversation.createdAt.toLocaleDateString()}\n\n`;
  text += "=".repeat(50) + "\n\n";

  conversation.messages.forEach((msg) => {
    text += `${msg.role.toUpperCase()}:\n`;
    text += `${msg.content}\n\n`;
    text += "-".repeat(50) + "\n\n";
  });

  return text;
}

export function generateConversationTitle(messages: Message[]): string {
  if (messages.length === 0) return "New Conversation";

  const firstUserMessage = messages.find((m) => m.role === "user");
  if (!firstUserMessage) return "New Conversation";

  // Take first 50 characters of first user message
  const title = firstUserMessage.content.substring(0, 50);
  return title.length < firstUserMessage.content.length
    ? title + "..."
    : title;
}
