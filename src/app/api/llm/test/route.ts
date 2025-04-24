import { NextResponse } from "next/server"
import { testLLMConnection } from "@/lib/llm-service"
import type { LLMConfig } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const config = (await request.json()) as LLMConfig

    if (!config || !config.provider) {
      return NextResponse.json({ message: "Invalid configuration" }, { status: 400 })
    }

    const result = await testLLMConnection(config)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error testing LLM connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "An unknown error occurred",
      },
      { status: 500 },
    )
  }
}
