"use client";

import { useState } from "react";
import { AgentTask } from "@/lib/types";

interface WorkflowStep {
  id: string;
  name: string;
  systemPrompt: string;
  output?: string;
  status: "pending" | "running" | "completed" | "failed";
}

interface MultiAgentWorkflowProps {
  modelId: string;
}

export default function MultiAgentWorkflow({ modelId }: MultiAgentWorkflowProps) {
  const [input, setInput] = useState("");
  const [workflow, setWorkflow] = useState<WorkflowStep[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const predefinedWorkflows = [
    {
      name: "Research → Write → Edit",
      steps: [
        {
          name: "Research",
          systemPrompt: "You are a research assistant. Research the topic thoroughly and provide key findings.",
        },
        {
          name: "Write",
          systemPrompt: "You are a professional writer. Using the research provided, write a comprehensive article.",
        },
        {
          name: "Edit",
          systemPrompt: "You are an expert editor. Polish the article for grammar, clarity, and flow.",
        },
      ],
    },
    {
      name: "Code → Test → Review",
      steps: [
        {
          name: "Code Generator",
          systemPrompt: "You are a software engineer. Write clean, well-documented code based on the requirements.",
        },
        {
          name: "Test Generator",
          systemPrompt: "You are a testing expert. Generate comprehensive tests for the code provided.",
        },
        {
          name: "Code Reviewer",
          systemPrompt: "You are a senior developer. Review the code and tests for quality, security, and best practices.",
        },
      ],
    },
    {
      name: "Outline → Draft → Refine",
      steps: [
        {
          name: "Outliner",
          systemPrompt: "Create a detailed outline for the content.",
        },
        {
          name: "Drafter",
          systemPrompt: "Write a full draft based on the outline.",
        },
        {
          name: "Refiner",
          systemPrompt: "Refine and improve the draft to make it publication-ready.",
        },
      ],
    },
  ];

  const loadWorkflow = (workflowIndex: number) => {
    const selected = predefinedWorkflows[workflowIndex];
    const steps: WorkflowStep[] = selected.steps.map((step, idx) => ({
      id: `step_${idx}`,
      name: step.name,
      systemPrompt: step.systemPrompt,
      status: "pending",
    }));
    setWorkflow(steps);
  };

  const runWorkflow = async () => {
    if (!input.trim() || workflow.length === 0) return;

    setIsRunning(true);
    let currentInput = input;

    for (let i = 0; i < workflow.length; i++) {
      const step = workflow[i];

      // Update status to running
      setWorkflow((prev) =>
        prev.map((s, idx) =>
          idx === i ? { ...s, status: "running" } : s
        )
      );

      try {
        const prompt = `${step.systemPrompt}\n\nInput:\n${currentInput}`;

        const response = await fetch("/api/invoke", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            modelId,
            prompt,
            params: { temperature: 0.7, maxTokens: 4096 },
          }),
        });

        const data = await response.json();
        const output = data.text || "";

        // Update status to completed with output
        setWorkflow((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: "completed", output }
              : s
          )
        );

        // Use this output as input for next step
        currentInput = output;
      } catch (error) {
        console.error(`Error in step ${step.name}:`, error);
        setWorkflow((prev) =>
          prev.map((s, idx) =>
            idx === i
              ? { ...s, status: "failed", output: "Error occurred" }
              : s
          )
        );
        break;
      }
    }

    setIsRunning(false);
  };

  const resetWorkflow = () => {
    setWorkflow((prev) =>
      prev.map((s) => ({ ...s, status: "pending", output: undefined }))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          Multi-Agent Workflow
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Chain multiple AI agents together to complete complex tasks
        </p>
      </div>

      {/* Predefined Workflows */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
          Load Predefined Workflow:
        </h3>
        <div className="flex gap-2 flex-wrap">
          {predefinedWorkflows.map((wf, idx) => (
            <button
              key={idx}
              onClick={() => loadWorkflow(idx)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {wf.name}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div>
        <label className="block font-semibold mb-2 text-gray-900 dark:text-white">
          Initial Input:
        </label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter your task or content..."
          className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          rows={4}
        />
      </div>

      {/* Workflow Steps */}
      {workflow.length > 0 && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <button
              onClick={runWorkflow}
              disabled={isRunning || !input.trim()}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isRunning ? "Running..." : "▶️ Run Workflow"}
            </button>
            <button
              onClick={resetWorkflow}
              disabled={isRunning}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
            >
              🔄 Reset
            </button>
          </div>

          <div className="space-y-4">
            {workflow.map((step, idx) => (
              <div
                key={step.id}
                className={`p-4 border-2 rounded-lg ${
                  step.status === "completed"
                    ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                    : step.status === "running"
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                    : step.status === "failed"
                    ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="font-bold text-lg text-gray-900 dark:text-white">
                    {idx + 1}. {step.name}
                  </div>
                  <div className="text-sm">
                    {step.status === "completed" && "✅"}
                    {step.status === "running" && (
                      <span className="animate-pulse">⏳</span>
                    )}
                    {step.status === "failed" && "❌"}
                    {step.status === "pending" && "⏸️"}
                  </div>
                </div>

                <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {step.systemPrompt}
                </div>

                {step.output && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400">
                      OUTPUT:
                    </div>
                    <div className="text-sm whitespace-pre-wrap text-gray-900 dark:text-gray-100">
                      {step.output}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
