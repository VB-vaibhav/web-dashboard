// import React from 'react';
// import { useLocation } from 'react-router-dom';
// import { Sun, Moon, RefreshCcw, Bell, User, HelpCircle, Grid, Search } from 'lucide-react';

// const routeTitles = {
//   '/dashboard': 'Dashboard',
//   '/renewals': 'Manage Renewals',
//   '/clients': 'Clients',
//   '/clients/cloud': 'Cloud Server Clients',
//   '/clients/cerberus': 'Cerberus Clients',
//   '/clients/proxy': 'Proxy Clients',
//   '/clients/storage': 'Storage Server Clients',
//   '/clients/varys': 'Varys Clients',
//   '/notification-scheduler': 'Notification Scheduler',
//   '/mail-scheduler': 'Mail Scheduler',
//   '/reports': 'Reports',
//   '/settings': 'Settings',
// };

// const Header = ({ dark, onToggleMobile, onToggleTheme, activeIcon }) => {
//   const iconClass = (icon) =>
//     `p-2 rounded-full transition ${activeIcon === icon
//       ? dark
//         ? 'bg-gray-600 text-white'
//         : 'bg-indigo-100 text-indigo-600'
//       : dark
//         ? 'hover:bg-gray-600 hover:text-white text-gray-500'
//         : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'
//     }`;
//   const location = useLocation();
//   const pageTitle = routeTitles[location.pathname] || 'Dashboard';

//   return (
//     <header className={`relative h-16 flex items-center justify-between px-4  ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//       <button className="md:hidden" onClick={onToggleMobile}>☰</button>
//       {/* LEFT: Page title */}
//       <div className="text-lg text-indigo-600 font-semibold min-w-[180px] pl-4 md:pl-6 lg:pl-6">
//         {pageTitle}
//       </div>

//       {/* CENTER: Search bar */}
//       <div className="absolute left-1/2 transform -translate-x-1/2 w-60 md:w-72">
//         <div className="relative">
//           <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
//             <Search size={16} />
//           </span>
//           <input
//             type="text"
//             placeholder="Global Search"
//             className={`w-full pl-10 pr-4 py-1 rounded-md border text-sm transition focus:outline-none focus:ring 
//             ${dark ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400' : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
//           />
//         </div>
//       </div>

//       {/* RIGHT: Icons */}
//       {/* <div className="flex items-center gap-4 text-xl">
//         <button className="hover:text-indigo-500" title="Refresh">
//           <RefreshCcw size={20} />
//         </button>
//         <button className="hover:text-yellow-500" title="Notifications">
//           <Bell size={20} />
//         </button>
//         <button className="hover:text-purple-500" title="Help & Support">
//           <HelpCircle size={20} />
//         </button>
//         <button className="hover:text-black" title="Add-ons">
//           <Grid size={20} />
//         </button>
//         <button onClick={onToggleTheme} title="Toggle Theme">
//           {dark ? <Moon size={20} /> : <Sun size={20} />}
//         </button>
//         <button className="hover:text-purple-500" title="Profile">
//           <User size={20} />
//         </button>
//       </div> */}
//       {/* <div className="flex items-center gap-1 text-xl">
//         <button
//           className={`p-2 rounded-full transition 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Refresh"
//         >
//           <RefreshCcw size={18} />
//         </button>

//         <button
//           className={`p-2 rounded-full transition 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Notifications"
//         >
//           <Bell size={18} />
//         </button>

//         <button
//           className={`p-2 rounded-full transition 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Help & Support"
//         >
//           <HelpCircle size={18} />
//         </button>

//         <button
//           className={`p-2 rounded-full transition 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Add-ons"
//         >
//           <Grid size={18} />
//         </button>

//         <button
//           onClick={onToggleTheme}
//           className={`p-2 rounded-full transition 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Toggle Theme"
//         >
//           {dark ? <Moon size={18} /> : <Sun size={18} />}
//         </button>

//         <button
//           className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Profile"
//         >
//           <img
//             src="https://i.pravatar.cc/40?img=4"
//             alt="User"
//             className="w-full h-full object-cover"
//           />
//         </button>
//       </div> */}
//       <div className="flex items-center gap-2 text-xl">

//         <button className={iconClass('refresh')} title="Refresh">
//           <RefreshCcw size={18} />
//         </button>

//         <button className={iconClass('notifications')} title="Notifications">
//           <Bell size={18} />
//         </button>

//         <button className={iconClass('help')} title="Help & Support">
//           <HelpCircle size={18} />
//         </button>

//         <button className={iconClass('addons')} title="Add-ons">
//           <Grid size={18} />
//         </button>

//         <button
//           onClick={onToggleTheme}
//           className={iconClass('theme')}
//           title="Toggle Theme"
//         >
//           {dark ? <Moon size={18} /> : <Sun size={18} />}
//         </button>

//         {/* <button className={`${iconClass('profile')} w-8 h-8 border overflow-hidden`} title="Profile">
//           <img
//             src="https://i.pravatar.cc/40?img=4"
//             alt="User"
//             className="w-full h-full object-cover"
//           /> */}
//         <button
//           className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
//       ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//           title="Profile"
//         >
//           <img
//             src="https://i.pravatar.cc/40?img=4"
//             alt="User"
//             className="w-full h-full object-cover"
//           />
//         </button>
//       </div>
//     </header>
//   );
// };

// export default Header;
// import React, { useState } from 'react';
// import { useLocation } from 'react-router-dom';
// import {
//   Sun, Moon, RefreshCcw, Bell, User, HelpCircle, Grid, Search
// } from 'lucide-react';

// const routeTitles = {
//   '/dashboard': 'Dashboard',
//   '/renewals': 'Manage Renewals',
//   '/clients': 'Clients',
//   '/clients/cloud': 'Cloud Server Clients',
//   '/clients/cerberus': 'Cerberus Clients',
//   '/clients/proxy': 'Proxy Clients',
//   '/clients/storage': 'Storage Server Clients',
//   '/clients/varys': 'Varys Clients',
//   '/notification-scheduler': 'Notification Scheduler',
//   '/mail-scheduler': 'Mail Scheduler',
//   '/reports': 'Reports',
//   '/settings': 'Settings',
// };

// const Header = ({ dark, onToggleMobile, onToggleTheme, activeIcon }) => {
//   const location = useLocation();
//   const pageTitle = routeTitles[location.pathname] || 'Dashboard';
//   const [showMobileSearch, setShowMobileSearch] = useState(false);

//   const iconClass = (icon) =>
//     `p-2 rounded-full transition ${activeIcon === icon
//       ? dark
//         ? 'bg-gray-600 text-white'
//         : 'bg-indigo-100 text-indigo-600'
//       : dark
//         ? 'hover:bg-gray-600 hover:text-white text-gray-500'
//         : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'
//     }`;

//   return (
//     <>
//       <header className={`relative w-full px-4 py-2 flex items-center justify-between ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>

//         {/* TOP ROW: Title and Icons */}
//         <div className="flex w-full items-center justify-start gap-4">
//           <button className="md:hidden" onClick={onToggleMobile}>☰</button>

//           <div className="text-lg text-indigo-600 font-semibold flex-grow pl-2 md:pl-6 lg:pl-8">
//             {pageTitle}
//           </div>

//           <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
//             {/* Only Show on All */}
//             <button
//               className={`md:hidden ${iconClass('search')}`}
//               title="Search"
//               onClick={() => setShowMobileSearch(prev => !prev)}
//             >
//               <Search size={18} />
//             </button>

//             <button className={iconClass('refresh')} title="Refresh">
//               <RefreshCcw size={18} />
//             </button>

//             <button className={iconClass('notifications')} title="Notifications">
//               <Bell size={18} />
//             </button>

//             {/* Hidden on Mobile, shown on md+ */}
//             <div className="hidden md:flex items-center gap-2">
//               <button className={iconClass('help')} title="Help & Support">
//                 <HelpCircle size={18} />
//               </button>
//               <button className={iconClass('addons')} title="Add-ons">
//                 <Grid size={18} />
//               </button>
//               <button onClick={onToggleTheme} className={iconClass('theme')} title="Toggle Theme">
//                 {dark ? <Moon size={18} /> : <Sun size={18} />}
//               </button>
//               <button
//                 className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
//                 ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
//                 title="Profile"
//               >
//                 <img
//                   src="https://i.pravatar.cc/40?img=4"
//                   alt="User"
//                   className="w-full h-full object-cover"
//                 />
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* SEARCH BAR - Below in Mobile, Center in Desktop */}
//         <div className={`absolute hidden left-1/2 transform -translate-x-1/2 md:block md:w-60 lg:w-72 mx-auto ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//           <div className="relative">
//             <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
//               <Search size={16} />
//             </span>
//             <input
//               type="text"
//               placeholder="Global Search"
//               className={`w-full pl-10 pr-4 py-1 rounded-md border text-sm transition focus:outline-none focus:ring 
//               ${dark
//                   ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400'
//                   : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
//             />
//           </div>
//         </div>
//       </header>
//       {/* MOBILE Search Bar Below Header */}
//       {
//         showMobileSearch && (
//           <div className={`px-4 py-2 w-full bg-white dark:bg-gray-800 shadow md:hidden`}>
//             <div className="relative">
//               <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
//                 <Search size={16} />
//               </span>
//               <input
//                 type="text"
//                 placeholder="Search..."
//                 className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring 
//                 ${dark
//                     ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
//                     : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'}`}
//               />
//             </div>
//           </div>
//         )
//       }
//     </>
//   );
// };

// export default Header;


import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import HelpModal from './HelpModal';
import {
  Sun, Moon, RefreshCcw, Bell, User, HelpCircle, Grid, Search
} from 'lucide-react';

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
  const location = useLocation();
  const pageTitle = routeTitles[location.pathname] || 'Dashboard';
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showHelp, setShowHelp] = useState(false);


  const iconClass = (icon) =>
    `p-2 rounded-full transition ${activeIcon === icon
      ? dark
        ? 'bg-gray-600 text-white'
        : 'bg-indigo-100 text-indigo-600'
      : dark
        ? 'hover:bg-gray-600 hover:text-white text-gray-500'
        : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'
    }`;

  return (
    <>
      {/* HEADER */}
      <header className={`relative w-full px-4 py-2 flex items-center justify-between ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>

        {/* LEFT: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button className="md:hidden" onClick={onToggleMobile}>☰</button>
          <div className="text-lg text-indigo-600 font-semibold pl-2 md:pl-6 lg:pl-8">
            {pageTitle}
          </div>
        </div>

        {/* CENTER: Search bar (desktop only) */}
        <div className="hidden xl:block absolute left-1/2 transform -translate-x-1/2 w-60 xl:w-72">
          <div className="relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Global Search"
              className={`w-full pl-10 pr-4 py-1 rounded-md border text-sm transition focus:outline-none focus:ring 
                ${dark
                  ? 'bg-gray-700 text-white border-gray-700 placeholder-gray-400'
                  : 'bg-gray-100 border-gray-100 text-gray-800 placeholder-gray-500'}`}
            />
          </div>
        </div>

        {/* RIGHT: Icons */}
        <div className="flex items-center gap-1 md:gap-2 lg:gap-3">
          {/* Mobile Search Icon */}
          <button
            className={`block xl:hidden ${iconClass('search')}`}
            title="Search"
            onClick={() => setShowMobileSearch(prev => !prev)}
          >
            <Search size={18} />
          </button>

          <button className={iconClass('refresh')} title="Refresh">
            <RefreshCcw size={18} />
          </button>

          <button className={iconClass('notifications')} title="Notifications">
            <Bell size={18} />
          </button>

          {/* Desktop-only Icons */}
          <div className="hidden lg:flex items-center gap-2">
            <button className={iconClass('help')} title="Help & Support" onClick={() => setShowHelp(true)}>
              <HelpCircle size={18} />
            </button>
            <button className={iconClass('addons')} title="Add-ons">
              <Grid size={18} />
            </button>
            <button onClick={onToggleTheme} className={iconClass('theme')} title="Toggle Theme">
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
          </div>
        </div>
      </header>

      {/* MOBILE/TABLET Search Bar — full width below header */}
      {showMobileSearch && (
        <div className={`w-full flex justify-center xl:hidden px-4 py-2 ${dark
          ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
          : 'bg-white border-gray-300 text-gray-800 placeholder-gray-500'}`}
          style={{ borderTop: 'none', borderBottom: 'none', boxShadow: 'none' }}
        >
          <div className="w-full max-w-md relative">
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-400">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search..."
              className={`w-full pl-10 pr-4 py-2 rounded-md border text-sm focus:outline-none focus:ring 
                ${dark
                  ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400'
                  : 'bg-gray-100 border-gray-300 text-gray-800 placeholder-gray-500'}`}
            />
          </div>
        </div>
      )}

      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} dark={dark}/> </>
      
   
    
  );
};

export default Header;
