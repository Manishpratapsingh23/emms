import express from 'express';
import { getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { protect, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getAllAnnouncements);
router.post('/', requireAdmin, createAnnouncement);
router.put('/:id', requireAdmin, updateAnnouncement);
router.delete('/:id', requireAdmin, deleteAnnouncement);

export default router;
