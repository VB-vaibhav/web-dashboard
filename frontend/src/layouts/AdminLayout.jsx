// src/layouts/AdminLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';
import { useRefresh } from '../context/RefreshContext';
import useIsMobile from '../hooks/useIsMobile';
import HelpPopover from '../components/HelpPopover';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { blink } = useRefresh();
  const [showHelp, setShowHelp] = useState(false);
  const isMobile = useIsMobile();
  const helpRef = useRef();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);

  return (
    <div className={`flex min-h-screen font-sans ${dark ? 'dark' : ''} ${blink ? 'animate-blink' : ''}`}>
      <Sidebar
        dark={dark}
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        isMobile={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onToggleTheme={toggleTheme}
        setShowHelp={setShowHelp}
      />
      <div className="flex-1 flex flex-col transition-colors duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header
          dark={dark}
          collapsed={collapsed}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onToggleTheme={toggleTheme}
          showHelp={showHelp}
          setShowHelp={setShowHelp}
        />
        {/* <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900 transition-colors duration-300"> */}
        <main className={`flex-1 overflow-y-auto pt-[60px] duration-300 ease-in-out ${dark ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} ${collapsed ? 'ml-16' : 'ml-[255px]'}`}>
          <div className="max-w-[95%] mx-auto mt-10 mb-10 rounded-xl shadow-[0_8px_20px_-8px_rgba(0,0,0,0.1)] ${dark ? 'bg-gray-800' : 'bg-white'}">
            <Outlet context={{ dark }} />
          </div>
        </main>

        {/* Global Help popup/modal */}
        {!isMobile && (
          <HelpPopover
            isOpen={showHelp}
            onClose={() => setShowHelp(false)}
            anchorRef={helpRef}
            dark={dark}
          />
        )}
      </div>
    </div>
  );
};

export default AdminLayout;
