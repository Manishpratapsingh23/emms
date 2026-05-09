import express from 'express';
import { sendMessage, getMyMessages, markAsRead } from '../controllers/messageController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin sends message to employee
router.post('/', protect, requireAdmin, sendMessage);

// Employee views their messages
router.get('/my-messages', protect, getMyMessages);

// Employee marks message as read
router.patch('/:id/read', protect, markAsRead);

export default router;
