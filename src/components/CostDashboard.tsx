"use client";

import { useState, useEffect } from "react";
import {
  getTotalCost,
  getCostByModel,
  getCostByDateRange,
  getTokenUsageHistory,
  clearUsageHistory,
} from "@/lib/costTracking";
import { getModelById } from "@/lib/bedrock/models";

export default function CostDashboard() {
  const [isOpen, setIsOpen] = useState(false);
  const [totalCost, setTotalCost] = useState(0);
  const [costByModel, setCostByModel] = useState<Record<string, number>>({});
  const [todayCost, setTodayCost] = useState(0);
  const [thisMonthCost, setThisMonthCost] = useState(0);

  const refreshData = () => {
    setTotalCost(getTotalCost());
    setCostByModel(getCostByModel());

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    setTodayCost(getCostByDateRange(startOfDay, now));
    setThisMonthCost(getCostByDateRange(startOfMonth, now));
  };

  useEffect(() => {
    refreshData();
    // Refresh every 10 seconds while open
    const interval = isOpen ? setInterval(refreshData, 10000) : null;
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);

  const handleClear = () => {
    if (
      confirm(
        "Are you sure you want to clear all usage history? This cannot be undone."
      )
    ) {
      clearUsageHistory();
      refreshData();
    }
  };

  return (
    <div className="mb-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
      >
        <span>💰 Cost Tracker</span>
        <span className="font-bold">${totalCost.toFixed(4)}</span>
        <span className="text-sm">{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div className="mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-sm text-blue-600 dark:text-blue-400 mb-1">
                Today
              </div>
              <div className="text-2xl font-bold text-blue-900 dark:text-blue-200">
                ${todayCost.toFixed(4)}
              </div>
            </div>

            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
              <div className="text-sm text-purple-600 dark:text-purple-400 mb-1">
                This Month
              </div>
              <div className="text-2xl font-bold text-purple-900 dark:text-purple-200">
                ${thisMonthCost.toFixed(4)}
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-sm text-green-600 dark:text-green-400 mb-1">
                All Time
              </div>
              <div className="text-2xl font-bold text-green-900 dark:text-green-200">
                ${totalCost.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Cost by Model */}
          <div>
            <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
              Cost by Model
            </h3>
            <div className="space-y-2">
              {Object.entries(costByModel).length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  No usage data yet. Start chatting to track costs!
                </p>
              ) : (
                Object.entries(costByModel)
                  .sort((a, b) => b[1] - a[1])
                  .map(([modelId, cost]) => {
                    const model = getModelById(modelId);
                    return (
                      <div
                        key={modelId}
                        className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {model?.name || modelId}
                        </span>
                        <span className="font-semibold text-gray-900 dark:text-white">
                          ${cost.toFixed(4)}
                        </span>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
            >
              Refresh
            </button>
            <button
              onClick={handleClear}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors text-sm"
            >
              Clear History
            </button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 dark:text-gray-400 pt-2 border-t border-gray-200 dark:border-gray-700">
            <p>
              💡 Costs are estimated based on token usage and published pricing.
              Actual AWS charges may vary slightly.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
