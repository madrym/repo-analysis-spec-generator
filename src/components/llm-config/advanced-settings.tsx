"use client"

import { useState } from "react"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Settings } from "lucide-react"
import { useLLMConfig } from "../llm-config-wrapper"

export function AdvancedSettings() {
  const { config, updateConfig } = useLLMConfig()
  const [open, setOpen] = useState(false)
  const [globalMaxTokens, setGlobalMaxTokens] = useState(config.maxTokens.toString())

  const handleSave = () => {
    updateConfig({ maxTokens: Number.parseInt(globalMaxTokens) || 4000 })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Settings className="h-4 w-4 mr-2" />
          Advanced Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Advanced LLM Settings</DialogTitle>
          <DialogDescription>Configure advanced settings for LLM providers.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="global-max-tokens" className="col-span-2">
              Default Max Tokens
            </Label>
            <Input
              id="global-max-tokens"
              type="number"
              value={globalMaxTokens}
              onChange={(e) => setGlobalMaxTokens(e.target.value)}
              className="col-span-2"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This setting will be used as a fallback when provider-specific max tokens are not set. Environment variables
            will override this setting when available.
          </p>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={handleSave}>
            Save changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
