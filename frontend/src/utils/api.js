// API client for calling FastAPI endpoints

const API_BASE_URL = "http://localhost:8000";

/**
 * Fetches the available LLM models from the backend.
 * @returns {Promise<{models: string[], source: string, success: boolean}>}
 */
export async function fetchModels() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/models`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("API error fetching models:", error);
    // Safe mock fallbacks in case the backend is completely offline
    return {
      success: true,
      models: [
        "qwen2.5-7b-instruct",
        "meta-llama-3.1-8b-instruct",
        "mistral-7b-instruct-v0.3",
        "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF"
      ],
      source: "fallback",
      warning: "Could not connect to API server. Operating in offline client fallback mode."
    };
  }
}

/**
 * Streams the adaptive explanation from the FastAPI tutor endpoint.
 * Uses ReadableStream to stream chunks in real-time.
 * 
 * @param {string} question The topic to tutor.
 * @param {string} model Selected model ID.
 * @param {number} explanationLevel Difficulty level (1 to 4).
 * @param {function} onChunk Callback triggered when a new text chunk is received.
 * @param {function} onError Callback triggered when an error occurs.
 * @param {function} onComplete Callback triggered when streaming successfully ends.
 */
export async function streamExplanation(
  question,
  model,
  explanationLevel,
  onChunk,
  onError,
  onComplete
) {
  try {
    const response = await fetch(`${API_BASE_URL}/api/tutor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        question,
        model,
        explanation_level: explanationLevel,
      }),
    });

    if (!response.ok) {
      throw new Error(`Tutor returned status code ${response.status}`);
    }

    if (!response.body) {
      throw new Error("No response body available for streaming.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let done = false;

    while (!done) {
      const { value, done: readerDone } = await reader.read();
      done = readerDone;
      if (value) {
        const textChunk = decoder.decode(value, { stream: !done });
        onChunk(textChunk);
      }
    }
    
    onComplete();
  } catch (error) {
    console.error("Error streaming explanation from tutor:", error);
    onError(error);
  }
}
