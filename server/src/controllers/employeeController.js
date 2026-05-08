import User from '../models/User.js';

export const getAllEmployees = async (req, res, next) => {
  try {
    const { search, department, status, page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const query = { role: 'employee' };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { designation: { $regex: search, $options: 'i' } }
      ];
    }
    if (department) query.department = department;
    if (status) query.status = status;

    const total = await User.countDocuments(query);
    const employees = await User.find(query)
      .populate('department', 'name')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ employees, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id).populate('department', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, phone, department, designation, salary, joiningDate, status, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'Email already exists' });
    const employee = await User.create({
      name, email, password: password || 'password123', phone, department: department || null,
      designation, salary, joiningDate, status: status || 'active', role: role || 'employee'
    });
    const populated = await User.findById(employee._id).populate('department', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, phone, department, designation, salary, joiningDate, status, role } = req.body;
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, department: department || null, designation, salary, joiningDate, status, role },
      { new: true, runValidators: true }
    ).populate('department', 'name');
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    next(error);
  }
};

export const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee deleted successfully' });
  } catch (error) {
    next(error);
  }
};
