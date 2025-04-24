import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface PrProcessProps {
  prProcess: {
    checks: string[]
    tools: string[]
    requirements: string[]
    diagram: string
  }
}

export function PrProcess({ prProcess }: PrProcessProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>PR Process Diagram</CardTitle>
          <CardDescription>Visual representation of the pull request workflow</CardDescription>
        </CardHeader>
        <CardContent>
          {prProcess.diagram ? (
            <div className="border rounded-md p-4 bg-muted/30">
              <div dangerouslySetInnerHTML={{ __html: prProcess.diagram }} />
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No PR process diagram available for this repository.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Required Checks</CardTitle>
          </CardHeader>
          <CardContent>
            {prProcess.checks && prProcess.checks.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {prProcess.checks.map((check, index) => (
                  <li key={index}>{check}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No required checks identified.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Automated Tools</CardTitle>
          </CardHeader>
          <CardContent>
            {prProcess.tools && prProcess.tools.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {prProcess.tools.map((tool, index) => (
                  <li key={index}>{tool}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No automated tools identified.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Review Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            {prProcess.requirements && prProcess.requirements.length > 0 ? (
              <ul className="list-disc list-inside text-sm text-muted-foreground">
                {prProcess.requirements.map((requirement, index) => (
                  <li key={index}>{requirement}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">No review requirements identified.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
