from openai import OpenAI
from dotenv import load_dotenv
import os

from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware


load_dotenv()

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatRequest(BaseModel):
    prompt: str

class ChatResponse(BaseModel):
    output: str

@app.post("/chat", response_model = ChatResponse)
def chat(req: ChatRequest):
    response = client.responses.create(
        model="gpt-4o-mini",
        instructions="You are a chatbot that responds to any questions.",
        input=req.prompt,
    )
    return ChatResponse(output=response.output_text)

# prompt = input("How can I help you?")

# response = client.responses.create(
#     model="gpt-4o-mini",
#     instructions="You are a chatbot that responds to any questions.",
#     input=prompt,
# )

# print(response.output_text)