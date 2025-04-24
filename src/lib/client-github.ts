/**
 * Fetches repository details from the backend API route.
 */
export async function fetchRepositoryDetails(owner: string, repo: string) {
  const response = await fetch(`/api/github/repo?owner=${encodeURIComponent(owner)}&repo=${encodeURIComponent(repo)}`);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Attempt to parse error JSON
    throw new Error(`Failed to fetch repository details (${response.status}): ${errorData.error || response.statusText}`);
  }

  return response.json();
}

/**
 * Requests the backend API to clone a repository branch.
 */
export async function cloneRepositoryBranch(repoUrl: string, branch?: string) {
  const response = await fetch('/api/github/clone', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ repoUrl, branch }), // Pass repoUrl and optional branch
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})); // Attempt to parse error JSON
    throw new Error(`Failed to clone repository (${response.status}): ${errorData.details || errorData.error || response.statusText}`);
  }

  return response.json(); // Returns { message: string, path: string } on success
} 