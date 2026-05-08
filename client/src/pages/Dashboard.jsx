import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { FiUsers, FiFolder, FiCalendar, FiCheckCircle, FiDollarSign } from 'react-icons/fi';

const StatCard = ({ title, value, icon: Icon, bgClass, textClass }) => (
  <div className="card flex items-center p-6">
    <div className={`p-4 rounded-full ${bgClass} mr-4`}>
      <Icon className={`w-8 h-8 ${textClass}`} />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">{title}</p>
      <h3 className="text-3xl font-bold text-gray-800 mt-1">{value}</h3>
    </div>
  </div>
);

const AdminDashboard = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Employees" value={stats.totalEmployees} icon={FiUsers} bgClass="bg-indigo-600/10" textClass="text-indigo-600" />
        <StatCard title="Departments" value={stats.totalDepartments} icon={FiFolder} bgClass="bg-purple-500/10" textClass="text-purple-500" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FiCalendar} bgClass="bg-indigo-500/10" textClass="text-indigo-500" />
        <StatCard title="Present Today" value={stats.presentToday} icon={FiCheckCircle} bgClass="bg-teal-500/10" textClass="text-teal-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Leave Requests</h2>
          <div className="space-y-4">
            {stats.recentLeaves?.map(leave => (
              <div key={leave._id} className="flex justify-between items-center p-3 hover:bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {leave.employee?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{leave.employee?.name}</p>
                    <p className="text-sm text-gray-500">{leave.leaveType} Leave</p>
                  </div>
                </div>
                <span className={`badge ${leave.status === 'pending' ? 'badge-warning' : leave.status === 'approved' ? 'badge-success' : 'badge-danger'}`}>
                  {leave.status}
                </span>
              </div>
            ))}
            {!stats.recentLeaves?.length && <p className="text-gray-500 text-sm">No recent leave requests.</p>}
          </div>
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Announcements</h2>
          <div className="space-y-4">
            {stats.recentAnnouncements?.map(ann => (
              <div key={ann._id} className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg">
                <h3 className="font-medium text-gray-800">{ann.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.description}</p>
              </div>
            ))}
            {!stats.recentAnnouncements?.length && <p className="text-gray-500 text-sm">No announcements.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const EmployeeDashboard = ({ stats }) => {
  if (!stats) return null;
  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Total Attendance" value={stats.totalAttendance} icon={FiCheckCircle} bgClass="bg-teal-500/10" textClass="text-teal-500" />
        <StatCard title="Approved Leaves" value={stats.approvedLeaves} icon={FiCalendar} bgClass="bg-indigo-600/10" textClass="text-indigo-600" />
        <StatCard title="Pending Leaves" value={stats.pendingLeaves} icon={FiCalendar} bgClass="bg-indigo-500/10" textClass="text-indigo-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Latest Payroll</h2>
          {stats.latestPayroll ? (
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
               <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600 font-medium">Month/Year:</span>
                <span className="font-semibold">{stats.latestPayroll.month}/{stats.latestPayroll.year}</span>
              </div>
              <div className="flex justify-between items-center mb-4">
                <span className="text-gray-600">Net Salary</span>
                <span className="font-bold text-teal-600">${stats.latestPayroll.netSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600 font-medium">Status:</span>
                <span className={`badge ${stats.latestPayroll.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>
                  {stats.latestPayroll.paymentStatus}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No payroll records available.</p>
          )}
        </div>

        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Announcements</h2>
          <div className="space-y-4">
            {stats.recentAnnouncements?.map(ann => (
              <div key={ann._id} className="p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-lg">
                <h3 className="font-medium text-gray-800">{ann.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{ann.description}</p>
              </div>
            ))}
            {!stats.recentAnnouncements?.length && <p className="text-gray-500 text-sm">No announcements.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/employee';
        const res = await api.get(endpoint);
        setStats(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard stats', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchStats();
  }, [user]);

  if (loading) return <div>Loading dashboard...</div>;

  return user?.role === 'admin' ? <AdminDashboard stats={stats} /> : <EmployeeDashboard stats={stats} />;
};

export default Dashboard;
