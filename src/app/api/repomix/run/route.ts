import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import util from 'util';
import path from 'path';
import fs from 'fs/promises';

const execPromise = util.promisify(exec);

export async function POST(request: Request) {
  const { owner, repo, branch, clonedCodePath } = await request.json();

  if (!owner || !repo || !branch || !clonedCodePath) {
    return NextResponse.json({ error: 'Missing required parameters (owner, repo, branch, clonedCodePath)' }, { status: 400 });
  }

  // Construct the output path based on the input parameters (assuming they are already sanitized)
  const outputDir = path.resolve(
    process.cwd(),
    'storage',
    'repos',
    owner,
    repo,
    branch
  );
  const repomixOutputPath = path.join(outputDir, 'repomix-output.xml');

  try {
    // Ensure the output directory exists
    await fs.mkdir(outputDir, { recursive: true });

    // IMPORTANT: Construct the repomix command.
    // Ensure 'repomix' is in the system's PATH or provide the full path to the executable.
    // Escape paths if they might contain spaces or special characters (though sanitizePathComponent should help)
    const repomixCommand = `repomix --input "${clonedCodePath}" --output "${repomixOutputPath}"`;

    console.log(`Executing repomix command: ${repomixCommand}`);

    const { stdout, stderr } = await execPromise(repomixCommand);

    console.log('Repomix stdout:', stdout);
    if (stderr) {
        // Check if stderr contains actual errors or just informational messages
        // Adjust this based on repomix's typical output behavior
        console.error('Repomix stderr:', stderr);
        if (stderr.toLowerCase().includes('error') || stderr.toLowerCase().includes('failed')) {
             // Consider throwing an error if stderr indicates failure
             // throw new Error(`Repomix execution failed: ${stderr}`);
        }
    }

    // Verify output file exists (optional but recommended)
    await fs.access(repomixOutputPath);
    console.log(`Repomix output file created successfully at ${repomixOutputPath}`);

    return NextResponse.json({ 
        message: 'Repomix analysis completed successfully', 
        repomixOutputPath 
    });

  } catch (error: any) {
    console.error(`Repomix execution failed for ${owner}/${repo}/${branch}:`, error);
    const errorMessage = error.stderr || error.stdout || error.message || 'Failed to run repomix analysis';
    return NextResponse.json({ error: 'Repomix execution failed', details: errorMessage }, { status: 500 });
  }
} 