import { NextResponse } from "next/server"
import { chatWithSpecifications } from "@/lib/spec-generator"

export async function POST(request: Request) {
  try {
    const { message, specifications, history } = await request.json()

    if (!message || !specifications) {
      return NextResponse.json({ message: "Message and specifications are required" }, { status: 400 })
    }

    // Generate a response based on the message and specifications
    try {
      const response = await chatWithSpecifications(message, specifications, history)
      return NextResponse.json({ response })
    } catch (error) {
      console.error("Error in chatWithSpecifications:", error)
      return NextResponse.json(
        { message: `Error generating chat response: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ message: "An error occurred while generating a response" }, { status: 500 })
  }
}
