import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell } from 'react-icons/fi';

const Navbar = ({ toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const dropdownRef = useRef(null);

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
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

        <button onClick={handleLogout} className="btn btn-danger">
          Logout
        </button>

        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
