"""
WorkWise AI — Generate Payroll Tool
Generates monthly payroll records for all active employees.
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def generate_payroll(
    admin_id: str,
    month: int,
    year: int,
    bonus: float = 0,
    deductions: float = 0,
    employee_name: str = None,
) -> dict:
    """
    Generate payroll for all active employees (or a specific employee) for the given month/year.
    
    Args:
        admin_id: The admin user's ObjectId string
        month: Month number (1-12)
        year: Year (e.g., 2026)
        bonus: Bonus amount
        deductions: Deduction amount
        employee_name: Optional specific employee to generate payroll for
    
    Returns:
        Structured result with payroll generation summary
    """
    users_col = get_collection("users")
    payrolls_col = get_collection("payrolls")
    
    try:
        month = int(month)
        year = int(year)
        bonus = float(bonus) if bonus else 0
        deductions = float(deductions) if deductions else 0
        
        query = {"role": "employee", "status": "active", "salary": {"$gt": 0}}
        if employee_name:
            query["name"] = {"$regex": employee_name, "$options": "i"}

        # Fetch active employees matching the query
        employees = list(users_col.find(
            query,
            {"_id": 1, "name": 1, "salary": 1, "designation": 1}
        ))
        
        if not employees:
            return {
                "success": False,
                "action": "generate_payroll",
                "message": "No active employees with salary found."
            }
        
        created_count = 0
        skipped_count = 0
        total_amount = 0
        payroll_details = []
        
        for emp in employees:
            # Check if payroll already exists for this employee/month/year
            existing = payrolls_col.find_one({
                "employee": emp["_id"],
                "month": month,
                "year": year
            })
            
            if existing:
                skipped_count += 1
                continue
            
            basic_salary = emp["salary"]
            net_salary = basic_salary + bonus - deductions
            
            payroll_record = {
                "employee": emp["_id"],
                "month": month,
                "year": year,
                "basicSalary": basic_salary,
                "bonus": bonus,
                "deductions": deductions,
                "netSalary": net_salary,
                "paymentStatus": "unpaid",
                "paymentDate": None,
                "createdAt": datetime.utcnow(),
                "updatedAt": datetime.utcnow(),
            }
            
            payrolls_col.insert_one(payroll_record)
            created_count += 1
            total_amount += net_salary
            
            payroll_details.append({
                "employee": emp["name"],
                "designation": emp.get("designation", "N/A"),
                "basic": basic_salary,
                "net": net_salary,
            })
        
        month_name = datetime(year, month, 1).strftime("%B")
        
        return {
            "success": True,
            "action": "generate_payroll",
            "message": f"Payroll generated for {month_name} {year}. Created {created_count} records, skipped {skipped_count} (already exist).",
            "created_count": created_count,
            "skipped_count": skipped_count,
            "total_amount": total_amount,
            "month": month_name,
            "year": year,
            "details": payroll_details[:20]  # Limit details to first 20
        }
        
    except Exception as e:
        return {"success": False, "action": "generate_payroll", "message": f"Error generating payroll: {str(e)}"}
