import type { LLMConfig } from "../types"
import { getConfigWithEnvVars } from "../llm-service"

export const googleAdapter = {
  testConnection: async (config: LLMConfig) => {
    try {
      const effectiveConfig = getConfigWithEnvVars(config)
      const apiKey = effectiveConfig.google.apiKey

      if (!apiKey) {
        return {
          success: false,
          error: "Google API key is required",
        }
      }

      // Make a minimal API call to test the connection
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${effectiveConfig.google.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: "Hello, this is a test.",
                  },
                ],
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error ${response.status}`

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch (e) {
          // If not JSON, use the text directly
          errorMessage = errorText.substring(0, 100) // Limit length
        }

        return {
          success: false,
          error: errorMessage,
        }
      }

      return {
        success: true,
        message: "Successfully connected to Google API",
      }
    } catch (error) {
      console.error("Google connection test error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error connecting to Google API",
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
      const apiKey = effectiveConfig.google.apiKey

      if (!apiKey) {
        throw new Error("Google API key is required")
      }

      // Use provided maxTokens, or fall back to config-specific maxTokens
      const effectiveMaxTokens = maxTokens || effectiveConfig.google.maxTokens || effectiveConfig.maxTokens

      const requestBody: any = {
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature,
        },
      }

      if (effectiveMaxTokens) {
        requestBody.generationConfig.maxOutputTokens = effectiveMaxTokens
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${effectiveConfig.google.model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        },
      )

      if (!response.ok) {
        const errorText = await response.text()
        let errorMessage = `HTTP error ${response.status}`

        try {
          // Try to parse as JSON
          const errorData = JSON.parse(errorText)
          errorMessage = errorData.error?.message || errorMessage
        } catch (e) {
          // If not JSON, use the text directly
          errorMessage = errorText.substring(0, 100) // Limit length
        }

        throw new Error(errorMessage)
      }

      const data = await response.json()

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error("No response generated from the model")
      }

      const text = data.candidates[0].content.parts[0].text

      return { text }
    } catch (error) {
      console.error("Google text generation error:", error)
      throw new Error(`Google API error: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },
}
