"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { History, Trash2, Search } from "lucide-react"

interface SearchHistoryItem {
  query: string
  timestamp: string
  resultsCount: number
}

interface SearchHistoryProps {
  onSearchFromHistory: (query: string) => void
}

export function SearchHistory({ onSearchFromHistory }: SearchHistoryProps) {
  const [history, setHistory] = useState<SearchHistoryItem[]>([])
  const [isExpanded, setIsExpanded] = useState(false)

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem("search_history")
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error("Failed to parse search history:", error)
      }
    }
  }, [])

  const addToHistory = (query: string, resultsCount: number) => {
    const newItem: SearchHistoryItem = {
      query,
      timestamp: new Date().toISOString(),
      resultsCount,
    }

    const updatedHistory = [newItem, ...history.filter((item) => item.query !== query)].slice(0, 10) // Keep last 10 searches

    setHistory(updatedHistory)
    localStorage.setItem("search_history", JSON.stringify(updatedHistory))
  }

  const clearHistory = () => {
    setHistory([])
    localStorage.removeItem("search_history")
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    return date.toLocaleDateString()
  }

  // Expose addToHistory function to parent component
  useEffect(() => {
    ;(window as any).addToSearchHistory = addToHistory
  }, [history])

  if (history.length === 0) return null

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle
          className="flex items-center gap-2 text-base cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <History className="h-4 w-4" />
          Recent Searches
          <Badge variant="outline" className="ml-auto text-xs">
            {history.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      {isExpanded && (
        <CardContent className="pt-0">
          <div className="space-y-2">
            {history.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.query}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimestamp(item.timestamp)}</span>
                    <span>•</span>
                    <span>{item.resultsCount} results</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onSearchFromHistory(item.query)}
                  className="h-8 px-2 shrink-0"
                >
                  <Search className="h-3 w-3" />
                </Button>
              </div>
            ))}
            <div className="pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={clearHistory} className="w-full text-xs text-muted-foreground">
                <Trash2 className="h-3 w-3 mr-1" />
                Clear History
              </Button>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
