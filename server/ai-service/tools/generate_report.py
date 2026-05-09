"""
WorkWise AI — Generate Report Tool
Generates summary reports across HR domains using MongoDB aggregation.
"""

from datetime import datetime
from db.connection import get_collection


def generate_report(
    admin_id: str,
    report_type: str,
) -> dict:
    """
    Generate a summary report based on the requested type.
    
    Args:
        admin_id: The admin user's ObjectId string
        report_type: One of: employee_summary, leave_summary, payroll_summary,
                     attendance_summary, department_summary
    
    Returns:
        Structured report data
    """
    try:
        generators = {
            "employee_summary": _employee_summary,
            "leave_summary": _leave_summary,
            "payroll_summary": _payroll_summary,
            "attendance_summary": _attendance_summary,
            "department_summary": _department_summary,
        }
        
        generator = generators.get(report_type)
        if not generator:
            return {
                "success": False,
                "action": "generate_report",
                "message": f"Unknown report type: {report_type}. Available: {', '.join(generators.keys())}"
            }
        
        return generator()
        
    except Exception as e:
        return {"success": False, "action": "generate_report", "message": f"Error generating report: {str(e)}"}


def _employee_summary() -> dict:
    """Generate employee overview report."""
    users_col = get_collection("users")
    
    total = users_col.count_documents({"role": "employee"})
    active = users_col.count_documents({"role": "employee", "status": "active"})
    inactive = users_col.count_documents({"role": "employee", "status": "inactive"})
    
    # Average salary
    pipeline = [
        {"$match": {"role": "employee", "status": "active", "salary": {"$gt": 0}}},
        {"$group": {"_id": None, "avg_salary": {"$avg": "$salary"}, "total_salary": {"$sum": "$salary"}}}
    ]
    salary_stats = list(users_col.aggregate(pipeline))
    avg_salary = round(salary_stats[0]["avg_salary"], 2) if salary_stats else 0
    total_salary_cost = salary_stats[0]["total_salary"] if salary_stats else 0
    
    # Recent hires (last 30 days)
    from datetime import timedelta
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    recent_hires = users_col.count_documents({
        "role": "employee",
        "createdAt": {"$gte": thirty_days_ago}
    })
    
    return {
        "success": True,
        "action": "generate_report",
        "message": "Employee Summary Report generated.",
        "report": {
            "type": "Employee Summary",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_employees": total,
            "active_employees": active,
            "inactive_employees": inactive,
            "average_salary": avg_salary,
            "total_monthly_salary_cost": total_salary_cost,
            "recent_hires_30_days": recent_hires,
        }
    }


def _leave_summary() -> dict:
    """Generate leave overview report."""
    leaves_col = get_collection("leaves")
    
    total = leaves_col.count_documents({})
    pending = leaves_col.count_documents({"status": "pending"})
    approved = leaves_col.count_documents({"status": "approved"})
    rejected = leaves_col.count_documents({"status": "rejected"})
    
    # By type
    type_pipeline = [
        {"$group": {"_id": "$leaveType", "count": {"$sum": 1}}}
    ]
    by_type = {doc["_id"]: doc["count"] for doc in leaves_col.aggregate(type_pipeline)}
    
    return {
        "success": True,
        "action": "generate_report",
        "message": "Leave Summary Report generated.",
        "report": {
            "type": "Leave Summary",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_requests": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "by_type": by_type,
            "approval_rate": f"{round((approved / max(total, 1)) * 100, 1)}%",
        }
    }


def _payroll_summary() -> dict:
    """Generate payroll overview report."""
    payrolls_col = get_collection("payrolls")
    
    total = payrolls_col.count_documents({})
    paid = payrolls_col.count_documents({"paymentStatus": "paid"})
    unpaid = payrolls_col.count_documents({"paymentStatus": "unpaid"})
    
    # Total amounts
    pipeline = [
        {"$group": {
            "_id": None,
            "total_net": {"$sum": "$netSalary"},
            "total_bonus": {"$sum": "$bonus"},
            "total_deductions": {"$sum": "$deductions"},
        }}
    ]
    totals = list(payrolls_col.aggregate(pipeline))
    
    return {
        "success": True,
        "action": "generate_report",
        "message": "Payroll Summary Report generated.",
        "report": {
            "type": "Payroll Summary",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_records": total,
            "paid": paid,
            "unpaid": unpaid,
            "total_net_salary": totals[0]["total_net"] if totals else 0,
            "total_bonuses": totals[0]["total_bonus"] if totals else 0,
            "total_deductions": totals[0]["total_deductions"] if totals else 0,
        }
    }


def _attendance_summary() -> dict:
    """Generate attendance overview for current month."""
    attendance_col = get_collection("attendances")
    
    now = datetime.now()
    start = datetime(now.year, now.month, 1)
    if now.month == 12:
        end = datetime(now.year + 1, 1, 1)
    else:
        end = datetime(now.year, now.month + 1, 1)
    
    records = list(attendance_col.find({"date": {"$gte": start, "$lt": end}}))
    
    total = len(records)
    present = sum(1 for r in records if r.get("status") == "present")
    absent = sum(1 for r in records if r.get("status") == "absent")
    late = sum(1 for r in records if r.get("status") == "late")
    half_day = sum(1 for r in records if r.get("status") == "half-day")
    
    avg_hours = 0
    if present > 0:
        avg_hours = round(sum(r.get("totalHours", 0) for r in records) / present, 2)
    
    return {
        "success": True,
        "action": "generate_report",
        "message": f"Attendance Summary Report for {now.strftime('%B %Y')} generated.",
        "report": {
            "type": "Attendance Summary",
            "period": now.strftime("%B %Y"),
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_records": total,
            "present": present,
            "absent": absent,
            "late": late,
            "half_day": half_day,
            "average_hours": avg_hours,
            "attendance_rate": f"{round((present / max(total, 1)) * 100, 1)}%",
        }
    }


def _department_summary() -> dict:
    """Generate department overview report."""
    depts_col = get_collection("departments")
    users_col = get_collection("users")
    
    departments = list(depts_col.find({}, {"name": 1, "description": 1}))
    
    dept_data = []
    for dept in departments:
        emp_count = users_col.count_documents({
            "department": dept["_id"],
            "role": "employee",
            "status": "active"
        })
        dept_data.append({
            "name": dept["name"],
            "description": dept.get("description", ""),
            "employee_count": emp_count,
        })
    
    # Sort by employee count descending
    dept_data.sort(key=lambda x: x["employee_count"], reverse=True)
    
    return {
        "success": True,
        "action": "generate_report",
        "message": "Department Summary Report generated.",
        "report": {
            "type": "Department Summary",
            "generated_at": datetime.now().strftime("%Y-%m-%d %H:%M"),
            "total_departments": len(departments),
            "departments": dept_data,
        }
    }
