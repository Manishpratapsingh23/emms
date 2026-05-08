import express from 'express';
import { createPayroll, getAllPayrolls, getMyPayrolls, updatePayrollStatus, deletePayroll } from '../controllers/payrollController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/my', getMyPayrolls);
router.get('/', requireAdmin, getAllPayrolls);
router.post('/', requireAdmin, createPayroll);
router.put('/:id/status', requireAdmin, updatePayrollStatus);
router.delete('/:id', requireAdmin, deletePayroll);

export default router;
