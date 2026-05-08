import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiGrid, 
  FiUsers, 
  FiFolder, 
  FiCalendar, 
  FiDollarSign, 
  FiClock, 
  FiSpeaker,
  FiBox
} from 'react-icons/fi';
import { BsBuildingFill } from 'react-icons/bs';

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const navItems = isAdmin ? [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Employees', path: '/employees', icon: FiUsers },
    { name: 'Departments', path: '/departments', icon: FiFolder },
    { name: 'Leave Management', path: '/leaves', icon: FiCalendar },
    { name: 'Payroll', path: '/payroll', icon: FiDollarSign },
    { name: 'Attendance', path: '/attendance', icon: FiClock },
    { name: 'Announcements', path: '/announcements', icon: FiSpeaker },
  ] : [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'My Leaves', path: '/my-leaves', icon: FiCalendar },
    { name: 'My Attendance', path: '/my-attendance', icon: FiClock },
    { name: 'My Payroll', path: '/my-payroll', icon: FiDollarSign },
    { name: 'Announcements', path: '/announcements', icon: FiSpeaker },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out z-30 flex flex-col`}>
        
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <div className="flex items-center gap-2 text-[var(--color-primary)]">
            <FiBox size={28} />
            <span className="font-bold text-xl leading-tight">WorkWise<br/>AI</span>
          </div>
        </div>

        <div className="px-4 py-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4 px-2">Main</p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                    isActive 
                      ? 'bg-indigo-50 text-[var(--color-primary)]' 
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
