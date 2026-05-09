"""
WorkWise AI — Update Employee Tool
Updates employee details like designation, department, and salary.
"""

from bson import ObjectId
from db.connection import get_collection


def update_employee(
    admin_id: str,
    employee_id: str = None,
    employee_name: str = None,
    department: str = None,
    designation: str = None,
    salary: float = None,
) -> dict:
    """
    Update details of an existing employee.
    
    Args:
        admin_id: The admin user's ObjectId string
        employee_id: Specific employee ObjectId
        employee_name: Employee name to search for
        department: New department name (will be matched to DB)
        designation: New designation string
        salary: New salary amount
    
    Returns:
        Structured result with success status
    """
    users_col = get_collection("users")
    depts_col = get_collection("departments")
    
    try:
        if not employee_id and not employee_name:
            return {"success": False, "action": "update_employee", "message": "Either employee_id or employee_name must be provided."}
            
        query = {}
        if employee_id:
            try:
                query["_id"] = ObjectId(employee_id)
            except Exception:
                return {"success": False, "action": "update_employee", "message": f"Invalid employee ID format: {employee_id}"}
        else:
            query["name"] = {"$regex": employee_name, "$options": "i"}
            query["role"] = "employee"
            
        employee = users_col.find_one(query)
        if not employee:
            return {"success": False, "action": "update_employee", "message": "Employee not found."}
            
        update_data = {}
        
        if designation:
            update_data["designation"] = designation
            
        if salary is not None:
            update_data["salary"] = float(salary)
            
        if department:
            # Find department by name
            dept = depts_col.find_one({"name": {"$regex": department, "$options": "i"}})
            if dept:
                update_data["department"] = dept["_id"]
            else:
                return {"success": False, "action": "update_employee", "message": f"Department '{department}' not found. Create it first."}
                
        if not update_data:
            return {"success": True, "action": "update_employee", "message": "No fields to update."}
            
        users_col.update_one({"_id": employee["_id"]}, {"$set": update_data})
        
        return {
            "success": True,
            "action": "update_employee",
            "message": f"Successfully updated details for {employee.get('name', 'employee')}.",
            "details": [
                {
                    "employee": employee.get("name"),
                    "updated_fields": list(update_data.keys())
                }
            ]
        }
        
    except Exception as e:
        return {"success": False, "action": "update_employee", "message": f"Error updating employee: {str(e)}"}
