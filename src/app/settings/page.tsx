import { LLMConfigPanel } from "../../components/llm-config/llm-config-panel"

export default function SettingsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center space-y-6 text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground max-w-[700px]">Configure your application settings and integrations.</p>
      </div>

      <div className="max-w-3xl mx-auto">
        <LLMConfigPanel />
      </div>
    </div>
  )
}
