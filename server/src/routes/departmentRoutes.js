import express from 'express';
import { getAllDepartments, getDepartmentById, createDepartment, updateDepartment, deleteDepartment } from '../controllers/departmentController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getAllDepartments);
router.get('/:id', getDepartmentById);
router.post('/', requireAdmin, createDepartment);
router.put('/:id', requireAdmin, updateDepartment);
router.delete('/:id', requireAdmin, deleteDepartment);

export default router;
