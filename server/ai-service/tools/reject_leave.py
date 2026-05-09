"""
WorkWise AI — Reject Leave Tool
Rejects pending leave requests with admin remarks.
"""

from bson import ObjectId
from db.connection import get_collection
from datetime import datetime


def reject_leave(
    admin_id: str,
    leave_id: str = None,
    employee_name: str = None,
    reason: str = "Rejected by AI HR Agent",
) -> dict:
    """
    Reject pending leave request(s).
    
    Args:
        admin_id: The admin user's ObjectId string
        leave_id: Specific leave ID to reject
        employee_name: Filter by employee name
        reason: Rejection reason / admin remarks
    
    Returns:
        Structured result with success status and details
    """
    leaves_col = get_collection("leaves")
    users_col = get_collection("users")
    
    try:
        query = {"status": "pending"}
        
        if leave_id:
            try:
                query["_id"] = ObjectId(leave_id)
            except Exception:
                return {"success": False, "action": "reject_leave", "message": f"Invalid leave ID: {leave_id}"}
        
        if employee_name:
            matching_users = list(users_col.find(
                {"name": {"$regex": employee_name, "$options": "i"}},
                {"_id": 1, "name": 1}
            ))
            if not matching_users:
                return {
                    "success": False,
                    "action": "reject_leave",
                    "message": f"No employee found matching '{employee_name}'"
                }
            user_ids = [u["_id"] for u in matching_users]
            query["employee"] = {"$in": user_ids}
        
        pending_leaves = list(leaves_col.find(query))
        
        if not pending_leaves:
            return {
                "success": True,
                "action": "reject_leave",
                "message": "No pending leave requests found matching the criteria.",
                "rejected_count": 0
            }
        
        leave_ids = [l["_id"] for l in pending_leaves]
        result = leaves_col.update_many(
            {"_id": {"$in": leave_ids}},
            {
                "$set": {
                    "status": "rejected",
                    "approvedBy": ObjectId(admin_id),
                    "adminRemarks": reason
                }
            }
        )
        
        rejected_details = []
        for leave in pending_leaves:
            emp = users_col.find_one({"_id": leave["employee"]}, {"name": 1})
            rejected_details.append({
                "employee": emp["name"] if emp else "Unknown",
                "type": leave.get("leaveType", "N/A"),
                "reason": reason,
            })
        
        return {
            "success": True,
            "action": "reject_leave",
            "message": f"Successfully rejected {result.modified_count} leave request(s).",
            "rejected_count": result.modified_count,
            "details": rejected_details
        }
        
    except Exception as e:
        return {"success": False, "action": "reject_leave", "message": f"Error rejecting leaves: {str(e)}"}
