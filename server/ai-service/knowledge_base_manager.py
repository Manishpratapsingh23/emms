"""
WorkWise AI - Semantic Knowledge Base Manager
Handles loading, processing, and semantic searching of company documents using FAISS and Sentence-Transformers.
"""

import os
import json
import re
import numpy as np
from typing import List, Dict, Optional
from PyPDF2 import PdfReader
from sklearn.metrics.pairwise import cosine_similarity

# Semantic Search Dependencies
MODEL_DIR = os.path.join(os.path.dirname(__file__), "model_cache", "all-MiniLM-L6-v2")

# Initialize Embedding Model
model = None
if SEMANTIC_SEARCH_ENABLED:
    try:
        # Check if local model exists, otherwise load from cloud
        if os.path.exists(MODEL_DIR):
            print(f"Loading local embedding model from {MODEL_DIR}...")
            model = SentenceTransformer(MODEL_DIR)
        else:
            print("Local model not found. Loading from cloud (all-MiniLM-L6-v2)...")
            model = SentenceTransformer('all-MiniLM-L6-v2')
            
        print("[OK] Embedding model ready.")
    except Exception as e:
        print(f"Error loading embedding model: {e}")
        SEMANTIC_SEARCH_ENABLED = False
try:
    import faiss
    from sentence_transformers import SentenceTransformer
    SEMANTIC_SEARCH_ENABLED = True
except ImportError:
    SEMANTIC_SEARCH_ENABLED = False
    print("WARNING: FAISS or Sentence-Transformers not found. Falling back to keyword search.")

# Path setup
KB_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "knowledge_base")
CACHE_FILE = os.path.join(KB_DIR, ".cache.json")
INDEX_FILE = os.path.join(KB_DIR, ".faiss_index")

# Initialize Embedding Model
model = None
if SEMANTIC_SEARCH_ENABLED:
    try:
        print("Loading embedding model (all-MiniLM-L6-v2)...")
        model = SentenceTransformer('all-MiniLM-L6-v2')
        print("[OK] Embedding model loaded.")
    except Exception as e:
        print(f"Error loading embedding model: {e}")
        SEMANTIC_SEARCH_ENABLED = False

# ==================== BUILT-IN KNOWLEDGE BASE ====================
BUILT_IN_POLICIES = [
    {
        "id": "leave-001",
        "title": "Annual Leave Policy",
        "category": "Leave Policies",
        "access_level": "all",
        "content": "Annual Leave Policy - WorkWise AI. Entitlement: 24 days per year. Accrual: 2 days per month. Carry forward: Max 5 days. Apply 3 days in advance via system."
    },
    {
        "id": "leave-002",
        "title": "Sick Leave Policy",
        "category": "Leave Policies",
        "access_level": "all",
        "content": "Sick Leave Policy - WorkWise AI. Entitlement: 12 days per year. No carry forward. Medical certificate required for 3+ consecutive days. Notify manager before 9 AM."
    }
]

# ==================== SEMANTIC CHUNKING LOGIC ====================

def get_semantic_chunks(text: str, model, threshold: float = 0.6) -> List[str]:
    """
    Groups sentences based on their embedding similarity.
    Threshold: lower means larger, broader chunks; higher means smaller, more specific chunks.
    """
    # 1. Clean and split into sentences
    text = text.replace('\n', ' ').strip()
    sentences = re.split(r'(?<=[.!?]) +', text)
    if len(sentences) < 2:
        return [text]

    # 2. Get embeddings for all sentences
    embeddings = model.encode(sentences)

    chunks = []
    current_chunk = [sentences[0]]

    # 3. Iterate through sentences and check semantic 'breaks'
    for i in range(len(sentences) - 1):
        # Calculate similarity between current sentence and the next
        sim = cosine_similarity([embeddings[i]], [embeddings[i+1]])[0][0]
        
        if sim < threshold:
            # If similarity is low, start a new chunk
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentences[i+1]]
        else:
            # If similar, group them together
            current_chunk.append(sentences[i+1])

    if current_chunk:
        chunks.append(" ".join(current_chunk))
    
    return chunks

def categorize_document(filename: str) -> str:
    lower = filename.lower()
    if "leave" in lower: return "Leave Policies"
    if "hr" in lower: return "HR Rules"
    if "payroll" in lower: return "Payroll Rules"
    return "Company Policies"

def determine_access_level(filename: str, content: str) -> str:
    if "admin" in filename.lower() or "internal" in filename.lower(): 
        return "admin"
    return "all"

# ==================== VECTOR STORE MANAGEMENT ====================
faiss_index = None
doc_map = []

def save_index(documents: List[Dict]):
    global faiss_index
    if not SEMANTIC_SEARCH_ENABLED or faiss_index is None: return
    try:
        if not os.path.exists(KB_DIR): os.makedirs(KB_DIR)
        faiss.write_index(faiss_index, INDEX_FILE)
        with open(CACHE_FILE, 'w', encoding='utf-8') as f:
            json.dump(documents, f, indent=2)
        print(f"[OK] Saved index to {INDEX_FILE}")
    except Exception as e:
        print(f"Error saving index: {e}")

def load_index() -> Optional[List[Dict]]:
    global faiss_index, doc_map
    if not SEMANTIC_SEARCH_ENABLED: return None
    if os.path.exists(INDEX_FILE) and os.path.exists(CACHE_FILE):
        try:
            faiss_index = faiss.read_index(INDEX_FILE)
            with open(CACHE_FILE, 'r', encoding='utf-8') as f:
                doc_map = json.load(f)
            return doc_map
        except Exception as e:
            print(f"Error loading index: {e}")
    return None

def build_vector_index(documents: List[Dict]):
    global faiss_index, doc_map
    if not SEMANTIC_SEARCH_ENABLED or not documents: return

    print(f"Building semantic index for {len(documents)} chunks...")
    texts = [f"{doc.get('title')}: {doc.get('content')}" for doc in documents]
    embeddings = model.encode(texts, convert_to_tensor=False)
    embeddings = np.array(embeddings).astype('float32')

    dimension = embeddings.shape[1]
    faiss_index = faiss.IndexFlatL2(dimension)
    faiss_index.add(embeddings)
    doc_map = documents
    save_index(documents)

def process_and_index(force_rebuild: bool = False):
    global doc_map
    if not force_rebuild:
        cached_docs = load_index()
        if cached_docs: return cached_docs

    documents = list(BUILT_IN_POLICIES)
    
    if os.path.exists(KB_DIR):
        pdf_files = [f for f in os.listdir(KB_DIR) if f.lower().endswith(".pdf")]
        for pdf_file in pdf_files:
            file_path = os.path.join(KB_DIR, pdf_file)
            try:
                reader = PdfReader(file_path)
                full_text = "".join([page.extract_text() for page in reader.pages if page.extract_text()])
                
                if full_text.strip():
                    # CALL SEMANTIC CHUNKING HERE
                    chunks = get_semantic_chunks(full_text, model)
                    
                    category = categorize_document(pdf_file)
                    access = determine_access_level(pdf_file, full_text)
                    for i, chunk in enumerate(chunks):
                        documents.append({
                            "id": f"pdf-{pdf_file}-{i}",
                            "title": f"{pdf_file} (Sec {i+1})",
                            "category": category,
                            "access_level": access,
                            "content": chunk,
                            "source": pdf_file
                        })
            except Exception as e:
                print(f"Error processing {pdf_file}: {e}")

    build_vector_index(documents)
    return documents

def search_semantic(query: str, user_role: str, top_k: int = 5) -> List[Dict]:
    global faiss_index, doc_map
    if not SEMANTIC_SEARCH_ENABLED or faiss_index is None: return []

    accessible_indices = [
        i for i, doc in enumerate(doc_map) 
        if doc['access_level'] == 'all' or (doc['access_level'] == 'admin' and user_role == 'admin')
    ]
    
    if not accessible_indices: return []

    query_vector = model.encode([query]).astype('float32')
    distances, indices = faiss_index.search(query_vector, len(doc_map))
    
    results = []
    for i, idx in enumerate(indices[0]):
        if idx in accessible_indices:
            doc = doc_map[idx].copy() # Use copy to avoid mutating cache
            doc['score'] = float(1.0 / (1.0 + distances[0][i]))
            results.append(doc)
            if len(results) >= top_k: break
                
    return results