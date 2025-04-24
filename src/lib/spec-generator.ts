import type { LLMConfig } from "@/lib/types"
import { generateLLMText } from "@/lib/llm-service"
import { getLLMConfigFromEnv } from "./utils"

export async function generateFollowUpQuestions(featureRequest: string, repoContext: string | null) {
  try {
    // Get the LLM configuration parts from environment variables
    const envConfigParts = getLLMConfigFromEnv()
    const provider = process.env.DEFAULT_LLM_PROVIDER as LLMConfig['provider'] || "openai"
    
    const config: LLMConfig = {
        ...envConfigParts,
        provider: provider,
        useEnvVars: true, // Assuming we always use env vars on the server
        // Set maxTokens based on provider if not globally defined
        maxTokens: envConfigParts.maxTokens || (provider === 'openai' ? envConfigParts.openai.maxTokens : envConfigParts.google.maxTokens)
    }

    const prompt = `
      You are an expert feature specification analyst. Based on the initial feature request below, generate a comprehensive set of follow-up questions to gather all necessary information for creating detailed feature specifications.

      FEATURE REQUEST:
      ${featureRequest}

      ${repoContext ? `REPOSITORY CONTEXT:\n${repoContext}` : ""}

      Create a form with follow-up questions covering:
      1. Project name and goals
      2. Target audience
      3. Functional requirements specific to this feature
      4. Non-functional requirements 
      5. User scenarios
      6. UI/UX guidelines
      7. Technical constraints or preferences
      8. Business value
      9. Timeline constraints
      10. Any additional questions specific to this particular feature request

      Return your response as a JSON array of question objects with the following structure:
      [
        {
          "id": "unique_id",
          "label": "Question text",
          "type": "text|textarea|select",
          "options": ["option1", "option2"] (only for select type),
          "required": true|false,
          "placeholder": "Example answer"
        }
      ]

      Make your questions specific to the feature request rather than generic.
      
      IMPORTANT: Ensure your response is valid JSON that can be parsed with JSON.parse().
    `

    const { text } = await generateLLMText({
      prompt,
      config,
      temperature: 0.7,
      maxTokens: 2000,
    })

    // Parse the JSON response
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = text
        .trim()
        .replace(/^```json/i, "") // Remove markdown JSON code block start
        .replace(/```$/i, "") // Remove markdown code block end
        .trim()

      const questions = JSON.parse(cleanedText)
      return questions
    } catch (error) {
      console.error("Error parsing JSON response:", error)
      console.error("Raw response:", text)
      throw new Error("Failed to parse the response from the LLM. The response was not valid JSON.")
    }
  } catch (error) {
    console.error("Error generating follow-up questions:", error)
    throw new Error(
      `Failed to generate follow-up questions: ${error instanceof Error ? error.message : "Unknown error"}`,
    )
  }
}

export async function generateSpecifications(
  featureRequest: string,
  answers: Record<string, string>,
  repoContext: string | null,
) {
  try {
    // Get the LLM configuration parts from environment variables
    const envConfigParts = getLLMConfigFromEnv()
    const provider = process.env.DEFAULT_LLM_PROVIDER as LLMConfig['provider'] || "openai"
    
    const config: LLMConfig = {
        ...envConfigParts,
        provider: provider,
        useEnvVars: true, // Assuming we always use env vars on the server
        // Set maxTokens based on provider if not globally defined
        maxTokens: envConfigParts.maxTokens || (provider === 'openai' ? envConfigParts.openai.maxTokens : envConfigParts.google.maxTokens)
    }

    // Format the answers for the prompt
    const formattedAnswers = Object.entries(answers)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n")

    const prompt = `
      You are an expert feature specification writer. Based on the information provided, create comprehensive specification documents for the requested feature.

      FEATURE REQUEST:
      ${featureRequest}

      USER RESPONSES:
      ${formattedAnswers}

      ${repoContext ? `REPOSITORY CONTEXT:\n${repoContext}` : ""}

      Generate three markdown documents:

      1. PLANNING.md - A technical planning document covering:
         - Overview of the feature purpose and value
         - Architectural approach
         - Technical stack and dependencies
         - Design constraints
         - Security and privacy considerations
         - Performance considerations
         - Testing strategy
         - Future considerations

      2. TASK.md - An implementation task breakdown including:
         - Priority 1 (Must-have) tasks with subtasks
         - Priority 2 (Should-have) tasks with subtasks
         - Priority 3 (Nice-to-have) tasks with subtasks
         - Technical debt & refactoring considerations
         - Testing tasks

      3. SPECS.md - Behavior-driven specifications including:
         - Overview of the feature
         - User stories with Gherkin-formatted scenarios
         - Edge cases and error scenarios
         - Assumptions
         - Acceptance criteria

      Format each document with clear structure, using markdown for headings, lists, code blocks, and tables where appropriate. Be specific rather than generic, and tailor the content to the provided feature information and repository context.

      Return your response as a JSON object with the following structure:
      {
        "planning": "Full PLANNING.md content",
        "tasks": "Full TASK.md content",
        "specs": "Full SPECS.md content"
      }
      
      IMPORTANT: Ensure your response is valid JSON that can be parsed with JSON.parse().
    `

    const { text } = await generateLLMText({
      prompt,
      config,
      temperature: 0.7,
      maxTokens: 4000,
    })

    // Parse the JSON response
    try {
      // Clean the response to ensure it's valid JSON
      const cleanedText = text
        .trim()
        .replace(/^```json/i, "") // Remove markdown JSON code block start
        .replace(/```$/i, "") // Remove markdown code block end
        .trim()

      const specifications = JSON.parse(cleanedText)
      return specifications
    } catch (error) {
      console.error("Error parsing JSON response:", error)
      console.error("Raw response:", text)
      throw new Error("Failed to parse the response from the LLM. The response was not valid JSON.")
    }
  } catch (error) {
    console.error("Error generating specifications:", error)
    throw new Error(`Failed to generate specifications: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export async function chatWithSpecifications(
  message: string,
  specifications: { planning: string; tasks: string; specs: string },
  history: { role: string; content: string }[],
) {
  try {
    // Get the LLM configuration parts from environment variables
    const envConfigParts = getLLMConfigFromEnv()
    const provider = process.env.DEFAULT_LLM_PROVIDER as LLMConfig['provider'] || "openai"
    
    const config: LLMConfig = {
        ...envConfigParts,
        provider: provider,
        useEnvVars: true, // Assuming we always use env vars on the server
        // Set maxTokens based on provider if not globally defined
        maxTokens: envConfigParts.maxTokens || (provider === 'openai' ? envConfigParts.openai.maxTokens : envConfigParts.google.maxTokens)
    }

    // Format the chat history
    const formattedHistory = history
      .map((msg) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
      .join("\n\n")

    const prompt = `
      You are an AI assistant specializing in feature specifications. You have access to the following specification documents for a feature:

      PLANNING.md:
      ${specifications.planning}

      TASK.md:
      ${specifications.tasks}

      SPECS.md:
      ${specifications.specs}

      CHAT HISTORY:
      ${formattedHistory}

      USER QUESTION:
      ${message}

      Provide a helpful, accurate, and concise response to the user's question based on the specification documents. If the question is about something not covered in the specifications, you can provide general guidance but make it clear that it's not specifically addressed in the documents.
    `

    const { text } = await generateLLMText({
      prompt,
      config,
      temperature: 0.7,
      maxTokens: 2000,
    })

    return text
  } catch (error) {
    console.error("Error generating chat response:", error)
    throw new Error(`Failed to generate chat response: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}
