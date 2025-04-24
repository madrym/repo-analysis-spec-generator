"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { LLMConfig, LLMConnectionStatus } from "@/lib/types"
import { testLLMConnection } from "@/lib/llm-service"

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
}

const LLMConfigContext = createContext<LLMConfigContextType | undefined>(undefined)

export function LLMConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<LLMConfig>(defaultConfig)
  const [connectionStatus, setConnectionStatus] = useState<LLMConnectionStatus>("not_connected")
  const [error, setError] = useState<string | null>(null)

  // Load config from localStorage on mount
  useEffect(() => {
    const savedConfig = localStorage.getItem("llmConfig")
    if (savedConfig) {
      try {
        setConfig(JSON.parse(savedConfig))
      } catch (e) {
        console.error("Failed to parse saved LLM config:", e)
      }
    }
  }, [])

  const updateConfig = (partialConfig: Partial<LLMConfig>) => {
    setConfig((prevConfig) => {
      // Handle nested updates
      if (partialConfig.openai) {
        partialConfig.openai = { ...prevConfig.openai, ...partialConfig.openai }
      }
      if (partialConfig.google) {
        partialConfig.google = { ...prevConfig.google, ...partialConfig.google }
      }
      return { ...prevConfig, ...partialConfig }
    })
  }

  const testConnection = async () => {
    setConnectionStatus("connecting")
    setError(null)

    try {
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
    <LLMConfigContext.Provider value={{ config, updateConfig, testConnection, connectionStatus, error }}>
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
