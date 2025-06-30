import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  Users, 
  Calendar, 
  FileText, 
  Stethoscope,
  User,
  BarChart3,
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const adminNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Patients', href: '/patients', icon: Users },
    { name: 'Appointments', href: '/incidents', icon: FileText },
    { name: 'Calendar', href: '/calendar', icon: Calendar },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const patientNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'My Profile', href: `/patient/${user?.patientId}`, icon: User },
  ];

  const navItems = user?.role === 'Admin' ? adminNavItems : patientNavItems;

  const isActive = (href) => location.pathname === href;

  return (
    <div className="flex flex-col w-64 bg-white border-r border-gray-200 h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-200">
        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 rounded-lg">
          <Stethoscope className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900">DentalCare</h1>
          <p className="text-xs text-gray-500">Management System</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                  active
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Role Badge */}
        <div className="mt-8 px-3">
          <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
            user?.role === 'Admin' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {user?.role === 'Admin' ? 'Administrator' : 'Patient'}
          </div>
        </div>
      </nav>

      {/* User Info */}
      <div className="px-4 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center gap-3">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="w-8 h-8 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="w-8 h-8 bg-gray-400 rounded-full flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user?.email}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
