import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface CiCdWorkflowProps {
  cicd: {
    workflows: any[]
    diagram: string
  }
}

export function CiCdWorkflow({ cicd }: CiCdWorkflowProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>CI/CD Workflow Diagram</CardTitle>
          <CardDescription>Visual representation of the CI/CD processes</CardDescription>
        </CardHeader>
        <CardContent>
          {cicd.diagram ? (
            <div className="border rounded-md p-4 bg-muted/30">
              <div dangerouslySetInnerHTML={{ __html: cicd.diagram }} />
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No CI/CD workflow diagram available for this repository.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Details</CardTitle>
          <CardDescription>Identified CI/CD workflows in this repository</CardDescription>
        </CardHeader>
        <CardContent>
          {cicd.workflows && cicd.workflows.length > 0 ? (
            <div className="space-y-6">
              {cicd.workflows.map((workflow, index) => (
                <div key={index} className="space-y-2">
                  <h3 className="font-medium">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>

                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Triggers:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {workflow.triggers.map((trigger: string, i: number) => (
                        <li key={i}>{trigger}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-2">
                    <h4 className="text-sm font-medium mb-1">Steps:</h4>
                    <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {workflow.steps.map((step: string, i: number) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No CI/CD workflows were detected in this repository.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
