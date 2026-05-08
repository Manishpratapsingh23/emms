"""
WorkWise AI - Advanced RAG Agent Service (Python/FastAPI)
Using FAISS Vector Store and Sentence-Transformers for Semantic Search.
"""

import os
import sys
from typing import Optional, List, Dict
from datetime import datetime

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from groq import Groq

from knowledge_base_manager import (
    process_and_index,
    search_semantic,
)

# Load env
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), ".env")
load_dotenv(env_path)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    print("ERROR: GROQ_API_KEY missing.")
    sys.exit(1)

groq_client = Groq(api_key=GROQ_API_KEY)
app = FastAPI(title="WorkWise AI Semantic Agent")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global documents list
all_documents = []

@app.on_event("startup")
async def startup_event():
    """Build the semantic index on startup."""
    global all_documents
    print("\nInitializing Semantic RAG System...")
    all_documents = process_and_index()
    print(f"System Ready. Index size: {len(all_documents)} chunks.\n")

class ChatRequest(BaseModel):
    message: str
    user_id: str
    user_role: str
    user_name: str = "User"
    user_context: Optional[Dict] = None

@app.post("/chat")
async def chat(request: ChatRequest):
    try:
        print(f"--- Incoming Chat Request from {request.user_name} ---")
        
        # Step 1: Semantic Search (FAISS Retrieval)
        print(f"Step 1: Retrieving context for query: '{request.message}'")
        retrieved_docs = search_semantic(request.message, request.user_role)
        print(f"Found {len(retrieved_docs)} relevant document chunks.")
        
        # Step 2: Context Preparation & Prompt Construction
        print("Step 2: Constructing Augmented Prompt...")
        ctx = request.user_context or {}
        
        # Build document context string
        context_str = ""
        for i, doc in enumerate(retrieved_docs):
            context_str += f"\n[Document {i+1}: {doc['title']}]\n{doc['content']}\n"
        
        system_prompt = f"""You are WorkWise AI Assistant, a professional HR and company policy expert.
Your goal is to provide accurate information based ONLY on the provided company documents.

USER INFORMATION:
- Name: {request.user_name}
- Role: {request.user_role}
- Remaining Leave: {ctx.get('remainingAnnualLeave', 'N/A')}
- Monthly Attendance: {ctx.get('thisMonthAttendance', 'N/A')} days

COMPANY CONTEXT:
{context_str if context_str else "No specific documents found for this query. Use general company knowledge if appropriate, but be cautious."}

INSTRUCTIONS:
1. Use the provided context to answer the user's question.
2. If the answer is not in the context, politely state that you don't have that specific information.
3. Keep the tone professional, helpful, and concise.
4. If the user is asking about their own data (leaves/attendance), use the USER INFORMATION provided above.
5. SECURITY: Never reveal 'admin' category information to a user with a 'employee' role.
"""

        # Step 3: LLM Generation (Groq)
        print(f"Step 3: Generating response using llama-3.3-70b-versatile...")
        completion = groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": request.message},
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.1, # Lower temperature for more factual responses
            max_tokens=1024
        )

        reply = completion.choices[0].message.content
        sources = [{"title": d['title'], "category": d['category']} for d in retrieved_docs]

        print("Step 4: Response generated successfully.")
        return {
            "reply": reply,
            "sources": sources,
            "timestamp": datetime.now().isoformat()
        }

    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/reload-kb")
async def reload():
    global all_documents
    all_documents = process_and_index()
    return {"status": "success", "count": len(all_documents)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
