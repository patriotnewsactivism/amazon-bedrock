"use client";

import { useState, useRef, useEffect } from "react";
import { Message, ConversationHistory } from "@/lib/types";
import {
  saveConversation,
  generateConversationTitle,
  exportConversation,
} from "@/lib/conversationStorage";
import { countTokens, estimateCost, saveTokenUsage } from "@/lib/costTracking";
import { copyToClipboard, downloadFile } from "@/lib/exportUtils";
import MarkdownRenderer from "./MarkdownRenderer";
import ParametersPanel from "./ParametersPanel";
import { ModelParameters, DEFAULT_PARAMETERS } from "@/lib/modelParameters";

interface EnhancedChatInterfaceProps {
  modelId: string;
  systemPrompt?: string;
  placeholder?: string;
  conversationId?: string;
  onConversationUpdate?: (conversation: ConversationHistory) => void;
}

export default function EnhancedChatInterface({
  modelId,
  systemPrompt,
  placeholder = "Type your message... (Ctrl+Enter to send)",
  conversationId,
  onConversationUpdate,
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [currentStreamText, setCurrentStreamText] = useState("");
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [estimatedCost, setEstimatedCost] = useState({
    inputCost: 0,
    outputCost: 0,
    totalCost: 0,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, currentStreamText]);

  useEffect(() => {
    // Calculate estimated cost for current input
    if (input) {
      const inputTokens = countTokens(input);
      const estimate = estimateCost(modelId, inputTokens, parameters.maxTokens);
      setEstimatedCost(estimate);
    } else {
      setEstimatedCost({ inputCost: 0, outputCost: 0, totalCost: 0 });
    }
  }, [input, modelId, parameters.maxTokens]);

  const saveCurrentConversation = (updatedMessages: Message[]) => {
    const conversation: ConversationHistory = {
      id: conversationId || `conv_${Date.now()}`,
      title: generateConversationTitle(updatedMessages),
      messages: updatedMessages,
      createdAt: new Date(),
      updatedAt: new Date(),
      metadata: { modelId, systemPrompt },
    };
    saveConversation(conversation);
    onConversationUpdate?.(conversation);
  };

  const sendMessage = async (useStreaming = true) => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
      modelId,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    // Track input tokens
    const inputTokens = countTokens(input);

    try {
      const prompt = systemPrompt ? `${systemPrompt}\n\nUser: ${input}` : input;

      if (useStreaming) {
        setStreaming(true);
        setCurrentStreamText("");

        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId,
            prompt,
            params: parameters,
            stream: true,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.body) throw new Error("No response body");

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setCurrentStreamText(fullText);
                }
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: fullText,
          timestamp: new Date(),
          modelId,
        };

        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        saveCurrentConversation(finalMessages);

        // Track cost
        const outputTokens = countTokens(fullText);
        const cost = estimateCost(modelId, inputTokens, outputTokens);
        saveTokenUsage({
          inputTokens,
          outputTokens,
          totalCost: cost.totalCost,
          modelId,
          timestamp: new Date(),
        });

        setCurrentStreamText("");
        setStreaming(false);
      } else {
        const response = await fetch("/api/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId,
            prompt,
            params: parameters,
            stream: false,
          }),
        });

        const data = await response.json();

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: data.text || "No response",
          timestamp: new Date(),
          modelId,
        };

        const finalMessages = [...newMessages, assistantMessage];
        setMessages(finalMessages);
        saveCurrentConversation(finalMessages);

        // Track cost
        const outputTokens = countTokens(data.text || "");
        const cost = estimateCost(modelId, inputTokens, outputTokens);
        saveTokenUsage({
          inputTokens,
          outputTokens,
          totalCost: cost.totalCost,
          modelId,
          timestamp: new Date(),
        });
      }
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.log("Request aborted");
      } else {
        console.error("Error sending message:", error);
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Error: ${error.message || "Failed to get response"}`,
          timestamp: new Date(),
        };
        const errorMessages = [...newMessages, errorMessage];
        setMessages(errorMessages);
        saveCurrentConversation(errorMessages);
      }
    } finally {
      setLoading(false);
      setStreaming(false);
      abortControllerRef.current = null;
    }
  };

  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      sendMessage();
    }
  };

  const copyMessage = async (content: string) => {
    try {
      await copyToClipboard(content);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const exportChat = (format: "json" | "markdown" | "txt") => {
    const conversation: ConversationHistory = {
      id: conversationId || `conv_${Date.now()}`,
      title: generateConversationTitle(messages),
      messages,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const content = exportConversation(conversation, format);
    const extension = format === "markdown" ? "md" : format;
    downloadFile(content, `conversation_${Date.now()}.${extension}`);
  };

  const clearChat = () => {
    if (messages.length > 0 && confirm("Clear this conversation?")) {
      setMessages([]);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Parameters Panel */}
      <ParametersPanel
        modelId={modelId}
        onParametersChange={setParameters}
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 dark:text-gray-400 py-8">
            Start a conversation...
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[85%] p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-semibold">
                    {message.role === "user" ? "You" : "Assistant"}
                  </div>
                  <button
                    onClick={() => copyMessage(message.content)}
                    className="text-xs opacity-70 hover:opacity-100 transition-opacity px-2 py-1 rounded hover:bg-black/10"
                    title="Copy message"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  {message.role === "assistant" ? (
                    <MarkdownRenderer content={message.content} />
                  ) : (
                    <div className="whitespace-pre-wrap">{message.content}</div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}

        {/* Streaming message */}
        {streaming && currentStreamText && (
          <div className="flex justify-start">
            <div className="max-w-[85%] p-4 rounded-lg bg-gray-100 dark:bg-gray-800">
              <div className="text-sm font-semibold mb-2">Assistant</div>
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <MarkdownRenderer content={currentStreamText} />
              </div>
              <div className="mt-2 text-xs text-gray-500 animate-pulse">
                Generating...
              </div>
            </div>
          </div>
        )}

        {loading && !streaming && (
          <div className="flex justify-start">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Action Bar */}
      {messages.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex gap-2 flex-wrap">
          <button
            onClick={() => exportChat("markdown")}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            📥 Export MD
          </button>
          <button
            onClick={() => exportChat("json")}
            className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            📥 Export JSON
          </button>
          <button
            onClick={clearChat}
            className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            🗑️ Clear
          </button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        {input && (
          <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">
            Estimated cost: ${estimatedCost.totalCost.toFixed(6)} (max)
          </div>
        )}
        <div className="flex gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={placeholder}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg resize-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            disabled={loading}
          />
          <div className="flex flex-col gap-2">
            {streaming ? (
              <button
                onClick={stopGeneration}
                className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                ⏹️ Stop
              </button>
            ) : (
              <button
                onClick={() => sendMessage(true)}
                disabled={loading || !input.trim()}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Send
              </button>
            )}
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Press Ctrl+Enter to send
        </div>
      </div>
    </div>
  );
}
