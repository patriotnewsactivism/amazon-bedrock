export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  modelId?: string;
}

export interface ConversationHistory {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentTask {
  id: string;
  type: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  result?: string;
  error?: string;
  createdAt: Date;
  completedAt?: Date;
}

export interface CodingAgent {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  capabilities: string[];
  modelId: string;
}

export interface ArticleTemplate {
  id: string;
  name: string;
  description: string;
  sections: string[];
  tone: string;
  length: "short" | "medium" | "long";
}

export interface ResearchQuery {
  id: string;
  query: string;
  depth: "basic" | "moderate" | "comprehensive";
  sources: string[];
  findings: string;
  status: "pending" | "researching" | "completed";
}

export interface LegalDocument {
  id: string;
  type: string;
  title: string;
  content: string;
  jurisdiction?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIEmployee {
  id: string;
  name: string;
  role: string;
  responsibilities: string[];
  modelId: string;
  systemPrompt: string;
  taskHistory: AgentTask[];
}

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  personality: string;
  modelId: string;
  systemPrompt: string;
  knowledge: string[];
  createdAt: Date;
}

export interface WebsiteConfig {
  id: string;
  name: string;
  description: string;
  theme: string;
  pages: {
    name: string;
    route: string;
    content: string;
  }[];
  components: string[];
}
