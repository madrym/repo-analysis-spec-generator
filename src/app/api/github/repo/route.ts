import { NextResponse } from 'next/server';
import { getRepositoryDetails } from '@/lib/github'; // Assuming alias '@' points to 'src'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const owner = searchParams.get('owner');
  const repo = searchParams.get('repo');

  if (!owner || !repo) {
    return NextResponse.json({ error: 'Missing owner or repo query parameter' }, { status: 400 });
  }

  try {
    const apiKey = process.env.GITHUB_API_KEY;
    if (!apiKey) {
      console.error("GITHUB_API_KEY environment variable not set.");
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    // The API key is handled internally by the Octokit instance in lib/github.ts
    const repoDetails = await getRepositoryDetails(owner, repo);
    return NextResponse.json(repoDetails);

  } catch (error: any) {
    console.error(`Error fetching repository ${owner}/${repo}:`, error);
    // Provide a more specific error message if possible based on the error type
    const status = error.status || 500;
    const message = error.message || 'Failed to fetch repository details';
    return NextResponse.json({ error: message }, { status });
  }
} 