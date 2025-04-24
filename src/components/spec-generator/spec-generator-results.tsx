"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Download, RefreshCw, MessageSquare } from "lucide-react"
import { SpecChat } from "./spec-chat"

interface SpecGeneratorResultsProps {
  specifications: {
    planning: string
    tasks: string
    specs: string
  }
  onReset: () => void
}

export function SpecGeneratorResults({ specifications, onReset }: SpecGeneratorResultsProps) {
  const [showChat, setShowChat] = useState(false)

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadAll = () => {
    handleDownload(specifications.planning, "PLANNING.md")
    handleDownload(specifications.tasks, "TASK.md")
    handleDownload(specifications.specs, "SPECS.md")
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
            <div>
              <CardTitle>Feature Specifications</CardTitle>
              <CardDescription>Your comprehensive feature specifications have been generated.</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowChat(!showChat)}>
                <MessageSquare className="mr-2 h-4 w-4" />
                {showChat ? "Hide Chat" : "Ask Questions"}
              </Button>
              <Button variant="outline" onClick={handleDownloadAll}>
                <Download className="mr-2 h-4 w-4" />
                Download All
              </Button>
              <Button variant="outline" onClick={onReset}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Start New
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {showChat ? (
            <SpecChat specifications={specifications} />
          ) : (
            <Tabs defaultValue="planning" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4">
                <TabsTrigger value="planning">PLANNING.md</TabsTrigger>
                <TabsTrigger value="tasks">TASK.md</TabsTrigger>
                <TabsTrigger value="specs">SPECS.md</TabsTrigger>
              </TabsList>

              <TabsContent value="planning">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Planning Document</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(specifications.planning, "PLANNING.md")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-mono text-xs p-4 bg-muted rounded-md overflow-auto">
                        {specifications.planning}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Task Breakdown</CardTitle>
                    <Button variant="outline" size="sm" onClick={() => handleDownload(specifications.tasks, "TASK.md")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-mono text-xs p-4 bg-muted rounded-md overflow-auto">
                        {specifications.tasks}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="specs">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Behavior Specifications</CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(specifications.specs, "SPECS.md")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <pre className="whitespace-pre-wrap font-mono text-xs p-4 bg-muted rounded-md overflow-auto">
                        {specifications.specs}
                      </pre>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
