import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface LanguageBreakdownProps {
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
}

export function LanguageBreakdown({ languages, frameworks }: LanguageBreakdownProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language Distribution</CardTitle>
          <CardDescription>Breakdown of programming languages used in this repository</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full rounded-full overflow-hidden flex">
              {languages.map((language) => (
                <div
                  key={language.name}
                  className="h-full"
                  style={{
                    width: `${language.percentage}%`,
                    backgroundColor: language.color || "#ccc",
                  }}
                  title={`${language.name}: ${language.percentage.toFixed(1)}%`}
                />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {languages.map((language) => (
                <div key={language.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: language.color || "#ccc" }} />
                  <span className="font-medium">{language.name}</span>
                  <span className="text-muted-foreground text-sm ml-auto">{language.percentage.toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Frameworks & Libraries</CardTitle>
          <CardDescription>Key technologies identified in the codebase</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {frameworks.map((framework) => (
              <div key={framework.name} className="space-y-1">
                <h3 className="font-medium">{framework.name}</h3>
                <p className="text-sm text-muted-foreground">{framework.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
