import express from 'express';
import { clockIn, clockOut, getMyAttendance, getAllAttendance, addManualAttendance, getTodayStatus } from '../controllers/attendanceController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.post('/clock-in', clockIn);
router.post('/clock-out', clockOut);
router.get('/my', getMyAttendance);
router.get('/today', getTodayStatus);
router.get('/', requireAdmin, getAllAttendance);
router.post('/manual', requireAdmin, addManualAttendance);

export default router;
