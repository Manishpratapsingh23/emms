"""
WorkWise AI — Schedule Meeting Tool
Creates a new meeting record in the database.
"""

from datetime import datetime
from dateutil import parser as date_parser
from bson import ObjectId
from db.connection import get_collection


def schedule_meeting(
    admin_id: str,
    title: str,
    scheduled_at: str,
    duration: int = 60,
    description: str = "",
) -> dict:
    """
    Schedule a new meeting.
    
    Args:
        admin_id: The admin user's ObjectId string
        title: Meeting title (required)
        scheduled_at: Date/time string (required) — e.g., "2026-05-10T15:00:00"
        duration: Duration in minutes (default: 60)
        description: Meeting description/agenda
    
    Returns:
        Structured result with meeting details
    """
    meetings_col = get_collection("meetings")
    
    try:
        # Parse the scheduled date
        try:
            scheduled_datetime = date_parser.parse(scheduled_at)
        except Exception:
            return {
                "success": False,
                "action": "schedule_meeting",
                "message": f"Could not parse date/time: '{scheduled_at}'. Please use a clear format like '2026-05-10 3:00 PM'."
            }
        
        # Don't allow meetings in the past
        if scheduled_datetime < datetime.now():
            return {
                "success": False,
                "action": "schedule_meeting",
                "message": "Cannot schedule a meeting in the past."
            }
        
        meeting_doc = {
            "title": title.strip(),
            "description": description or "",
            "scheduledAt": scheduled_datetime,
            "duration": int(duration),
            "createdBy": ObjectId(admin_id),
            "status": "scheduled",
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
        }
        
        result = meetings_col.insert_one(meeting_doc)
        
        return {
            "success": True,
            "action": "schedule_meeting",
            "message": f"Meeting '{title}' scheduled successfully!",
            "meeting": {
                "id": str(result.inserted_id),
                "title": title,
                "scheduled_at": scheduled_datetime.strftime("%A, %B %d, %Y at %I:%M %p"),
                "duration": f"{duration} minutes",
                "description": description or "No agenda specified",
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "schedule_meeting", "message": f"Error scheduling meeting: {str(e)}"}
