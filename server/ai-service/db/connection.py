"""
WorkWise AI — MongoDB Connection Manager
Provides direct pymongo access to the same database used by the Express backend.
"""

import os
from pymongo import MongoClient
from dotenv import load_dotenv

# Load env from the server root
env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
load_dotenv(env_path)

MONGODB_URI = os.getenv("MONGODB_URI")
if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI not found in .env")

# Singleton client
_client = None
_db = None


def get_client():
    """Get or create the MongoDB client (singleton)."""
    global _client
    if _client is None:
        _client = MongoClient(MONGODB_URI)
    return _client


def get_db():
    """Get the default database from the connection string."""
    global _db
    if _db is None:
        client = get_client()
        # Extract DB name from URI — pymongo uses the path after the last '/'
        _db = client.get_default_database()
    return _db


def get_collection(name: str):
    """Shortcut to get a collection by name."""
    return get_db()[name]


def close_connection():
    """Close the MongoDB connection."""
    global _client, _db
    if _client:
        _client.close()
        _client = None
        _db = None
