import express from 'express';
import { handleChat, reloadKnowledgeBase } from '../controllers/chatController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All chat routes require authentication
router.use(protect);

// Main chat endpoint
router.post('/', handleChat);

// Admin: Reload knowledge base (after adding new PDFs)
router.post('/reload-kb', requireAdmin, reloadKnowledgeBase);

export default router;
