import api from './api';

export const payrollService = {
  getMyPayrolls: async () => {
    const response = await api.get('/payroll/my');
    return response.data;
  },
  
  getAllPayrolls: async () => {
    const response = await api.get('/payroll');
    return response.data;
  },
  
  createPayroll: async (data) => {
    const response = await api.post('/payroll', data);
    return response.data;
  },
  
  updatePayrollStatus: async (id, status) => {
    const response = await api.put(`/payroll/${id}/status`, { paymentStatus: status });
    return response.data;
  },
  
  deletePayroll: async (id) => {
    const response = await api.delete(`/payroll/${id}`);
    return response.data;
  }
};
