"""
WorkWise AI — Attendance Analytics Tool
Generates attendance statistics and insights from the database.
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def attendance_analytics(
    admin_id: str,
    month: int = None,
    year: int = None,
    department: str = None,
    employee_name: str = None,
) -> dict:
    """
    Generate attendance analytics and statistics.
    
    Args:
        admin_id: The admin user's ObjectId string
        month: Month number (defaults to current month)
        year: Year (defaults to current year)
        department: Filter by department name
        employee_name: Filter by employee name
    
    Returns:
        Structured analytics data
    """
    attendance_col = get_collection("attendances")
    users_col = get_collection("users")
    depts_col = get_collection("departments")
    
    try:
        now = datetime.now()
        month = int(month) if month else now.month
        year = int(year) if year else now.year
        
        # Date range for the month
        start_date = datetime(year, month, 1)
        if month == 12:
            end_date = datetime(year + 1, 1, 1)
        else:
            end_date = datetime(year, month + 1, 1)
        
        # Build employee filter
        employee_filter = {"role": "employee", "status": "active"}
        
        if department:
            dept = depts_col.find_one({"name": {"$regex": department, "$options": "i"}})
            if dept:
                employee_filter["department"] = dept["_id"]
            else:
                return {
                    "success": False,
                    "action": "attendance_analytics",
                    "message": f"Department '{department}' not found."
                }
        
        if employee_name:
            employee_filter["name"] = {"$regex": employee_name, "$options": "i"}
        
        target_employees = list(users_col.find(employee_filter, {"_id": 1, "name": 1}))
        employee_ids = [e["_id"] for e in target_employees]
        
        if not employee_ids:
            return {
                "success": True,
                "action": "attendance_analytics",
                "message": "No employees found matching the criteria.",
                "analytics": {}
            }
        
        # Fetch attendance records
        attendance_records = list(attendance_col.find({
            "employee": {"$in": employee_ids},
            "date": {"$gte": start_date, "$lt": end_date}
        }))
        
        # Calculate statistics
        total_records = len(attendance_records)
        present_count = sum(1 for r in attendance_records if r.get("status") == "present")
        absent_count = sum(1 for r in attendance_records if r.get("status") == "absent")
        late_count = sum(1 for r in attendance_records if r.get("status") == "late")
        half_day_count = sum(1 for r in attendance_records if r.get("status") == "half-day")
        
        total_hours = sum(r.get("totalHours", 0) for r in attendance_records)
        avg_hours = round(total_hours / max(present_count, 1), 2)
        
        # Per-employee breakdown
        employee_stats = {}
        for record in attendance_records:
            emp_id = str(record["employee"])
            if emp_id not in employee_stats:
                employee_stats[emp_id] = {"present": 0, "absent": 0, "late": 0, "half_day": 0, "hours": 0}
            status = record.get("status", "present")
            if status == "present":
                employee_stats[emp_id]["present"] += 1
            elif status == "absent":
                employee_stats[emp_id]["absent"] += 1
            elif status == "late":
                employee_stats[emp_id]["late"] += 1
            elif status == "half-day":
                employee_stats[emp_id]["half_day"] += 1
            employee_stats[emp_id]["hours"] += record.get("totalHours", 0)
        
        # Top performers (most present days)
        emp_name_map = {str(e["_id"]): e["name"] for e in target_employees}
        top_performers = sorted(
            employee_stats.items(),
            key=lambda x: x[1]["present"],
            reverse=True
        )[:5]
        
        top_list = []
        for emp_id, stats in top_performers:
            top_list.append({
                "name": emp_name_map.get(emp_id, "Unknown"),
                "present_days": stats["present"],
                "total_hours": round(stats["hours"], 1),
            })
        
        month_name = datetime(year, month, 1).strftime("%B")
        
        return {
            "success": True,
            "action": "attendance_analytics",
            "message": f"Attendance analytics for {month_name} {year}",
            "analytics": {
                "period": f"{month_name} {year}",
                "total_employees": len(employee_ids),
                "total_records": total_records,
                "present": present_count,
                "absent": absent_count,
                "late": late_count,
                "half_day": half_day_count,
                "average_hours_per_day": avg_hours,
                "total_hours_logged": round(total_hours, 1),
                "attendance_rate": f"{round((present_count / max(total_records, 1)) * 100, 1)}%",
                "top_performers": top_list,
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "attendance_analytics", "message": f"Error generating analytics: {str(e)}"}
