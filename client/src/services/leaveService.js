import api from './api';

export const leaveService = {
  getMyLeaves: async () => {
    const response = await api.get('/leaves/my');
    return response.data;
  },
  
  getAllLeaves: async () => {
    const response = await api.get('/leaves');
    return response.data;
  },
  
  applyLeave: async (data) => {
    const response = await api.post('/leaves', data);
    return response.data;
  },
  
  updateLeaveStatus: async (id, status) => {
    const response = await api.put(`/leaves/${id}/status`, { status });
    return response.data;
  },
  
  deleteLeave: async (id) => {
    const response = await api.delete(`/leaves/${id}`);
    return response.data;
  }
};
