import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { RepositoryAnalysis } from "../components/repo-analysis/repository-analysis"
import { SpecGenerator } from "../components/spec-generator/spec-generator"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-6 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Repository Analysis & Feature Spec Generator</h1>
        <p className="text-muted-foreground max-w-[700px]">
          Analyze GitHub repositories for insights and generate comprehensive feature specifications with AI assistance.
        </p>
      </div>

      <Tabs defaultValue="repo-analysis" className="w-full max-w-5xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="repo-analysis">Repository Analysis</TabsTrigger>
          <TabsTrigger value="spec-generator">Feature Spec Generator</TabsTrigger>
        </TabsList>
        <TabsContent value="repo-analysis" className="mt-6">
          <RepositoryAnalysis />
        </TabsContent>
        <TabsContent value="spec-generator" className="mt-6">
          <SpecGenerator />
        </TabsContent>
      </Tabs>
    </main>
  )
}
