import Payroll from '../models/Payroll.js';

export const createPayroll = async (req, res, next) => {
  try {
    const { employee, month, year, basicSalary, bonus, deductions } = req.body;
    const netSalary = basicSalary + (bonus || 0) - (deductions || 0);
    const payroll = await Payroll.create({ employee, month, year, basicSalary, bonus, deductions, netSalary });
    const populated = await Payroll.findById(payroll._id).populate('employee', 'name email designation department profileImage');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const getAllPayrolls = async (req, res, next) => {
  try {
    const { month, year, status, employee } = req.query;
    const query = {};
    if (month) query.month = parseInt(month);
    if (year) query.year = parseInt(year);
    if (status) query.paymentStatus = status;
    if (employee) query.employee = employee;
    const payrolls = await Payroll.find(query)
      .populate('employee', 'name email designation department profileImage')
      .sort('-year -month');
    res.json(payrolls);
  } catch (error) {
    next(error);
  }
};

export const getMyPayrolls = async (req, res, next) => {
  try {
    const payrolls = await Payroll.find({ employee: req.user._id })
      .populate('employee', 'name email designation department')
      .sort('-year -month');
    res.json(payrolls);
  } catch (error) {
    next(error);
  }
};

export const updatePayrollStatus = async (req, res, next) => {
  try {
    const { paymentStatus } = req.body;
    const updates = { paymentStatus };
    if (paymentStatus === 'paid') updates.paymentDate = new Date();
    const payroll = await Payroll.findByIdAndUpdate(req.params.id, updates, { new: true })
      .populate('employee', 'name email designation department profileImage');
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json(payroll);
  } catch (error) {
    next(error);
  }
};

export const deletePayroll = async (req, res, next) => {
  try {
    const payroll = await Payroll.findByIdAndDelete(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json({ message: 'Payroll record deleted' });
  } catch (error) {
    next(error);
  }
};
