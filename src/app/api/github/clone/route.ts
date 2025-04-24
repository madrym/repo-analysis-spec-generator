import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs/promises'; // Import fs promises
import { getRepositoryDetails } from '@/lib/github'; // Import function to get repo details

// Promisify exec for async/await usage
const execPromise = util.promisify(exec);

// Helper function to extract owner and repo from URL
function parseRepoUrl(url: string): { owner: string; repo: string } | null {
  // Simple regex for GitHub HTTPS URLs (adjust if needed for SSH or other formats)
  const match = url.match(/github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/i);
  if (match && match[1] && match[2]) {
    return { owner: match[1], repo: match[2] };
  }
  return null;
}

// Helper function to sanitize path components
function sanitizePathComponent(component: string): string {
    // Remove potentially harmful characters like '..', '/', '\', etc.
    // This is a basic example; consider more robust sanitization based on your needs.
    return component.replace(/[\.\/\\]+/g, '');
}

export async function POST(request: Request) {
  // Expect repoUrl and optional branch in the request body
  // clonePath is no longer needed from the request
  const { repoUrl, branch: requestedBranch } = await request.json(); 

  if (!repoUrl) {
    return NextResponse.json({ error: 'Missing repoUrl in request body' }, { status: 400 });
  }

  const repoInfo = parseRepoUrl(repoUrl);
  if (!repoInfo) {
    return NextResponse.json({ error: 'Invalid repository URL format' }, { status: 400 });
  }

  let { owner, repo } = repoInfo;

  const apiKey = process.env.GITHUB_API_KEY;
  if (!apiKey) {
    console.error("GITHUB_API_KEY environment variable not set.");
    return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
  }

  let branchToClone = requestedBranch;

  // **Declare variables to hold the final values used in the path**
  let finalOwner: string;
  let finalRepo: string;
  let finalBranch: string;

  try {
    // If branch is not specified, fetch the default branch
    if (!branchToClone) {
      console.log(`Branch not specified for ${owner}/${repo}, fetching default branch...`);
      const details = await getRepositoryDetails(owner, repo); // API key handled within Octokit instance
      branchToClone = details.default_branch;
      if (!branchToClone) {
          throw new Error('Could not determine default branch from GitHub API.');
      }
      console.log(`Default branch for ${owner}/${repo} is ${branchToClone}`);
    }

    // Sanitize path components and store the final versions
    finalOwner = sanitizePathComponent(owner);
    finalRepo = sanitizePathComponent(repo);
    finalBranch = sanitizePathComponent(branchToClone); // Use the determined branch


    // Define the new target directory structure using final versions
    const targetDirectory = path.resolve(
        process.cwd(),
        'storage',
        'repos',
        finalOwner,
        finalRepo,
        finalBranch,
        'code'
    );

    console.log(`Target directory for cloning: ${targetDirectory}`);

    // Ensure the target directory exists
    await fs.mkdir(targetDirectory, { recursive: true });
    console.log(`Ensured directory exists: ${targetDirectory}`);

    // Construct the authenticated URL
    const authenticatedUrl = repoUrl.replace("https://", `https://oauth2:${apiKey}@`);

    // Construct the git clone command with the specific branch and target directory
    // Using --depth 1 for shallow clone can save time and space if full history isn't needed
    const cloneCommand = `git clone --branch ${finalBranch} --depth 1 ${authenticatedUrl} ${targetDirectory}`;
    
    console.log(`Executing command: ${cloneCommand.replace(apiKey, '***')}`); // Log command without token

    // Check if directory is empty before cloning
    const files = await fs.readdir(targetDirectory);
    if (files.length > 0) {
      console.log(`Target directory ${targetDirectory} is not empty. Assuming already cloned.`);
      // Return success indicating it already exists, INCLUDING the path info
      return NextResponse.json({
        message: 'Repository branch already exists at target path',
        path: targetDirectory,
        owner: finalOwner,
        repo: finalRepo,
        branchName: finalBranch
      });
      // Option 2: Delete contents and re-clone (use with caution!)
      // await fs.rm(targetDirectory, { recursive: true, force: true });
      // await fs.mkdir(targetDirectory, { recursive: true }); // Recreate after rm
      // console.log(`Cleared existing directory: ${targetDirectory}`);
    }
    
    const { stdout, stderr } = await execPromise(cloneCommand);

    console.log('Git clone stdout:', stdout);
    if (stderr) {
      // Git often uses stderr for progress messages; check if it's actually an error
      if (!stderr.toLowerCase().includes('cloning into') && !stderr.toLowerCase().includes('resolving deltas')) {
           console.error('Git clone stderr:', stderr);
      } else {
          console.log('Git clone progress (stderr):', stderr); // Log progress messages if needed
      }
    }

    // Return success message including the path and components used
    return NextResponse.json({
      message: 'Repository branch cloned successfully',
      path: targetDirectory,
      owner: finalOwner,
      repo: finalRepo,
      branchName: finalBranch
    });

  } catch (error: any) {
    console.error(`Error cloning repository ${repoUrl} (branch: ${branchToClone || 'default'}):`, error);
    const errorMessage = error.stderr || error.stdout || error.message || 'Failed to clone repository';
    return NextResponse.json({ error: 'Cloning failed', details: errorMessage }, { status: 500 });
  }
} 