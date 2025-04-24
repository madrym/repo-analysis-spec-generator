import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { LLMConfig } from "./types" // Assuming LLMConfig type is defined here or import from correct path

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Default configuration values
const DEFAULT_OPENAI_MODEL = "claude-3.7-sonnet"
const DEFAULT_GOOGLE_MODEL = "gemini-2.5-pro-exp-03-25"
const DEFAULT_MAX_TOKENS = "64000"

/**
 * Reads LLM configuration from environment variables.
 * Provides default values if environment variables are not set.
 */
export function getLLMConfigFromEnv(): Pick<LLMConfig, 'maxTokens' | 'openai' | 'google'> {
  return {
    maxTokens: Number.parseInt(
        process.env.MAX_TOKENS || DEFAULT_MAX_TOKENS
    ),
    openai: {
      apiKey: process.env.OPENAI_API_KEY || "",
      baseUrl: process.env.OPENAI_BASE_URL || "",
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      maxTokens: Number.parseInt(
        process.env.OPENAI_MAX_TOKENS || DEFAULT_MAX_TOKENS
      ),
    },
    google: {
      apiKey: process.env.GOOGLE_API_KEY || "",
      model: process.env.GOOGLE_MODEL || DEFAULT_GOOGLE_MODEL,
      maxTokens: Number.parseInt(
        process.env.GOOGLE_MAX_TOKENS || DEFAULT_MAX_TOKENS
      ),
    },
  }
}
