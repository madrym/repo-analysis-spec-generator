import { NextResponse } from "next/server"
import { generateLLMText } from "@/lib/llm-service"
import type { LLMConfig } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { prompt, config, temperature, maxTokens } = (await request.json()) as {
      prompt: string
      config: LLMConfig
      temperature?: number
      maxTokens?: number
    }

    if (!prompt || !config || !config.provider) {
      return NextResponse.json({ message: "Invalid request parameters" }, { status: 400 })
    }

    const result = await generateLLMText({
      prompt,
      config,
      temperature,
      maxTokens,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error generating text with LLM:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
