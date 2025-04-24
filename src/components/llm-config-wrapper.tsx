"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LLMConfig, LLMConnectionStatus, LLMProvider } from "../lib/types"
import { testLLMConnection, getAvailableProviders, isProviderConfigComplete } from "../lib/llm-service"

// Default configuration
const defaultConfig: LLMConfig = {
  provider: "openai",
  useEnvVars: true,
  maxTokens: 64000,
  openai: {
    apiKey: "",
    baseUrl: "",
    model: "claude-3.7-sonnet",
    maxTokens: 64000,
  },
  google: {
    apiKey: "",
    model: "gemini-2.5-pro-exp-03-25",
    maxTokens: 64000,
  },
}

interface LLMConfigContextType {
  config: LLMConfig
  updateConfig: (partialConfig: Partial<LLMConfig>) => void
  testConnection: () => Promise<boolean>
  connectionStatus: LLMConnectionStatus
  error: string | null
  availableProviders: LLMProvider[]
  isCurrentProviderConfigured: boolean
}

const LLMConfigContext = createContext<LLMConfigContextType | undefined>(undefined)

export function LLMConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig)
  const [connectionStatus, setConnectionStatus] = useState<LLMConnectionStatus>("not_connected")
  const [error, setError] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])
  const [isCurrentProviderConfigured, setIsCurrentProviderConfigured] = useState(false)

  // Load config from localStorage on mount and check available providers
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedConfig = localStorage.getItem("llmConfig")
      if (savedConfig) {
        try {
          const parsedConfig = JSON.parse(savedConfig)
          setConfig(parsedConfig)

          // Check available providers after loading config
          const providers = getAvailableProviders(parsedConfig)
          setAvailableProviders(providers)

          // Check if current provider is configured
          setIsCurrentProviderConfigured(isProviderConfigComplete(parsedConfig, parsedConfig.provider))

          // If current provider is not configured but others are, switch to an available one
          if (!isProviderConfigComplete(parsedConfig, parsedConfig.provider) && providers.length > 0) {
            setConfig((prev) => ({
              ...prev,
              provider: providers[0],
            }))
          }
        } catch (e) {
          console.error("Failed to parse saved LLM config:", e)
        }
      } else {
        // Check available providers with default config
        const providers = getAvailableProviders(defaultConfig)
        setAvailableProviders(providers)
        setIsCurrentProviderConfigured(isProviderConfigComplete(defaultConfig, defaultConfig.provider))
      }
    }
  }, [])

  // Update available providers when config changes
  useEffect(() => {
    const providers = getAvailableProviders(config)
    setAvailableProviders(providers)
    setIsCurrentProviderConfigured(isProviderConfigComplete(config, config.provider))
  }, [config])

  const updateConfig = (partialConfig: Partial<LLMConfig>) => {
    setConfig((prevConfig) => {
      // Handle nested updates
      if (partialConfig.openai) {
        partialConfig.openai = { ...prevConfig.openai, ...partialConfig.openai }
      }
      if (partialConfig.google) {
        partialConfig.google = { ...prevConfig.google, ...partialConfig.google }
      }

      const newConfig = { ...prevConfig, ...partialConfig }

      // Save to localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("llmConfig", JSON.stringify(newConfig))
      }

      return newConfig
    })
  }

  const testConnection = async () => {
    setConnectionStatus("connecting")
    setError(null)

    try {
      // Check if current provider is configured
      if (!isProviderConfigComplete(config, config.provider)) {
        setConnectionStatus("error")
        setError(
          `${config.provider === "openai" ? "OpenAI" : "Google"} is not fully configured. Please check your settings.`,
        )
        return false
      }

      const result = await testLLMConnection(config)
      if (result.success) {
        setConnectionStatus("connected")
        return true
      } else {
        setConnectionStatus("error")
        setError(result.error || "Unknown error")
        return false
      }
    } catch (err) {
      setConnectionStatus("error")
      setError(err instanceof Error ? err.message : "Unknown error occurred")
      return false
    }
  }

  return (
    <LLMConfigContext.Provider
      value={{
        config,
        updateConfig,
        testConnection,
        connectionStatus,
        error,
        availableProviders,
        isCurrentProviderConfigured,
      }}
    >
      {children}
    </LLMConfigContext.Provider>
  )
}

export function useLLMConfig() {
  const context = useContext(LLMConfigContext)
  if (context === undefined) {
    throw new Error("useLLMConfig must be used within a LLMConfigProvider")
  }
  return context
}
