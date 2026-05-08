import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import MyAttendance from './pages/MyAttendance';
import MyLeaves from './pages/MyLeaves';
import MyPayroll from './pages/MyPayroll';
import Announcements from './pages/Announcements';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import LeaveManagement from './pages/LeaveManagement';
import PayrollManagement from './pages/PayrollManagement';
import AttendanceManagement from './pages/AttendanceManagement';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<ProtectedRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />
              
              {/* Employee Routes */}
              <Route path="/my-attendance" element={<MyAttendance />} />
              <Route path="/my-leaves" element={<MyLeaves />} />
              <Route path="/my-payroll" element={<MyPayroll />} />
              <Route path="/announcements" element={<Announcements />} />

              {/* Admin Routes */}
              <Route element={<ProtectedRoute role="admin" />}>
                <Route path="/employees" element={<Employees />} />
                <Route path="/departments" element={<Departments />} />
                <Route path="/leaves" element={<LeaveManagement />} />
                <Route path="/payroll" element={<PayrollManagement />} />
                <Route path="/attendance" element={<AttendanceManagement />} />
              </Route>
            </Route>
          </Route>
          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
