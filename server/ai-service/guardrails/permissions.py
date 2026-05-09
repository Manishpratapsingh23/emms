"""
WorkWise AI — Permission Checks
Double-validates admin role at the tool level (belt-and-suspenders with route middleware).
"""

from typing import Dict

# Tools that require confirmation before execution (destructive actions)
DESTRUCTIVE_TOOLS = {
    "remove_employee",
    "remove_department",
    "approve_leave",     # when approve_all is True
    "reject_leave",      # when reject_all is True
}

# All AI Agent tools require admin role
ADMIN_ONLY_TOOLS = {
    "approve_leave",
    "reject_leave",
    "generate_payroll",
    "update_payroll",
    "add_employee",
    "update_employee",
    "remove_employee",
    "create_department",
    "remove_department",
    "schedule_meeting",
    "send_announcement",
    "attendance_analytics",
    "generate_report",
}

# Tools available to all authenticated users
ALL_USER_TOOLS = {
    "search_company_policies",
}


def check_permission(user_role: str, tool_name: str) -> Dict:
    """
    Verify the user has permission to execute the given tool.
    
    Returns:
        { "allowed": True/False, "reason": str }
    """
    if tool_name in ALL_USER_TOOLS:
        return {"allowed": True, "reason": ""}
    
    if tool_name in ADMIN_ONLY_TOOLS:
        if user_role == "admin":
            return {"allowed": True, "reason": ""}
        else:
            return {
                "allowed": False,
                "reason": f"Tool '{tool_name}' requires admin privileges. Your role: {user_role}"
            }
    
    return {"allowed": False, "reason": f"Unknown tool: {tool_name}"}


def requires_confirmation(tool_name: str, args: dict = None) -> bool:
    """
    Check if a tool execution requires admin confirmation before proceeding.
    Used for destructive or bulk operations.
    """
    if tool_name == "remove_employee" or tool_name == "remove_department":
        return True
    if tool_name == "approve_leave" and args and args.get("approve_all"):
        return True
    return False
