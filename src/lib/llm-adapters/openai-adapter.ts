import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"
import type { LLMConfig } from "../types"
import { getConfigWithEnvVars } from "../llm-service"

export const openaiAdapter = {
  testConnection: async (config: LLMConfig) => {
    try {
      const effectiveConfig = getConfigWithEnvVars(config)
      const apiKey = effectiveConfig.openai.apiKey

      if (!apiKey) {
        return {
          success: false,
          error:
            "OpenAI API key is not configured. Please provide an API key in settings or via environment variables.",
        }
      }

      // Make a minimal API call to test the connection
      const { text } = await generateText({
        model: openai(effectiveConfig.openai.model, {
          apiKey,
          baseURL: effectiveConfig.openai.baseUrl || undefined,
        }),
        prompt: "Hello, this is a test.",
        maxTokens: 5,
      })

      return {
        success: true,
        message: "Successfully connected to OpenAI API",
      }
    } catch (error) {
      console.error("OpenAI connection test error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error connecting to OpenAI",
      }
    }
  },

  generateText: async ({
    prompt,
    config,
    temperature = 0.7,
    maxTokens,
  }: {
    prompt: string
    config: LLMConfig
    temperature?: number
    maxTokens?: number
  }) => {
    try {
      const effectiveConfig = getConfigWithEnvVars(config)
      const apiKey = effectiveConfig.openai.apiKey

      if (!apiKey) {
        throw new Error(
          "OpenAI API key is not configured. Please provide an API key in settings or via environment variables.",
        )
      }

      // Use provided maxTokens, or fall back to config-specific maxTokens
      const effectiveMaxTokens = maxTokens || effectiveConfig.openai.maxTokens || effectiveConfig.maxTokens

      const { text } = await generateText({
        model: openai(effectiveConfig.openai.model, {
          apiKey,
          baseURL: effectiveConfig.openai.baseUrl || undefined,
        }),
        prompt,
        temperature,
        maxTokens: effectiveMaxTokens,
      })

      return { text }
    } catch (error) {
      console.error("OpenAI text generation error:", error)
      throw new Error(`OpenAI error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
}
