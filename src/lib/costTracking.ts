import { BedrockModel, BEDROCK_MODELS } from "./bedrock/models";

export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalCost: number;
  modelId: string;
  timestamp: Date;
}

export interface CostEstimate {
  inputCost: number;
  outputCost: number;
  totalCost: number;
}

export function estimateCost(
  modelId: string,
  inputTokens: number,
  outputTokens: number
): CostEstimate {
  const model = BEDROCK_MODELS.find((m) => m.id === modelId);
  if (!model?.pricing) {
    return { inputCost: 0, outputCost: 0, totalCost: 0 };
  }

  // Parse pricing (e.g., "$3.00/MTok" -> 3.0)
  const parsePrice = (price: string): number => {
    const match = price.match(/\$?([\d.]+)/);
    return match ? parseFloat(match[1]) : 0;
  };

  const inputPricePerMTok = parsePrice(model.pricing.input);
  const outputPricePerMTok = parsePrice(model.pricing.output);

  const inputCost = (inputTokens / 1000000) * inputPricePerMTok;
  const outputCost = (outputTokens / 1000000) * outputPricePerMTok;

  return {
    inputCost,
    outputCost,
    totalCost: inputCost + outputCost,
  };
}

export function countTokens(text: string): number {
  // Rough estimation: ~4 characters per token
  // More accurate would use tiktoken or similar
  return Math.ceil(text.length / 4);
}

export function saveTokenUsage(usage: TokenUsage): void {
  const history = getTokenUsageHistory();
  history.push(usage);
  localStorage.setItem("tokenUsageHistory", JSON.stringify(history));
}

export function getTokenUsageHistory(): TokenUsage[] {
  const stored = localStorage.getItem("tokenUsageHistory");
  if (!stored) return [];
  return JSON.parse(stored).map((item: any) => ({
    ...item,
    timestamp: new Date(item.timestamp),
  }));
}

export function getTotalCost(): number {
  const history = getTokenUsageHistory();
  return history.reduce((sum, item) => sum + item.totalCost, 0);
}

export function getCostByModel(): Record<string, number> {
  const history = getTokenUsageHistory();
  const byModel: Record<string, number> = {};

  history.forEach((item) => {
    byModel[item.modelId] = (byModel[item.modelId] || 0) + item.totalCost;
  });

  return byModel;
}

export function getCostByDateRange(startDate: Date, endDate: Date): number {
  const history = getTokenUsageHistory();
  return history
    .filter(
      (item) => item.timestamp >= startDate && item.timestamp <= endDate
    )
    .reduce((sum, item) => sum + item.totalCost, 0);
}

export function clearUsageHistory(): void {
  localStorage.removeItem("tokenUsageHistory");
}
