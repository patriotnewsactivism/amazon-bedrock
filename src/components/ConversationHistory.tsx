"use client";

import { useState, useEffect } from "react";
import {
  getAllConversations,
  deleteConversation,
  searchConversations,
} from "@/lib/conversationStorage";
import { ConversationHistory as ConversationType } from "@/lib/types";

interface ConversationHistoryProps {
  onSelectConversation: (conversation: ConversationType) => void;
  currentConversationId?: string;
}

export default function ConversationHistory({
  onSelectConversation,
  currentConversationId,
}: ConversationHistoryProps) {
  const [conversations, setConversations] = useState<ConversationType[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const loadConversations = () => {
    if (searchQuery.trim()) {
      setConversations(searchConversations(searchQuery));
    } else {
      setConversations(getAllConversations());
    }
  };

  useEffect(() => {
    loadConversations();
  }, [searchQuery]);

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Delete this conversation?")) {
      deleteConversation(id);
      loadConversations();
    }
  };

  const handleNewConversation = () => {
    onSelectConversation({
      id: `conv_${Date.now()}`,
      title: "New Conversation",
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    setIsOpen(false);
  };

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 p-3 bg-blue-600 text-white rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
        title="Conversation History"
      >
        💬 {isOpen ? "Close" : "History"}
      </button>

      {/* Sidebar */}
      {isOpen && (
        <div className="fixed left-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 shadow-xl z-40 overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
              Conversations
            </h2>

            {/* New Conversation Button */}
            <button
              onClick={handleNewConversation}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              ➕ New Conversation
            </button>

            {/* Search */}
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {conversations.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">
                {searchQuery ? "No conversations found" : "No conversations yet"}
              </p>
            ) : (
              conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => {
                    onSelectConversation(conv);
                    setIsOpen(false);
                  }}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    conv.id === currentConversationId
                      ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                      : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-sm text-gray-900 dark:text-white line-clamp-2">
                      {conv.title}
                    </h3>
                    <button
                      onClick={(e) => handleDelete(conv.id, e)}
                      className="text-red-500 hover:text-red-700 text-xs ml-2"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {conv.messages.length} messages
                  </div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">
                    {new Date(conv.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
