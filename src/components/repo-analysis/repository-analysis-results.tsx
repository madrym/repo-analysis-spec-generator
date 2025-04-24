"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RepositoryOverview } from "./repository-overview"
import { LanguageBreakdown } from "./language-breakdown"
import { CiCdWorkflow } from "./cicd-workflow"
import { PrProcess } from "./pr-process"
import { RepositoryStructure } from "./repository-structure"

interface RepositoryAnalysisResultsProps {
  results: {
    overview: {
      name: string
      description: string
      purpose: string
      architecture: string
    }
    languages: {
      name: string
      percentage: number
      color: string
    }[]
    frameworks: {
      name: string
      category: string
      description: string
    }[]
    cicd: {
      workflows: any[]
      diagram: string
    }
    prProcess: {
      checks: string[]
      tools: string[]
      requirements: string[]
      diagram: string
    }
    structure: {
      directories: any[]
      diagram: string
    }
  }
}

export function RepositoryAnalysisResults({ results }: RepositoryAnalysisResultsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
          <div>
            <CardTitle>{results.overview.name}</CardTitle>
            <CardDescription>{results.overview.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            {results.languages.slice(0, 3).map((lang) => (
              <Badge key={lang.name} variant="secondary">
                {lang.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="languages">Languages</TabsTrigger>
            <TabsTrigger value="cicd">CI/CD</TabsTrigger>
            <TabsTrigger value="pr">PR Process</TabsTrigger>
            <TabsTrigger value="structure">Structure</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <RepositoryOverview overview={results.overview} frameworks={results.frameworks} />
          </TabsContent>

          <TabsContent value="languages">
            <LanguageBreakdown languages={results.languages} frameworks={results.frameworks} />
          </TabsContent>

          <TabsContent value="cicd">
            <CiCdWorkflow cicd={results.cicd} />
          </TabsContent>

          <TabsContent value="pr">
            <PrProcess prProcess={results.prProcess} />
          </TabsContent>

          <TabsContent value="structure">
            <RepositoryStructure structure={results.structure} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
