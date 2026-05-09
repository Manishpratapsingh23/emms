"""
WorkWise AI — Tool Input Validation
Validates parameters before tool execution to prevent bad data from entering the database.
"""

from typing import Dict, Any, List
from datetime import datetime


def validate_tool_input(tool_name: str, args: Dict[str, Any]) -> Dict:
    """
    Validate tool arguments against expected schemas.
    
    Returns:
        { "valid": True/False, "errors": [] }
    """
    validators = {
        "approve_leave": _validate_approve_leave,
        "reject_leave": _validate_reject_leave,
        "generate_payroll": _validate_generate_payroll,
        "add_employee": _validate_add_employee,
        "remove_employee": _validate_remove_employee,
        "create_department": _validate_create_department,
        "schedule_meeting": _validate_schedule_meeting,
        "send_announcement": _validate_send_announcement,
        "attendance_analytics": _validate_attendance_analytics,
        "generate_report": _validate_generate_report,
        "search_company_policies": _validate_search_policies,
        "update_employee": _validate_update_employee,
        "remove_department": _validate_remove_department,
        "get_pending_leaves": _validate_get_pending_leaves,
        "update_payroll": _validate_update_payroll,
    }
    
    validator = validators.get(tool_name)
    if not validator:
        return {"valid": False, "errors": [f"Unknown tool: {tool_name}"]}
    
    return validator(args)


def _validate_approve_leave(args: Dict) -> Dict:
    errors = []
    if args.get("leave_type") and args["leave_type"] not in [
        "sick", "casual", "annual", "maternity", "paternity", "unpaid"
    ]:
        errors.append(f"Invalid leave_type: {args['leave_type']}")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_reject_leave(args: Dict) -> Dict:
    errors = []
    if not args.get("leave_id") and not args.get("employee_name"):
        errors.append("Either leave_id or employee_name is required")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_generate_payroll(args: Dict) -> Dict:
    errors = []
    if not args.get("month"):
        errors.append("month is required")
    elif not isinstance(args["month"], (int, float)) or not (1 <= int(args["month"]) <= 12):
        errors.append("month must be between 1 and 12")
    if not args.get("year"):
        errors.append("year is required")
    elif not isinstance(args["year"], (int, float)) or int(args["year"]) < 2020:
        errors.append("year must be 2020 or later")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_get_pending_leaves(args: Dict) -> Dict:
    return {"valid": True, "errors": []}


def _validate_update_payroll(args: Dict) -> Dict:
    errors = []
    if not args.get("employee_name"):
        errors.append("employee_name is required")
    if not args.get("month"):
        errors.append("month is required")
    if not args.get("year"):
        errors.append("year is required")
    if not args.get("status"):
        errors.append("status is required")
    return {"valid": len(errors) == 0, "errors": errors}

def _validate_add_employee(args: Dict) -> Dict:
    errors = []
    if not args.get("name") or len(str(args["name"]).strip()) < 2:
        errors.append("Employee name is required (min 2 characters)")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_remove_employee(args: Dict) -> Dict:
    errors = []
    if not args.get("employee_id") and not args.get("employee_name"):
        errors.append("Either employee_id or employee_name is required")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_create_department(args: Dict) -> Dict:
    errors = []
    if not args.get("name") or len(str(args["name"]).strip()) < 2:
        errors.append("Department name is required (min 2 characters)")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_remove_department(args: Dict) -> Dict:
    errors = []
    if not args.get("department_name"):
        errors.append("department_name is required")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_update_employee(args: Dict) -> Dict:
    errors = []
    if not args.get("employee_id") and not args.get("employee_name"):
        errors.append("Either employee_id or employee_name is required")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_schedule_meeting(args: Dict) -> Dict:
    errors = []
    if not args.get("title"):
        errors.append("Meeting title is required")
    if not args.get("scheduled_at"):
        errors.append("scheduled_at is required")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_send_announcement(args: Dict) -> Dict:
    errors = []
    if not args.get("title"):
        errors.append("Announcement title is required")
    if not args.get("description"):
        errors.append("Announcement description is required")
    if args.get("priority") and args["priority"] not in ["low", "medium", "high", "urgent"]:
        errors.append(f"Invalid priority: {args['priority']}. Must be low, medium, high, or urgent")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_attendance_analytics(args: Dict) -> Dict:
    errors = []
    if args.get("month") and not (1 <= int(args["month"]) <= 12):
        errors.append("month must be between 1 and 12")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_generate_report(args: Dict) -> Dict:
    errors = []
    valid_types = [
        "employee_summary", "leave_summary", "payroll_summary",
        "attendance_summary", "department_summary"
    ]
    if not args.get("report_type"):
        errors.append("report_type is required")
    elif args["report_type"] not in valid_types:
        errors.append(f"Invalid report_type. Must be one of: {', '.join(valid_types)}")
    return {"valid": len(errors) == 0, "errors": errors}


def _validate_search_policies(args: Dict) -> Dict:
    errors = []
    if not args.get("query"):
        errors.append("Search query is required")
    return {"valid": len(errors) == 0, "errors": errors}
