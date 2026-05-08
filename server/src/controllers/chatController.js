import User from '../models/User.js';
import Leave from '../models/Leave.js';
import Attendance from '../models/Attendance.js';
import Payroll from '../models/Payroll.js';
import Announcement from '../models/Announcement.js';
import Department from '../models/Department.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

/**
 * Fetch real-time user data from MongoDB for personalized responses
 */
async function getUserContext(userId, userRole) {
  const context = {};

  try {
    const user = await User.findById(userId).populate('department');
    if (user) {
      context.userName = user.name;
      context.email = user.email;
      context.department = user.department?.name || 'Not Assigned';
      context.designation = user.designation || 'Not Set';
      context.joiningDate = user.joiningDate ? new Date(user.joiningDate).toLocaleDateString() : 'N/A';
      context.status = user.status;
    }

    // Leave summary
    const leaves = await Leave.find({ employee: userId });
    const approvedLeaves = leaves.filter(l => l.status === 'approved');
    context.totalLeavesApplied = leaves.length;
    context.approvedLeaves = approvedLeaves.length;
    context.pendingLeaves = leaves.filter(l => l.status === 'pending').length;
    context.rejectedLeaves = leaves.filter(l => l.status === 'rejected').length;

    let usedDays = 0;
    for (const leave of approvedLeaves) {
      const start = new Date(leave.startDate);
      const end = new Date(leave.endDate);
      usedDays += Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    }
    context.usedLeaveDays = usedDays;
    context.remainingAnnualLeave = Math.max(0, 24 - usedDays);

    // Attendance (current month)
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const attendance = await Attendance.find({
      employee: userId,
      date: { $gte: monthStart }
    });
    context.thisMonthAttendance = attendance.length;

    // Latest payroll
    const latestPayroll = await Payroll.findOne({ employee: userId }).sort({ createdAt: -1 });
    if (latestPayroll) {
      context.lastPayrollMonth = latestPayroll.month;
      context.lastPayrollYear = latestPayroll.year;
      context.lastPayrollStatus = latestPayroll.status;
    }

    // Admin extras
    if (userRole === 'admin') {
      context.totalEmployees = await User.countDocuments({ role: 'employee' });
      context.totalDepartments = await Department.countDocuments();
      context.allPendingLeaves = await Leave.countDocuments({ status: 'pending' });
      const recentAnnouncements = await Announcement.find().sort({ createdAt: -1 }).limit(3);
      context.recentAnnouncements = recentAnnouncements.map(a => a.title);
    }
  } catch (error) {
    console.error('Error fetching user context:', error.message);
  }

  return context;
}

/**
 * Main chat handler — collects MongoDB context and forwards to Python RAG service
 */
export const handleChat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;
    const userName = req.user.name;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message is too long. Please keep it under 2000 characters.' });
    }

    // Step 1: Get real-time user data from MongoDB
    const userContext = await getUserContext(userId, userRole);

    // Step 2: Forward to Python RAG service
    const response = await fetch(`${AI_SERVICE_URL}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: message.trim(),
        user_id: userId.toString(),
        user_role: userRole,
        user_name: userName,
        user_context: userContext,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('AI service error:', response.status, errorData);
      
      if (response.status === 429) {
        return res.status(429).json({ error: 'AI service is currently busy. Please try again in a few seconds.' });
      }
      
      return res.status(500).json({ 
        error: errorData.detail || 'An error occurred while processing your request. Please try again.' 
      });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Chat error:', error.message);

    if (error.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        error: 'AI service is not running. Please start the Python AI service (cd server/ai-service && python main.py).' 
      });
    }

    res.status(500).json({ error: 'An error occurred while processing your request. Please try again.' });
  }
};

/**
 * Reload knowledge base (admin only)
 */
export const reloadKnowledgeBase = async (req, res) => {
  try {
    const response = await fetch(`${AI_SERVICE_URL}/reload-kb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to reload knowledge base.' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Reload error:', error.message);
    res.status(500).json({ error: 'AI service is not reachable.' });
  }
};
