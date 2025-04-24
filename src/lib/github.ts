import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_API_KEY,
});

export async function getRepositoryDetails(owner: string, repo: string) {
  try {
    const response = await octokit.repos.get({
      owner,
      repo,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching repository details:", error);
    // Rethrow or handle error as appropriate for your application
    throw error;
  }
} 