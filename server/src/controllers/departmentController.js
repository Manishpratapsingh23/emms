import Department from '../models/Department.js';
import User from '../models/User.js';

export const getAllDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find()
      .populate('manager', 'name email')
      .populate('employeeCount')
      .sort('-createdAt');
    res.json(departments);
  } catch (error) {
    next(error);
  }
};

export const getDepartmentById = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id)
      .populate('manager', 'name email')
      .populate('employeeCount');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    next(error);
  }
};

export const createDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;
    const department = await Department.create({ name, description, manager: manager || null });
    const populated = await Department.findById(department._id)
      .populate('manager', 'name email')
      .populate('employeeCount');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateDepartment = async (req, res, next) => {
  try {
    const { name, description, manager } = req.body;
    const department = await Department.findByIdAndUpdate(
      req.params.id,
      { name, description, manager: manager || null },
      { new: true, runValidators: true }
    ).populate('manager', 'name email').populate('employeeCount');
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json(department);
  } catch (error) {
    next(error);
  }
};

export const deleteDepartment = async (req, res, next) => {
  try {
    const usersInDept = await User.countDocuments({ department: req.params.id });
    if (usersInDept > 0) {
      return res.status(400).json({ message: 'Cannot delete department with employees. Reassign them first.' });
    }
    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: 'Department not found' });
    res.json({ message: 'Department deleted successfully' });
  } catch (error) {
    next(error);
  }
};
