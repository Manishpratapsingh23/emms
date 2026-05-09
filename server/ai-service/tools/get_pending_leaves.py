"""
WorkWise AI — Get Pending Leaves Tool
Fetches pending leave requests.
"""

from db.connection import get_collection


def get_pending_leaves(
    admin_id: str,
    leave_type: str = None,
) -> dict:
    """
    Get a list of all pending leave requests.
    
    Args:
        admin_id: The admin user's ObjectId string
        leave_type: Optional filter by leave type
    
    Returns:
        Structured result with list of pending leaves
    """
    leaves_col = get_collection("leaves")
    users_col = get_collection("users")
    
    try:
        query = {"status": "pending"}
        if leave_type:
            query["leaveType"] = leave_type.lower()
            
        pending = list(leaves_col.find(query))
        
        if not pending:
            return {
                "success": True,
                "action": "get_pending_leaves",
                "message": "There are no pending leave requests right now.",
                "count": 0,
                "details": []
            }
            
        details = []
        for leave in pending:
            emp = users_col.find_one({"_id": leave["employee"]}, {"name": 1})
            details.append({
                "leave_id": str(leave["_id"]),
                "employee": emp["name"] if emp else "Unknown",
                "type": leave.get("leaveType", "N/A"),
                "reason": leave.get("reason", "N/A"),
                "start": str(leave.get("startDate", "").split("T")[0] if isinstance(leave.get("startDate"), str) else leave.get("startDate")),
                "end": str(leave.get("endDate", "").split("T")[0] if isinstance(leave.get("endDate"), str) else leave.get("endDate")),
            })
            
        return {
            "success": True,
            "action": "get_pending_leaves",
            "message": f"Found {len(pending)} pending leave request(s).",
            "count": len(pending),
            "details": details
        }
        
    except Exception as e:
        return {"success": False, "action": "get_pending_leaves", "message": f"Error fetching leaves: {str(e)}"}
