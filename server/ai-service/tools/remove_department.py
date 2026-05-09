"""
WorkWise AI — Remove Department Tool
Deletes a department. Requires confirmation.
"""

from bson import ObjectId
from db.connection import get_collection


def remove_department(
    admin_id: str,
    department_name: str = None,
    confirmed: bool = False,
) -> dict:
    """
    Remove (delete) a department from the system.
    This is a DESTRUCTIVE action — requires confirmation.
    
    Args:
        admin_id: The admin user's ObjectId string
        department_name: Name of the department to delete
        confirmed: Whether the admin has confirmed this action
    
    Returns:
        Structured result with success status
    """
    depts_col = get_collection("departments")
    users_col = get_collection("users")
    
    try:
        if not department_name:
            return {"success": False, "action": "remove_department", "message": "Department name is required."}
            
        dept = depts_col.find_one({"name": {"$regex": department_name, "$options": "i"}})
        
        if not dept:
            return {"success": False, "action": "remove_department", "message": f"Department '{department_name}' not found."}
            
        if not confirmed:
            return {
                "success": True,
                "action": "remove_department",
                "confirmation_needed": {
                    "tool": "remove_department",
                    "args": {"department_name": department_name, "confirmed": True}
                },
                "message": f"⚠️ **Confirmation Required** ⚠️\n\nYou are about to permanently delete the **{dept['name']}** department. Please confirm this action."
            }
            
        # Optional: check if employees are assigned to this department
        emp_count = users_col.count_documents({"department": dept["_id"]})
        if emp_count > 0:
            return {
                "success": False,
                "action": "remove_department",
                "message": f"Cannot delete '{dept['name']}' department. There are {emp_count} employees currently assigned to it."
            }
            
        depts_col.delete_one({"_id": dept["_id"]})
        
        return {
            "success": True,
            "action": "remove_department",
            "message": f"Successfully deleted the '{dept['name']}' department.",
            "details": [
                {"department": dept["name"], "status": "deleted"}
            ]
        }
        
    except Exception as e:
        return {"success": False, "action": "remove_department", "message": f"Error removing department: {str(e)}"}
