"use client";

import { useState } from "react";
import FileUpload from "./FileUpload";
import EnhancedChatInterface from "./EnhancedChatInterface";

interface Document {
  id: string;
  name: string;
  content: string;
  timestamp: Date;
}

interface RAGInterfaceProps {
  modelId: string;
}

export default function RAGInterface({ modelId }: RAGInterfaceProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [systemPrompt, setSystemPrompt] = useState("");

  const handleFileUpload = (content: string, filename: string) => {
    const doc: Document = {
      id: `doc_${Date.now()}`,
      name: filename,
      content,
      timestamp: new Date(),
    };
    setDocuments((prev) => [...prev, doc]);
    updateSystemPrompt([...documents, doc]);
  };

  const updateSystemPrompt = (docs: Document[]) => {
    if (docs.length === 0) {
      setSystemPrompt("");
      return;
    }

    const context = docs
      .map((doc) => `Document: ${doc.name}\n\n${doc.content}`)
      .join("\n\n---\n\n");

    const prompt = `You are an AI assistant with access to the following documents. Use this context to answer questions accurately and cite sources when relevant.

${context}

When answering questions:
1. Use information from the provided documents
2. Cite which document(s) you're referencing
3. If the answer isn't in the documents, say so
4. Be accurate and don't make up information`;

    setSystemPrompt(prompt);
  };

  const removeDocument = (id: string) => {
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    updateSystemPrompt(updated);
  };

  const clearAllDocuments = () => {
    if (confirm("Remove all documents?")) {
      setDocuments([]);
      setSystemPrompt("");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          RAG - Retrieval Augmented Generation
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Upload documents to create a knowledge base for the AI to reference
        </p>
      </div>

      {/* Document Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
            Upload Documents
          </h3>

          <FileUpload
            onFileContent={handleFileUpload}
            accept=".txt,.md,.json,.pdf,.doc,.docx"
            maxSize={10}
          />

          {/* Document List */}
          <div className="space-y-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="font-semibold text-sm text-gray-700 dark:text-gray-300">
                Loaded Documents ({documents.length})
              </h4>
              {documents.length > 0 && (
                <button
                  onClick={clearAllDocuments}
                  className="text-xs text-red-600 dark:text-red-400 hover:underline"
                >
                  Clear All
                </button>
              )}
            </div>

            {documents.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                No documents uploaded yet
              </p>
            ) : (
              documents.map((doc) => (
                <div
                  key={doc.id}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      📄 {doc.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {(doc.content.length / 1024).toFixed(1)} KB
                    </div>
                    <div className="text-xs text-gray-400 dark:text-gray-500">
                      {doc.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeDocument(doc.id)}
                    className="ml-2 text-red-500 hover:text-red-700 text-sm"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Info Box */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-sm">
            <strong className="text-blue-800 dark:text-blue-200">
              💡 How it works:
            </strong>
            <ul className="mt-2 space-y-1 text-blue-700 dark:text-blue-300 text-xs">
              <li>1. Upload your documents (PDF, TXT, MD, etc.)</li>
              <li>2. The AI will use them as context</li>
              <li>3. Ask questions about your documents</li>
              <li>4. Get accurate, sourced answers</li>
            </ul>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="lg:col-span-2">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden h-[700px]">
            <div className="bg-purple-100 dark:bg-purple-900 p-3">
              <h3 className="font-semibold text-gray-900 dark:text-white">
                Ask Questions About Your Documents
              </h3>
              {documents.length > 0 && (
                <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                  {documents.length} document{documents.length > 1 ? "s" : ""}{" "}
                  loaded
                </p>
              )}
            </div>
            <EnhancedChatInterface
              modelId={modelId}
              systemPrompt={systemPrompt}
              placeholder={
                documents.length === 0
                  ? "Upload documents first to start asking questions..."
                  : "Ask questions about your documents..."
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
