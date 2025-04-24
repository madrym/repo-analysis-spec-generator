import { NextResponse } from "next/server"
import { simpleGit } from "simple-git"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"
import { generateRepoContext } from "@/lib/repomix"

export async function POST(request: Request) {
  try {
    const { repoUrl } = await request.json()

    // Validate URL format
    if (!repoUrl.match(/^https:\/\/github\.com\/[^/]+\/[^/]+$/)) {
      return NextResponse.json({ message: "Invalid GitHub repository URL" }, { status: 400 })
    }

    // Create a unique directory for this repository
    const repoId = uuidv4()
    const repoDir = path.join(process.cwd(), "tmp", repoId)

    try {
      // Ensure the tmp directory exists
      fs.mkdirSync(path.join(process.cwd(), "tmp"), { recursive: true })

      // Clone the repository
      await simpleGit().clone(repoUrl, repoDir, ["--depth", "1"])

      // Generate repository context using Repomix
      const repoContext = await generateRepoContext(repoDir)

      // Clean up the cloned repository
      fs.rmSync(repoDir, { recursive: true, force: true })

      return NextResponse.json({ context: repoContext })
    } catch (error) {
      // Clean up in case of error
      if (fs.existsSync(repoDir)) {
        fs.rmSync(repoDir, { recursive: true, force: true })
      }

      console.error("Repository context generation error:", error)
      return NextResponse.json(
        { message: "Failed to generate repository context. Please check the URL and try again." },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json({ message: "An error occurred while processing your request" }, { status: 500 })
  }
}
