import { useState, useEffect } from 'react';
import { payrollService } from '../services/payrollService';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus, FiDollarSign, FiTrash2 } from 'react-icons/fi';

const PayrollManagement = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employee: '',
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    basicSalary: 0,
    bonus: 0,
    deductions: 0
  });

  const fetchInitialData = async () => {
    try {
      const [payrollRes, employeeRes] = await Promise.all([
        payrollService.getAllPayrolls(),
        api.get('/employees')
      ]);
      setPayrolls(Array.isArray(payrollRes) ? payrollRes : []);
      setEmployees(employeeRes.data.employees || []);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchPayrolls = async () => {
    try {
      const data = await payrollService.getAllPayrolls();
      setPayrolls(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch payrolls');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await payrollService.createPayroll(formData);
      toast.success('Payroll record created successfully');
      setIsModalOpen(false);
      fetchPayrolls();
      setFormData({
        employee: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        basicSalary: 0,
        bonus: 0,
        deductions: 0
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create payroll');
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await payrollService.updatePayrollStatus(id, status);
      toast.success('Payment status updated');
      fetchPayrolls();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this payroll record?')) {
      try {
        await payrollService.deletePayroll(id);
        toast.success('Payroll record deleted');
        fetchPayrolls();
      } catch (error) {
        toast.error('Failed to delete payroll record');
      }
    }
  };

  const handleEmployeeChange = (e) => {
    const empId = e.target.value;
    const selectedEmp = employees.find(emp => emp._id === empId);
    setFormData({
      ...formData,
      employee: empId,
      basicSalary: selectedEmp?.salary || 0
    });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Payroll Management</h1>
          <p className="text-gray-600">Generate and manage employee salaries</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Generate Payroll
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Period</th>
                <th>Net Salary</th>
                <th>Status</th>
                <th>Payment Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {payrolls.map((payroll) => (
                <tr key={payroll._id}>
                  <td className="font-medium text-gray-800">
                    {payroll.employee?.name || 'Unknown'}
                  </td>
                  <td>
                    {new Date(`${payroll.year}-${payroll.month}-01`).toLocaleString('default', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="font-bold text-teal-600">${payroll.netSalary.toLocaleString()}</td>
                  <td>
                    <span className={`badge ${payroll.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'} capitalize`}>
                      {payroll.paymentStatus}
                    </span>
                  </td>
                  <td>
                    {payroll.paymentDate ? new Date(payroll.paymentDate).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      {payroll.paymentStatus === 'unpaid' && (
                        <button 
                          onClick={() => handleUpdateStatus(payroll._id, 'paid')}
                          className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 text-sm font-medium"
                        >
                          <FiDollarSign /> Mark Paid
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(payroll._id)}
                        className="p-1.5 text-red-600 bg-red-50 hover:bg-red-100 rounded text-sm font-medium transition-colors"
                        title="Delete Payroll"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {payrolls.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No payroll records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Generate Payroll">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.employee}
              onChange={handleEmployeeChange}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Month (1-12)</label>
              <input
                type="number"
                min="1" max="12"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.month}
                onChange={(e) => setFormData({...formData, month: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
              <input
                type="number"
                min="2000" max="2100"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.year}
                onChange={(e) => setFormData({...formData, year: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Basic Salary ($)</label>
            <input
              type="number"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.basicSalary}
              onChange={(e) => setFormData({...formData, basicSalary: Number(e.target.value)})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bonus ($)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.bonus}
                onChange={(e) => setFormData({...formData, bonus: Number(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deductions ($)</label>
              <input
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.deductions}
                onChange={(e) => setFormData({...formData, deductions: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 mt-2">
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">Calculated Net Salary:</span>
              <span className="font-bold text-lg text-teal-600">
                ${(formData.basicSalary + formData.bonus - formData.deductions).toLocaleString()}
              </span>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn hover:bg-gray-100 border border-gray-300 text-gray-700">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Generate Payroll
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default PayrollManagement;
