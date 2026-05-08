import { useState, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const MyAttendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [todayStatus, setTodayStatus] = useState({ clockedIn: false, clockedOut: false });
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await api.get('/attendance/my');
      setAttendance(res.data);
      
      const statusRes = await api.get('/attendance/today');
      if (!statusRes.data || !statusRes.data.clockIn) {
        setTodayStatus({ clockedIn: false, clockedOut: false });
      } else {
        setTodayStatus({
          clockedIn: true,
          clockedOut: !!statusRes.data.clockOut
        });
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleClockIn = async () => {
    try {
      await api.post('/attendance/clock-in');
      toast.success('Clocked in successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock in');
    }
  };

  const handleClockOut = async () => {
    try {
      await api.post('/attendance/clock-out');
      toast.success('Clocked out successfully');
      fetchAttendance();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to clock out');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Attendance</h1>
      
      {todayStatus.clockOut && (
        <div className="bg-teal-100 border border-teal-200 text-teal-800 px-4 py-3 rounded-lg mb-6">
          Clocked out successfully.
        </div>
      )}
      
      {!todayStatus.clockOut && todayStatus.clockIn && (
        <div className="bg-indigo-100 border border-indigo-200 text-indigo-800 px-4 py-3 rounded-lg mb-6">
          Clocked in successfully. Don't forget to clock out!
        </div>
      )}

      <div className="flex gap-4 mb-8">
        <button 
          onClick={handleClockIn} 
          disabled={todayStatus.clockIn}
          className={`px-6 py-2 rounded-md font-medium text-white transition-colors ${
            todayStatus.clockIn ? 'bg-teal-300 cursor-not-allowed' : 'bg-[#14B8A6] hover:bg-teal-600'
          }`}
        >
          Clock In
        </button>
        <button 
          onClick={handleClockOut} 
          className="px-6 py-2 rounded-md font-medium text-white transition-colors bg-[#EF4444] hover:bg-red-600"
        >
          Clock Out
        </button>
      </div>

      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Clock In</th>
                <th>Clock Out</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((record) => (
                <tr key={record._id}>
                  <td className="font-medium text-gray-700">{formatDate(record.date)}</td>
                  <td className="text-gray-600">{formatTime(record.clockIn)}</td>
                  <td className="text-gray-600">{formatTime(record.clockOut)}</td>
                </tr>
              ))}
              {attendance.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center py-4 text-gray-500">No attendance records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
