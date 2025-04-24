"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Textarea } from "../ui/textarea"
import { Button } from "../ui/button"
import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { AlertCircle, Loader2, Settings } from "lucide-react"
import { SpecGeneratorForm } from "./spec-generator-form"
import { SpecGeneratorResults } from "./spec-generator-results"
import { useLLMConfig } from "../llm-config-wrapper"
import Link from "next/link"
import { Input } from "../ui/input"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import { cloneRepositoryBranch } from "@/lib/client-github"

type Step = "initial" | "questions" | "results"

export function SpecGenerator() {
  const { availableProviders } = useLLMConfig()
  const [step, setStep] = useState<Step>("initial")
  const [featureRequest, setFeatureRequest] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [questions, setQuestions] = useState<any[] | null>(null)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [specifications, setSpecifications] = useState<any | null>(null)
  const [repoContext, setRepoContext] = useState<string | null>(null)
  const [repoBranch, setRepoBranch] = useState("")
  const [loadingStatus, setLoadingStatus] = useState("")

  // New state for repository context
  const [useRepoAsContext, setUseRepoAsContext] = useState(false)
  const [repoUrl, setRepoUrl] = useState("")
  const [isLoadingRepo, setIsLoadingRepo] = useState(false)

  const handleInitialSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    setIsLoadingRepo(false)
    setLoadingStatus("Starting...")

    let contextData: string | null = null
    let repomixOutputUsed: string | null = null

    try {
      if (availableProviders.length === 0) {
        throw new Error("No LLM providers are configured. Please configure an LLM provider in the settings.")
      }

      if (useRepoAsContext && repoUrl) {
        setIsLoadingRepo(true)

        const repoMatch = repoUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/.]+)(?:\.git)?$/i)
        if (!repoMatch) {
          throw new Error("Please enter a valid GitHub repository URL (e.g., https://github.com/owner/repo)")
        }
        const owner = repoMatch[1]
        const repo = repoMatch[2]

        setLoadingStatus(`Cloning ${owner}/${repo}` + (repoBranch ? ` branch ${repoBranch}` : ' default branch') + "...")
        const cloneData = await cloneRepositoryBranch(repoUrl, repoBranch || undefined)
        const clonedCodePath = cloneData.path
        const actualBranch = cloneData.branchName
        const actualOwner = cloneData.owner
        const actualRepo = cloneData.repo

        if (!clonedCodePath || !actualBranch || !actualOwner || !actualRepo) {
            throw new Error("Cloning process did not return expected path or branch information.");
        }
        console.log(`Clone successful for spec gen. Path: ${clonedCodePath}, Branch: ${actualBranch}`) 

        setLoadingStatus("Running repomix analysis...")
        const repomixResponse = await fetch("/api/repomix/run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
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
        repomixOutputUsed = repomixData.repomixOutputPath
        contextData = repomixOutputUsed
        console.log(`Repomix successful for spec gen. Output: ${repomixOutputUsed}`) 

        setIsLoadingRepo(false)
        setLoadingStatus("Generating questions...")
      } else {
        contextData = repoContext
      }

      setLoadingStatus("Generating questions...")
      const questionsResponse = await fetch("/api/spec/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          featureRequest,
          repoContext: repomixOutputUsed, 
        }),
      })

      if (!questionsResponse.ok) {
        const errorData = await questionsResponse.json().catch(() => ({}))
        throw new Error(`Failed to generate questions: ${errorData.message || questionsResponse.statusText}`)
      }

      const questionsData = await questionsResponse.json()
      setQuestions(questionsData.questions)
      setRepoContext(repomixOutputUsed)
      setStep("questions")

    } catch (err) {
      console.error("Spec generator initial step failed:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
      setIsLoadingRepo(false)
      setLoadingStatus("")
    }
  }

  const handleQuestionsSubmit = async (formAnswers: Record<string, string>) => {
    setAnswers(formAnswers)
    setError(null)
    setIsLoading(true)
    setLoadingStatus("Generating specification...")

    try {
      const response = await fetch("/api/spec/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          featureRequest,
          repoContext: repoContext,
          answers: formAnswers,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to generate specifications")
      }

      const data = await response.json()
      setSpecifications(data)
      setStep("results")

    } catch (err) {
      console.error("Spec generation failed:", err)
      setError(err instanceof Error ? err.message : "An unknown error occurred")
    } finally {
      setIsLoading(false)
      setLoadingStatus("")
    }
  }

  const handleReset = () => {
    setStep("initial")
    setFeatureRequest("")
    setQuestions(null)
    setAnswers({})
    setSpecifications(null)
    setRepoContext(null)
    setUseRepoAsContext(false)
    setRepoUrl("")
    setRepoBranch("")
    setLoadingStatus("")
  }

  return (
    <div className="space-y-6">
      {step === "initial" && (
        <Card>
          <CardHeader>
            <CardTitle>Feature Specification Generator</CardTitle>
            <CardDescription>
              Describe the feature you want to build, and we'll generate comprehensive specifications.
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
              <form onSubmit={handleInitialSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Textarea
                    placeholder="Describe your feature request in detail. For example: I want to build a user authentication system with social login options and two-factor authentication."
                    value={featureRequest}
                    onChange={(e) => setFeatureRequest(e.target.value)}
                    className="min-h-[150px]"
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="use-repo-context"
                      checked={useRepoAsContext}
                      onCheckedChange={(checked) => setUseRepoAsContext(checked === true)}
                    />
                    <Label htmlFor="use-repo-context" className="font-medium">
                      Use repository as context
                    </Label>
                  </div>

                  {useRepoAsContext && (
                    <div className="space-y-2 pl-6">
                      <Label htmlFor="repo-url">GitHub Repository URL</Label>
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
                              <Label htmlFor="repo-branch">Branch (Optional)</Label>
                              <Input
                                id="repo-branch"
                                placeholder="Default branch"
                                value={repoBranch}
                                onChange={(e) => setRepoBranch(e.target.value)}
                                className="w-full"
                              />
                         </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        The repository branch will be cloned and analyzed...
                      </p>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isLoading || isLoadingRepo || !featureRequest || (useRepoAsContext && !repoUrl)}
                    >
                      {isLoading || isLoadingRepo ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {loadingStatus || (isLoadingRepo ? "Analyzing Repository..." : "Generating Questions...")}
                        </>
                      ) : (
                        "Generate Questions"
                      )}
                    </Button>
                  </div>

                  {error && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {step === "questions" && questions && (
        <SpecGeneratorForm
          questions={questions}
          onSubmit={handleQuestionsSubmit}
          onBack={() => setStep("initial")}
          isLoading={isLoading}
        />
      )}

      {step === "results" && specifications && (
        <SpecGeneratorResults specifications={specifications} onReset={handleReset} />
      )}
    </div>
  )
}
