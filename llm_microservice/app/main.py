# llm_microservice/app/main.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from huggingface_hub import InferenceClient
import os
from dotenv import load_dotenv

# Load environment variables from .env file (if available)
load_dotenv()

app = FastAPI(title="LLM Microservice")

# Load and strip the Hugging Face API token
HF_API_TOKEN = os.getenv("HF_API_TOKEN", "default_value").strip()
if HF_API_TOKEN == "default_value" or not HF_API_TOKEN:
    raise Exception("HF_API_TOKEN is not set correctly. Please update your .env file.")

# Initialize the InferenceClient using your token
client = InferenceClient(api_key=HF_API_TOKEN)

# Define a Pydantic model for the request body
class PromptRequest(BaseModel):
    prompt: str

@app.post("/generate")
async def generate_text(request: PromptRequest):
    # Prepare messages for the Hugging Face API
    messages = [
        {
            "role": "system",
            "content": "You are a highly knowledgeable personal finance assistant. Provide concise and actionable advice."
        },
        {
            "role": "user",
            "content": request.prompt
        }
    ]
    try:
        # Call the Hugging Face API for chat completions
        completion = client.chat.completions.create(
            model="microsoft/Phi-3-mini-4k-instruct",
            messages=messages,
            max_tokens=500
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
    # Extract the generated message content
    response_message = completion.choices[0].message
    return {"response": response_message.content}
