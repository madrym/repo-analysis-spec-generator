import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info } from "lucide-react"

interface RepositoryStructureProps {
  structure: {
    directories: {
      name: string
      path: string
      description: string
      children?: any[]
    }[]
    diagram: string
  }
}

export function RepositoryStructure({ structure }: RepositoryStructureProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Structure Diagram</CardTitle>
          <CardDescription>Visual representation of the repository structure</CardDescription>
        </CardHeader>
        <CardContent>
          {structure.diagram ? (
            <div className="border rounded-md p-4 bg-muted/30">
              <div dangerouslySetInnerHTML={{ __html: structure.diagram }} />
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No structure diagram available for this repository.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Directory Structure</CardTitle>
          <CardDescription>Key directories and their purpose</CardDescription>
        </CardHeader>
        <CardContent>
          {structure.directories && structure.directories.length > 0 ? (
            <div className="space-y-4">
              {structure.directories.map((directory) => (
                <div key={directory.path} className="space-y-2">
                  <h3 className="font-medium">{directory.name}</h3>
                  <p className="text-sm text-muted-foreground">{directory.description}</p>

                  {directory.children && directory.children.length > 0 && (
                    <div className="ml-4 mt-2 border-l pl-4">
                      {directory.children.map((child) => (
                        <div key={child.path} className="mt-2">
                          <h4 className="text-sm font-medium">{child.name}</h4>
                          <p className="text-xs text-muted-foreground">{child.description}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription>No directory structure information available for this repository.</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
