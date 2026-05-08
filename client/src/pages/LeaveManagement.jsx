import { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import toast from 'react-hot-toast';
import { FiCheck, FiX } from 'react-icons/fi';

const LeaveManagement = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLeaves = async () => {
    try {
      const data = await leaveService.getAllLeaves();
      setLeaves(Array.isArray(data) ? data : []);
    } catch (error) {
      toast.error('Failed to fetch leaves');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await leaveService.updateLeaveStatus(id, status);
      toast.success(`Leave ${status} successfully`);
      fetchLeaves();
    } catch (error) {
      toast.error('Failed to update leave status');
    }
  };

  if (loading) return <div>Loading...</div>;

  const getStatusBadge = (status) => {
    switch(status) {
      case 'approved': return 'badge-success';
      case 'rejected': return 'badge-danger';
      default: return 'badge-warning';
    }
  };

  return (
    <div className="animate-fade-in max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
        <p className="text-gray-600">Review and manage employee leave requests</p>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Dates</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave._id}>
                  <td className="font-medium text-gray-800">
                    {leave.employee?.name || 'Unknown'}
                  </td>
                  <td className="capitalize">{leave.leaveType}</td>
                  <td>
                    {new Date(leave.startDate).toLocaleDateString()} - {new Date(leave.endDate).toLocaleDateString()}
                  </td>
                  <td className="max-w-xs truncate" title={leave.reason}>{leave.reason}</td>
                  <td>
                    <span className={`badge ${getStatusBadge(leave.status)} capitalize`}>
                      {leave.status}
                    </span>
                  </td>
                  <td>
                    {leave.status === 'pending' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleUpdateStatus(leave._id, 'approved')}
                          className="flex items-center gap-1 text-teal-600 bg-teal-50 px-2 py-1 rounded hover:bg-teal-100 text-sm font-medium"
                        >
                          <FiCheck /> Approve
                        </button>
                        <button 
                          onClick={() => handleUpdateStatus(leave._id, 'rejected')}
                          className="flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded hover:bg-red-100 text-sm font-medium"
                        >
                          <FiX /> Reject
                        </button>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">Processed</span>
                    )}
                  </td>
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-500">
                    No leave requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LeaveManagement;
