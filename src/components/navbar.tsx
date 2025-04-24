import Link from "next/link"
import { Button } from "./ui/button"
import { GitBranch, Settings } from "lucide-react"
import { LLMStatusIndicator } from "./llm-config/llm-status-indicator"
import { ThemeSwitcher } from "./theme-switcher"

export function Navbar() {
  return (
    <header className="border-b">
      <div className="container flex h-16 items-center px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <GitBranch className="h-5 w-5" />
          <span>Repo Analysis & Spec Generator</span>
        </Link>
        <div className="ml-auto flex items-center gap-4">
          <LLMStatusIndicator />
          <ThemeSwitcher />
          <nav className="flex gap-4 sm:gap-6">
            <Link href="/">
              <Button variant="ghost">Home</Button>
            </Link>
            <Link href="/settings">
              <Button variant="ghost">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
