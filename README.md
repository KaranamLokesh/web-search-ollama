# Web Search AI Tool

This is a Next.js application that combines web search capabilities with AI summarization using Ollama. It allows users to query the web and receive a concise, AI-generated summary of the search results.

## Features

*   **Web Search:** Utilizes the Brave Search API to fetch relevant web results.
*   **AI Summarization:** Integrates with Ollama to generate summaries of the retrieved search content.
*   **User-Friendly Interface:** (Assuming a UI exists based on Next.js project structure)

## Setup

Follow these steps to get the project up and running on your local machine.

### Prerequisites

*   **Node.js:** Ensure you have Node.js (LTS version recommended) installed.
*   **npm or pnpm:** A package manager for Node.js.
*   **Ollama:** Download and install Ollama from [https://ollama.ai/](https://ollama.ai/). Make sure you have a model downloaded (e.g., `llama3:8b` or `gemma:2b`).

### Installation

1.  **Clone the repository:**
    ```bash
    git clone <your-repository-url>
    cd web-search-ai-tool
    ```
2.  **Install dependencies:**
    ```bash
    pnpm install
    # or
    npm install
    ```

### Environment Variables

Create a `.env.local` file in the root of your project and add the following environment variables:

*   **`BRAVE_API_KEY`**: Your API key for the Brave Search API.
    *   Get your key from: [https://api.search.brave.com/](https://api.search.brave.com/)
*   **`OLLAMA_URL`**: The URL where your Ollama server is running.
    *   Default: `http://127.0.0.1:11434`
*   **`OLLAMA_MODEL`**: The Ollama model you want to use for summarization.
    *   Default: `gemma3:1b` (or `llama3:8b`, etc., depending on what you have downloaded)

Example `.env.local` file:
```
BRAVE_API_KEY="YOUR_BRAVE_API_KEY_HERE"
OLLAMA_URL="http://127.0.0.1:11434"
OLLAMA_MODEL="gemma:2b"
```

### Running the Application

1.  **Start Ollama:** Ensure your Ollama server is running in the background.
    ```bash
    ollama run <your-model-name> # e.g., ollama run gemma:2b
    ```
2.  **Run in Development Mode:**
    ```bash
    npm run dev
    # or
    pnpm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

3.  **Build and Run in Production Mode:**
    ```bash
    npm run build
    # or
    pnpm run build

    npm start
    # or
    pnpm start
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

Enter your search query in the application's interface. The application will fetch results from the Brave Search API and provide an AI-generated summary using Ollama.

## Troubleshooting

### Ollama API Errors (e.g., 404 Not Found)

*   **Ollama Server Not Running:** Ensure your Ollama server is running.
*   **Incorrect `OLLAMA_URL`:** Verify that `OLLAMA_URL` in your `.env.local` file matches the address where Ollama is listening. Use `http://127.0.0.1:11434` for local access.
*   **Conflicting Ollama Processes:** If you see multiple `ollama` processes, terminate them all (`killall ollama`) and restart Ollama.
*   **IPv6 vs. IPv4:** If `curl` works but the app fails, ensure `OLLAMA_URL` is set to `http://127.0.0.1:11434` to force IPv4.

### Brave API Errors (e.g., `ENOTFOUND api.search.brave.com`)

*   **Incorrect `BRAVE_API_KEY`:** Ensure your `BRAVE_API_KEY` is correctly set in `.env.local` and is valid.
*   **DNS Resolution Failure (`ENOTFOUND`):** This means your machine cannot find the IP address for `api.search.brave.com`.
    *   **Check Internet Connection:** Ensure your machine has an active internet connection.
    *   **Change DNS Servers:** Consider changing your system's DNS servers to public ones (e.g., Google DNS: `8.8.8.8`, `8.8.4.4` or Cloudflare DNS: `1.1.1.1`, `1.0.0.1`).
    *   **Flush DNS Cache (macOS):** Open your terminal and run: `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder` (you will be prompted for your password).
    *   **Firewall/Proxy:** Check if a firewall or proxy is blocking DNS lookups or access to `api.search.brave.com`.

### Accessing from Other Devices on Home Wi-Fi

*   **Find Your Local IP:** On macOS, go to System Settings > Network, select your active Wi-Fi, and find your IP address (e.g., `192.168.1.100`).
*   **Use IP Address:** From other devices, access the app using `http://<your-ip-address>:3000`.
*   **Firewall:** Your computer's firewall might be blocking incoming connections on port `3000`. Adjust settings if necessary.


