import { type NextRequest, NextResponse } from "next/server";

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

interface SearchResponse {
  searchResults: SearchResult[];
  rawContent: string;
  query: string;
}

// Brave Search API specific types
interface BraveApiResult {
  title: string;
  url: string;
  description: string;
}

interface BraveApiResponse {
  results: BraveApiResult[];
}

export async function POST(request: NextRequest) {
  try {
    const { query } = await request.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required and must be a string" }, { status: 400 });
    }

    const searchResults = await performWebSearch(query);

    const rawContent = searchResults
      .map((result) => `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}`)
      .join("\n\n---\n\n");

    const aiSummary = await getOllamaSummary(query, rawContent);

    const response: SearchResponse & { aiSummary: string } = {
      searchResults,
      rawContent,
      query,
      aiSummary,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
  }
}

async function performWebSearch(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.BRAVE_API_KEY;

  if (!apiKey) {
    console.error("Brave API key is missing. Please set the BRAVE_API_KEY environment variable.");
    return [];
  }

  const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(searchUrl, {
      headers: {
        "Accept": "application/json",
        "x-subscription-token": apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Safely navigate the nested structure for the web results
    const resultsArray = data?.web?.results;

    if (!resultsArray) {
      console.log("Brave API returned no results in the expected format.");
      console.log("Full API Response:", JSON.stringify(data, null, 2));
      return [];
    }

    // Map the Brave API response to our internal SearchResult format
    const results: SearchResult[] = resultsArray.map((item: any) => ({
      title: item.title,
      url: item.url,
      snippet: item.description,
    }));

    return results.slice(0, 8); // Limit to top 8 results
  } catch (error) {
    console.error("Brave API request failed:", error);
    return [];
  }
}

async function getOllamaSummary(query: string, content: string): Promise<string> {
  const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
  const ollamaEndpoint = `${ollamaUrl}/api/generate`;

  try {
    const response = await fetch(ollamaEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "*/*",
        "User-Agent": "curl/8.4.0",
      },
      body: JSON.stringify({
        model: process.env.OLLAMA_MODEL || "gemma3:1b", // Default model
        prompt: `You are a research assistant. Based on the following web search results for the query "${query}", provide a comprehensive, well-structured summary that synthesizes the key information. Focus on accuracy, clarity, and relevance.\n\nSearch Results:\n${content}\n\nPlease provide a clear, informative summary that addresses the user's query:`,        stream: false,
        options: {
          temperature: 0.3,
          top_p: 0.9,
          max_tokens: 500,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} - ${response.statusText} at ${ollamaEndpoint}`);
    }

    const data = await response.json();
    return data.response || "Unable to generate summary at this time.";
  } catch (error) {
    console.error("Ollama API error:", error);
    return `Based on the search results for "${query}", here's what I found: The search returned several relevant sources covering different aspects of this topic. The results include comprehensive guides, reference materials, and expert insights. For the most accurate and up-to-date information, I recommend reviewing the individual sources provided below. Please note: AI summarization is currently unavailable - check your Ollama connection.`;
  }
}