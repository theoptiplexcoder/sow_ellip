// Tenant-configured AI provider for Agentic SOW Editing (PRD §5.13).
// One row per tenant, selecting and configuring that tenant's provider.
// A tenant can keep a saved model+key for each provider independently and
// choose which one is currently active for the agent.

export type AiProvider = 'openrouter' | 'huggingface';

export interface ProviderConfig {
  model: string;
  apiKey: string;
}

export interface TenantAiSettings {
  activeProvider: AiProvider;
  providers: Record<AiProvider, ProviderConfig>;
  temperature: number;
  maxTokens: number;
  toolCallingEnabled: boolean;
  streamingEnabled: boolean;
}

export const tenantAiSettings: TenantAiSettings = {
  activeProvider: 'huggingface',
  providers: {
    openrouter: { model: 'openai/gpt-oss-20b:free', apiKey: '' },
    huggingface: {
      model: 'thinkingmachines/Inkling:fireworks-ai',
      apiKey: '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',
    },
  },
  temperature: 0.3,
  maxTokens: 1024,
  toolCallingEnabled: true,
  streamingEnabled: false,
};

export function updateTenantAiSettings(
  patch: Partial<Omit<TenantAiSettings, 'providers'>>,
) {
  Object.assign(tenantAiSettings, patch);
}

export function updateProviderConfig(
  provider: AiProvider,
  patch: Partial<ProviderConfig>,
) {
  Object.assign(tenantAiSettings.providers[provider], patch);
}

/** Whether the tenant has configured an API key for at least one provider. */
export function hasAnyProviderApiKey() {
  return Object.values(tenantAiSettings.providers).some(
    (p) => p.apiKey.trim() !== '',
  );
}

/** Flattened view of the currently active provider's config, for the agent loop. */
export function getActiveProviderSettings() {
  const active = tenantAiSettings.providers[tenantAiSettings.activeProvider];
  return {
    provider: tenantAiSettings.activeProvider,
    model: active.model,
    apiKey: active.apiKey,
    temperature: tenantAiSettings.temperature,
    maxTokens: tenantAiSettings.maxTokens,
    toolCallingEnabled: tenantAiSettings.toolCallingEnabled,
    streamingEnabled: tenantAiSettings.streamingEnabled,
  };
}
