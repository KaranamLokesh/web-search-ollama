"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Settings, Save } from "lucide-react"

export function SettingsPanel() {
  const [ollamaUrl, setOllamaUrl] = useState("http://localhost:11434")
  const [ollamaModel, setOllamaModel] = useState("llama3.2")
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSave = () => {
    // In a real app, you'd save these to localStorage or user preferences
    localStorage.setItem("ollama_url", ollamaUrl)
    localStorage.setItem("ollama_model", ollamaModel)

    // Show success feedback
    alert("Settings saved! Note: These are stored locally and will reset on page refresh.")
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <Settings className="h-4 w-4" />
          Configuration
          <Badge variant="outline" className="ml-auto text-xs">
            {isExpanded ? "Hide" : "Show"}
          </Badge>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ollama-url" className="text-sm font-medium">
                Ollama URL
              </Label>
              <Input
                id="ollama-url"
                type="url"
                value={ollamaUrl}
                onChange={(e) => setOllamaUrl(e.target.value)}
                placeholder="http://localhost:11434"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">The URL where your Ollama instance is running</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ollama-model" className="text-sm font-medium">
                Ollama Model
              </Label>
              <Input
                id="ollama-model"
                type="text"
                value={ollamaModel}
                onChange={(e) => setOllamaModel(e.target.value)}
                placeholder="llama3.2"
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">The model name to use for AI summarization</p>
            </div>

            <Button onClick={handleSave} size="sm" className="w-full">
              <Save className="mr-2 h-3 w-3" />
              Save Configuration
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
