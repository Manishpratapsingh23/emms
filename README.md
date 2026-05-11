# WorkWise Employee Management System (EMS)

[WorkWise AI](https://emms-psi.vercel.app/login) <!-- You can add a real screenshot image link here later -->
<img width="960" height="427" alt="em2" src="https://github.com/user-attachments/assets/57c74620-79ff-4d4e-ba5b-195fb3e76b6e" />
<img width="253" height="338" alt="em3" src="https://github.com/user-attachments/assets/f6723456-2abd-4c64-8030-dd4fb7318277" />
<img width="959" height="427" alt="em4" src="https://github.com/user-attachments/assets/a7a917a9-7ebb-4a30-813b-cf05786edb84" />
<img width="959" height="429" alt="em5" src="https://github.com/user-attachments/assets/ad19e64c-bd9e-43c8-a4bd-aea75c2a892e" />
<img width="960" height="425" alt="em6" src="https://github.com/user-attachments/assets/1cc8045b-e5b7-49d4-aa5e-e185b6d07cf8" />

<img width="960" height="467" alt="em3" src="https://github.com/user-attachments/assets/443cb7a1-c4d6-45aa-9863-4d750ae1cd23" />



WorkWise AI is an enterprise-grade Employee Management System (EMS) that seamlessly integrates traditional HR operations with advanced Artificial Intelligence. Built for scalability and security, it empowers administrators with an autonomous **AI HR Agent** and provides employees with a **RAG-powered Knowledge Base**.

**Live Demo:** [https://emms-psi.vercel.app/login](https://emms-psi.vercel.app/login)

** admin creds : admin@emms.com || admin123             employee creds : john@emms.com || password123**


##  Key Features

### 🤖 Intelligent AI Ecosystem
*   **AI HR Agent (Admin Only):** An autonomous agent using Groq's tool-calling to perform real database actions (approving leaves, generating payroll, updating employee records) via natural language.
*   **RAG Chatbot (All Users):** A Retrieval-Augmented Generation assistant that provides instant, accurate answers about company policies by scanning PDF documents in the knowledge base.
*   **Semantic Search:** Powered by FAISS and Sentence-Transformers for lightning-fast, context-aware information retrieval.

###  Core HR Operations
*   **Role-Based Access Control (RBAC):** Secure authentication with distinct Admin and Employee dashboards.
*   **Leave Management:** Full workflow for applying, tracking, and approving/rejecting time-off requests.
*   **Attendance Tracking:** Real-time check-in/out system with monthly analytics.
*   **Payroll System:** Automated payroll generation, status tracking (paid/unpaid), and PDF salary slip downloads.
*   **Departmental Management:** Organize employees into departments with dedicated oversight tools.

---

##  Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React (Vite), Tailwind CSS, Lucide Icons, React Hot Toast |
| **Backend** | Node.js, Express.js, JWT, Bcrypt, PDFKit |
| **Database** | MongoDB (Mongoose), FAISS (Vector Store) |
| **AI Service** | Python (FastAPI), Groq (Llama 3.3 70B), Sentence-Transformers |
| **Deployment** | Vercel (Frontend), Render (Backend), Hugging Face (AI Service) |

---

##  AI Architecture & Pipeline

### 1. AI HR Agent (Tool-Calling)
The HR Agent doesn't just chat—it executes. When an admin gives a command, the system:
1.  Extracts intent and parameters using **Groq Tool-Calling**.
2.  Triggers specialized Python scripts to interact with **MongoDB**.
3.  Validates all inputs through a strict **Guardrail System** before execution.

### 2. RAG Pipeline (Semantic Knowledge Base)
*   **Ingestion:** PDFs are parsed and broken into semantic chunks.
*   **Embeddings:** Chunks are vectorized using the `all-MiniLM-L6-v2` model.
*   **Retrieval:** User queries are vectorized and compared against the FAISS index.
*   **Augmentation:** The most relevant policy text is injected into the LLM prompt to prevent hallucinations.

---

##  Project Structure

```text
emms/
├── client/                 # React Frontend (Vite + Tailwind)
├── server/                 # Node.js Core Backend
│   ├── src/                # Express controllers, models, and routes
│   └── ai-service/         # Python AI Service (FastAPI)
│       ├── agent/          # HR Agent logic & tool executor
│       ├── tools/          # Python tools for database interaction
│       ├── knowledge_base/ # PDF documents for RAG
│       └── main.py         # AI Service entry point
└── PROJECT_ARCHITECTURE.md # Detailed technical documentation
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB Atlas Account
- Groq API Key

### 1. Backend Setup (Node.js)
```bash
cd server
npm install
# Create .env with MONGODB_URI, JWT_SECRET, and AI_SERVICE_URL
npm run dev
```

### 2. AI Service Setup (Python)
```bash
cd server/ai-service
pip install -r requirements.txt
# Create .env with GROQ_API_KEY and MONGODB_URI
python main.py
```

### 3. Frontend Setup (React)
```bash
cd client
npm install
# Create .env with VITE_API_URL
npm run dev
```

---

##  Security & Compliance
- **JWT Stateless Auth:** Secure token-based communication.
- **Role Validation:** Middleware-level protection for sensitive admin routes.
- **Audit Logging:** Every action performed by the AI HR Agent is logged for accountability.
- **Input Sanitization:** Guardrails against prompt injection and malformed tool arguments.

---
