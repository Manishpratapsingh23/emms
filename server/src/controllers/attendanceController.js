import Attendance from '../models/Attendance.js';

const getDateOnly = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

export const clockIn = async (req, res, next) => {
  try {
    const today = getDateOnly(new Date());
    let attendance = await Attendance.findOne({ employee: req.user._id, date: today });
    if (attendance && attendance.clockIn) {
      return res.status(400).json({ message: 'Already clocked in today' });
    }
    if (!attendance) {
      attendance = await Attendance.create({
        employee: req.user._id, date: today, clockIn: new Date(), status: 'present'
      });
    } else {
      attendance.clockIn = new Date();
      attendance.status = 'present';
      await attendance.save();
    }
    const populated = await Attendance.findById(attendance._id).populate('employee', 'name email');
    res.json({ message: 'Clocked in successfully', attendance: populated });
  } catch (error) {
    next(error);
  }
};

export const clockOut = async (req, res, next) => {
  try {
    const today = getDateOnly(new Date());
    const attendance = await Attendance.findOne({ employee: req.user._id, date: today });
    if (!attendance || !attendance.clockIn) {
      return res.status(400).json({ message: 'You have not clocked in today' });
    }
    if (attendance.clockOut) {
      return res.status(400).json({ message: 'Already clocked out today' });
    }
    attendance.clockOut = new Date();
    const diffMs = attendance.clockOut - attendance.clockIn;
    attendance.totalHours = parseFloat((diffMs / (1000 * 60 * 60)).toFixed(2));
    if (attendance.totalHours < 4) {
      attendance.status = 'half-day';
    }
    await attendance.save();
    const populated = await Attendance.findById(attendance._id).populate('employee', 'name email');
    res.json({ message: 'Clocked out successfully', attendance: populated });
  } catch (error) {
    next(error);
  }
};

export const getMyAttendance = async (req, res, next) => {
  try {
    const { month, year } = req.query;
    const query = { employee: req.user._id };
    if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    const attendance = await Attendance.find(query).sort('-date');
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const getAllAttendance = async (req, res, next) => {
  try {
    const { date, employee, month, year } = req.query;
    const query = {};
    if (employee) query.employee = employee;
    if (date) {
      query.date = getDateOnly(date);
    } else if (month && year) {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      query.date = { $gte: startDate, $lte: endDate };
    }
    const attendance = await Attendance.find(query)
      .populate('employee', 'name email designation department profileImage')
      .sort('-date');
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const addManualAttendance = async (req, res, next) => {
  try {
    const { employee, date, clockIn, clockOut, status } = req.body;
    const dateOnly = getDateOnly(date);
    let totalHours = 0;
    if (clockIn && clockOut) {
      totalHours = parseFloat(((new Date(clockOut) - new Date(clockIn)) / (1000 * 60 * 60)).toFixed(2));
    }
    const attendance = await Attendance.findOneAndUpdate(
      { employee, date: dateOnly },
      { employee, date: dateOnly, clockIn: clockIn ? new Date(clockIn) : null, clockOut: clockOut ? new Date(clockOut) : null, totalHours, status: status || 'present' },
      { new: true, upsert: true }
    ).populate('employee', 'name email');
    res.json(attendance);
  } catch (error) {
    next(error);
  }
};

export const getTodayStatus = async (req, res, next) => {
  try {
    const today = getDateOnly(new Date());
    const attendance = await Attendance.findOne({ employee: req.user._id, date: today });
    res.json(attendance || { clockedIn: false, clockedOut: false });
  } catch (error) {
    next(error);
  }
};
