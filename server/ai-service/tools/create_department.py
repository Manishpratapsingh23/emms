"""
WorkWise AI — Create Department Tool
Creates a new department in the system.
"""

from datetime import datetime
from db.connection import get_collection


def create_department(
    admin_id: str,
    name: str,
    description: str = "",
) -> dict:
    """
    Create a new department.
    
    Args:
        admin_id: The admin user's ObjectId string
        name: Department name (required)
        description: Department description
    
    Returns:
        Structured result with new department details
    """
    depts_col = get_collection("departments")
    
    try:
        name = name.strip()
        
        # Check for duplicate
        existing = depts_col.find_one({"name": {"$regex": f"^{name}$", "$options": "i"}})
        if existing:
            return {
                "success": False,
                "action": "create_department",
                "message": f"Department '{existing['name']}' already exists."
            }
        
        dept_doc = {
            "name": name,
            "description": description or "",
            "manager": None,
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "__v": 0,
        }
        
        result = depts_col.insert_one(dept_doc)
        
        return {
            "success": True,
            "action": "create_department",
            "message": f"Department '{name}' created successfully!",
            "department": {
                "id": str(result.inserted_id),
                "name": name,
                "description": description or "No description",
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "create_department", "message": f"Error creating department: {str(e)}"}
