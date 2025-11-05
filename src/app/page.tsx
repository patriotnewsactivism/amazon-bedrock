"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import ModelSelector from "@/components/ModelSelector";
import EnhancedChatInterface from "@/components/EnhancedChatInterface";
import ConversationHistory from "@/components/ConversationHistory";
import CostDashboard from "@/components/CostDashboard";
import ModelComparison from "@/components/ModelComparison";
import MultiAgentWorkflow from "@/components/MultiAgentWorkflow";
import RAGInterface from "@/components/RAGInterface";
import FileUpload from "@/components/FileUpload";
import { ConversationHistory as ConversationType } from "@/lib/types";

const ThemeToggle = dynamic(() => import("@/components/ThemeToggle"), {
  ssr: false,
});

type Tab =
  | "models"
  | "coding"
  | "articles"
  | "research"
  | "legal"
  | "employees"
  | "chatbots"
  | "websites"
  | "comparison"
  | "workflow"
  | "rag";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("models");
  const [selectedModelId, setSelectedModelId] = useState(
    "anthropic.claude-3-5-sonnet-20241022-v2:0"
  );
  const [currentConversation, setCurrentConversation] = useState<ConversationType | null>(null);

  const tabs = [
    { id: "models" as Tab, label: "🤖 Models" },
    { id: "coding" as Tab, label: "💻 Coding" },
    { id: "articles" as Tab, label: "📝 Articles" },
    { id: "research" as Tab, label: "🔍 Research" },
    { id: "legal" as Tab, label: "⚖️ Legal" },
    { id: "employees" as Tab, label: "👥 Employees" },
    { id: "chatbots" as Tab, label: "💬 Chatbots" },
    { id: "websites" as Tab, label: "🌐 Websites" },
    { id: "comparison" as Tab, label: "🔄 Compare" },
    { id: "workflow" as Tab, label: "🔗 Workflow" },
    { id: "rag" as Tab, label: "🧠 RAG" },
  ];

  const handleFileContent = (content: string, filename: string) => {
    // File content handler for code analysis
    console.log("File uploaded:", filename);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <ConversationHistory
        onSelectConversation={setCurrentConversation}
        currentConversationId={currentConversation?.id}
      />

      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header */}
        <header className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              AWS Bedrock AI Platform
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Complete AI toolkit with 25+ models, workflows, and advanced features
            </p>
          </div>
          <ThemeToggle />
        </header>

        {/* Cost Dashboard */}
        <CostDashboard />

        {/* Navigation Tabs */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6 overflow-x-auto">
          <div className="flex p-2 gap-2 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap text-sm ${
                  activeTab === tab.id
                    ? "bg-blue-600 text-white shadow-md"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          {activeTab === "models" && (
            <div>
              <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                Select Your AI Model
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose from 25+ state-of-the-art AI models from leading providers
              </p>
              <ModelSelector
                selectedModelId={selectedModelId}
                onModelChange={setSelectedModelId}
              />
            </div>
          )}

          {activeTab === "comparison" && <ModelComparison />}

          {activeTab === "workflow" && (
            <MultiAgentWorkflow modelId={selectedModelId} />
          )}

          {activeTab === "rag" && <RAGInterface modelId={selectedModelId} />}

          {activeTab === "coding" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Autonomous Coding Agents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create, debug, and refactor code with AI-powered coding assistants
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Code Generation */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    💻 Code Generator
                  </h3>
                  <FileUpload onFileContent={handleFileContent} />
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an expert software engineer. Help users write clean, efficient, and well-documented code. Provide explanations and best practices. Format all code with proper syntax highlighting."
                      placeholder="Describe the code you want to create..."
                    />
                  </div>
                </div>

                {/* Code Review & Debug */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🔍 Code Review & Debug
                  </h3>
                  <FileUpload onFileContent={handleFileContent} />
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a senior code reviewer. Analyze code for bugs, security issues, performance problems, and suggest improvements. Be thorough and constructive."
                      placeholder="Paste your code for review..."
                    />
                  </div>
                </div>

                {/* Architecture Design */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🏗️ Architecture Design
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a software architect. Help design scalable, maintainable systems. Provide architecture diagrams, technology recommendations, and design patterns."
                      placeholder="Describe your system requirements..."
                    />
                  </div>
                </div>

                {/* Test Generation */}
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🧪 Test Generator
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a testing expert. Generate comprehensive unit tests, integration tests, and edge cases. Write tests that are maintainable and thorough."
                      placeholder="Paste code to generate tests for..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "articles" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Article Composition
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create high-quality articles, blog posts, and content
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    ✍️ Blog Writer
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a professional blog writer. Create engaging, SEO-optimized blog posts with compelling headlines, clear structure, and valuable insights."
                      placeholder="What topic should I write about?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📚 Technical Writer
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a technical documentation expert. Write clear, comprehensive technical articles and documentation that developers can easily understand and implement."
                      placeholder="What technical topic needs documentation?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📰 News Writer
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a professional news writer. Write factual, unbiased news articles with proper structure: headline, lead, body, and conclusion. Focus on the 5 W's."
                      placeholder="What news story should I write?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    ✏️ Content Editor
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an expert editor. Improve grammar, clarity, style, and flow. Make content more engaging while preserving the author's voice."
                      placeholder="Paste content to edit..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "research" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Research Tools
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Conduct comprehensive research and analysis
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🔬 Research Assistant
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a research assistant. Help conduct thorough research on any topic. Provide well-organized findings, cite sources when possible, and identify key insights."
                      placeholder="What topic should I research?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📊 Data Analyst
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a data analyst. Help analyze data, identify trends, create visualizations, and provide actionable insights. Explain statistical concepts clearly."
                      placeholder="Describe your data analysis needs..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📈 Market Research
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a market research expert. Analyze markets, competitors, customer segments, and trends. Provide strategic insights and recommendations."
                      placeholder="What market should I analyze?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🎓 Academic Research
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an academic research assistant. Help with literature reviews, research methodologies, hypothesis formation, and scholarly writing."
                      placeholder="What academic topic are you researching?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "legal" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Legal Document Assistant
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Draft and review legal documents (informational purposes only)
                </p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                  <strong className="text-yellow-800 dark:text-yellow-200">
                    Disclaimer:
                  </strong>{" "}
                  <span className="text-yellow-700 dark:text-yellow-300">
                    This is for informational purposes only. Not legal advice. Consult
                    a licensed attorney for legal matters.
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📄 Contract Drafter
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a legal document assistant. Help draft clear, comprehensive contracts and agreements. Include necessary clauses and provisions. Remind users this is not legal advice."
                      placeholder="What type of contract do you need?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🔍 Legal Reviewer
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a legal document reviewer. Analyze legal documents for potential issues, unclear language, and missing provisions. Provide educational insights."
                      placeholder="Paste document to review..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📋 Terms & Conditions
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a legal document specialist. Draft comprehensive Terms & Conditions and Privacy Policies for websites and apps. Ensure clarity and completeness."
                      placeholder="Describe your service/product..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🤐 NDA Generator
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an NDA specialist. Draft Non-Disclosure Agreements appropriate for various situations. Include standard protections and clear terms."
                      placeholder="What type of NDA do you need?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "employees" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  AI Employees & Autonomous Agents
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Deploy specialized AI agents to handle various business tasks
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🎧 Customer Support Agent
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a customer support specialist. Help customers with their questions, troubleshoot issues, and provide excellent service with empathy and professionalism."
                      placeholder="Customer inquiry..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    💼 Sales Assistant
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a sales assistant. Help qualify leads, answer product questions, handle objections, and guide prospects through the sales process professionally."
                      placeholder="Sales scenario..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📅 Project Manager
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a project manager. Help plan projects, create timelines, allocate resources, identify risks, and keep projects on track."
                      placeholder="Describe your project..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    👔 HR Assistant
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an HR assistant. Help with job descriptions, interview questions, onboarding processes, and HR policy guidance."
                      placeholder="HR task..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📢 Marketing Specialist
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a marketing specialist. Create marketing strategies, campaigns, ad copy, email sequences, and social media content."
                      placeholder="Marketing need..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📧 Executive Assistant
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an executive assistant. Help with scheduling, email management, meeting prep, travel arrangements, and administrative tasks."
                      placeholder="Task for assistant..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "chatbots" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Chatbot Builder
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Create custom chatbots for different purposes and personalities
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🛍️ E-commerce Bot
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an e-commerce shopping assistant. Help customers find products, answer questions about items, explain shipping and returns, and provide excellent shopping experience."
                      placeholder="How can I help you shop today?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    📚 Educational Bot
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are an educational tutor. Teach concepts clearly, provide examples, answer questions patiently, and help students learn effectively."
                      placeholder="What would you like to learn?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🎮 Entertainment Bot
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a fun, entertaining chatbot. Tell jokes, share interesting facts, play word games, and engage users in enjoyable conversations."
                      placeholder="Let's have some fun!"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    ⚙️ Support Bot
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a technical support chatbot. Help users troubleshoot problems, provide step-by-step guidance, and escalate complex issues when needed."
                      placeholder="What do you need help with?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "websites" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                  Website Builder
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Generate website code, components, and designs
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🚀 Landing Page Builder
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a web developer specializing in landing pages. Create beautiful, conversion-optimized landing pages with HTML, CSS, and JavaScript. Include hero sections, features, testimonials, and CTAs."
                      placeholder="Describe your landing page..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🧩 Component Generator
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a React/Next.js expert. Generate reusable, modern UI components with TypeScript, Tailwind CSS, and best practices. Include props, state management, and accessibility."
                      placeholder="What component do you need?"
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🌐 Full Website Builder
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a full-stack web developer. Design and build complete websites with multiple pages, navigation, responsive design, and modern features. Provide architecture and implementation."
                      placeholder="Describe your website..."
                    />
                  </div>
                </div>

                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                    🎨 UI/UX Designer
                  </h3>
                  <div className="h-[600px]">
                    <EnhancedChatInterface
                      modelId={selectedModelId}
                      systemPrompt="You are a UI/UX designer. Create user-friendly designs, wireframes, color schemes, typography systems, and provide design rationale. Focus on usability and aesthetics."
                      placeholder="What design do you need?"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
