"use client";

import { useState, useEffect } from "react";
import { BedrockModel } from "@/lib/bedrock/models";

interface ModelSelectorProps {
  selectedModelId: string;
  onModelChange: (modelId: string) => void;
}

export default function ModelSelector({
  selectedModelId,
  onModelChange,
}: ModelSelectorProps) {
  const [models, setModels] = useState<BedrockModel[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await fetch("/api/models");
        const data = await response.json();
        setModels(data.models);
        setProviders(["All", ...data.providers]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching models:", error);
        setLoading(false);
      }
    };

    fetchModels();
  }, []);

  const filteredModels =
    selectedProvider === "All"
      ? models
      : models.filter((model) => model.provider === selectedProvider);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {providers.map((provider) => (
          <button
            key={provider}
            onClick={() => setSelectedProvider(provider)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              selectedProvider === provider
                ? "bg-blue-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {provider}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-8">Loading models...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredModels.map((model) => (
            <button
              key={model.id}
              onClick={() => onModelChange(model.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedModelId === model.id
                  ? "border-blue-600 bg-blue-50 dark:bg-blue-900/20"
                  : "border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500"
              }`}
            >
              <div className="font-semibold text-lg mb-1">{model.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {model.provider}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                {model.description}
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                {model.capabilities.map((cap) => (
                  <span
                    key={cap}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    {cap}
                  </span>
                ))}
              </div>
              {model.pricing && (
                <div className="text-xs text-gray-500">
                  In: {model.pricing.input} | Out: {model.pricing.output}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {selectedModel && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <strong>Selected:</strong> {selectedModel.name} ({selectedModel.provider})
        </div>
      )}
    </div>
  );
}
