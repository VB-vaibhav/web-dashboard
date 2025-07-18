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
  Settings, HelpCircle, Grid, Sun, Moon, User
} from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { hasAccess } from '../utils/accessUtils';
import { useProfile } from '../context/ProfileContext';


const Sidebar = ({ dark, collapsed, toggleCollapsed, isMobile, setIsMobileOpen, isMobileOpen, onToggleTheme, setShowHelp }) => {
  const location = useLocation();
  const permissions = useSelector(state => state.auth.permissions) || {};
  const { openProfile } = useProfile();

  const username = useSelector(state => state.auth.username);
  const name = useSelector(state => state.auth.name); // if available
  const role = useSelector(state => state.auth.role);
  const avatarUrl = useSelector(state => state.auth.avatarUrl) || 'https://i.pravatar.cc/100?u=default';
  const navigate = useNavigate(); // to handle navigation


  const isActive = (path) =>
    location.pathname === path || (path === '/dashboard' && location.pathname === '/');

  const iconClass = `p-2 rounded-full transition ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`;

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
    { label: 'Notification scheduler', to: '/notification-scheduler', icon: Bell, roles: ['superadmin', 'admin', 'middleman'], key: 'is_notification' },
    { label: 'Mail scheduler', to: '/mail-scheduler', icon: Mail, roles: ['superadmin', 'admin', 'middleman'], key: 'is_mail' },
    { label: 'Reports', to: '/reports', icon: BarChart2, roles: ['superadmin', 'admin', 'middleman'], key: 'is_reports' },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['superadmin', 'admin', 'middleman'], key: 'is_settings' },
  ];
  const mobileOnlyLinks = [
    { label: 'Help', icon: HelpCircle, to: '/help' },
    { label: 'Add-ons', icon: Grid },
    { label: 'Theme', icon: dark ? Sun : Moon, onClick: onToggleTheme },
    // {
    //   label: 'Profile', icon: () => (
    //     <img
    //       src="https://i.pravatar.cc/40?img=4"
    //       alt="User"
    //       className="w-5 h-5 rounded-full object-cover"
    //     />
    //   )
    // }
    // {
    //   label: 'Profile', icon: User, to: '/profile'
    // }
  ];
  return (
    <aside className={`fixed top-0 left-0 h-screen z-50 transition-[width,transform] duration-300 ease-in-out
  ${dark ? 'bg-gray-900' : 'bg-white'} shadow-md`}>
      <div className="fixed md:relative z-40 h-screen">
        {/* Mobile Slide Container */}
        <div
          className={`
      h-screen shadow transform transition-transform duration-300 ease-in-out
      ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      ${collapsed ? 'w-16' : 'w-64'}
      overflow-hidden
      flex flex-col
      absolute md:relative md:translate-x-0
    `}
          style={
            isMobile
              ? { transitionProperty: 'transform' } // Only animate slide
              : {
                width: collapsed ? '4rem' : '16rem',
                transitionProperty: 'width'
              }
          }

        >
          {/* <div
          className={`transition-transform duration-300 ease-in-out
      h-screen overflow-hidden flex flex-col
      ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
      ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
      ${collapsed ? 'w-16' : 'w-64'}
      absolute md:relative md:translate-x-0
    `}
          style={{ transitionProperty: 'width, transform' }} // ensures both animate
        > */}
          {/* <div
          className={`h-screen overflow-hidden flex flex-col
    transform transition-transform duration-300 ease-in-out
    ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
    ${isMobile ? (isMobileOpen ? 'translate-x-0' : '-translate-x-full') : 'translate-x-0'}
    ${collapsed ? 'w-16' : 'w-64'}
    absolute md:relative md:translate-x-0
  `}
          style={{ transitionProperty: 'width, transform' }}
        > */}


          {/* Top Heading and Collapse Button */}
          <div className="px-4 pt-4">
            {/* {!collapsed && <h2 className="font-bold text-lg">Management Panel</h2>} */}
            <h2 className="font-bold text-lg tracking-wide mb-4">
              {collapsed ? 'MP' : 'Management Panel'}
            </h2>
            {!collapsed && isMobile && (
              <div
                className="flex items-center gap-3 mt-4 px-2 cursor-pointer"
                onClick={() =>
                  navigate('/profile')
                }
              >
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div className="leading-tight">
                  <div className={`text-sm font-semibold ${dark ? 'text-white' : 'text-indigo-600'} `}>{name || username}</div>
                  <div className="text-xs text-gray-500 capitalize">{role}</div>
                </div>
              </div>
            )}
            <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed(true)} className={`w-5 h-5 flex items-center justify-center rounded-full border ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-800 border-gray-200'} absolute right-[-8px] top-6`}>
              {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            </button>
            {/* <div className="absolute top-8 -translate-y-1/2 right-[-10px] z-10">
              <button
                onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()}
                className={`w-6 h-6 flex items-center justify-center rounded-full border 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-400 border-gray-600'
                    : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-800 border-gray-300'}`}
              >
                {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
              </button>
            </div> */}

          </div>
          {/* Full height flex column
      {/* TOP LINKS */}
          <div className="flex-1 flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 overflow-y-scroll no-scrollbar">
              < nav className="px-2 mt-4 space-y-2">
                {
                  linksTop.map(({ label, to, icon: Icon, roles, key }) => {
                    // Skip if role not allowed
                    if (!roles.includes(role)) return null;

                    // For admin or middleman, check flag key
                    if (key && !hasAccess(role, permissions, key)) return null;

                    return (
                      <Link
                        to={to}
                        key={label}
                        onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed(true)}
                        className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium
                
                ${isActive(to)
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
            <div className="px-2 pb-4 pt-4 overflow-y-scroll no-scrollbar">
              <hr className={`my-4 mx-4 border-t ${dark ? 'border-gray-700' : 'border-gray-200'}`} />

              <nav className=" space-y-2">
                {linksBottom.map(({ label, to, icon: Icon, roles, key }) => {
                  if (!roles.includes(role)) return null;
                  if ((role === 'admin' || role === 'middleman') && key && permissions[key] !== 1) return null;

                  return (
                    <Link
                      to={to}
                      key={label}
                      onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed(true)}
                      className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium
                ${isActive(to)
                          ? (dark ? 'bg-gray-600 text-white' : 'bg-indigo-100 text-indigo-600')
                          : (dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500')}
                  `}
                    >
                      <Icon size={18} />
                      {!collapsed && label}
                    </Link>
                  );
                }
                )}

                {/* ✅ MOBILE-ONLY EXTRA ICONS */}
                <div className="block md:hidden space-y-2">
                  {mobileOnlyLinks.map(({ label, icon: Icon, to, onClick }) =>
                    to ? (
                      <Link
                        to={to}
                        key={label}
                        onClick={() => { if (isMobile) setIsMobileOpen(false); }}
                        className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium w-full ${iconClass}`}
                        title={label}
                      >
                        {typeof Icon === 'function' ? <Icon /> : <Icon size={18} />}
                        {!collapsed && label}
                      </Link>
                    ) : (
                      <button
                        key={label}
                        onClick={onClick}
                        className={`flex items-center ${collapsed ? 'justify-center px-0' : 'gap-3 px-3'} py-2 rounded-md text-sm font-medium w-full ${iconClass} ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
                        title={label}
                      >
                        {typeof Icon === 'function' ? <Icon /> : <Icon size={18} />}
                        {!collapsed && label}
                      </button>
                    )
                  )}
                </div>

              </nav>
            </div >
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
