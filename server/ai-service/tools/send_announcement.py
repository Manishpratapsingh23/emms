"""
WorkWise AI — Send Announcement Tool
Creates a company announcement in the database.
"""

from datetime import datetime
from bson import ObjectId
from db.connection import get_collection


def send_announcement(
    admin_id: str,
    title: str,
    description: str,
    priority: str = "medium",
) -> dict:
    """
    Create and publish a company announcement.
    
    Args:
        admin_id: The admin user's ObjectId string
        title: Announcement title (required)
        description: Announcement body/content (required)
        priority: Priority level — low, medium, high, urgent (default: medium)
    
    Returns:
        Structured result with announcement details
    """
    announcements_col = get_collection("announcements")
    
    try:
        valid_priorities = ["low", "medium", "high", "urgent"]
        if priority not in valid_priorities:
            priority = "medium"
        
        announcement_doc = {
            "title": title.strip(),
            "description": description.strip(),
            "priority": priority,
            "createdBy": ObjectId(admin_id),
            "createdAt": datetime.utcnow(),
            "updatedAt": datetime.utcnow(),
            "__v": 0,
        }
        
        result = announcements_col.insert_one(announcement_doc)
        
        priority_emoji = {"low": "📋", "medium": "📢", "high": "⚡", "urgent": "🚨"}
        
        return {
            "success": True,
            "action": "send_announcement",
            "message": f"{priority_emoji.get(priority, '📢')} Announcement '{title}' published successfully!",
            "announcement": {
                "id": str(result.inserted_id),
                "title": title,
                "priority": priority,
                "description": description[:200] + "..." if len(description) > 200 else description,
            }
        }
        
    except Exception as e:
        return {"success": False, "action": "send_announcement", "message": f"Error creating announcement: {str(e)}"}
