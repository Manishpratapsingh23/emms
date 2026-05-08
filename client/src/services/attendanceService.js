import api from './api';

export const attendanceService = {
  getMyAttendance: async () => {
    const response = await api.get('/attendance/my');
    return response.data;
  },
  
  getAllAttendance: async () => {
    const response = await api.get('/attendance');
    return response.data;
  },
  
  getTodayStatus: async () => {
    const response = await api.get('/attendance/today');
    return response.data;
  },
  
  clockIn: async () => {
    const response = await api.post('/attendance/clock-in');
    return response.data;
  },
  
  clockOut: async () => {
    const response = await api.post('/attendance/clock-out');
    return response.data;
  },
  
  addManualAttendance: async (data) => {
    const response = await api.post('/attendance/manual', data);
    return response.data;
  }
};
