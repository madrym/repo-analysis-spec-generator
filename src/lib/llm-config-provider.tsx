"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LLMConfig, LLMConnectionStatus, LLMProvider } from "@/lib/types"
import { testLLMConnection, getAvailableProviders, isProviderConfigComplete } from "@/lib/llm-service"
import { getLLMConfigFromEnv } from "./utils"

// Generate the initial config state using the utility function and provider defaults
const getInitialConfig = (): LLMConfig => {
  const envConfigParts = getLLMConfigFromEnv()
  const defaultProvider: LLMProvider = "openai" // Default provider for the UI
  return {
    ...envConfigParts,
    provider: defaultProvider,
    useEnvVars: true, // Default to using env vars, user can override
    maxTokens: envConfigParts.maxTokens || (defaultProvider === 'openai' ? envConfigParts.openai.maxTokens : envConfigParts.google.maxTokens)
  }
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
  const [config, setConfig] = useState<LLMConfig>(getInitialConfig())
  const [connectionStatus, setConnectionStatus] = useState<LLMConnectionStatus>("not_connected")
  const [error, setError] = useState<string | null>(null)
  const [availableProviders, setAvailableProviders] = useState<LLMProvider[]>([])
  const [isCurrentProviderConfigured, setIsCurrentProviderConfigured] = useState(false)

  // Load config from localStorage on mount and check available providers
  useEffect(() => {
    const savedConfig = localStorage.getItem("llmConfig")
    if (savedConfig) {
      try {
        const parsedConfig = JSON.parse(savedConfig)
        // IMPORTANT: Merge saved config with potentially updated env var defaults
        // This ensures that if env vars change, the UI reflects it unless explicitly overridden by the user
        const initialEnvConfig = getInitialConfig()
        const mergedConfig = {
          ...initialEnvConfig, // Start with defaults from env vars
          ...parsedConfig,   // Override with user's saved settings
          openai: { ...initialEnvConfig.openai, ...parsedConfig.openai }, // Deep merge provider settings
          google: { ...initialEnvConfig.google, ...parsedConfig.google }
        }
        setConfig(mergedConfig)

        // Check available providers after loading config
        const providers = getAvailableProviders(mergedConfig)
        setAvailableProviders(providers)

        // Check if current provider is configured
        setIsCurrentProviderConfigured(isProviderConfigComplete(mergedConfig, mergedConfig.provider))

        // If current provider is not configured but others are, switch to an available one
        if (!isProviderConfigComplete(mergedConfig, mergedConfig.provider) && providers.length > 0) {
          setConfig((prev) => ({
            ...prev,
            provider: providers[0],
          }))
        }
      } catch (e) {
        console.error("Failed to parse saved LLM config:", e)
      }
    } else {
      // Check available providers with initial config derived from env vars
      const initialConfig = getInitialConfig()
      const providers = getAvailableProviders(initialConfig)
      setAvailableProviders(providers)
      setIsCurrentProviderConfigured(isProviderConfigComplete(initialConfig, initialConfig.provider))
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
      localStorage.setItem("llmConfig", JSON.stringify(newConfig))

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
