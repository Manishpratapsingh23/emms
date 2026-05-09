/**
 * WorkWise AI — AI Agent Routes
 * All routes require admin authentication.
 */

import express from 'express';
import {
  handleAgentRequest,
  confirmAgentAction,
  getAgentHistory,
  getAuditLogs,
  clearAgentHistory,
} from '../controllers/aiAgentController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All AI Agent routes require authentication + admin role
router.use(protect);
router.use(requireAdmin);

// POST /api/admin/ai-agent — Main agent endpoint
router.post('/', handleAgentRequest);

// POST /api/admin/ai-agent/confirm — Confirm destructive action
router.post('/confirm', confirmAgentAction);

// GET /api/admin/ai-agent/history — Get chat history
router.get('/history', getAgentHistory);

// DELETE /api/admin/ai-agent/history — Clear chat history
router.delete('/history', clearAgentHistory);

// GET /api/admin/ai-agent/audit — Get audit logs
router.get('/audit', getAuditLogs);

export default router;
