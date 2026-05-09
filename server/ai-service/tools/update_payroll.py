"""
WorkWise AI — Update Payroll Tool
Updates the status of an existing payroll record (e.g., mark as paid or approved).
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def update_payroll(
    admin_id: str,
    employee_name: str,
    month: int,
    year: int,
    status: str,
) -> dict:
    """
    Update the status of an employee's payroll.
    
    Args:
        admin_id: The admin user's ObjectId string
        employee_name: Name of the employee
        month: Month number (1-12)
        year: Year (e.g., 2026)
        status: The new status (e.g., 'paid', 'approved', 'unpaid')
    
    Returns:
        Structured result with success status
    """
    users_col = get_collection("users")
    payrolls_col = get_collection("payrolls")
    
    try:
        month = int(month)
        year = int(year)
        status = status.lower()
        
        # Find employee
        employee = users_col.find_one(
            {"name": {"$regex": employee_name, "$options": "i"}, "role": "employee"},
            {"_id": 1, "name": 1}
        )
        
        if not employee:
            return {"success": False, "action": "update_payroll", "message": f"Employee '{employee_name}' not found."}
            
        # Find payroll
        payroll = payrolls_col.find_one({
            "employee": employee["_id"],
            "month": month,
            "year": year
        })
        
        if not payroll:
            return {
                "success": False, 
                "action": "update_payroll", 
                "message": f"No payroll record found for {employee['name']} for {month}/{year}. Please generate it first."
            }
            
        update_data = {
            "paymentStatus": status,
            "updatedAt": datetime.utcnow()
        }
        
        if status == "paid":
            update_data["paymentDate"] = datetime.utcnow()
            
        payrolls_col.update_one({"_id": payroll["_id"]}, {"$set": update_data})
        
        return {
            "success": True,
            "action": "update_payroll",
            "message": f"Successfully marked {employee['name']}'s payroll for {month}/{year} as '{status}'.",
            "details": [
                {
                    "employee": employee["name"],
                    "month": month,
                    "year": year,
                    "status": status
                }
            ]
        }
        
    except Exception as e:
        return {"success": False, "action": "update_payroll", "message": f"Error updating payroll: {str(e)}"}
