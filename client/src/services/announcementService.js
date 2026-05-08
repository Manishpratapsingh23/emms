import api from './api';

export const announcementService = {
  getAllAnnouncements: async () => {
    const response = await api.get('/announcements');
    return response.data;
  },
  
  createAnnouncement: async (data) => {
    const response = await api.post('/announcements', data);
    return response.data;
  },
  
  deleteAnnouncement: async (id) => {
    const response = await api.delete(`/announcements/${id}`);
    return response.data;
  }
};
