import React, { useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import {
  Sun, Moon, RefreshCcw, Bell, User, HelpCircle, Grid, Search
} from 'lucide-react';
import { useRefresh } from '../context/RefreshContext';
import HelpPopover from './HelpPopover';
import useIsMobile from '../hooks/useIsMobile';
import ProfilePanel from './ProfilePanel';
import { useSelector } from 'react-redux';
import { useProfile } from '../context/ProfileContext';
import NotificationPopup from './NotificationPopup';
import axios from '../api/axios';

const routeTitles = {
  '/dashboard-stats': 'Dashboard',
  '/renewals': 'Manage Renewals',
  '/renewals/expiring-clients': 'Manage Renewals',
  '/renewals/cancelled-clients': 'Manage Renewals',
  '/renewals/deleted-clients': 'Manage Renewals',
  '/clients': 'Clients',
  '/clients/cloud': 'Cloud Server Clients',
  '/clients/cerberus': 'Cerberus Clients',
  '/clients/proxy': 'Proxy Clients',
  '/clients/storage': 'Storage Server Clients',
  '/clients/varys': 'Varys Clients',
  '/notification-scheduler': 'Notification Scheduler',
  '/mail-scheduler': 'Mail Scheduler',
  '/reports': 'Reports',
  // '/settings': 'Settings',
  '/settings/service-access': 'Settings',
  '/settings/panel-access': 'Settings',
  '/settings/exclude-clients': 'Settings',
  '/settings/role-management': 'Settings',
  '/settings/users': 'Settings',
  '/profile': 'Profile',
  '/profile/edit': 'Edit Profile',
  '/help': 'Help',
  "/client-report/:id": "Client Report",
};

const Header = ({ dark, collapsed, onToggleMobile, onToggleTheme, activeIcon, showMobileSearch, setShowMobileSearch }) => {
  const location = useLocation();
  const pathname = location.pathname;
  // const pageTitle = routeTitles[location.pathname] || 'Dashboard';
  let pageTitle = 'Dashboard';
  for (const route in routeTitles) {
    const pattern = new RegExp('^' + route.replace(/:[^\s/]+/g, '[^/]+') + '$');
    if (pattern.test(pathname)) {
      pageTitle = routeTitles[route];
      break;
    }
  }
  // const [showMobileSearch, setShowMobileSearch] = useState(false);
  const isMobile = useIsMobile();
  const { toggleProfile } = useProfile();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);

  useEffect(() => {
  if (notificationCount > 0) {
    document.title = `(${notificationCount > 9 ? '9+' : notificationCount}) Management Panel`;
  } else {
    document.title = 'Management Panel';
  }
}, [notificationCount]);
  const iconClass = (icon) => {
    const isActive =
      (icon === 'help' && showHelp) ||
      (activeIcon === icon);
    return `p-2 rounded-full transition ${isActive
      ? dark
        ? 'bg-gray-600 text-white'
        : 'bg-indigo-100 text-indigo-600'
      : dark
        ? 'hover:bg-gray-600 hover:text-white text-gray-500'
        : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'
      }`;
  };
  const { triggerRefresh } = useRefresh();
  useEffect(() => {
    fetchNotificationCount();
  }, []);

  const fetchNotificationCount = async () => {
    try {
      const res = await axios.get('/notifications/count');
      setNotificationCount(res.data.count || 0);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    }
  };

  const [showHelp, setShowHelp] = useState(false);
  const helpRef = useRef();
  const notificationRef = useRef();

  const username = useSelector(state => state.auth.username);
  const name = useSelector(state => state.auth.name);
  const role = useSelector(state => state.auth.role);
  const email = useSelector(state => state.auth.email);
  const phone = useSelector(state => state.auth.phone);
  const joinDate = useSelector(state => state.auth.joinDate);
  const userId = useSelector(state => state.auth.userId);
  const avatarUrl = useSelector(state => state.auth.avatarUrl);

  const hideIconsOnRoutes = ['/profile', '/profile/edit', '/help'];
  const shouldHideIcons = hideIconsOnRoutes.includes(pathname);

  return (
    <>
      {/* HEADER */}
      <header className={`fixed top-0 z-40 h-[60px] flex items-center justify-between px-4 shadow-[0_8px_20px_-8px_rgba(0,0,0,0.15)]
    ${dark ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'}
    ${isMobile ? 'left-0 w-full' : (collapsed ? 'left-16 w-[calc(100%-64px)]' : 'left-[240px] w-[calc(100%-240px)]')}
  `}>

        {/* LEFT: Hamburger + Title */}
        <div className="flex items-center gap-4">
          <button className="md:hidden" onClick={onToggleMobile}>☰</button>
          <div className={`text-lg font-semibold pl-2 md:pl-6 lg:pl-8 ${dark ? 'text-white' : 'text-indigo-600'}`}>
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
          {!shouldHideIcons && (
            <button
              className={`block xl:hidden ${iconClass('search')}`}
              title="Search"
              onClick={() => setShowMobileSearch(prev => !prev)}
            >
              <Search size={18} />
            </button>
          )}

          <button onClick={() => {
            triggerRefresh();
            fetchNotificationCount();
          }} className={iconClass('refresh')} title="Refresh">
            <RefreshCcw size={18} />
          </button>

          {/* <button className={iconClass('notifications')} title="Notifications">
            <Bell size={18} />
          </button> */}
          <button
            ref={notificationRef}
            onClick={() => setShowNotifications(prev => !prev)}
            className={`${iconClass('notifications')} relative`}
            title="Notifications"
          >
            <Bell size={18} />
            {notificationCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                {notificationCount > 9 ? '9+' : notificationCount}
              </span>
            )}
          </button>
          {/* <button
            onClick={async () => {
              try {
                await axios.post('/notifications/generate');  // 🔁 Force create notifications
                setShowNotifications(prev => !prev);          // Toggle popup
              } catch (err) {
                console.error("Failed to generate notifications:", err);
              }
            }}
            className={iconClass('notifications')}
            title="Notifications"
            ref={notificationRef}
          >
            <Bell size={18} />
          </button> */}


          {/* Desktop-only Icons */}
          <div className="hidden md:flex items-center gap-2">
            <button ref={helpRef} className={iconClass('help')} title="Help & Support" onClick={() => setShowHelp(prev => !prev)}>
              <HelpCircle size={18} />
            </button>
            <button className={iconClass('addons')} title="Add-ons">
              <Grid size={18} />
            </button>
            <button onClick={onToggleTheme} className={iconClass('theme')} title="Toggle Theme">
              {dark ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();       // ✅ prevents bubbling to document
                toggleProfile();           // toggles the panel
              }}
              className={`rounded-full border border-gray-300 w-8 h-8 overflow-hidden 
                ${dark ? 'hover:bg-gray-600 hover:text-white text-gray-500' : 'hover:bg-indigo-100 hover:text-indigo-600 text-gray-500'}`}
              title="Profile"
            >
              <img
                src={avatarUrl || 'https://i.pravatar.cc/40?img'}
                alt="User"
                className="w-full h-full object-cover"
                onError={(e) => e.currentTarget.src = 'https://i.pravatar.cc/40?img'}
              />
            </button>
          </div>
          {!isMobile && (
            <HelpPopover isOpen={showHelp} onClose={() => setShowHelp(false)} anchorRef={helpRef} dark={dark} />
          )}
        </div>
        {showNotifications && (
          <NotificationPopup isOpen={showNotifications} dark={dark} onClose={() => setShowNotifications(false)} anchorRef={notificationRef} 
          setNotificationCount={setNotificationCount}/>
        )}
      </header>
      <ProfilePanel
        user={{
          username,
          role,
          name,
          email,
          phone,
          userId,
          joinDate,
          avatarUrl,
        }}
        dark={dark}
      />


      {/* MOBILE/TABLET Search Bar — full width below header */}
      {isMobile && showMobileSearch && (
        <div className={`w-full fixed top-[60px] left-0 right-0 xl:hidden px-4 py-2 z-40 ${dark
          ? 'text-white border-gray-600 placeholder-gray-400'
          : 'border-gray-300 text-gray-800 placeholder-gray-500'}`}
        // style={{ borderTop: 'none', borderBottom: 'none', boxShadow: 'none' }}
        >
          <div className="w-full max-w-md relative mx-auto">
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

    </>



  );
};

export default Header;
