import Leave from '../models/Leave.js';

export const applyLeave = async (req, res, next) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    const leave = await Leave.create({ employee: req.user._id, leaveType, startDate, endDate, reason });
    const populated = await Leave.findById(leave._id).populate('employee', 'name email designation profileImage');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getMyLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = { employee: req.user._id };
    if (status) query.status = status;
    const leaves = await Leave.find(query).sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

export const getAllLeaves = async (req, res, next) => {
  try {
    const { status, employee } = req.query;
    const query = {};
    if (status) query.status = status;
    if (employee) query.employee = employee;
    const leaves = await Leave.find(query)
      .populate('employee', 'name email designation profileImage department')
      .populate('approvedBy', 'name')
      .sort('-createdAt');
    res.json(leaves);
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status, adminRemarks } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Status must be approved or rejected' });
    }
    const leave = await Leave.findByIdAndUpdate(
      req.params.id,
      { status, approvedBy: req.user._id, adminRemarks: adminRemarks || '' },
      { new: true }
    ).populate('employee', 'name email designation profileImage');
    if (!leave) return res.status(404).json({ message: 'Leave request not found' });
    res.json(leave);
  } catch (error) {
    next(error);
  }
};

export const deleteLeave = async (req, res, next) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave not found' });
    if (leave.employee.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    await Leave.findByIdAndDelete(req.params.id);
    res.json({ message: 'Leave deleted successfully' });
  } catch (error) {
    next(error);
  }
};
