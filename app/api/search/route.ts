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

    const ollamaUrl = process.env.OLLAMA_URL || "http://127.0.0.1:11434";
    const ollamaEndpoint = `${ollamaUrl}/api/chat`; // Use /api/chat for function calling

    const tools = [
      {
        type: "function",
        function: {
          name: "web_search",
          description: "Searches the web for a given query and returns a list of search results (title, url, snippet).",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The search query.",
              },
            },
            required: ["query"],
          },
        },
      },
      {
        type: "function",
        function: {
          name: "summarize_content",
          description: "Summarizes a given text content based on a query.",
          parameters: {
            type: "object",
            properties: {
              query: {
                type: "string",
                description: "The original query for which the content was gathered.",
              },
              content: {
                type: "string",
                description: "The text content to summarize.",
              },
            },
            required: ["query", "content"],
          },
        },
      },
    ];

    let messages: any[] = [
      {
        role: "user",
        content: query,
      },
    ];

    let aiResponseContent = "";
    let searchResults: SearchResult[] = [];
    let rawContent = "";

    // Agentic loop
    for (let i = 0; i < 5; i++) { // Limit iterations to prevent infinite loops
      const ollamaResponse = await fetch(ollamaEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: process.env.OLLAMA_MODEL || "scb10x/typhoon2.1-gemma3-4b",
          messages: messages,
          tools: tools,
          stream: false,
        }),
      });

      console.log("Ollama Request Body:", JSON.stringify({
        model: process.env.OLLAMA_MODEL || "scb10x/typhoon2.1-gemma3-4b",
        messages: messages,
        tools: tools,
        stream: false,
      }, null, 2));

      const ollamaData = await ollamaResponse.json(); // Parse as JSON directly
      console.log("Ollama Raw Response Body (Parsed):", JSON.stringify(ollamaData, null, 2)); // Log the parsed object

      if (!ollamaResponse.ok) {
        throw new Error(`Ollama API error: ${ollamaResponse.status} - ${ollamaResponse.statusText} - ${JSON.stringify(ollamaData)}`);
      }

      const responseMessage = ollamaData.message;

      if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
        const toolCall = responseMessage.tool_calls[0]; // Assuming one tool call for simplicity

        if (toolCall.function.name === "web_search") {
          const args = toolCall.function.arguments;
          searchResults = await performWebSearch(args.query);
          rawContent = searchResults
            .map((result) => `Title: ${result.title}\nURL: ${result.url}\nContent: ${result.snippet}`)
            .join("\n\n---\n\n");

          messages.push(responseMessage); // Add tool call to history
          messages.push({
            role: "tool",
            content: JSON.stringify(searchResults), // Send search results back to Ollama
          });
        } else if (toolCall.function.name === "summarize_content") {
          const args = toolCall.function.arguments;
          aiResponseContent = await getOllamaSummary(args.query, args.content); // Use the existing summarization function
          messages.push(responseMessage); // Add tool call to history
          messages.push({
            role: "tool",
            content: aiResponseContent, // Send summary back to Ollama
          });
          break; // Summary generated, exit loop
        } else {
          throw new Error(`Unknown tool: ${toolCall.function.name}`);
        }
      } else if (responseMessage.content) {
        aiResponseContent = responseMessage.content;
        break; // Final answer from LLM
      } else {
        throw new Error("Unexpected Ollama response: No content or tool_calls.");
      }
    }

    const response: SearchResponse & { aiSummary: string } = {
      searchResults,
      rawContent,
      query,
      aiSummary: aiResponseContent,
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
        model: process.env.OLLAMA_MODEL || "scb10x/typhoon2.1-gemma3-4b", // Default model
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