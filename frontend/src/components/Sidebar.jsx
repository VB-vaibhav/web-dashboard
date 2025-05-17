// src/components/Sidebar.jsx
import {
  LayoutDashboard,
  Users,
  UserCog,
  Server,
  Shield,
  Globe,
  HardDrive,
  Network,
  Bell,
  Mail,
  BarChart2,
  Settings
} from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Sidebar = ({ dark, collapsed, toggleCollapsed, isMobile, setIsMobileOpen }) => {
  const location = useLocation();
  const role = localStorage.getItem('role') || 'superadmin';
  const permissions = JSON.parse(localStorage.getItem('permissions')) || {};

  const linksTop = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Manage Renewals', to: '/renewals', icon: UserCog, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Clients', to: '/clients', icon: Users, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Cloud Server Clients', to: '/clients/cloud', icon: Server, roles: ['superadmin', 'admin', 'middleman'], key: 'is_vps' },
    { label: 'Cerberus Clients', to: '/clients/cerberus', icon: Shield, roles: ['superadmin', 'admin', 'middleman'], key: 'is_cerberus' },
    { label: 'Proxy Clients', to: '/clients/proxy', icon: Globe, roles: ['superadmin', 'admin', 'middleman'], key: 'is_proxy' },
    { label: 'Storage Server Clients', to: '/clients/storage', icon: HardDrive, roles: ['superadmin', 'admin', 'middleman'], key: 'is_storage' },
    { label: 'Varys Clients', to: '/clients/varys', icon: Network, roles: ['superadmin', 'admin', 'middleman'], key: 'is_varys' },
  ];

  const linksBottom = [
    { label: 'Notification scheduler', to: '/notification-scheduler', icon: Bell, roles: ['admin', 'superadmin'] },
    { label: 'Mail scheduler', to: '/mail-scheduler', icon: Mail, roles: ['superadmin'] },
    { label: 'Reports', to: '/reports', icon: BarChart2, roles: ['superadmin'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['superadmin'] },
  ];
  return (
    <div 
    className={`
      fixed md:relative z-40 transition-[width] duration-300 ease-in-out shadow
      ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? 'block' : 'hidden'} md:block
      ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      h-screen flex flex-col
    `}>
      {/* Top Heading and Collapse Button */}
      <div className="relative flex justify-between items-center h-16 px-4">
        {/* {!collapsed && <h2 className="font-bold text-lg">Management Panel</h2>} */}
        <h2 className="font-bold text-lg tracking-wide">
          {collapsed ? 'MP' : 'Management Panel'}
        </h2>
        <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()} className={`w-5 h-5 flex items-center justify-center rounded-full border ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-800 border-gray-200'} absolute right-[-10px] top-6`}>
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      {/* Full height flex column
      {/* TOP LINKS */}
      <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-y-auto">
          < nav className="px-2 mt-4 space-y-2">
            {
              linksTop.map(({ label, to, icon: Icon, roles, key }) => {
                // Skip if role not allowed
                if (!roles.includes(role)) return null;

                // For admin or middleman, check flag key
                if ((role === 'admin' || role === 'middleman') && key && permissions[key] !== 1) return null;

                return (
                  <Link
                    to={to}
                    key={label}
                    className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium
                
                ${location.pathname === to
                        ? (dark ? 'bg-gray-600 text-white' : 'bg-indigo-100 text-indigo-600')
                        : (dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500')}
                  `}
                  >
                    <Icon size={18} />
                    {!collapsed && label}
                  </Link>
                );
              }
              )
            }
          </nav >
        </div>
        {/* BOTTOM LINKS - Stick to Bottom */}
        {/* <div className="absolute bottom-0 left-0 right-0 pt-4 pb-6 border-t border-gray-200 dark:border-gray-700"> */}
        <div className="px-2 pb-6 pt-4">
          <hr className={`my-4 mx-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`} />

          <nav className="px-2 space-y-2">
            {linksBottom.map(({ label, to, icon: Icon, roles }) =>
              roles.includes(role) && (
                <Link
                  to={to}
                  key={label}
                  className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium
                ${location.pathname === to
                      ? (dark ? 'bg-gray-600 text-white' : 'bg-indigo-100 text-indigo-600')
                      : (dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500')}
                  `}
                >
                  <Icon size={18} />
                  {!collapsed && label}
                </Link>
              )
            )}
          </nav>
        </div >
      </div>
    </div>
  );
};

export default Sidebar;
