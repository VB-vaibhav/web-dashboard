// const Header = ({dark, onToggleMobile, onToggleTheme }) => {
//     return (
//         <header className={`h-16 shadow flex items-center justify-between px-4 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//         {/* <header className="h-16 shadow flex items-center justify-between bg-white px-4"> */}
//             <div className="flex items-center gap-2">
//                 <button className="md:hidden" onClick={onToggleMobile}>☰</button>
//                 <input className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300" placeholder="Search..." />
//             </div>
//             <div className="flex items-center gap-4 text-xl">
//                 <button>🔔</button>
//                 <button onClick={onToggleTheme}>🌓</button>
//                 <button>👤</button>
//             </div>
//         </header>
//     );
// };

// export default Header;


// src/components/Header.jsx
// import { Sun, Moon } from 'lucide-react';

// const Header = ({ dark, onToggleMobile, onToggleTheme }) => {
//   return (
//     <header className={`h-16 duration-300 ease-in-out shadow flex items-center justify-between px-4 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//       <div className="flex items-center gap-2">
//         <button className="md:hidden" onClick={onToggleMobile}>☰</button>
//         <input
//           className={`px-3 py-1 duration-300 ease-in-out shadow border rounded text-sm focus:outline-none focus:ring focus:ring-blue-300
//             ${dark
//               ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-400'
//               : 'bg-white border-gray-300 text-gray-900'
//             }`}
//           placeholder="Search..."
//         />
//       </div>
//       <div className="flex items-center gap-4 text-xl">
//         <button>🔔</button>
//         <button onClick={onToggleTheme}>
//           {dark ? <Moon size={22} /> : <Sun size={22} />}
//         </button>
//         <button>👤</button>
//       </div>
//     </header>
//   );
// };

// export default Header;


import React from 'react';
import { useLocation } from 'react-router-dom';
import { Sun, Moon, RefreshCcw, Bell, User, HelpCircle, Grid, Search } from 'lucide-react';

const routeTitles = {
  '/dashboard': 'Dashboard',
  '/renewals': 'Manage Renewals',
  '/clients': 'Clients',
  '/clients/cloud': 'Cloud Server Clients',
  '/clients/cerberus': 'Cerberus Clients',
  '/clients/proxy': 'Proxy Clients',
  '/clients/storage': 'Storage Server Clients',
  '/clients/varys': 'Varys Clients',
  '/notification-scheduler': 'Notification Scheduler',
  '/mail-scheduler': 'Mail Scheduler',
  '/reports': 'Reports',
  '/settings': 'Settings',
};

const Header = ({ dark, onToggleMobile, onToggleTheme, activeIcon }) => {
  const iconClass = (icon) =>
    `p-2 rounded-full transition ${activeIcon === icon
      ? dark
        ? 'bg-gray-600 text-white'
        : 'bg-indigo-100 text-indigo-600'
      : dark
        ? 'hover:bg-gray-600 hover:text-white text-gray-500'
        : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'
    }`;
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';

  return (
    <header className={`relative h-16 flex items-center justify-between px-4  ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <button className="md:hidden" onClick={onToggleMobile}>☰</button>
      {/* LEFT: Page title */}
      <div className="text-lg text-indigo-600 font-semibold min-w-[180px] pl-4 md:pl-6 lg:pl-6">
        {pageTitle}
      </div>

      {/* CENTER: Search bar */}
      <div className="absolute left-1/2 transform -translate-x-1/2 w-60 md:w-72">
        <div className="relative">
          <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
            <Search size={16} />
          </span>
          <input
            type="text"
            placeholder="Global Search"
            className={`w-full pl-10 pr-4 py-1 rounded-full border text-sm transition focus:outline-none focus:ring 
            ${dark ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'}`}
          />
        </div>
      </div>

      {/* RIGHT: Icons */}
      {/* <div className="flex items-center gap-4 text-xl">
        <button className="hover:text-indigo-500" title="Refresh">
          <RefreshCcw size={20} />
        </button>
        <button className="hover:text-yellow-500" title="Notifications">
          <Bell size={20} />
        </button>
        <button className="hover:text-purple-500" title="Help & Support">
          <HelpCircle size={20} />
        </button>
        <button className="hover:text-black" title="Add-ons">
          <Grid size={20} />
        </button>
        <button onClick={onToggleTheme} title="Toggle Theme">
          {dark ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <button className="hover:text-purple-500" title="Profile">
          <User size={20} />
        </button>
      </div> */}
      {/* <div className="flex items-center gap-1 text-xl">
        <button
          className={`p-2 rounded-full transition 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Refresh"
        >
          <RefreshCcw size={18} />
        </button>

        <button
          className={`p-2 rounded-full transition 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Notifications"
        >
          <Bell size={18} />
        </button>

        <button
          className={`p-2 rounded-full transition 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Help & Support"
        >
          <HelpCircle size={18} />
        </button>

        <button
          className={`p-2 rounded-full transition 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Add-ons"
        >
          <Grid size={18} />
        </button>

        <button
          onClick={onToggleTheme}
          className={`p-2 rounded-full transition 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Toggle Theme"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <button
          className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Profile"
        >
          <img
            src="https://i.pravatar.cc/40?img=4"
            alt="User"
            className="w-full h-full object-cover"
          />
        </button>
      </div> */}
      <div className="flex items-center gap-2 text-xl">

        {/* <button className={iconClass('refresh')} title="Refresh">
          <RefreshCcw size={18} />
        </button>

        <button className={iconClass('notifications')} title="Notifications">
          <Bell size={18} />
        </button>

        <button className={iconClass('help')} title="Help & Support">
          <HelpCircle size={18} />
        </button>

        <button className={iconClass('addons')} title="Add-ons">
          <Grid size={18} />
        </button> */}

        <button
          onClick={onToggleTheme}
          className={iconClass('theme')}
          title="Toggle Theme"
        >
          {dark ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        {/* <button className={`${iconClass('profile')} w-8 h-8 border overflow-hidden`} title="Profile">
          <img
            src="https://i.pravatar.cc/40?img=4"
            alt="User"
            className="w-full h-full object-cover"
          /> */}
        <button
          className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
      ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
          title="Profile"
        >
          <img
            src="https://i.pravatar.cc/40?img=4"
            alt="User"
            className="w-full h-full object-cover"
          />
        </button>
      </div>
    </header>
  );
};

export default Header;
