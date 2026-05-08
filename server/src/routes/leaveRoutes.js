import express from 'express';
import { applyLeave, getMyLeaves, getAllLeaves, updateLeaveStatus, deleteLeave } from '../controllers/leaveController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/', applyLeave);
router.get('/my', getMyLeaves);
router.get('/', requireAdmin, getAllLeaves);
router.put('/:id/status', requireAdmin, updateLeaveStatus);
router.delete('/:id', deleteLeave);

export default router;
