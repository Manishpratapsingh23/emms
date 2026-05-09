"""
WorkWise AI — Tool Executor
Dispatches tool calls from the LLM to the appropriate Python functions.
Creates audit logs for every execution.
"""

import json
from datetime import datetime
from bson import ObjectId
from db.connection import get_collection
from guardrails.permissions import check_permission
from guardrails.validation import validate_tool_input

# Import all tools
from tools.approve_leave import approve_leave
from tools.reject_leave import reject_leave
from tools.generate_payroll import generate_payroll
from tools.add_employee import add_employee
from tools.remove_employee import remove_employee
from tools.create_department import create_department
from tools.schedule_meeting import schedule_meeting
from tools.send_announcement import send_announcement
from tools.attendance_analytics import attendance_analytics
from tools.generate_report import generate_report
from tools.update_employee import update_employee
from tools.remove_department import remove_department
from tools.get_pending_leaves import get_pending_leaves
from tools.update_payroll import update_payroll

# Tool registry — maps tool names to functions
TOOL_REGISTRY = {
    "approve_leave": approve_leave,
    "reject_leave": reject_leave,
    "generate_payroll": generate_payroll,
    "add_employee": add_employee,
    "remove_employee": remove_employee,
    "create_department": create_department,
    "schedule_meeting": schedule_meeting,
    "send_announcement": send_announcement,
    "attendance_analytics": attendance_analytics,
    "generate_report": generate_report,
    "update_employee": update_employee,
    "remove_department": remove_department,
    "get_pending_leaves": get_pending_leaves,
    "update_payroll": update_payroll,
}


def execute_tool(tool_name: str, args: dict, admin_user: dict) -> dict:
    """
    Execute an AI tool with full validation, permission checks, and audit logging.
    
    Args:
        tool_name: Name of the tool to execute
        args: Arguments for the tool (from LLM's function call)
        admin_user: Admin user info { id, name, role }
    
    Returns:
        Structured result from the tool execution
    """
    admin_id = admin_user.get("id", "")
    admin_role = admin_user.get("role", "")
    
    # Step 1: Permission check
    perm = check_permission(admin_role, tool_name)
    if not perm["allowed"]:
        _create_audit_log(admin_id, tool_name, args, "denied", perm["reason"])
        return {
            "success": False,
            "action": tool_name,
            "message": f"Permission denied: {perm['reason']}"
        }
    
    # Step 2: Input validation
    validation = validate_tool_input(tool_name, args)
    if not validation["valid"]:
        _create_audit_log(admin_id, tool_name, args, "validation_failed", str(validation["errors"]))
        return {
            "success": False,
            "action": tool_name,
            "message": f"Validation failed: {', '.join(validation['errors'])}"
        }
    
    # Step 3: Get and execute the tool
    tool_fn = TOOL_REGISTRY.get(tool_name)
    if not tool_fn:
        return {
            "success": False,
            "action": tool_name,
            "message": f"Tool '{tool_name}' not found in registry."
        }
    
    try:
        # All tools receive admin_id as first argument
        result = tool_fn(admin_id=admin_id, **args)
        
        # Step 4: Create audit log
        status = "success" if result.get("success") else "failed"
        if result.get("confirmation_needed"):
            status = "pending_confirmation"
        
        _create_audit_log(
            admin_id=admin_id,
            tool_name=tool_name,
            args=args,
            status=status,
            message=result.get("message", "")
        )
        
        return result
        
    except Exception as e:
        _create_audit_log(admin_id, tool_name, args, "error", str(e))
        return {
            "success": False,
            "action": tool_name,
            "message": f"Tool execution error: {str(e)}"
        }


def _create_audit_log(admin_id: str, tool_name: str, args: dict, status: str, message: str = ""):
    """Create an audit log entry in MongoDB."""
    try:
        audit_col = get_collection("ai_audit_logs")
        
        # Sanitize args for storage (remove sensitive data)
        safe_args = {k: v for k, v in args.items() if k not in ["password", "token"]}
        
        audit_col.insert_one({
            "adminId": ObjectId(admin_id) if admin_id and len(admin_id) == 24 else admin_id,
            "action": tool_name,
            "toolUsed": tool_name,
            "input": safe_args,
            "status": status,
            "resultMessage": message,
            "timestamp": datetime.utcnow(),
            "createdAt": datetime.utcnow(),
        })
    except Exception as e:
        print(f"[AUDIT LOG ERROR] Failed to create audit log: {e}")
