import express from 'express';
import { getAllEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from '../controllers/employeeController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', requireAdmin, getAllEmployees);
router.get('/:id', requireAdmin, getEmployeeById);
router.post('/', requireAdmin, createEmployee);
router.put('/:id', requireAdmin, updateEmployee);
router.delete('/:id', requireAdmin, deleteEmployee);

export default router;
