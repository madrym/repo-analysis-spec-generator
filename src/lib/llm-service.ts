import type { LLMConfig, LLMProvider } from "../lib/types"
import { openaiAdapter } from "./llm-adapters/openai-adapter"
import { googleAdapter } from "./llm-adapters/google-adapter"

// Test the LLM connection
export async function testLLMConnection(config: LLMConfig) {
  try {
    const adapter = getAdapter(config.provider)
    return await adapter.testConnection(config)
  } catch (error) {
    console.error("Error testing LLM connection:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    }
  }
}

// Generate text using the configured LLM provider
export async function generateLLMText({
  prompt,
  config,
  temperature = 0.7,
  maxTokens,
}: {
  prompt: string
  config: LLMConfig
  temperature?: number
  maxTokens?: number
}) {
  try {
    const adapter = getAdapter(config.provider)
    return await adapter.generateText({
      prompt,
      config,
      temperature,
      maxTokens,
    })
  } catch (error) {
    console.error("Error generating text with LLM:", error)
    throw new Error(`Failed to generate text: ${error instanceof Error ? error.message : "Unknown error occurred"}`)
  }
}

// Get the appropriate adapter based on the provider
function getAdapter(provider: LLMProvider) {
  switch (provider) {
    case "openai":
      return openaiAdapter
    case "google":
      return googleAdapter
    default:
      throw new Error(`Unsupported LLM provider: ${provider}`)
  }
}

// Helper to get environment variables if useEnvVars is enabled
export function getConfigWithEnvVars(config: LLMConfig): LLMConfig {
  if (!config.useEnvVars) {
    return config
  }

  const newConfig = { ...config }

  // Apply global max tokens if available
  if (typeof process.env.LLM_MAX_TOKENS !== "undefined" && process.env.LLM_MAX_TOKENS !== "") {
    const maxTokens = Number.parseInt(process.env.LLM_MAX_TOKENS)
    if (!isNaN(maxTokens)) {
      newConfig.maxTokens = maxTokens
    }
  }

  // Apply environment variables if they exist
  if (config.provider === "openai") {
    // Only apply OpenAI API key if it exists and is not empty
    if (typeof process.env.OPENAI_API_KEY !== "undefined" && process.env.OPENAI_API_KEY !== "") {
      newConfig.openai = {
        ...newConfig.openai,
        apiKey: process.env.OPENAI_API_KEY,
      }
    }

    // Only apply OpenAI base URL if it exists and is not empty
    if (typeof process.env.OPENAI_BASE_URL !== "undefined" && process.env.OPENAI_BASE_URL !== "") {
      newConfig.openai = {
        ...newConfig.openai,
        baseUrl: process.env.OPENAI_BASE_URL,
      }
    }

    // Only apply OpenAI model if it exists and is not empty
    if (typeof process.env.OPENAI_MODEL !== "undefined" && process.env.OPENAI_MODEL !== "") {
      newConfig.openai = {
        ...newConfig.openai,
        model: process.env.OPENAI_MODEL,
      }
    }

    if (typeof process.env.OPENAI_MAX_TOKENS !== "undefined" && process.env.OPENAI_MAX_TOKENS !== "") {
      const maxTokens = Number.parseInt(process.env.OPENAI_MAX_TOKENS)
      if (!isNaN(maxTokens)) {
        newConfig.openai = {
          ...newConfig.openai,
          maxTokens,
        }
      }
    }
  } else if (config.provider === "google") {
    if (typeof process.env.GOOGLE_API_KEY !== "undefined" && process.env.GOOGLE_API_KEY !== "") {
      newConfig.google = {
        ...newConfig.google,
        apiKey: process.env.GOOGLE_API_KEY,
      }
    }

    if (typeof process.env.GOOGLE_MODEL !== "undefined" && process.env.GOOGLE_MODEL !== "") {
      newConfig.google = {
        ...newConfig.google,
        model: process.env.GOOGLE_MODEL,
      }
    }

    if (typeof process.env.GOOGLE_MAX_TOKENS !== "undefined" && process.env.GOOGLE_MAX_TOKENS !== "") {
      const maxTokens = Number.parseInt(process.env.GOOGLE_MAX_TOKENS)
      if (!isNaN(maxTokens)) {
        newConfig.google = {
          ...newConfig.google,
          maxTokens,
        }
      }
    }
  }

  return newConfig
}

// Check if a provider's configuration is complete
export function isProviderConfigComplete(config: LLMConfig, provider: LLMProvider): boolean {
  if (provider === "openai") {
    return Boolean(config.openai.apiKey) && Boolean(config.openai.model)
  } else if (provider === "google") {
    return Boolean(config.google.apiKey) && Boolean(config.google.model)
  }
  return false
}

// Get a list of available providers based on configuration
export function getAvailableProviders(config: LLMConfig): LLMProvider[] {
  const providers: LLMProvider[] = []

  if (isProviderConfigComplete(config, "openai")) {
    providers.push("openai")
  }

  if (isProviderConfigComplete(config, "google")) {
    providers.push("google")
  }

  return providers
}
