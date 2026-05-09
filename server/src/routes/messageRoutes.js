import express from 'express';
import { sendMessage, getMyMessages, markAsRead } from '../controllers/messageController.js';
import { verifyToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin sends message to employee
router.post('/', verifyToken, requireAdmin, sendMessage);

// Employee views their messages
router.get('/my-messages', verifyToken, getMyMessages);

// Employee marks message as read
router.patch('/:id/read', verifyToken, markAsRead);

export default router;
