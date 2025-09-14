"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RefreshCw, CheckCircle, XCircle, Server } from "lucide-react"

interface OllamaHealth {
  status: string
  ollama: {
    status: string
    url: string
    models: Array<{ name: string; size: number }>
    error?: string
  }
  timestamp: string
}

export function OllamaStatus() {
  const [health, setHealth] = useState<OllamaHealth | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setHealth(data)
    } catch (error) {
      console.error("Health check failed:", error)
      setHealth({
        status: "error",
        ollama: {
          status: "error",
          url: "unknown",
          models: [],
          error: "Failed to connect to health endpoint",
        },
        timestamp: new Date().toISOString(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
  }, [])

  if (!health) {
    return (
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking Ollama status...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const isConnected = health.ollama.status === "connected"

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Server className="h-4 w-4" />
          Ollama Status
          <Button variant="ghost" size="sm" onClick={checkHealth} disabled={isLoading} className="ml-auto h-6 w-6 p-0">
            <RefreshCw className={`h-3 w-3 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <CheckCircle className="h-4 w-4 text-green-500" />
            ) : (
              <XCircle className="h-4 w-4 text-red-500" />
            )}
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Connected" : "Disconnected"}
            </Badge>
            <span className="text-sm text-muted-foreground">{health.ollama.url}</span>
          </div>

          {health.ollama.error && (
            <div className="text-sm text-destructive bg-destructive/10 p-2 rounded">{health.ollama.error}</div>
          )}

          {isConnected && health.ollama.models.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Available Models:</p>
              <div className="flex flex-wrap gap-1">
                {health.ollama.models.map((model) => (
                  <Badge key={model.name} variant="secondary" className="text-xs">
                    {model.name}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {!isConnected && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
              <p className="font-medium mb-1">To use AI summarization:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  Install Ollama from <code className="bg-background px-1 rounded">ollama.ai</code>
                </li>
                <li>
                  Run <code className="bg-background px-1 rounded">ollama pull llama3.2</code>
                </li>
                <li>Start Ollama service</li>
                <li>Refresh this status</li>
              </ol>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
