"""
WorkWise AI — Approve Leave Tool
Approves pending leave requests based on filters (type, employee, or bulk).
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def approve_leave(
    admin_id: str,
    leave_type: str = None,
    employee_name: str = None,
    approve_all: bool = False,
    leave_id: str = None,
) -> dict:
    """
    Approve pending leave request(s).
    
    Args:
        admin_id: The admin user's ObjectId string
        leave_type: Filter by type (sick, casual, annual, etc.)
        employee_name: Filter by employee name (partial match)
        approve_all: If True, approve all matching pending leaves
        leave_id: Specific leave ID to approve
    
    Returns:
        Structured result with success status and details
    """
    leaves_col = get_collection("leaves")
    users_col = get_collection("users")
    
    try:
        # Build query for pending leaves
        query = {"status": "pending"}
        
        if leave_id:
            # Approve specific leave
            try:
                query["_id"] = ObjectId(leave_id)
            except Exception:
                return {"success": False, "action": "approve_leave", "message": f"Invalid leave ID: {leave_id}"}
        
        if leave_type:
            query["leaveType"] = leave_type.lower()
        
        if employee_name:
            # Find employees matching the name
            matching_users = list(users_col.find(
                {"name": {"$regex": employee_name, "$options": "i"}},
                {"_id": 1, "name": 1}
            ))
            if not matching_users:
                return {
                    "success": False,
                    "action": "approve_leave",
                    "message": f"No employee found matching '{employee_name}'"
                }
            user_ids = [u["_id"] for u in matching_users]
            query["employee"] = {"$in": user_ids}
        
        # Find matching pending leaves
        pending_leaves = list(leaves_col.find(query))
        
        if not pending_leaves:
            return {
                "success": True,
                "action": "approve_leave",
                "message": "No pending leave requests found matching the criteria.",
                "approved_count": 0
            }
        
        # Approve the leaves
        leave_ids = [l["_id"] for l in pending_leaves]
        result = leaves_col.update_many(
            {"_id": {"$in": leave_ids}},
            {
                "$set": {
                    "status": "approved",
                    "approvedBy": ObjectId(admin_id),
                    "adminRemarks": "Approved by AI HR Agent"
                }
            }
        )
        
        # Build detailed response
        approved_details = []
        for leave in pending_leaves:
            emp = users_col.find_one({"_id": leave["employee"]}, {"name": 1, "email": 1})
            approved_details.append({
                "employee": emp["name"] if emp else "Unknown",
                "type": leave.get("leaveType", "N/A"),
                "start": leave["startDate"].strftime("%Y-%m-%d") if isinstance(leave["startDate"], datetime) else str(leave["startDate"]),
                "end": leave["endDate"].strftime("%Y-%m-%d") if isinstance(leave["endDate"], datetime) else str(leave["endDate"]),
            })
        
        return {
            "success": True,
            "action": "approve_leave",
            "message": f"Successfully approved {result.modified_count} leave request(s).",
            "approved_count": result.modified_count,
            "details": approved_details
        }
        
    except Exception as e:
        return {"success": False, "action": "approve_leave", "message": f"Error approving leaves: {str(e)}"}
