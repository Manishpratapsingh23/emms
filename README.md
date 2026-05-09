# WorkWise Employee Management System (EMS)

[WorkWise AI](https://emms-psi.vercel.app/login) <!-- You can add a real screenshot image link here later -->
<img width="960" height="461" alt="em1" src="https://github.com/user-attachments/assets/61a70c4a-40f7-4104-8165-c7de0f9e189b" />
<img width="321" height="387" alt="em2" src="https://github.com/user-attachments/assets/2237c483-6245-4f94-a3b7-3a2f49c46ff0" />
<img width="960" height="467" alt="em3" src="https://github.com/user-attachments/assets/443cb7a1-c4d6-45aa-9863-4d750ae1cd23" />
<img width="960" height="459" alt="em4" src="https://github.com/user-attachments/assets/20b0304c-e15e-433a-8f0a-c78d3946601d" />




WorkWise is a modern, full-stack, enterprise-grade Employee Management System integrated with a Retrieval-Augmented Generation (RAG) AI assistant. It provides a robust platform for managing human resource operations, including attendance tracking, leave management, and payroll processing, while empowering employees with an intelligent conversational AI to access company policies and knowledge instantly.

**Live Demo:** [https://emms-psi.vercel.app/login](https://emms-psi.vercel.app/login)

** admin creds : admin@emms.com || admin123             employee creds : john@emms.com || password123**


## Key Features

* **Role-Based Access Control:** Secure authentication and authorization for Admin and Employee roles.
* **Intelligent AI Assistant:** Integrated Python-based AI agent utilizing RAG and FAISS to provide accurate, context-aware answers regarding company policies (leaves, attendance, payroll) using Groq LLM.
* **Attendance Tracking:** Seamless check-in/check-out functionality with status tracking.
* **Leave Management:** Employees can request time off, and admins can approve or reject them.
* **Payroll Processing:** Generate, view, and download detailed salary slips.
* **Department & Employee Views:** Comprehensive admin dashboard to oversee all departments and filter employees.
* **Modern UI/UX:** Built with React, Tailwind CSS, and dynamic micro-animations for a premium user experience.

## Technology Stack

**Frontend (Client)**
* React.js (Vite)
* Tailwind CSS
* React Router DOM
* Axios
* React Hot Toast (Notifications)
* React Icons

**Core Backend (Server)**
* Node.js
* Express.js
* MongoDB & Mongoose
* JSON Web Tokens (JWT) & bcrypt (Authentication)
* PDFKit (Salary slip generation)

**AI Service**
* Python 3
* FastAPI
* LangChain & FAISS (Vector Database)
* Hugging Face Transformers
* Groq API (LLM Integration)

##  Project Structure

```
emms/
├── client/                 # React Frontend Application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # React Context (Auth)
│   │   ├── layouts/        # Dashboard layouts
│   │   ├── pages/          # Application pages (Login, Dashboard, etc.)
│   │   └── services/       # API call handlers
├── server/                 # Node.js Core Backend Application
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── models/         # MongoDB schema definitions
│   │   ├── routes/         # Express API routes
│   │   └── middleware/     # Auth and error handling middlewares
│   ├── ai-service/         # Python AI Agent (FastAPI + RAG)
│   └── knowledge_base/     # Document storage for RAG pipeline
└── README.md
```

## Local Development Setup

To run this project locally, you will need Node.js, Python, and a MongoDB instance.

### 1. Clone the repository
```bash
git clone https://github.com/your-username/workwise-ems.git
cd workwise-ems
```

### 2. Setup the Core Server (Node.js)
```bash
cd server
npm install

# Create a .env file based on environment variables needed
# PORT=5000
# MONGODB_URI=your_mongodb_connection_string
# JWT_SECRET=your_jwt_secret
# AI_SERVICE_URL=http://localhost:8000

npm run dev
```

### 3. Setup the AI Service (Python)
```bash
cd server/ai-service
python -m venv venv

# Activate virtual environment
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt

# Run the FastAPI server
uvicorn main:app --reload --port 8000
```

### 4. Setup the Client (React)
```bash
cd client
npm install

# Create a .env file
# VITE_API_URL=http://localhost:5000/api
# VITE_AI_URL=http://localhost:8000

npm run dev
```

## Environment Variables

You'll need the following environment variables to fully run the application.

**Client (`client/.env`)**
* `VITE_API_URL`: Your Node.js backend URL
* `VITE_AI_URL`: Your Python FastAPI URL

**Server (`server/.env`)**
* `PORT`: Node server port (default 5000)
* `MONGODB_URI`: MongoDB connection string
* `JWT_SECRET`: Secret key for token generation
* `AI_SERVICE_URL`: URL of the Python AI service

**AI Service (`server/ai-service/.env`)**
* `GROQ_API_KEY`: API key for Groq LLM

** Future Implementation – AI HR Automation Agent

 * WorkWise EMS is designed with scalability in mind and will evolve beyond a traditional Employee Management System into a fully AI-powered HR automation platform.

 * Planned Feature: AI HR Agent (Admin Only)

A future implementation of WorkWise will introduce an advanced AI HR Agent capable of automating administrative and HR workflows using AI Agents, Retrieval-Augmented Generation (RAG), and secure tool/function calling architectures.

Unlike the current AI assistant that primarily answers employee queries using company policies and internal knowledge, the AI HR Agent will be able to intelligently perform administrative actions inside the EMS platform.

Planned Capabilities

The AI HR Agent will support natural language administrative commands such as:

“Generate payroll for this month”
“Approve all pending leave requests”
“Add a new employee to Engineering department”
“Create a new department”
“Schedule HR meeting tomorrow at 3 PM”
“Send announcement to all employees”
“Generate attendance analytics report”
Key Architecture Goals

The AI HR Agent will include:

AI Tool/Function Calling
Role-Based Agent Permissions
Workflow Automation
RAG-based Policy Understanding
Secure Action Execution
Audit Logging & Activity Tracking
Prompt Injection Protection
Admin-only AI Controls
Security Design

The AI HR Agent will strictly follow enterprise-grade security practices:

Only Admin users will have access to automation features
Employees will only access the standard AI assistant
Every AI action will require backend validation
Sensitive operations will include confirmation workflows
AI tools will never directly expose database access or secrets
Planned Technology Stack

The future AI HR Agent will utilize:

LangChain Agents
Groq LLM APIs
FAISS Vector Database
FastAPI AI Microservice
JWT-based RBAC
MongoDB Audit Logs
Secure Tool Execution Layer
Long-Term Vision

The long-term vision for WorkWise EMS is to become:

“An enterprise-grade AI-powered workforce management platform combining modern HR operations, secure AI assistants, RAG-based enterprise knowledge retrieval, and intelligent workflow automation.”

This future implementation aims to simulate real-world enterprise AI systems used in modern organizations and demonstrates advanced AI engineering concepts including:

AI Agents
RAG Pipelines
Enterprise AI Security
Workflow Automation
Intelligent HR Operations
Multi-Service Architecture

## License

This project is licensed under the MIT License.