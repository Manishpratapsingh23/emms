"""
WorkWise AI - Advanced RAG Agent Service + AI HR Agent (Python/FastAPI)
Using FAISS Vector Store, Sentence-Transformers for Semantic Search,
and Groq native tool-calling for HR automation.
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
app = FastAPI(title="WorkWise AI Semantic Agent + HR Agent")

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
    """Build the semantic index and initialize MongoDB connection on startup."""
    global all_documents
    print("\nInitializing Semantic RAG System...")
    all_documents = process_and_index()
    print(f"System Ready. Index size: {len(all_documents)} chunks.")
    
    # Initialize MongoDB connection for AI Agent
    try:
        from db.connection import get_db
        db = get_db()
        print(f"[OK] MongoDB connected for AI Agent: {db.name}")
    except Exception as e:
        print(f"[WARNING] MongoDB connection for AI Agent failed: {e}")
        print("   AI HR Agent features will not be available until MongoDB is connected.")
    
    print("\n* WorkWise AI Service Ready - RAG + HR Agent\n")


# ============================================================
# EXISTING RAG CHATBOT ENDPOINT (Unchanged)
# ============================================================

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
            temperature=0.1,  # Lower temperature for more factual responses
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


# ============================================================
# AI HR AGENT ENDPOINTS (Admin Only)
# ============================================================

class AgentRequest(BaseModel):
    message: str
    admin_id: str
    admin_name: str
    admin_role: str
    pending_confirmation: Optional[Dict] = None


class ConfirmRequest(BaseModel):
    admin_id: str
    admin_name: str
    admin_role: str
    tool: str
    args: Dict


@app.post("/agent")
async def agent_endpoint(request: AgentRequest):
    """
    AI HR Agent endpoint — processes admin commands using Groq tool-calling.
    Authentication is handled by the Express middleware (JWT + requireAdmin).
    This endpoint receives pre-validated admin info.
    """
    try:
        # Double-check admin role (belt-and-suspenders)
        if request.admin_role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required for AI HR Agent.")
        
        print(f"\n=== AI HR Agent Request from {request.admin_name} ===")
        print(f"Message: {request.message}")
        
        from agent.hr_agent import process_agent_request
        
        admin_user = {
            "id": request.admin_id,
            "name": request.admin_name,
            "role": request.admin_role,
        }
        
        result = process_agent_request(
            message=request.message,
            admin_user=admin_user,
            groq_client=groq_client,
            pending_confirmation=request.pending_confirmation,
        )
        
        print(f"Agent Response: {result.get('reply', '')[:100]}...")
        print(f"Tools Used: {result.get('tools_used', [])}")
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Agent error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/agent/confirm")
async def agent_confirm(request: ConfirmRequest):
    """Confirm a destructive action that was previously flagged."""
    try:
        if request.admin_role != "admin":
            raise HTTPException(status_code=403, detail="Admin access required.")
        
        from agent.hr_agent import process_agent_request
        
        admin_user = {
            "id": request.admin_id,
            "name": request.admin_name,
            "role": request.admin_role,
        }
        
        confirmation = {
            "tool": request.tool,
            "args": request.args,
        }
        
        result = process_agent_request(
            message=f"Confirmed: execute {request.tool}",
            admin_user=admin_user,
            groq_client=groq_client,
            pending_confirmation=confirmation,
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Confirm error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agent/history")
async def agent_history(admin_id: str, limit: int = 50):
    """Get AI Agent chat history for an admin."""
    try:
        from agent.memory import get_history_from_db
        history = get_history_from_db(admin_id, limit)
        return {"history": history}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/agent/history")
async def clear_agent_history(admin_id: str):
    """Clear AI Agent chat history for an admin."""
    try:
        from agent.memory import clear_history_from_db, clear_session
        clear_history_from_db(admin_id)
        clear_session(admin_id)
        return {"success": True, "message": "History cleared"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/agent/audit")
async def agent_audit(limit: int = 50):
    """Get AI Agent audit logs."""
    try:
        from db.connection import get_collection
        audit_col = get_collection("ai_audit_logs")
        logs = list(audit_col.find(
            {},
            {"_id": 0, "adminId": 1, "action": 1, "toolUsed": 1, "status": 1, 
             "resultMessage": 1, "input": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(limit))
        
        # Convert ObjectId to string for JSON serialization
        for log in logs:
            if "adminId" in log and hasattr(log["adminId"], "__str__"):
                log["adminId"] = str(log["adminId"])
            if "timestamp" in log and isinstance(log["timestamp"], datetime):
                log["timestamp"] = log["timestamp"].isoformat()
        
        return {"logs": logs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "service": "WorkWise AI Service",
        "features": ["RAG Chatbot", "AI HR Agent"],
        "timestamp": datetime.now().isoformat(),
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
