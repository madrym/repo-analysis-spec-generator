import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RepositoryOverviewProps {
  overview: {
    name: string
    description: string
    purpose: string
    architecture: string
  }
  frameworks: {
    name: string
    category: string
    description: string
  }[]
}

export function RepositoryOverview({ overview, frameworks }: RepositoryOverviewProps) {
  // Group frameworks by category
  const frameworksByCategory = frameworks.reduce(
    (acc, framework) => {
      if (!acc[framework.category]) {
        acc[framework.category] = []
      }
      acc[framework.category].push(framework)
      return acc
    },
    {} as Record<string, typeof frameworks>,
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Repository Purpose</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{overview.purpose}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Architecture</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">{overview.architecture}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Technologies</CardTitle>
          <CardDescription>Key frameworks and libraries used in this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(frameworksByCategory).map(([category, categoryFrameworks]) => (
              <div key={category}>
                <h3 className="text-sm font-medium mb-2">{category}</h3>
                <div className="flex flex-wrap gap-2">
                  {categoryFrameworks.map((framework) => (
                    <Badge key={framework.name} variant="outline" className="px-2 py-1">
                      {framework.name}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
