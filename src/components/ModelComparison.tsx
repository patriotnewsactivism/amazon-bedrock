"use client";

import { useState } from "react";
import EnhancedChatInterface from "./EnhancedChatInterface";
import ModelSelector from "./ModelSelector";

export default function ModelComparison() {
  const [model1, setModel1] = useState("anthropic.claude-3-5-sonnet-20241022-v2:0");
  const [model2, setModel2] = useState("meta.llama3-1-405b-instruct-v1:0");
  const [showSelectors, setShowSelectors] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Model Comparison
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Compare responses from two different models side-by-side
        </p>

        <button
          onClick={() => setShowSelectors(!showSelectors)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mb-4"
        >
          {showSelectors ? "Hide" : "Change"} Models
        </button>

        {showSelectors && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Model 1
              </h3>
              <ModelSelector selectedModelId={model1} onModelChange={setModel1} />
            </div>
            <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
              <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">
                Model 2
              </h3>
              <ModelSelector selectedModelId={model2} onModelChange={setModel2} />
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-blue-100 dark:bg-blue-900 p-3 font-semibold text-gray-900 dark:text-white">
            Model 1: {model1.split(".")[1]?.split("-").slice(0, 2).join(" ")}
          </div>
          <div className="h-[600px]">
            <EnhancedChatInterface
              modelId={model1}
              placeholder="Type message to compare models..."
            />
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="bg-purple-100 dark:bg-purple-900 p-3 font-semibold text-gray-900 dark:text-white">
            Model 2: {model2.split(".")[1]?.split("-").slice(0, 2).join(" ")}
          </div>
          <div className="h-[600px]">
            <EnhancedChatInterface
              modelId={model2}
              placeholder="Type message to compare models..."
            />
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
        <strong className="text-yellow-800 dark:text-yellow-200">💡 Tip:</strong>{" "}
        <span className="text-yellow-700 dark:text-yellow-300">
          Send the same prompt to both models to compare their responses, reasoning styles, and quality.
        </span>
      </div>
    </div>
  );
}
