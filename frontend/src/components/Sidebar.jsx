// import React from 'react';
// import { Link } from 'react-router-dom';

// const Sidebar = ({ dark, collapsed, toggleCollapsed, isMobile, setIsMobileOpen }) => {
//     const role = localStorage.getItem('role') || 'superadmin';

//     const routes = [
//         { label: 'Dashboard', to: '/dashboard', roles: ['superadmin', 'admin', 'middleman'] },
//         { label: 'Manage Renewals', to: '/renewals', roles: ['superadmin', 'admin'] },
//         { label: 'Clients', to: '/clients', roles: ['superadmin', 'admin', 'middleman'] },
//         { label: 'Reports', to: '/reports', roles: ['superadmin'] },
//         { label: 'Mail Scheduler', to: '/mail-scheduler', roles: ['superadmin'] },
//         { label: 'Notification Scheduler', to: '/notification-scheduler', roles: ['admin', 'superadmin'] },
//         { label: 'Settings', to: '/settings', roles: ['superadmin'] },
//     ];

//     return (
//         <div className={`
//       fixed md:relative h-full z-40 transition-all duration-300 ease-in-out
//       shadow-lg ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? 'block' : 'hidden'} md:block
//       ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
//     `}>
//             {/* <div className={`
//       fixed md:relative h-full z-40 transition-all bg-white shadow-lg
//       ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? 'block' : 'hidden'} md:block
//     `}> */}
//             {/* <div className="flex justify-between items-center p-4">
//                 {!collapsed && <h2 className="font-bold text-lg">Panel</h2>}
//                 <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()}>
//                     {collapsed ? '➡️' : '⬅️'}
//                 </button> */}
//             {/* <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-4">
//                     <h2 className="text-xl font-bold mb-6">Dashboard</h2> */}
//             {/* <nav className="flex flex-col gap-4">
//                     <a href="#" className="hover:text-blue-500">Dashboard</a>
//                     <a href="#" className="hover:text-blue-500">Manage Renewals</a>
//                     <a href="#" className="hover:text-blue-500">Clients</a>
//                     <a href="#" className="hover:text-blue-500">Reports</a>
//                     <a href="#" className="hover:text-amber-200">Proxy Clients</a> */}
//             {/* </nav> */}
//             {/* </aside> */}
//             {/* </div> */}
//             <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
//                 {!collapsed && <h2 className="font-bold text-lg mb-2">Panel</h2>}
//                 <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()} className="mb-2">
//                     {collapsed ? '➡️' : '⬅️'}
//                 </button>
//                 {/* <aside className="w-64 bg-white shadow-md hidden md:flex flex-col p-4">
//         <h2 className="text-xl font-bold mb-6">Dashboard</h2> */}
//                 {/* <nav className="flex flex-col gap-4">
//                     <a href="#" className="hover:text-blue-500">Dashboard</a>
//                     <a href="#" className="hover:text-blue-500">Manage Renewals</a>
//                     <a href="#" className="hover:text-blue-500">Clients</a>
//                     <a href="#" className="hover:text-blue-500">Reports</a>
//                     <a href="#" className="hover:text-amber-200">Proxy Clients</a>
//                 </nav> */}
//                 {/* </aside> */}
//             </div>
//             <nav className="px-4 py-2 space-y-2">
//                 {routes.map(({ label, to, roles }) =>
//                     roles.includes(role) && (
//                         <Link key={label} to={to} className="block py-2 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 rounded px-3 font-medium">
//                             {/* <Link key={label} to={to} className="block py-2 text-sm hover:bg-gray-200 rounded px-2"> */}
//                             {collapsed ? label[0] : label}
//                         </Link>
//                     )
//                 )}
//             </nav>
//         </div>
//     );
// };

// export default Sidebar;



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

  const linksTop = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Manage Renewals', to: '/renewals', icon: UserCog, roles: ['superadmin', 'admin'] },
    { label: 'Clients', to: '/clients', icon: Users, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Cloud Server Clients', to: '/clients/cloud', icon: Server, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Cerberus Clients', to: '/clients/cerberus', icon: Shield, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Proxy Clients', to: '/clients/proxy', icon: Globe, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Storage Server Clients', to: '/clients/storage', icon: HardDrive, roles: ['superadmin', 'admin', 'middleman'] },
    { label: 'Varys Clients', to: '/clients/varys', icon: Network, roles: ['superadmin', 'admin', 'middleman'] },
  ];

  const linksBottom = [
    { label: 'Notification scheduler', to: '/notification-scheduler', icon: Bell, roles: ['admin', 'superadmin'] },
    { label: 'Mail scheduler', to: '/mail-scheduler', icon: Mail, roles: ['superadmin'] },
    { label: 'Reports', to: '/reports', icon: BarChart2, roles: ['superadmin'] },
    { label: 'Settings', to: '/settings', icon: Settings, roles: ['superadmin'] },
  ];
  return (
    <div className={`
      fixed md:relative h-full z-40 transition-all duration-300 ease-in-out shadow
      ${collapsed ? 'w-16' : 'w-64'} ${isMobile ? 'block' : 'hidden'} md:block
      ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}
    `}>
      <div className="relative flex justify-between items-center h-16 px-4">
        {!collapsed && <h2 className="font-bold text-lg">Management Panel</h2>}
        <button onClick={() => isMobile ? setIsMobileOpen(false) : toggleCollapsed()} className="w-5 h-5 flex items-center justify-center rounded-full border border-gray-100 bg-white dark:bg-gray-800 text-gray-900 dark:border-gray-600 dark:text-white shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700 absolute right-[-10px] top-6">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
      {/* <nav className="px-4 mt-4 space-y-2">
        {linksTop.map(({ label, to, icon: Icon, roles }) =>
          roles.includes(role) && (
            <Link
              to={to}
              key={label}
              //   className={`block py-2 text-sm rounded px-3 font-medium hover:bg-opacity-75
              //     ${dark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'}`}
              // >
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                ${location.pathname === to
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500 dark:text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          )
        )}
      </nav> */}
      <nav className="px-2 mt-4 space-y-2">
        {linksTop.map(({ label, to, icon: Icon, roles }) =>
          roles.includes(role) && (
            <Link
              to={to}
              key={label}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                ${location.pathname === to
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500 dark:text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          )
        )}
      </nav>
      <hr className="my-4 border-t border-gray-200 dark:border-gray-700" />

      <nav className="px-2 space-y-2">
        {linksBottom.map(({ label, to, icon: Icon, roles }) =>
          roles.includes(role) && (
            <Link
              to={to}
              key={label}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                ${location.pathname === to
                  ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500 dark:text-white'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              <Icon size={18} />
              {!collapsed && label}
            </Link>
          )
        )}
      </nav>
    </div>
  );
};

export default Sidebar;
