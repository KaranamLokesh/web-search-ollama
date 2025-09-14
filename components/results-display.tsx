"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { ExternalLink, Brain, Globe, Copy, Check, ChevronDown, ChevronUp } from "lucide-react"

interface SearchResult {
  title: string
  url: string
  snippet: string
}

interface ResultsDisplayProps {
  results: {
    searchResults: SearchResult[]
    aiSummary: string
    query: string
  }
  isLoading: boolean
}

export function ResultsDisplay({ results, isLoading }: ResultsDisplayProps) {
  const [copiedSummary, setCopiedSummary] = useState(false)
  const [expandedResults, setExpandedResults] = useState(true)

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedSummary(true)
      setTimeout(() => setCopiedSummary(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* AI Summary Loading */}
        <Card className="border-accent/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent animate-pulse" />
              <div className="h-5 w-24 bg-muted animate-pulse rounded" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="h-4 w-full bg-muted animate-pulse rounded" />
              <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4/6 bg-muted animate-pulse rounded" />
              <div className="h-4 w-3/6 bg-muted animate-pulse rounded" />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Search Results Loading */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <div className="h-6 w-32 bg-muted animate-pulse rounded" />
          </div>
          {[...Array(4)].map((_, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
                  <div className="space-y-2">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                    <div className="h-4 w-5/6 bg-muted animate-pulse rounded" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Summary Section */}
      <Card className="border-accent/20 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-accent">
              <Brain className="h-5 w-5" />
              AI Summary
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(results.aiSummary)}
              className="h-8 w-8 p-0"
            >
              {copiedSummary ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <div className="bg-accent/5 p-4 rounded-lg border border-accent/10">
              <p className="text-foreground leading-relaxed whitespace-pre-wrap m-0">{results.aiSummary}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="text-xs">
              Query: {results.query}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {results.searchResults.length} sources analyzed
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Search Results Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-5 w-5 text-muted-foreground" />
            <h2 className="text-xl font-semibold">Web Results</h2>
            <Badge variant="secondary" className="ml-2">
              {results.searchResults.length} results
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpandedResults(!expandedResults)}
            className="flex items-center gap-1"
          >
            {expandedResults ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Collapse
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Expand
              </>
            )}
          </Button>
        </div>

        {expandedResults && (
          <div className="space-y-4">
            {results.searchResults.map((result, index) => (
              <Card key={index} className="hover:shadow-md transition-all duration-200 hover:border-accent/20">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="group flex-1">
                        <h3 className="text-lg font-medium text-primary group-hover:text-accent transition-colors line-clamp-2 leading-tight">
                          {result.title}
                        </h3>
                      </a>
                      <Badge variant="outline" className="text-xs shrink-0">
                        #{index + 1}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-muted rounded-sm flex items-center justify-center">
                        <div className="w-2 h-2 bg-muted-foreground rounded-full" />
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{result.url}</p>
                    </div>

                    <p className="text-foreground leading-relaxed line-clamp-3">{result.snippet}</p>

                    <div className="flex items-center justify-between pt-2">
                      <a
                        href={result.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-accent hover:underline font-medium"
                      >
                        Visit page
                        <ExternalLink className="h-3 w-3" />
                      </a>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(`${result.title}\n${result.url}\n${result.snippet}`)}
                        className="h-7 px-2 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!expandedResults && (
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">
              Results collapsed. Click "Expand" to view all {results.searchResults.length} results.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
