import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiSettings, FiLogOut } from 'react-icons/fi';
import Modal from './Modal';
import api from '../services/api';
import toast from 'react-hot-toast';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const profileDropdownRef = useRef(null);
  
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const notifications = [
    { id: 1, text: 'Welcome to WorkWise AI!', time: '1 hr ago', unread: true },
    { id: 2, text: 'Please complete your profile details.', time: '2 hrs ago', unread: true },
    { id: 3, text: 'System maintenance scheduled for weekend.', time: '1 day ago', unread: false },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    try {
      await api.put('/auth/change-password', {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });
      toast.success('Password changed successfully');
      setIsPasswordModalOpen(false);
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setShowProfileMenu(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="p-2 rounded-md hover:bg-gray-100 lg:hidden">
          <FiMenu size={20} className="text-gray-600" />
        </button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button 
            className="p-2 rounded-full hover:bg-gray-100 relative text-gray-600 focus:outline-none"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FiBell size={20} />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800">Notifications</h3>
                <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all as read</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map(note => (
                  <div key={note.id} className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-50 cursor-pointer ${note.unread ? 'bg-blue-50/30' : ''}`}>
                    <p className="text-sm text-gray-800">{note.text}</p>
                    <p className="text-xs text-gray-400 mt-1">{note.time}</p>
                  </div>
                ))}
              </div>
              <div className="px-4 py-2 text-center border-t border-gray-100">
                <span className="text-sm text-[var(--color-primary)] font-medium cursor-pointer hover:underline">View All</span>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileDropdownRef}>
          <button 
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="w-10 h-10 bg-indigo-100 hover:bg-indigo-200 transition-colors rounded-full flex items-center justify-center font-bold text-indigo-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-offset-2"
          >
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-100 py-2 z-50 animate-fade-in">
              <div className="px-4 py-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-700 text-lg">
                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{user?.name || 'User'}</h3>
                    <p className="text-sm text-gray-500 font-medium capitalize">{user?.role || 'Employee'}</p>
                  </div>
                </div>
                {user?.department?.name && (
                  <div className="mt-3 bg-gray-50 rounded p-2 text-sm">
                    <span className="text-gray-500 block text-xs uppercase tracking-wider mb-0.5">Department</span>
                    <span className="font-medium text-gray-800">{user.department.name}</span>
                  </div>
                )}
              </div>
              
              <div className="py-2">
                <button 
                  onClick={() => setIsPasswordModalOpen(true)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[var(--color-primary)] flex items-center gap-2 transition-colors"
                >
                  <FiSettings className="text-gray-400" /> Change Password
                </button>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors mt-1"
                >
                  <FiLogOut className="text-red-400" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => setIsPasswordModalOpen(false)} 
        title="Change Password"
      >
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Old Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={passwordData.oldPassword}
              onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-[var(--color-primary)]"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
            />
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <button 
              type="button" 
              onClick={() => setIsPasswordModalOpen(false)} 
              className="btn hover:bg-gray-100 border border-gray-300 text-gray-700"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Change Password
            </button>
          </div>
        </form>
      </Modal>
    </header>
  );
};

export default Navbar;
