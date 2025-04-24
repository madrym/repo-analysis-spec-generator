export interface Repository {
  url: string
  name: string
  owner: string
  description: string
}

export interface RepositoryAnalysis {
  overview: {
    name: string
    description: string
    purpose: string
    architecture: string
  }
  languages: {
    name: string
    percentage: number
    color: string
  }[]
  frameworks: {
    name: string
    category: string
    description: string
  }[]
  cicd: {
    workflows: {
      name: string
      description: string
      triggers: string[]
      steps: string[]
    }[]
    diagram: string
  }
  prProcess: {
    checks: string[]
    tools: string[]
    requirements: string[]
    diagram: string
  }
  structure: {
    directories: {
      name: string
      path: string
      description: string
      children?: {
        name: string
        path: string
        description: string
      }[]
    }[]
    diagram: string
  }
}

export interface Question {
  id: string
  label: string
  type: "text" | "textarea" | "select"
  options?: string[]
  required?: boolean
  placeholder?: string
}

export interface Specifications {
  planning: string
  tasks: string
  specs: string
}

// LLM Configuration Types
export type LLMProvider = "openai" | "google"
export type LLMConnectionStatus = "not_connected" | "connecting" | "connected" | "error"

export interface LLMConfig {
  provider: LLMProvider
  useEnvVars: boolean
  maxTokens: number
  openai: {
    apiKey: string
    baseUrl: string
    model: string
    maxTokens: number
  }
  google: {
    apiKey: string
    model: string
    maxTokens: number
  }
}
