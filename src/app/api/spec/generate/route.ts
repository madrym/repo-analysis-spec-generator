import { NextResponse } from "next/server"
import { generateSpecifications } from "@/lib/spec-generator"
import path from 'path'
import fs from 'fs/promises'

// Re-use or define the helper function to safely read context
// (Ensure this is consistent with the one in questions/route.ts)
async function getContextContent(contextInput: string | null | undefined): Promise<string | null> {
    if (!contextInput) return null;

    if (contextInput.endsWith('repomix-output.xml')) {
        try {
            const storageDir = path.resolve(process.cwd(), 'storage', 'repos');
            const resolvedPath = path.resolve(contextInput);
            if (!resolvedPath.startsWith(storageDir)) {
                console.error(`Attempt to access file outside storage directory: ${resolvedPath}`);
                throw new Error('Invalid context path');
            }
            const fileContent = await fs.readFile(resolvedPath, 'utf-8');
            console.log(`Using context from file: ${resolvedPath}`);
            return fileContent;
        } catch (error: any) {
            if (error.code === 'ENOENT') {
                console.error(`Context file not found: ${contextInput}`);
                return null; 
            }
            console.error(`Error reading context file ${contextInput}:`, error);
            throw new Error('Failed to read repository context file');
        }
    } else {
        console.log("Using provided string as context.");
        return contextInput;
    }
}

export async function POST(request: Request) {
  try {
    const { featureRequest, repoContext: rawRepoContext, answers } = await request.json()

    if (!featureRequest || !answers) {
      return NextResponse.json({ message: "Feature request and answers are required" }, { status: 400 })
    }

    // Process the context input to get actual content
    const finalRepoContext = await getContextContent(rawRepoContext);

    // Generate specifications using the potentially file-read context
    try {
      const specifications = await generateSpecifications(featureRequest, answers, finalRepoContext)
      
      // TODO: Implement saving the generated spec to storage/repos/<org>/<repo>/<branch>/specs/
      // You would need to parse the owner/repo/branch from the rawRepoContext (if it was a path)
      // or potentially receive them as separate parameters from the client.
      if (rawRepoContext && typeof rawRepoContext === 'string' && rawRepoContext.includes('/storage/repos/')) {
          const pathParts = rawRepoContext.split(path.sep);
          // Example assuming path structure: .../storage/repos/owner/repo/branch/repomix-output.xml
          const branchIndex = pathParts.indexOf('repos') + 3;
          if (pathParts.length > branchIndex) {
              const owner = pathParts[branchIndex - 2];
              const repo = pathParts[branchIndex - 1];
              const branch = pathParts[branchIndex];
              const specDir = path.resolve(process.cwd(), 'storage', 'repos', owner, repo, branch, 'specs');
              const specFilename = `${featureRequest.substring(0, 30).replace(/\W+/g, '_') || 'feature'}_spec.json`; // Basic filename generation
              const specFilePath = path.join(specDir, specFilename);

              try {
                  await fs.mkdir(specDir, { recursive: true });
                  // Assuming specifications is JSON-serializable
                  await fs.writeFile(specFilePath, JSON.stringify(specifications, null, 2));
                  console.log(`Generated spec saved to: ${specFilePath}`);
              } catch(saveError) {
                  console.error(`Failed to save generated spec to ${specFilePath}:`, saveError);
                  // Don't fail the request, just log the error
              }
          }
      }

      return NextResponse.json(specifications)
    } catch (error) {
      console.error("Error in generateSpecifications:", error)
      return NextResponse.json(
        { message: `Error generating specifications: ${error instanceof Error ? error.message : "Unknown error"}` },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json({ message: "An error occurred while generating specifications" }, { status: 500 })
  }
}
