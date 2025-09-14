import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Check Ollama connection
    const ollamaUrl = process.env.OLLAMA_URL || "http://localhost:11434"

    const response = await fetch(`${ollamaUrl}/api/tags`, {
      method: "GET",
    })

    const ollamaStatus = response.ok ? "connected" : "disconnected"
    const models = response.ok ? await response.json() : null

    return NextResponse.json({
      status: "healthy",
      ollama: {
        status: ollamaStatus,
        url: ollamaUrl,
        models: models?.models || [],
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: "unhealthy",
        ollama: {
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
