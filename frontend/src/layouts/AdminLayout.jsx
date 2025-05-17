// import React, { useState } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { Outlet } from 'react-router-dom';

// const AdminLayout = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [dark, setDark] = useState(false);

//   const toggleTheme = () => {
//     setDark(!dark);
//     document.documentElement.classList.toggle('dark', !dark);
//   };

//   return (
//     <div className={`flex h-screen ${dark ? 'dark' : ''}`}>
//       <Sidebar
//         collapsed={collapsed}
//         toggleCollapsed={() => setCollapsed(!collapsed)}
//         isMobile={isMobileOpen}
//         setIsMobileOpen={setIsMobileOpen}
//       />
//       <div className="flex-1 flex flex-col">
//         <Header
//           onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
//           onToggleTheme={toggleTheme}
//         />
//         <main className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900">
//           <Outlet />
//         </main>
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet } from 'react-router-dom';

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white font-sans">
      <Sidebar
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        isMobile={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
      />
      <div className="flex-1 flex flex-col bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
        <Header
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onToggleTheme={toggleTheme}
        />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
