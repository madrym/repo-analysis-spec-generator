"use client";

import { useLLMConfig } from "../llm-config-wrapper"
import { Badge } from "../ui/badge"
import { AlertCircle, Check, Loader2, Settings } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import Link from "next/link"

export function LLMStatusIndicator() {
  const { connectionStatus, error, config, isCurrentProviderConfigured, availableProviders } = useLLMConfig()

  const getStatusColor = () => {
    if (!isCurrentProviderConfigured) {
      return "bg-yellow-500"
    }

    switch (connectionStatus) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "error":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getStatusIcon = () => {
    if (!isCurrentProviderConfigured) {
      return <Settings className="h-3 w-3 text-white" />
    }

    switch (connectionStatus) {
      case "connected":
        return <Check className="h-3 w-3 text-white" />
      case "connecting":
        return <Loader2 className="h-3 w-3 text-white animate-spin" />
      case "error":
        return <AlertCircle className="h-3 w-3 text-white" />
      default:
        return null
    }
  }

  const getStatusText = () => {
    if (!isCurrentProviderConfigured) {
      return `${config.provider === "openai" ? "OpenAI" : "Google"} configuration incomplete`
    }

    switch (connectionStatus) {
      case "connected":
        return `Connected to ${config.provider === "openai" ? "OpenAI" : "Google"}`
      case "connecting":
        return "Connecting..."
      case "error":
        return error || "Connection error"
      default:
        return "Not connected"
    }
  }

  const getProviderInfo = () => {
    if (availableProviders.length === 0) {
      return "No LLM providers configured"
    }

    return `Using ${config.provider === "openai" ? "OpenAI" : "Google"} (${
      config.provider === "openai" ? config.openai.model : config.google.model
    })`
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link href="/settings">
            <Badge variant="outline" className="gap-1 cursor-help">
              <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}>{getStatusIcon()}</div>
              <span className="text-xs">LLM</span>
            </Badge>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getStatusText()}</p>
          <p className="text-xs text-muted-foreground">{getProviderInfo()}</p>
          {!isCurrentProviderConfigured && <p className="text-xs text-muted-foreground mt-1">Click to configure</p>}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
