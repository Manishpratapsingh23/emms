import User from '../models/User.js';
import Department from '../models/Department.js';
import Leave from '../models/Leave.js';
import Payroll from '../models/Payroll.js';
import Attendance from '../models/Attendance.js';
import Announcement from '../models/Announcement.js';

export const getAdminDashboard = async (req, res, next) => {
  try {
    const totalEmployees = await User.countDocuments({ role: 'employee' });
    const totalDepartments = await Department.countDocuments();
    const pendingLeaves = await Leave.countDocuments({ status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ status: 'approved' });
    const totalPayrolls = await Payroll.countDocuments({ paymentStatus: 'paid' });
    const today = new Date(); today.setHours(0,0,0,0);
    const presentToday = await Attendance.countDocuments({ date: today, status: { $in: ['present', 'late'] } });
    const recentLeaves = await Leave.find().populate('employee', 'name profileImage').sort('-createdAt').limit(5);
    const recentAnnouncements = await Announcement.find().sort('-createdAt').limit(5);

    // Monthly attendance trend (last 6 months)
    const monthlyAttendance = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = await Attendance.countDocuments({ date: { $gte: start, $lte: end }, status: { $in: ['present', 'late'] } });
      monthlyAttendance.push({ month: start.toLocaleString('default', { month: 'short' }), year: start.getFullYear(), count });
    }

    // Department distribution
    const departments = await Department.find().populate('employeeCount');
    const deptDistribution = departments.map(d => ({ name: d.name, count: d.employeeCount || 0 }));

    res.json({
      totalEmployees, totalDepartments, pendingLeaves, approvedLeaves,
      totalPayrolls, presentToday, recentLeaves, recentAnnouncements,
      monthlyAttendance, deptDistribution
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeDashboard = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const totalAttendance = await Attendance.countDocuments({ employee: userId, status: { $in: ['present', 'late'] } });
    const pendingLeaves = await Leave.countDocuments({ employee: userId, status: 'pending' });
    const approvedLeaves = await Leave.countDocuments({ employee: userId, status: 'approved' });
    const latestPayroll = await Payroll.findOne({ employee: userId }).sort('-year -month');
    const recentAnnouncements = await Announcement.find().sort('-createdAt').limit(5);
    const today = new Date(); today.setHours(0,0,0,0);
    const todayAttendance = await Attendance.findOne({ employee: userId, date: today });

    // Monthly attendance for last 6 months
    const monthlyAttendance = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), 1);
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
      const count = await Attendance.countDocuments({ employee: userId, date: { $gte: start, $lte: end }, status: { $in: ['present', 'late'] } });
      monthlyAttendance.push({ month: start.toLocaleString('default', { month: 'short' }), count });
    }

    res.json({
      totalAttendance, pendingLeaves, approvedLeaves,
      latestPayroll, recentAnnouncements, todayAttendance, monthlyAttendance
    });
  } catch (error) {
    next(error);
  }
};
