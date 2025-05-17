import React from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({ collapsed, toggleCollapsed, isMobile, setIsMobileOpen }) => {
  const role = localStorage.getItem('role');

  const routes = [
    { label: 'Dashboard', to: '/dashboard', roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Manage Renewals', to: '/renewals', roles: ['superadmin', 'admin'] },
    { label: 'Clients', to: '/clients', roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Reports', to: '/reports', roles: ['superadmin'] },
    { label: 'Mail Scheduler', to: '/mail-scheduler', roles: ['superadmin'] },
    { label: 'Notification Scheduler', to: '/notification-scheduler', roles: ['admin', 'superadmin'] },
    { label: 'Settings', to: '/settings', roles: ['superadmin'] },
  ];

  return (
    <div className={`
      fixed md:relative h-full z-40 transition-all bg-white shadow-lg
      ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? 'block' : 'hidden'} md:block
    `}>
      <div className="flex justify-between items-center p-4">
        {!collapsed && <h2 className="font-bold text-lg">Panel</h2>}
        <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()}>
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>
      <nav className="px-4 space-y-2">
        {routes.map(({ label, to, roles }) =>
          roles.includes(role) && (
            <Link key={label} to={to} className="block py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-2">
              {collapsed ? label[0] : label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
