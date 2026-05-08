import Announcement from '../models/Announcement.js';

export const getAllAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find()
      .populate('createdBy', 'name')
      .sort('-createdAt');
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const announcement = await Announcement.create({
      title, description, priority: priority || 'medium', createdBy: req.user._id
    });
    const populated = await Announcement.findById(announcement._id).populate('createdBy', 'name');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const { title, description, priority } = req.body;
    const announcement = await Announcement.findByIdAndUpdate(
      req.params.id, { title, description, priority },
      { new: true, runValidators: true }
    ).populate('createdBy', 'name');
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json(announcement);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findByIdAndDelete(req.params.id);
    if (!announcement) return res.status(404).json({ message: 'Announcement not found' });
    res.json({ message: 'Announcement deleted successfully' });
  } catch (error) {
    next(error);
  }
};
