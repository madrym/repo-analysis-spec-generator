import { NextResponse } from "next/server"
import { generateFollowUpQuestions } from "@/lib/spec-generator"
import path from 'path'
import fs from 'fs/promises'

// Helper function to safely read context from a potential path
async function getContextContent(contextInput: string | null | undefined): Promise<string | null> {
    if (!contextInput) return null;

    // Check if it looks like a repomix output path
    if (contextInput.endsWith('repomix-output.xml')) {
        try {
            // Security check: Ensure path is within storage
            const storageDir = path.resolve(process.cwd(), 'storage', 'repos');
            const resolvedPath = path.resolve(contextInput);
            if (!resolvedPath.startsWith(storageDir)) {
                console.error(`Attempt to access file outside storage directory: ${resolvedPath}`);
                throw new Error('Invalid context path'); // Prevent using unsafe paths
            }
            
            // Read the file content
            const fileContent = await fs.readFile(resolvedPath, 'utf-8');
            // Optionally, you could parse the XML here if generateFollowUpQuestions expects structured data
            console.log(`Using context from file: ${resolvedPath}`);
            return fileContent; // Return file content as context
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.error(`Context file not found: ${contextInput}`);
                // Decide how to handle: return null, throw error, etc.
                return null; 
            }
            console.error(`Error reading context file ${contextInput}:`, error);
            throw new Error('Failed to read repository context file'); // Re-throw for API to handle
        }
    } else {
        // If it doesn't look like a path, assume it's direct context string
        console.log("Using provided string as context.");
        return contextInput;
    }
}

export async function POST(request: Request) {
  try {
    // repoContext received here might be a path or direct string
    const { featureRequest, repoContext: rawRepoContext } = await request.json()

    if (!featureRequest || featureRequest.trim() === "") {
      return NextResponse.json({ message: "Feature request is required" }, { status: 400 })
    }

    // Process the context input to get actual content
    const finalRepoContext = await getContextContent(rawRepoContext);

    // Generate follow-up questions using the potentially file-read context
    try {
      const questions = await generateFollowUpQuestions(featureRequest, finalRepoContext)
      return NextResponse.json({ questions })
    } catch (error) {
      console.error("Error in generateFollowUpQuestions:", error)
      return NextResponse.json(
        { message: `Error generating questions: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ message: "An error occurred while generating questions" }, { status: 500 })
  }
}
