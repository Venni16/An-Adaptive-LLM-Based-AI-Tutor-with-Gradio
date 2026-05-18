import os
import json
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from openai import AsyncOpenAI
from dotenv import load_dotenv

# Search for the .env file in parent directories
# Root .env has LM_STUDIO_BASE_URL
env_paths = [".env", "../.env", "../../.env"]
env_loaded = False
for path in env_paths:
    if os.path.exists(path):
        load_dotenv(dotenv_path=path)
        env_loaded = True
        print(f"Loaded environment variables from: {os.path.abspath(path)}")
        break

if not env_loaded:
    load_dotenv()  # Fallback to default load
    print("Default load_dotenv() called.")

# Configuration settings
LM_STUDIO_BASE_URL = os.getenv("LM_STUDIO_BASE_URL", "http://127.0.0.1:1234/v1")
LM_STUDIO_API_KEY = os.getenv("LM_STUDIO_API_KEY", "lm-studio")

print(f"Configured LM Studio Base URL: {LM_STUDIO_BASE_URL}")

# Instantiate AsyncOpenAI Client
openai_client = AsyncOpenAI(
    base_url=LM_STUDIO_BASE_URL,
    api_key=LM_STUDIO_API_KEY
)

# Initialize FastAPI application
app = FastAPI(
    title="Vortex - Adaptive AI Tutor Backend",
    description="FastAPI Backend for Vortex Adaptive AI Tutor, interfacing with local LLMs via LM Studio."
)

# Set up CORS middleware to allow connections from local dev server (default http://localhost:5173)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for seamless development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Available explanation levels prompt mapping
EXPLANATION_LEVELS = {
    1: (
        "as a student. Use simple everyday analogies, clear and friendly words, visual comparisons, "
        "and avoid dense industry jargon. Focus on explaining 'what' it is and 'why' it matters "
        "using intuitive examples."
    ),
    2: (
        "as a junior developer. Focus on practical code samples, core syntax, common usage, "
        "how to get started, and common mistakes or gotchas to avoid. Explain 'how to use it' clearly."
    ),
    3: (
        "as a senior developer. Discuss architectural patterns, design choices, trade-offs, "
        "scalability, clean code patterns, testability, and refactoring guidelines. Explain code "
        "in a production context."
    ),
    4: (
        "as a principal engineer/expert. Dive deep into engine internals, low-level mechanics, "
        "performance benchmarks, compilation processes, memory footprints, concurrency safety, "
        "and architectural deep dives. Do not pull any punches; use exact, high-level technical terms."
    )
}

from typing import List, Optional

# Request schema for tutoring
class Message(BaseModel):
    role: str = Field(..., description="Role of the sender: user or assistant.")
    content: str = Field(..., description="The text content of the message.")

class TutorRequest(BaseModel):
    question: str = Field(..., description="The coding or conceptual question to tutor.")
    model: str = Field(..., description="The LLM model ID selected for this session.")
    explanation_level: int = Field(default=3, ge=1, le=4, description="Adaptive level from 1 (Student) to 4 (Expert).")
    history: List[Message] = Field(default=[], description="Prior messages in this conversation thread.")

@app.get("/api/health")
async def health_check():
    """Health check endpoint to verify backend status."""
    return {"status": "ok", "base_url": LM_STUDIO_BASE_URL}

@app.get("/api/models")
async def list_models():
    """
    Fetches the list of available models loaded in LM Studio.
    If LM Studio is down or unloaded, it falls back to a curated list of models.
    """
    try:
        models = await openai_client.models.list()
        model_list = [model.id for model in models.data]
        if not model_list:
            raise ValueError("No models loaded in LM Studio.")
        return {"success": True, "models": model_list, "source": "lm-studio"}
    except Exception as e:
        print(f"Error fetching models from LM Studio: {e}. Utilizing fallbacks.")
        # Curved fallbacks for excellent developer experience if LM Studio is offline
        fallback_models = [
            "qwen2.5-7b-instruct",
            "meta-llama-3.1-8b-instruct",
            "mistral-7b-instruct-v0.3",
            "lmstudio-community/Meta-Llama-3-8B-Instruct-GGUF"
        ]
        return {
            "success": True,
            "models": fallback_models,
            "source": "fallback",
            "warning": "Could not connect to LM Studio. Displaying default mock models."
        }

@app.post("/api/tutor")
async def get_tutor_explanation(payload: TutorRequest):
    """
    Endpoint that streams the AI Tutor explanation as text tokens.
    """
    level_instruction = EXPLANATION_LEVELS.get(
        payload.explanation_level,
        "clearly and concisely"
    )
    
    system_prompt = (
        f"You are Vortex, a helpful, patient, and highly expert Adaptive AI Tutor.\n"
        f"You must explain the user's concept or question strictly {level_instruction}\n"
        f"Provide complete, clean code blocks in markdown when code is requested.\n"
        f"Keep your tone extremely engaging, encouraging, and clear."
    )
    
    async def tutor_generator():
        try:
            # Build conversation history
            messages = [{"role": "system", "content": system_prompt}]
            
            # Feed previous chat turns dynamically
            for msg in payload.history:
                messages.append({"role": msg.role, "content": msg.content})
                
            # Append final active prompt
            messages.append({"role": "user", "content": payload.question})
            
            stream = await openai_client.chat.completions.create(
                model=payload.model,
                messages=messages,
                temperature=0.7,
                stream=True
            )
            
            async for chunk in stream:
                if chunk.choices and len(chunk.choices) > 0:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        yield delta.content
                        
        except Exception as e:
            err_msg = f"\n\n[Tutor Connection Error]: {str(e)}\n"
            print(err_msg)
            # If the error is 'Model unloaded' or connection issues, explain clearly
            if "model unloaded" in str(e).lower() or "400" in str(e):
                yield (
                    "\n\n⚠️ **Tutor Notification**: It seems the selected model is not loaded in LM Studio. "
                    "Please open LM Studio, load your model (e.g. Qwen, Llama), and try again. "
                    "Make sure LM Studio is running on: " + LM_STUDIO_BASE_URL
                )
            else:
                yield f"\n\n⚠️ **Tutor Error**: Could not complete explanation. Details: {str(e)}"

    return StreamingResponse(tutor_generator(), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    # Local port 8000 for standard development API
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
