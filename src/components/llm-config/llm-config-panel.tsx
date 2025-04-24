"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select"
import { Switch } from "../ui/switch"
import { AlertCircle, Check, Loader2, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { useLLMConfig } from "../llm-config-wrapper"
import { AdvancedSettings } from "./advanced-settings"
import type { LLMProvider } from "../../lib/types"

export function LLMConfigPanel() {
  const {
    config,
    updateConfig,
    testConnection,
    connectionStatus,
    error,
    availableProviders,
    isCurrentProviderConfigured,
  } = useLLMConfig()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState<LLMProvider>(config.provider)

  // Update active tab when provider changes
  useEffect(() => {
    setActiveTab(config.provider)
  }, [config.provider])

  const handleTabChange = (value: string) => {
    setActiveTab(value as LLMProvider)
    updateConfig({ provider: value as LLMProvider })
  }

  const handleTestConnection = async () => {
    setIsLoading(true)
    await testConnection()
    setIsLoading(false)
  }

  const handleSave = () => {
    // Save configuration to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("llmConfig", JSON.stringify(config))
    }
  }

  // Check if environment variables are being used
  const isUsingEnvVars = config.useEnvVars

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>LLM Configuration</CardTitle>
        <CardDescription>Configure your LLM provider settings for AI-powered features</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="openai">OpenAI</TabsTrigger>
            <TabsTrigger value="google">Google</TabsTrigger>
          </TabsList>

          <TabsContent value="openai" className="space-y-4 mt-4">
            <div className="space-y-4">
              {isUsingEnvVars && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Using Environment Variables</AlertTitle>
                  <AlertDescription>
                    OpenAI configuration will use environment variables if available. Values entered below will be used
                    as fallbacks.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="openai-api-key">API Key</Label>
                <Input
                  id="openai-api-key"
                  type="password"
                  placeholder="sk-..."
                  value={config.openai.apiKey}
                  onChange={(e) => updateConfig({ openai: { ...config.openai, apiKey: e.target.value } })}
                />
                {isUsingEnvVars && (
                  <p className="text-xs text-muted-foreground">
                    {typeof process.env.OPENAI_API_KEY !== "undefined" && process.env.OPENAI_API_KEY !== ""
                      ? "Using API key from environment variable"
                      : "Environment variable OPENAI_API_KEY not set"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="openai-base-url">Base URL (Optional)</Label>
                <Input
                  id="openai-base-url"
                  placeholder="https://api.openai.com/v1"
                  value={config.openai.baseUrl}
                  onChange={(e) => updateConfig({ openai: { ...config.openai, baseUrl: e.target.value } })}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use the default OpenAI API URL. Change for compatible API providers.
                  {isUsingEnvVars &&
                    typeof process.env.OPENAI_BASE_URL !== "undefined" &&
                    process.env.OPENAI_BASE_URL !== "" &&
                    " Using base URL from environment variable."}
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="openai-model">Model</Label>
                <Select
                  value={config.openai.model}
                  onValueChange={(value) => updateConfig({ openai: { ...config.openai, model: value } })}
                >
                  <SelectTrigger id="openai-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claude-3.7-sonnet">Claude 3.7 Sonnet</SelectItem>
                    <SelectItem value="claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  </SelectContent>
                </Select>
                {isUsingEnvVars && (
                  <p className="text-xs text-muted-foreground">
                    {typeof process.env.OPENAI_MODEL !== "undefined" && process.env.OPENAI_MODEL !== ""
                      ? `Using model ${process.env.OPENAI_MODEL} from environment variable`
                      : "Environment variable OPENAI_MODEL not set"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="openai-max-tokens">Max Tokens</Label>
                <Input
                  id="openai-max-tokens"
                  type="number"
                  placeholder="4000"
                  value={config.openai.maxTokens}
                  onChange={(e) =>
                    updateConfig({ openai: { ...config.openai, maxTokens: Number.parseInt(e.target.value) || 4000 } })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens for responses. Modern models support up to 128K tokens.
                  {isUsingEnvVars &&
                    typeof process.env.OPENAI_MAX_TOKENS !== "undefined" &&
                    process.env.OPENAI_MAX_TOKENS !== "" &&
                    ` Using max tokens ${process.env.OPENAI_MAX_TOKENS} from environment variable.`}
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="google" className="space-y-4 mt-4">
            <div className="space-y-4">
              {isUsingEnvVars && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle>Using Environment Variables</AlertTitle>
                  <AlertDescription>
                    Google configuration will use environment variables if available. Values entered below will be used
                    as fallbacks.
                  </AlertDescription>
                </Alert>
              )}

              <div className="grid gap-2">
                <Label htmlFor="google-api-key">API Key</Label>
                <Input
                  id="google-api-key"
                  type="password"
                  placeholder="AIza..."
                  value={config.google.apiKey}
                  onChange={(e) => updateConfig({ google: { ...config.google, apiKey: e.target.value } })}
                />
                {isUsingEnvVars && (
                  <p className="text-xs text-muted-foreground">
                    {typeof process.env.GOOGLE_API_KEY !== "undefined" && process.env.GOOGLE_API_KEY !== ""
                      ? "Using API key from environment variable"
                      : "Environment variable GOOGLE_API_KEY not set"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="google-model">Model</Label>
                <Select
                  value={config.google.model}
                  onValueChange={(value) => updateConfig({ google: { ...config.google, model: value } })}
                >
                  <SelectTrigger id="google-model">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gemini-2.5-pro-exp-03-25">Gemini 2.5 Pro Experimental</SelectItem>
                    <SelectItem value="gemini-1.5-pro">Gemini 1.5 Pro</SelectItem>
                    <SelectItem value="gemini-1.5-flash">Gemini 1.5 Flash</SelectItem>
                    <SelectItem value="gemini-1.0-pro">Gemini 1.0 Pro</SelectItem>
                  </SelectContent>
                </Select>
                {isUsingEnvVars && (
                  <p className="text-xs text-muted-foreground">
                    {typeof process.env.GOOGLE_MODEL !== "undefined" && process.env.GOOGLE_MODEL !== ""
                      ? `Using model ${process.env.GOOGLE_MODEL} from environment variable`
                      : "Environment variable GOOGLE_MODEL not set"}
                  </p>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="google-max-tokens">Max Tokens</Label>
                <Input
                  id="google-max-tokens"
                  type="number"
                  placeholder="4000"
                  value={config.google.maxTokens}
                  onChange={(e) =>
                    updateConfig({ google: { ...config.google, maxTokens: Number.parseInt(e.target.value) || 4000 } })
                  }
                />
                <p className="text-xs text-muted-foreground">
                  Maximum number of tokens for responses. Gemini 1.5 supports up to 1M tokens.
                  {isUsingEnvVars &&
                    typeof process.env.GOOGLE_MAX_TOKENS !== "undefined" &&
                    process.env.GOOGLE_MAX_TOKENS !== "" &&
                    ` Using max tokens ${process.env.GOOGLE_MAX_TOKENS} from environment variable.`}
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex items-center space-x-2 mt-6">
          <Switch
            id="use-env-vars"
            checked={config.useEnvVars}
            onCheckedChange={(checked) => updateConfig({ useEnvVars: checked })}
          />
          <Label htmlFor="use-env-vars">Use environment variables instead (when available)</Label>
        </div>

        {!isCurrentProviderConfigured && (
          <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Configuration Incomplete</AlertTitle>
            <AlertDescription>
              {config.provider === "openai"
                ? "OpenAI configuration is incomplete. Please provide an API key and select a model."
                : "Google configuration is incomplete. Please provide an API key and select a model."}
            </AlertDescription>
          </Alert>
        )}

        {availableProviders.length === 0 && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Providers Configured</AlertTitle>
            <AlertDescription>
              No LLM providers are fully configured. Please configure at least one provider to use AI features.
            </AlertDescription>
          </Alert>
        )}

        {connectionStatus && (
          <Alert
            variant={
              connectionStatus === "connected" ? "default" : connectionStatus === "error" ? "destructive" : "default"
            }
            className="mt-4"
          >
            {connectionStatus === "connected" ? (
              <Check className="h-4 w-4" />
            ) : connectionStatus === "error" ? (
              <AlertCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "error"
                  ? "Connection Error"
                  : "Not Connected"}
            </AlertTitle>
            <AlertDescription>{error || "LLM provider connection status"}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleTestConnection} disabled={isLoading || !isCurrentProviderConfigured}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              "Test Connection"
            )}
          </Button>
          <AdvancedSettings />
        </div>
        <Button onClick={handleSave}>Save Configuration</Button>
      </CardFooter>
    </Card>
  )
}
