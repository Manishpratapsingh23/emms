"""
WorkWise AI — HR Agent Orchestrator
The main brain of the AI HR Agent system. Uses Groq's native tool-calling
to understand admin intent, decide which tools to use, execute them, and
generate human-readable summaries.
"""

import json
from datetime import datetime
from groq import Groq
from typing import Optional

from prompts.system_prompt import get_system_prompt
from prompts.security_prompt import SECURITY_PROMPT
from agent.executor import execute_tool
from agent.memory import get_conversation_history, add_message, save_to_db
from guardrails.anti_injection import sanitize_input
from db.connection import get_collection
from knowledge_base_manager import search_semantic

# ============================================================
# TOOL DEFINITIONS — Sent to Groq for function calling
# ============================================================

TOOL_DEFINITIONS = [
    {
        "type": "function",
        "function": {
            "name": "approve_leave",
            "description": "Approve pending leave requests. Can approve all pending leaves, filter by leave type, or approve for a specific employee.",
            "parameters": {
                "type": "object",
                "properties": {
                    "leave_type": {
                        "type": "string",
                        "enum": ["sick", "casual", "annual", "maternity", "paternity", "unpaid"],
                        "description": "Filter by leave type"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "Filter by employee name (partial match supported)"
                    },
                    "approve_all": {
                        "type": "boolean",
                        "description": "Set to true to approve ALL pending leaves matching the filters"
                    },
                    "leave_id": {
                        "type": "string",
                        "description": "Specific leave request ID to approve"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "reject_leave",
            "description": "Reject pending leave requests with a reason.",
            "parameters": {
                "type": "object",
                "properties": {
                    "leave_id": {
                        "type": "string",
                        "description": "Specific leave request ID to reject"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "Reject leaves for a specific employee by name"
                    },
                    "reason": {
                        "type": "string",
                        "description": "Reason for rejection"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_pending_leaves",
            "description": "Retrieve a list of all pending leave requests. Use this when the admin asks about pending leaves or to see if there are any.",
            "parameters": {
                "type": "object",
                "properties": {
                    "leave_type": {
                        "type": "string",
                        "description": "Optional filter by leave type (sick, casual, annual)"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_payroll",
            "description": "Generate monthly payroll records for all active employees. Creates payroll entries with salary calculations.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {
                        "type": "integer",
                        "description": "Month number (1-12). Use the current month if user says 'this month'."
                    },
                    "year": {
                        "type": "integer",
                        "description": "Year (e.g., 2026). Use the current year if not specified."
                    },
                    "bonus": {
                        "type": "number",
                        "description": "Bonus amount to add (default: 0)"
                    },
                    "deductions": {
                        "type": "number",
                        "description": "Deduction amount (default: 0)"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "Optional: Name of a specific employee to generate payroll for. Leave empty to generate for all employees."
                    }
                },
                "required": ["month", "year"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_payroll",
            "description": "Update the status of an existing payroll record (e.g., mark as paid, unpaid, or approved).",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_name": {
                        "type": "string",
                        "description": "Name of the employee (required)"
                    },
                    "month": {
                        "type": "integer",
                        "description": "Month number (1-12) (required)"
                    },
                    "year": {
                        "type": "integer",
                        "description": "Year (e.g., 2026) (required)"
                    },
                    "status": {
                        "type": "string",
                        "enum": ["paid", "unpaid", "approved"],
                        "description": "The new status for the payroll (required)"
                    }
                },
                "required": ["employee_name", "month", "year", "status"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "add_employee",
            "description": "Add a new employee to the system. Creates a user account with temporary credentials.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Full name of the new employee (required)"
                    },
                    "email": {
                        "type": "string",
                        "description": "Email address. Auto-generated from name if not provided."
                    },
                    "department": {
                        "type": "string",
                        "description": "Department name to assign the employee to"
                    },
                    "designation": {
                        "type": "string",
                        "description": "Job title / designation"
                    },
                    "salary": {
                        "type": "number",
                        "description": "Monthly salary amount"
                    },
                    "phone": {
                        "type": "string",
                        "description": "Phone number"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "remove_employee",
            "description": "Deactivate (soft-delete) an employee. This is a DESTRUCTIVE action that requires confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "The employee's database ID"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "The employee's name (used to look them up)"
                    },
                    "confirmed": {
                        "type": "boolean",
                        "description": "Set to true only after admin has confirmed the deactivation"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_employee",
            "description": "Update an existing employee's details such as designation, department, or salary.",
            "parameters": {
                "type": "object",
                "properties": {
                    "employee_id": {
                        "type": "string",
                        "description": "The employee's database ID"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "The employee's name (used to look them up)"
                    },
                    "department": {
                        "type": "string",
                        "description": "New department name"
                    },
                    "designation": {
                        "type": "string",
                        "description": "New designation"
                    },
                    "salary": {
                        "type": "number",
                        "description": "New salary"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_department",
            "description": "Create a new department in the organization.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {
                        "type": "string",
                        "description": "Department name (required)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Department description"
                    }
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "remove_department",
            "description": "Remove or delete an existing department. DESTRUCTIVE ACTION. Requires confirmation.",
            "parameters": {
                "type": "object",
                "properties": {
                    "department_name": {
                        "type": "string",
                        "description": "Name of the department to delete (required)"
                    },
                    "confirmed": {
                        "type": "boolean",
                        "description": "Set to true only after admin has confirmed the deletion"
                    }
                },
                "required": ["department_name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "schedule_meeting",
            "description": "Schedule a new meeting with a specific date, time, and agenda.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Meeting title (required)"
                    },
                    "scheduled_at": {
                        "type": "string",
                        "description": "Date and time for the meeting in ISO format or natural language like '2026-05-10T15:00:00' or 'tomorrow 3pm'"
                    },
                    "duration": {
                        "type": "integer",
                        "description": "Duration in minutes (default: 60)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Meeting agenda / description"
                    }
                },
                "required": ["title", "scheduled_at"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "send_announcement",
            "description": "Create and publish a company-wide announcement.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {
                        "type": "string",
                        "description": "Announcement title (required)"
                    },
                    "description": {
                        "type": "string",
                        "description": "Announcement body content (required)"
                    },
                    "priority": {
                        "type": "string",
                        "enum": ["low", "medium", "high", "urgent"],
                        "description": "Priority level (default: medium)"
                    }
                },
                "required": ["title", "description"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "attendance_analytics",
            "description": "Generate attendance analytics and statistics for employees. Can filter by month, department, or specific employee.",
            "parameters": {
                "type": "object",
                "properties": {
                    "month": {
                        "type": "integer",
                        "description": "Month number (1-12). Defaults to current month."
                    },
                    "year": {
                        "type": "integer",
                        "description": "Year. Defaults to current year."
                    },
                    "department": {
                        "type": "string",
                        "description": "Filter by department name"
                    },
                    "employee_name": {
                        "type": "string",
                        "description": "Filter by specific employee name"
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "generate_report",
            "description": "Generate summary reports across HR domains. Available types: employee_summary, leave_summary, payroll_summary, attendance_summary, department_summary.",
            "parameters": {
                "type": "object",
                "properties": {
                    "report_type": {
                        "type": "string",
                        "enum": ["employee_summary", "leave_summary", "payroll_summary", "attendance_summary", "department_summary"],
                        "description": "Type of report to generate"
                    }
                },
                "required": ["report_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "search_company_policies",
            "description": "Search the company knowledge base for HR policies, procedures, and company rules. Use this when the admin asks about policies, rules, or procedures.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Search query about company policies or procedures"
                    }
                },
                "required": ["query"]
            }
        }
    },
]


def _get_context(admin_id: str) -> dict:
    """Fetch current system context from MongoDB for the system prompt."""
    try:
        users_col = get_collection("users")
        leaves_col = get_collection("leaves")
        depts_col = get_collection("departments")
        
        return {
            "total_employees": users_col.count_documents({"role": "employee", "status": "active"}),
            "total_departments": depts_col.count_documents({}),
            "pending_leaves": leaves_col.count_documents({"status": "pending"}),
        }
    except Exception:
        return {}


def _execute_policy_search(query: str, admin_id: str) -> dict:
    """Execute a RAG policy search using the existing FAISS vector store."""
    try:
        results = search_semantic(query, "admin")
        if not results:
            return {
                "success": True,
                "action": "search_company_policies",
                "message": "No matching policies found in the knowledge base.",
                "results": []
            }
        
        formatted = []
        for doc in results:
            formatted.append({
                "title": doc.get("title", "Unknown"),
                "category": doc.get("category", "General"),
                "content": doc.get("content", "")[:500],  # Limit content length
            })
        
        return {
            "success": True,
            "action": "search_company_policies",
            "message": f"Found {len(formatted)} relevant policy document(s).",
            "results": formatted
        }
    except Exception as e:
        return {
            "success": False,
            "action": "search_company_policies",
            "message": f"Error searching policies: {str(e)}"
        }


def process_agent_request(
    message: str,
    admin_user: dict,
    groq_client: Groq,
    pending_confirmation: dict = None,
) -> dict:
    """
    Main entry point for the AI HR Agent.
    
    This function:
    1. Validates the input for prompt injection
    2. Builds the system prompt with context
    3. Sends to Groq with tool definitions
    4. Handles tool_calls by executing tools
    5. Feeds results back to Groq for final summary
    6. Returns the response with action details
    
    Args:
        message: Admin's natural language message
        admin_user: { id, name, role }
        groq_client: Initialized Groq client
        pending_confirmation: If set, confirms a previous destructive action
    
    Returns:
        { reply, actions[], tools_used[], confirmation_needed? }
    """
    admin_id = admin_user["id"]
    admin_name = admin_user["name"]
    
    # Step 1: Anti-injection check
    safety = sanitize_input(message)
    if not safety["safe"]:
        return {
            "reply": f"⚠️ I cannot process this request. {safety['reason']}",
            "actions": [],
            "tools_used": [],
            "timestamp": datetime.now().isoformat(),
        }
    
    # Step 2: Handle confirmation flow
    if pending_confirmation:
        tool_name = pending_confirmation.get("tool")
        tool_args = pending_confirmation.get("args", {})
        tool_args["confirmed"] = True
        
        result = execute_tool(tool_name, tool_args, admin_user)
        
        add_message(admin_id, "user", message)
        add_message(admin_id, "assistant", result.get("message", "Action completed."), [tool_name])
        save_to_db(admin_id, message, result.get("message", ""), [tool_name])
        
        return {
            "reply": result.get("message", "Action completed."),
            "actions": [result],
            "tools_used": [tool_name],
            "timestamp": datetime.now().isoformat(),
        }
    
    # Step 3: Build context and prompts
    context = _get_context(admin_id)
    system_prompt = get_system_prompt(admin_name, context) + "\n\n" + SECURITY_PROMPT
    
    # Step 4: Build conversation messages
    conversation = [{"role": "system", "content": system_prompt}]
    
    # Add recent conversation history for context
    history = get_conversation_history(admin_id)
    for msg in history[-6:]:  # Last 6 messages for context
        conversation.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    conversation.append({"role": "user", "content": message})
    
    # Step 5: Call Groq with tool definitions
    try:
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=conversation,
            tools=TOOL_DEFINITIONS,
            tool_choice="auto",
            temperature=0.1,
            max_tokens=2048,
        )
    except Exception as e:
        return {
            "reply": f"⚠️ AI service error: {str(e)}",
            "actions": [],
            "tools_used": [],
            "timestamp": datetime.now().isoformat(),
        }
    
    response_message = response.choices[0].message
    tool_calls = response_message.tool_calls
    
    # Step 6: If no tool calls, return the direct response
    if not tool_calls:
        reply = response_message.content or "I'm not sure how to help with that. Try asking about leaves, payroll, employees, departments, meetings, or announcements."
        
        add_message(admin_id, "user", message)
        add_message(admin_id, "assistant", reply)
        save_to_db(admin_id, message, reply)
        
        return {
            "reply": reply,
            "actions": [],
            "tools_used": [],
            "timestamp": datetime.now().isoformat(),
        }
    
    # Step 7: Execute tool calls
    actions = []
    tools_used = []
    confirmation_needed = None
    
    # Add assistant's message with tool calls to conversation
    conversation.append({
        "role": "assistant",
        "content": response_message.content or "",
        "tool_calls": [
            {
                "id": tc.id,
                "type": "function",
                "function": {
                    "name": tc.function.name,
                    "arguments": tc.function.arguments,
                }
            }
            for tc in tool_calls
        ]
    })
    
    for tool_call in tool_calls:
        tool_name = tool_call.function.name
        try:
            tool_args = json.loads(tool_call.function.arguments)
        except json.JSONDecodeError:
            tool_args = {}
        
        tools_used.append(tool_name)
        
        # Special handling for RAG policy search
        if tool_name == "search_company_policies":
            result = _execute_policy_search(tool_args.get("query", message), admin_id)
        else:
            result = execute_tool(tool_name, tool_args, admin_user)
        
        actions.append(result)
        
        # Check if confirmation is needed
        if result.get("confirmation_needed"):
            confirmation_needed = {
                "tool": tool_name,
                "args": tool_args,
                "message": result.get("message", ""),
                "employee": result.get("employee"),
            }
        
        # Add tool result to conversation for the LLM's final summary
        conversation.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": json.dumps(result, default=str),
        })
    
    # Step 8: If confirmation is needed, return early
    if confirmation_needed:
        add_message(admin_id, "user", message)
        add_message(admin_id, "assistant", confirmation_needed["message"], tools_used)
        save_to_db(admin_id, message, confirmation_needed["message"], tools_used)
        
        return {
            "reply": confirmation_needed["message"],
            "actions": actions,
            "tools_used": tools_used,
            "confirmation_needed": confirmation_needed,
            "timestamp": datetime.now().isoformat(),
        }
    
    # Step 9: Get final summary from LLM
    try:
        final_response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=conversation,
            temperature=0.2,
            max_tokens=1024,
        )
        final_reply = final_response.choices[0].message.content or "Action completed successfully."
    except Exception:
        # Fallback: use the tool results directly
        final_reply = "\n".join([a.get("message", "") for a in actions])
    
    # Step 10: Save to memory
    add_message(admin_id, "user", message)
    add_message(admin_id, "assistant", final_reply, tools_used)
    save_to_db(admin_id, message, final_reply, tools_used)
    
    return {
        "reply": final_reply,
        "actions": actions,
        "tools_used": tools_used,
        "timestamp": datetime.now().isoformat(),
    }
