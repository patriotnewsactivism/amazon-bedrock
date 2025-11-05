export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
  topK?: number;
  stopSequences?: string[];
}

export const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
};

export function getStoredParameters(modelId: string): ModelParameters {
  const stored = localStorage.getItem(`params_${modelId}`);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return DEFAULT_PARAMETERS;
    }
  }
  return DEFAULT_PARAMETERS;
}

export function saveParameters(
  modelId: string,
  params: ModelParameters
): void {
  localStorage.setItem(`params_${modelId}`, JSON.stringify(params));
}

export function resetParameters(modelId: string): void {
  localStorage.removeItem(`params_${modelId}`);
}
