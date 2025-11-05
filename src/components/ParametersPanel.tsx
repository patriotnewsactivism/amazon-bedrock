"use client";

import { useState, useEffect } from "react";
import { ModelParameters, DEFAULT_PARAMETERS, getStoredParameters, saveParameters } from "@/lib/modelParameters";

interface ParametersPanelProps {
  modelId: string;
  onParametersChange: (params: ModelParameters) => void;
}

export default function ParametersPanel({ modelId, onParametersChange }: ParametersPanelProps) {
  const [params, setParams] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const stored = getStoredParameters(modelId);
    setParams(stored);
    onParametersChange(stored);
  }, [modelId]);

  const updateParam = (key: keyof ModelParameters, value: number) => {
    const newParams = { ...params, [key]: value };
    setParams(newParams);
    saveParameters(modelId, newParams);
    onParametersChange(newParams);
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <span>⚙️ Advanced Parameters</span>
        <span className="text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4">
          {/* Temperature */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Temperature: {params.temperature.toFixed(2)}
              <span className="text-xs ml-2 text-gray-500">
                (Higher = more creative)
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.temperature}
              onChange={(e) => updateParam("temperature", parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Precise (0.0)</span>
              <span>Balanced (0.7)</span>
              <span>Creative (1.0)</span>
            </div>
          </div>

          {/* Max Tokens */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Max Tokens: {params.maxTokens}
              <span className="text-xs ml-2 text-gray-500">
                (~{Math.round(params.maxTokens * 0.75)} words)
              </span>
            </label>
            <input
              type="range"
              min="256"
              max="8192"
              step="256"
              value={params.maxTokens}
              onChange={(e) => updateParam("maxTokens", parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>256</span>
              <span>4096</span>
              <span>8192</span>
            </div>
          </div>

          {/* Top P */}
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Top P: {params.topP.toFixed(2)}
              <span className="text-xs ml-2 text-gray-500">
                (Nucleus sampling)
              </span>
            </label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={params.topP}
              onChange={(e) => updateParam("topP", parseFloat(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Focused (0.0)</span>
              <span>Balanced (0.9)</span>
              <span>Diverse (1.0)</span>
            </div>
          </div>

          {/* Reset Button */}
          <button
            onClick={() => {
              setParams(DEFAULT_PARAMETERS);
              saveParameters(modelId, DEFAULT_PARAMETERS);
              onParametersChange(DEFAULT_PARAMETERS);
            }}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            Reset to Defaults
          </button>
        </div>
      )}
    </div>
  );
}
