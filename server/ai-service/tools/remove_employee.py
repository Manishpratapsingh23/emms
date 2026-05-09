"""
WorkWise AI — Remove Employee Tool
Deactivates (soft-deletes) an employee. Requires confirmation for safety.
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def remove_employee(
    admin_id: str,
    employee_id: str = None,
    employee_name: str = None,
    confirmed: bool = False,
) -> dict:
    """
    Remove (deactivate) an employee from the system.
    This is a DESTRUCTIVE action — requires confirmation.
    
    Args:
        admin_id: The admin user's ObjectId string
        employee_id: Specific employee ObjectId
        employee_name: Employee name to search for
        confirmed: Whether the admin has confirmed this action
    
    Returns:
        Structured result — either confirmation request or execution result
    """
    users_col = get_collection("users")
    
    try:
        # Find the employee
        employee = None
        
        if employee_id:
            try:
                employee = users_col.find_one({
                    "_id": ObjectId(employee_id),
                    "role": "employee"
                })
            except Exception:
                return {"success": False, "action": "remove_employee", "message": f"Invalid employee ID: {employee_id}"}
        elif employee_name:
            employees = list(users_col.find({
                "name": {"$regex": employee_name, "$options": "i"},
                "role": "employee",
                "status": "active"
            }))
            if len(employees) == 0:
                return {
                    "success": False,
                    "action": "remove_employee",
                    "message": f"No active employee found matching '{employee_name}'"
                }
            if len(employees) > 1:
                names = [e["name"] for e in employees]
                return {
                    "success": False,
                    "action": "remove_employee",
                    "message": f"Multiple employees found matching '{employee_name}': {', '.join(names)}. Please be more specific."
                }
            employee = employees[0]
        else:
            return {"success": False, "action": "remove_employee", "message": "Employee ID or name is required."}
        
        if not employee:
            return {"success": False, "action": "remove_employee", "message": "Employee not found."}
        
        if employee.get("status") == "inactive":
            return {
                "success": False,
                "action": "remove_employee",
                "message": f"Employee '{employee['name']}' is already inactive."
            }
        
        # If not confirmed, return confirmation request
        if not confirmed:
            return {
                "success": True,
                "action": "remove_employee",
                "confirmation_needed": True,
                "message": f"⚠️ Are you sure you want to deactivate employee **{employee['name']}** ({employee['email']})? This will set their status to inactive.",
                "employee": {
                    "id": str(employee["_id"]),
                    "name": employee["name"],
                    "email": employee["email"],
                }
            }
        
        # Execute the deactivation
        users_col.update_one(
            {"_id": employee["_id"]},
            {"$set": {"status": "inactive", "updatedAt": datetime.utcnow()}}
        )
        
        return {
            "success": True,
            "action": "remove_employee",
            "message": f"Employee '{employee['name']}' has been deactivated successfully.",
            "employee": {
                "id": str(employee["_id"]),
                "name": employee["name"],
                "email": employee["email"],
                "new_status": "inactive"
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "remove_employee", "message": f"Error removing employee: {str(e)}"}
