"use client"

import { useState } from "react"
import { SearchInterface } from "@/components/search-interface"
import { ResultsDisplay } from "@/components/results-display"
import { OllamaStatus } from "@/components/ollama-status"
import { SettingsPanel } from "@/components/settings-panel"
import { SearchHistory } from "@/components/search-history"

export default function Home() {
  const [searchResults, setSearchResults] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSearch = async (query: string) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      })

      const data = await response.json()
      setSearchResults(data)

      // Add to search history
      if ((window as any).addToSearchHistory) {
        ;(window as any).addToSearchHistory(query, data.searchResults?.length || 0)
      }
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 text-balance">AI Research Assistant</h1>
            <p className="text-lg text-muted-foreground text-pretty">
              Search the web and get AI-powered summaries powered by Ollama
            </p>
          </header>

          <OllamaStatus />
          <SettingsPanel />
          <SearchHistory onSearchFromHistory={handleSearch} />

          <SearchInterface onSearch={handleSearch} isLoading={isLoading} />

          {searchResults && <ResultsDisplay results={searchResults} isLoading={isLoading} />}
        </div>
      </div>
    </main>
  )
}
