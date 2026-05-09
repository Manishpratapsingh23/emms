"""
WorkWise AI — Add Employee Tool
Creates a new employee in the system with auto-generated credentials.
"""

import re
from datetime import datetime
from bson import ObjectId
import bcrypt
from db.connection import get_collection


def add_employee(
    admin_id: str,
    name: str,
    email: str = None,
    department: str = None,
    designation: str = None,
    salary: float = 0,
    phone: str = "",
) -> dict:
    """
    Add a new employee to the system.
    
    Args:
        admin_id: The admin user's ObjectId string
        name: Employee full name (required)
        email: Email address (auto-generated if not provided)
        department: Department name (will be looked up by name)
        designation: Job title/designation
        salary: Monthly salary
        phone: Phone number
    
    Returns:
        Structured result with new employee details
    """
    users_col = get_collection("users")
    depts_col = get_collection("departments")
    
    try:
        name = name.strip()
        
        # Auto-generate email if not provided
        if not email:
            clean_name = re.sub(r'[^a-zA-Z\s]', '', name).lower().strip()
            parts = clean_name.split()
            if len(parts) >= 2:
                email = f"{parts[0]}.{parts[-1]}@workwise.com"
            else:
                email = f"{parts[0]}@workwise.com"
        
        email = email.lower().strip()
        
        # Check if email already exists
        existing = users_col.find_one({"email": email})
        if existing:
            return {
                "success": False,
                "action": "add_employee",
                "message": f"An employee with email '{email}' already exists."
            }
        
        # Look up department by name if provided
        dept_id = None
        dept_name = None
        if department:
            dept = depts_col.find_one({"name": {"$regex": f"^{department}$", "$options": "i"}})
            if dept:
                dept_id = dept["_id"]
                dept_name = dept["name"]
            else:
                return {
                    "success": False,
                    "action": "add_employee",
                    "message": f"Department '{department}' not found. Create it first or check the name."
                }
        
        # Hash the temporary password
        temp_password = "WorkWise@2026"
        hashed_password = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt(12))
        
        # Create the employee document
        employee_doc = {
            "name": name,
            "email": email,
            "password": hashed_password.decode('utf-8'),
            "phone": phone or "",
            "department": dept_id,
            "designation": designation or "",
            "salary": float(salary) if salary else 0,
            "joiningDate": datetime.utcnow(),
            "status": "active",
            "profileImage": "",
            "role": "employee",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "__v": 0,
        }
        
        result = users_col.insert_one(employee_doc)
        
        return {
            "success": True,
            "action": "add_employee",
            "message": f"Employee '{name}' added successfully!",
            "employee": {
                "id": str(result.inserted_id),
                "name": name,
                "email": email,
                "department": dept_name or "Not assigned",
                "designation": designation or "Not set",
                "salary": salary,
                "temp_password": temp_password,
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "add_employee", "message": f"Error adding employee: {str(e)}"}
