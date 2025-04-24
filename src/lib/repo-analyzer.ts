import type { LLMConfig } from "@/lib/types"
import { generateLLMText, getAvailableProviders } from "@/lib/llm-service"

// Mock language colors for visualization
const languageColors: Record<string, string> = {
  JavaScript: "#f1e05a",
  TypeScript: "#3178c6",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Python: "#3572A5",
  Java: "#b07219",
  Ruby: "#701516",
  Go: "#00ADD8",
  Rust: "#dea584",
  PHP: "#4F5D95",
  Swift: "#ffac45",
  Kotlin: "#A97BFF",
  C: "#555555",
  "C++": "#f34b7d",
  "C#": "#178600",
}

export async function analyzeRepository(repoDir: string, repoContext: string) {
  console.log(`Analyzing repository in ${repoDir}`)

  // For a real implementation, you would:
  // 1. Scan the repository for languages, frameworks, etc.
  // 2. Analyze CI/CD configuration files
  // 3. Analyze PR processes and requirements
  // 4. Generate diagrams and visualizations

  try {
    // Get the LLM configuration from localStorage or default
    let config: LLMConfig
    try {
      const savedConfig = localStorage.getItem("llmConfig")
      config = savedConfig
        ? JSON.parse(savedConfig)
        : {
            provider: "openai",
            useEnvVars: true,
            maxTokens: 64000,
            openai: {
              apiKey: process.env.OPENAI_API_KEY || "",
              baseUrl: process.env.OPENAI_BASE_URL || "",
              model: process.env.OPENAI_MODEL || "claude-3.7-sonnet",
              maxTokens: Number.parseInt(process.env.OPENAI_MAX_TOKENS || "64000"),
            },
            google: {
              apiKey: process.env.GOOGLE_API_KEY || "",
              model: process.env.GOOGLE_MODEL || "gemini-2.5-pro-exp-03-25",
              maxTokens: Number.parseInt(process.env.GOOGLE_MAX_TOKENS || "64000"),
            },
          }
    } catch (e) {
      console.error("Failed to parse saved LLM config:", e)
      throw new Error("Invalid LLM configuration")
    }

    // Check if any providers are available
    const availableProviders = getAvailableProviders(config)
    if (availableProviders.length === 0) {
      throw new Error("No LLM providers are configured. Please configure an LLM provider in the settings.")
    }

    // If current provider is not configured but others are, switch to an available one
    if (!availableProviders.includes(config.provider) && availableProviders.length > 0) {
      config.provider = availableProviders[0]
    }

    const prompt = `
      You are an expert repository analyzer. You are examining a codebase to provide insights about its structure, technologies, workflows, and processes.

      CONTEXT:
      ${repoContext}

      Please provide a detailed analysis of this repository in JSON format with the following structure:
      {
        "overview": {
          "name": "Repository name",
          "description": "Short description",
          "purpose": "Detailed purpose of the repository",
          "architecture": "High-level architecture description"
        },
        "languages": [
          {
            "name": "Language name",
            "percentage": percentage (number),
            "color": "hex color code"
          }
        ],
        "frameworks": [
          {
            "name": "Framework name",
            "category": "Category (Frontend, Backend, Testing, etc.)",
            "description": "Short description of how it's used"
          }
        ],
        "cicd": {
          "workflows": [
            {
              "name": "Workflow name",
              "description": "Workflow description",
              "triggers": ["trigger1", "trigger2"],
              "steps": ["step1", "step2"]
            }
          ],
          "diagram": "Mermaid diagram code for CI/CD workflow"
        },
        "prProcess": {
          "checks": ["check1", "check2"],
          "tools": ["tool1", "tool2"],
          "requirements": ["requirement1", "requirement2"],
          "diagram": "Mermaid diagram code for PR process"
        },
        "structure": {
          "directories": [
            {
              "name": "Directory name",
              "path": "path/to/directory",
              "description": "Directory purpose",
              "children": [
                {
                  "name": "Subdirectory name",
                  "path": "path/to/subdirectory",
                  "description": "Subdirectory purpose"
                }
              ]
            }
          ],
          "diagram": "Mermaid diagram code for repository structure"
        }
      }

      Make sure all diagrams use mermaid syntax and are properly escaped for JSON.
    `

    const { text } = await generateLLMText({
      prompt,
      config,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Parse the JSON response
    const analysisResults = JSON.parse(text)

    // Process diagrams to make them renderable
    if (analysisResults.cicd && analysisResults.cicd.diagram) {
      analysisResults.cicd.diagram = processMermaidDiagram(analysisResults.cicd.diagram)
    }

    if (analysisResults.prProcess && analysisResults.prProcess.diagram) {
      analysisResults.prProcess.diagram = processMermaidDiagram(analysisResults.prProcess.diagram)
    }

    if (analysisResults.structure && analysisResults.structure.diagram) {
      analysisResults.structure.diagram = processMermaidDiagram(analysisResults.structure.diagram)
    }

    return analysisResults
  } catch (error) {
    console.error("Error analyzing repository:", error)
    throw new Error(`Failed to analyze repository: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

function processMermaidDiagram(diagramCode: string): string {
  // In a real implementation, you would render the Mermaid diagram to SVG
  // For now, we'll just wrap it in a pre tag with the mermaid class
  return `<pre class="mermaid">${diagramCode}</pre>`
}
