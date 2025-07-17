// src/layouts/AdminLayout.jsx
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { Outlet, useNavigate } from 'react-router-dom';
import { useRefresh } from '../context/RefreshContext';
import useIsMobile from '../hooks/useIsMobile';
import HelpPopover from '../components/HelpPopover';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { setCredentials } from '../slices/authSlice';

// import { Search } from 'lucide-react';

const AdminLayout = () => {
  const isRestricted = useSelector(state => state.auth.isRestricted);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRestriction = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/me`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        const data = await res.json();
        if (data?.is_restricted === 1) {
          dispatch(setCredentials({ is_restricted: 1 }));
          navigate('/403', { replace: true });
        }
      } catch (err) {
        console.error("Restriction check failed", err);
      }
    };

    checkRestriction();
  }, [dispatch, navigate]);

  if (isRestricted) {
    window.location.href = '/403';  // 💣 Force reload into clean 403 route
    return null;
  }



  const [collapsed, setCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [dark, setDark] = useState(() => {
    return localStorage.getItem('theme') === 'dark';
  });
  const { blink } = useRefresh();
  const [showHelp, setShowHelp] = useState(false);
  const isMobile = useIsMobile();
  const helpRef = useRef();
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  // const isRestricted = useSelector(state => state.auth.is_restricted) === 1;
  // const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const toggleTheme = () => setDark(prev => !prev);


  // useEffect(() => {
  //   if (isRestricted) {
  //     navigate('/403'); // 🚀 Redirect user immediately
  //   }
  // }, [isRestricted, navigate]);


  return (
    <div className={`relative min-h-screen font-sans ${dark ? 'dark' : ''} ${blink ? 'animate-blink' : ''}`}>
      {/* {isRestricted && (
        <div className={`fixed inset-0 z-[9999]  bg-opacity-70 ${dark ? "bg-gray-900 bg-opacity-70" : "bg-white"} flex items-center justify-center`}>
          <div className="text-center">
            <h2 className="text-2xl font-bold text-red-600 dark:text-red-400">Access Restricted</h2>
            <p className="text-sm mt-2 text-gray-700 dark:text-gray-300">
              Your account is currently restricted. Please contact the administrator.
            </p>
          </div>
        </div>
      )} */}
      <Sidebar
        dark={dark}
        collapsed={collapsed}
        toggleCollapsed={() => setCollapsed(!collapsed)}
        // isMobile={isMobileOpen}
        isMobile={isMobile}
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onToggleTheme={toggleTheme}
        setShowHelp={setShowHelp}
      />
      {/* <div className="flex-1 flex flex-col transition-colors duration-300 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white"> */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${isMobile ? 'pl-5 pr-5' : (collapsed ? 'pl-[85px] pr-[22px]' : 'pl-[280px] pr-[25px]')} ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
      >

        <Header
          dark={dark}
          collapsed={collapsed}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
          onToggleTheme={toggleTheme}
          showHelp={showHelp}
          setShowHelp={setShowHelp}
          showMobileSearch={showMobileSearch}
          setShowMobileSearch={setShowMobileSearch}
        />

        {/* {showMobileSearch && isMobile && (
          <div className={`w-full flex justify-center xl:hidden px-4 py-2 transition-all duration-300
    ${dark
              ? 'bg-gray-800 text-white border-gray-600 placeholder-gray-400'
              : 'bg-purple-100 border-gray-300 text-gray-800 placeholder-gray-500'}`}
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
        )} */}

        <main
          className={`flex-1 w-full mx-auto ${showMobileSearch && isMobile ? 'pt-[40px]' : 'pt-[40px]'} min-h-screen duration-300 ease-in-out 
  ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}
  `}
        >
          {/* <main
          className={`flex-1 w-full mx-auto flex flex-col items-center justify-start 
    ${showMobileSearch && isMobile ? 'pt-[40px]' : 'pt-[40px]'} 
    min-h-screen duration-300 ease-in-out 
    ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
        > */}
          {/* ${collapsed ? '128px' : '510px'} */}
          {/* <div className="relative"> Make it position relative */}

          {/* 🛑 Overlay that blocks everything */}
          {/* {isRestricted && (
              <div className="absolute inset-0 z-50 bg-white bg-opacity-60 dark:bg-gray-900 dark:bg-opacity-60 flex items-center justify-center">
                <div className="text-center px-4">
                  <h2 className="text-xl font-semibold text-red-600 dark:text-red-400">You are restricted</h2>
                  <p className="text-sm mt-1 text-gray-700 dark:text-gray-300">All actions are temporarily disabled.</p>
                </div>
              </div> */}
          {/* )} */}
          <div
            className={`mx-auto my-10 p-2 w-full max-w-[calc(100% - ${collapsed ? '8em' : '31.875em'})] ${isMobile ? 'min-h-[calc(100vh-8rem)]' : ''} rounded-xl
    shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] overflow-hidden transition-all duration-300 ease-in-out
    ${dark ? 'bg-gray-800' : 'bg-white'}`}
          >
            {/* <div
            className={`flex flex-col w-full max-w-[calc(100%-2rem)] sm:max-w-[600px] flex-grow 
      p-4 rounded-xl mb-4
      shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] 
      transition-all duration-300 ease-in-out 
      ${dark ? 'bg-gray-800' : 'bg-white'}`}
            style={{ minHeight: 'calc(100vh - 100px)' }} // 🧠 Ensure true fill height inside layout
          > */}
            <Outlet context={{ dark }} />
          </div>
          {/* </div> */}
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



// import React, { useState, useEffect, useRef } from 'react';
// import Sidebar from '../components/Sidebar';
// import Header from '../components/Header';
// import { Outlet } from 'react-router-dom';
// import { useRefresh } from '../context/RefreshContext';
// import useIsMobile from '../hooks/useIsMobile';
// import HelpPopover from '../components/HelpPopover';

// const AdminLayout = () => {
//   const [collapsed, setCollapsed] = useState(false);
//   const [isMobileOpen, setIsMobileOpen] = useState(false);
//   const [dark, setDark] = useState(() => {
//     return localStorage.getItem('theme') === 'dark';
//   });
//   const { blink } = useRefresh();
//   const [showHelp, setShowHelp] = useState(false);
//   const isMobile = useIsMobile();
//   const helpRef = useRef();

//   useEffect(() => {
//     document.documentElement.classList.toggle('dark', dark);
//     localStorage.setItem('theme', dark ? 'dark' : 'light');
//   }, [dark]);

//   const toggleTheme = () => setDark(prev => !prev);

//   return (
//     <div
//       className={`grid min-h-screen font-sans transition-all duration-300 ease-in-out ${dark ? 'dark' : ''} ${blink ? 'animate-blink' : ''
//         }`}
//       style={{
//         gridTemplateColumns: collapsed ? '64px 1fr' : '255px 1fr'
//       }}
//     >
//       <Sidebar
//         dark={dark}
//         collapsed={collapsed}
//         toggleCollapsed={() => setCollapsed(!collapsed)}
//         isMobile={isMobileOpen}
//         setIsMobileOpen={setIsMobileOpen}
//         onToggleTheme={toggleTheme}
//         setShowHelp={setShowHelp}
//       />

//       <div
//         className={`flex flex-col col-start-2 transition-all duration-300 ease-in-out ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'
//           }`}
//       >
//         <Header
//           dark={dark}
//           collapsed={collapsed}
//           onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
//           onToggleTheme={toggleTheme}
//           showHelp={showHelp}
//           setShowHelp={setShowHelp}
//         />

//         {/* <main className="pt-10 min-h-screen">
//           <div
//             className={`mx-auto my-6 p-4 w-full max-w-[92%] rounded-xl shadow-[0_4px_6px_rgba(0,0,0,0.1)] transition-all duration-300 ease-in-out ${
//               dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
//             }`}
//           >
//             <Outlet context={{ dark }} />
//           </div>
//         </main> */}
//         <main
//           className={`pt-[40px] min-h-screen overflow-hidden duration-300 ease-in-out
//     ${dark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}
//         >
//           <div className="mx-auto my-10 w-full px-4">
//             <div
//               className={`rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1)]
//         transition-all duration-300 ease-in-out
//         ${dark ? 'bg-gray-800' : 'bg-white'}`}
//               style={{ width: '100%', maxWidth: '100%' }}
//             >
//               <Outlet context={{ dark }} />
//             </div>
//           </div>
//         </main>
//         {/* <main className="pt-[80px] min-h-screen overflow-hidden duration-300 ease-in-out bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white">
//           <div className="mx-auto w-full px-4">
//             <div
//               className={`rounded-xl shadow-md transition-all duration-300 ease-in-out ${dark ? 'bg-gray-800' : 'bg-white'
//                 }`}
//               style={{
//                 maxWidth: '100%',
//                 overflowX: 'auto' // ⬅️ important: this traps wide tables
//               }}
//             >
//               {/* <div style={{ minWidth: '900px' }}> or larger if needed */}
//                 <Outlet context={{ dark }} />
//               {/* </div> */}
//             {/* </div>
//           </div>
//         </main> */}



//         {!isMobile && (
//           <HelpPopover
//             isOpen={showHelp}
//             onClose={() => setShowHelp(false)}
//             anchorRef={helpRef}
//             dark={dark}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default AdminLayout;
