import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Bars3Icon, XMarkIcon, HomeIcon, BeakerIcon, UserGroupIcon, CubeIcon,ShieldCheckIcon, DocumentChartBarIcon, BuildingOffice2Icon  } from '@heroicons/react/24/outline';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import logo from '../assets/icon.png';
import { Cog8ToothIcon } from '@heroicons/react/24/outline';
const navigation = [
  // { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Contracts', href: '/contracts', icon: BuildingOffice2Icon },

  { name: 'Lab Tests', href: '/lab-tests', icon: BeakerIcon },
  { name: 'Users', href: '/users', icon: UserGroupIcon },
  { name: 'App-Requests', href: '/app-requests', icon: UserGroupIcon },
  { name: 'Materials', href: '/products', icon: CubeIcon },
  { name: 'Test-Schema', href: '/test-schema', icon: ShieldCheckIcon },
  { 
    name: 'System Settings',
    href: '/system-settings',
    icon: Cog8ToothIcon,
  },
   { 
    name: 'Report Schema',
    href: '/report-schema',
    icon: Cog8ToothIcon,
  },
];

export const DashboardLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Add this useEffect to handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Add this after the mobile sidebar overlay and before the main content
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b bg-[#1E3A8A] shadow-lg transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex items-center bg-[#e0f2ff] justify-center h-16 px-4 border-b border-white/10">
          <h1 className="text-xl font-bold text-white">
            <img src={logo} alt="Logo" className="h-12 w-20" />
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-md text-white/70 hover:bg-white/10 lg:hidden"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <nav className="mt-5 px-2">
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`group flex items-center px-4 py-3 text-sm font-medium rounded-md ${
                    isActive
                      ? 'bg-[#7A73D1] text-white'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <item.icon className={`mr-3 h-5 w-5 ${
                    isActive ? 'text-white' : 'text-white/70 group-hover:text-white'
                  }`} />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white rounded-md"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className={`${sidebarOpen ? 'lg:pl-64' : ''} flex flex-col flex-1 transition-all duration-300`}>
        {/* Header with profile menu */}
        <div className="sticky top-0 z-20 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-4">
            <div className="flex items-center lg:hidden">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-md text-gray-500 hover:bg-gray-100"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-2 text-xl font-bold text-gray-900">Civil Lab Admin</h1>
            </div>

            {/* Profile Menu */}
            <div className="ml-auto relative" ref={profileMenuRef}>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
              >
                <UserCircleIcon className="h-8 w-8 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">{localStorage.getItem('name')}</span>
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                  <div 
                    className="py-1" 
                    role="menu" 
                    aria-orientation="vertical" 
                    aria-labelledby="user-menu"
                  >
                    <Link
                      to="/profile"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <UserCircleIcon className="mr-3 h-5 w-5 text-gray-500" />
                      Your Profile
                    </Link>
                    <Link
                      to="/change-password"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                      onClick={() => setProfileMenuOpen(false)}
                    >
                      <KeyIcon className="mr-3 h-5 w-5 text-gray-500" />
                      Change Password
                    </Link>
                    <button
                      onClick={() => {
                        handleLogout();
                        setProfileMenuOpen(false);
                      }}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      role="menuitem"
                    >
                      <span className="mr-3 h-5 w-5 text-gray-500">🚪</span>
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <main className="flex-1">
          <div className="max-w-8xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};