"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { Button } from "../ui/button"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { AlertCircle, Loader2, Settings } from "lucide-react"
import { RepositoryAnalysisResults } from "./repository-analysis-results"
import { useLLMConfig } from "../llm-config-wrapper"
import Link from "next/link"
import { Label } from "../ui/label"
import { cloneRepositoryBranch, fetchRepositoryDetails } from "@/lib/client-github"

export function RepositoryAnalysis() {
  const { availableProviders } = useLLMConfig()
  const [repoUrl, setRepoUrl] = useState("")
  const [branch, setBranch] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loadingStatus, setLoadingStatus] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [analysisResults, setAnalysisResults] = useState<any | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setAnalysisResults(null)
    setIsLoading(true)

    try {
      if (availableProviders.length === 0) {
        throw new Error("No LLM providers are configured. Please configure an LLM provider in the settings.")
      }

      const repoMatch = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/i)
      if (!repoMatch) {
        throw new Error("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)")
      }
      const owner = repoMatch[1]
      const repo = repoMatch[2]

      setLoadingStatus("Verifying repository...")

      setLoadingStatus(`Cloning ${owner}/${repo}` + (branch ? ` branch ${branch}` : ' default branch') + "...")
      const cloneData = await cloneRepositoryBranch(repoUrl, branch || undefined)
      const clonedCodePath = cloneData.path
      const actualBranch = cloneData.branchName
      const actualOwner = cloneData.owner
      const actualRepo = cloneData.repo

      if (!clonedCodePath || !actualBranch || !actualOwner || !actualRepo) {
          throw new Error("Cloning process did not return expected path or branch information.");
      }

      console.log(`Clone successful. Path: ${clonedCodePath}, Branch: ${actualBranch}`)

      setLoadingStatus("Running repomix analysis...")
      const repomixResponse = await fetch("/api/repomix/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
            owner: actualOwner,
            repo: actualRepo,
            branch: actualBranch,
            clonedCodePath
        }),
      })

      if (!repomixResponse.ok) {
        const errorData = await repomixResponse.json().catch(() => ({}))
        throw new Error(`Repomix analysis failed: ${errorData.details || errorData.error || repomixResponse.statusText}`)
      }

      const repomixData = await repomixResponse.json()
      const repomixOutputPath = repomixData.repomixOutputPath
      console.log(`Repomix successful. Output: ${repomixOutputPath}`)

      setLoadingStatus("Processing analysis results...")
      const resultsResponse = await fetch(`/api/repomix/results?path=${encodeURIComponent(repomixOutputPath)}`)

      if (!resultsResponse.ok) {
        const errorData = await resultsResponse.json().catch(() => ({}))
        throw new Error(`Failed to fetch repomix results: ${errorData.error || resultsResponse.statusText}`)
      }

      const finalResults = await resultsResponse.json()
      setAnalysisResults(finalResults)

    } catch (err) {
      console.error("Analysis process failed:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
      setLoadingStatus("")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Analysis</CardTitle>
          <CardDescription>
            Enter a GitHub repository URL to analyze its structure, technologies, and workflows.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {availableProviders.length === 0 ? (
            <Alert variant="warning">
              <Settings className="h-4 w-4" />
              <AlertTitle>LLM Configuration Required</AlertTitle>
              <AlertDescription>
                No LLM providers are configured. Please{" "}
                <Link href="/settings" className="font-medium underline underline-offset-4">
                  configure an LLM provider
                </Link>{" "}
                in the settings to use this feature.
              </AlertDescription>
            </Alert>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label htmlFor="repo-url">Repository URL</Label>
                  <Input
                    id="repo-url"
                    placeholder="https://github.com/owner/repo"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    className="w-full"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="branch">Branch (Optional)</Label>
                  <Input
                    id="branch"
                    placeholder="Default branch"
                    value={branch}
                    onChange={(e) => setBranch(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isLoading || !repoUrl}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {loadingStatus || "Analyzing..."}
                    </>
                  ) : (
                    "Analyze Repository"
                  )}
                </Button>
              </div>
            </form>
          )}

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analysisResults && <RepositoryAnalysisResults results={analysisResults} />}
    </div>
  )
}
