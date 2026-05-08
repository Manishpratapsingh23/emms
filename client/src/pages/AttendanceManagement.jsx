import { useState, useEffect } from 'react';
import { attendanceService } from '../services/attendanceService';
import api from '../services/api';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';
import { FiPlus } from 'react-icons/fi';

const AttendanceManagement = () => {
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    employee: '',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: '17:00',
    status: 'present'
  });

  const fetchInitialData = async () => {
    try {
      const [attendanceRes, employeeRes] = await Promise.all([
        attendanceService.getAllAttendance(),
        api.get('/employees')
      ]);
      setAttendances(Array.isArray(attendanceRes) ? attendanceRes : []);
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

  const fetchAttendances = async () => {
    try {
      const data = await attendanceService.getAllAttendance();
      setAttendances(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch attendance records');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dateTimeIn = new Date(`${formData.date}T${formData.clockIn}`);
      const dateTimeOut = new Date(`${formData.date}T${formData.clockOut}`);
      
      await attendanceService.addManualAttendance({
        employee: formData.employee,
        date: formData.date,
        clockIn: dateTimeIn.toISOString(),
        clockOut: dateTimeOut.toISOString(),
        status: formData.status
      });
      
      toast.success('Manual attendance added successfully');
      setIsModalOpen(false);
      fetchAttendances();
      setFormData({
        employee: '',
        date: new Date().toISOString().split('T')[0],
        clockIn: '09:00',
        clockOut: '17:00',
        status: 'present'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add manual attendance');
    }
  };

  if (loading) return <div>Loading...</div>;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'present': return 'badge-success';
      case 'absent': return 'badge-danger';
      case 'late': return 'badge-warning';
      case 'half-day': return 'bg-blue-100 text-blue-800';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-600">Monitor employee attendance records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <FiPlus /> Manual Entry
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Total Hours</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((record) => (
                <tr key={record._id}>
                  <td className="font-medium text-gray-800">
                    {record.employee?.name || 'Unknown'}
                  </td>
                  <td>{new Date(record.date).toLocaleDateString()}</td>
                  <td>{record.clockIn ? new Date(record.clockIn).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                  <td>{record.clockOut ? new Date(record.clockOut).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-'}</td>
                  <td>{record.totalHours ? `${record.totalHours} hrs` : '-'}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(record.status)} capitalize`}>
                      {record.status}
                    </span>
                  </td>
                </tr>
              ))}
              {attendances.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No attendance records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manual Attendance Entry">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
            <select
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.employee}
              onChange={(e) => setFormData({...formData, employee: e.target.value})}
            >
              <option value="">Select Employee</option>
              {employees.map(emp => (
                <option key={emp._id} value={emp._id}>{emp.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clock In Time</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.clockIn}
                onChange={(e) => setFormData({...formData, clockIn: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Clock Out Time</label>
              <input
                type="time"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
                value={formData.clockOut}
                onChange={(e) => setFormData({...formData, clockOut: e.target.value})}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={formData.status}
              onChange={(e) => setFormData({...formData, status: e.target.value})}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="late">Late</option>
              <option value="half-day">Half Day</option>
            </select>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button type="button" onClick={() => setIsModalOpen(false)} className="btn hover:bg-gray-100 border border-gray-300 text-gray-700">
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Add Record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AttendanceManagement;
