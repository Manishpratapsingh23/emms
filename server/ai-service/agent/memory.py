"""
WorkWise AI — Conversation Memory Manager
Manages chat history for the AI HR Agent sessions.
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection

# In-memory session storage (per admin, last N messages)
_sessions = {}
MAX_HISTORY = 20  # Keep last 20 messages for context


def get_conversation_history(admin_id: str) -> list:
    """Get the current conversation history for an admin session."""
    return _sessions.get(admin_id, [])


def add_message(admin_id: str, role: str, content: str, tools_used: list = None):
    """Add a message to the in-memory conversation history."""
    if admin_id not in _sessions:
        _sessions[admin_id] = []
    
    _sessions[admin_id].append({
        "role": role,
        "content": content,
        "tools_used": tools_used or [],
        "timestamp": datetime.utcnow().isoformat(),
    })
    
    # Trim to max history
    if len(_sessions[admin_id]) > MAX_HISTORY:
        _sessions[admin_id] = _sessions[admin_id][-MAX_HISTORY:]


def save_to_db(admin_id: str, message: str, response: str, tools_used: list = None):
    """Persist a chat exchange to MongoDB for long-term history."""
    try:
        history_col = get_collection("ai_chat_histories")
        history_col.insert_one({
            "userId": ObjectId(admin_id) if len(admin_id) == 24 else admin_id,
            "role": "admin",
            "message": message,
            "response": response,
            "toolsUsed": tools_used or [],
            "sources": [],
            "timestamp": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[MEMORY ERROR] Failed to save chat history: {e}")


def get_history_from_db(admin_id: str, limit: int = 50) -> list:
    """Retrieve past chat history from MongoDB."""
    try:
        history_col = get_collection("ai_chat_histories")
        records = list(history_col.find(
            {"userId": ObjectId(admin_id) if len(admin_id) == 24 else admin_id},
            {"_id": 0, "message": 1, "response": 1, "toolsUsed": 1, "timestamp": 1}
        ).sort("timestamp", -1).limit(limit))
        records.reverse()  # Chronological order
        return records
    except Exception as e:
        print(f"[MEMORY ERROR] Failed to retrieve history: {e}")
        return []


def clear_history_from_db(admin_id: str):
    """Clear chat history from MongoDB for an admin."""
    try:
        history_col = get_collection("ai_chat_histories")
        history_col.delete_many({"userId": ObjectId(admin_id) if len(admin_id) == 24 else admin_id})
    except Exception as e:
        print(f"[MEMORY ERROR] Failed to clear history: {e}")




def clear_session(admin_id: str):
    """Clear the in-memory session for an admin."""
    if admin_id in _sessions:
        del _sessions[admin_id]
