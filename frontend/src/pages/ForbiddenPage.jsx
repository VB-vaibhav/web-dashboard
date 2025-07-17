// // src/pages/ForbiddenPage.jsx
// import React, { useEffect, useState } from 'react';
// import { useNavigate } from 'react-router-dom';

// export default function ForbiddenPage() {
//   const [count, setCount] = useState(60);
//   const navigate = useNavigate();

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCount(prev => {
//         if (prev <= 1) {
//           clearInterval(timer);
//           localStorage.clear();
//           navigate('/login');
//           return 0;
//         }
//         return prev - 1;
//       });
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <div className="h-screen flex flex-col justify-center items-center text-center">
//       <h1 className="text-6xl font-bold text-red-600">403</h1>
//       <p className="text-xl mt-4">Forbidden</p>
//       <p className="text-gray-500 mt-2">Access to this resource on the server is denied!</p>
//       <p className="mt-6 text-sm text-gray-400">You will be redirected to login in {count} seconds...</p>
//     </div>
//   );
// }


// src/pages/ForbiddenPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ForbiddenPage() {
  const [count, setCount] = useState(5);
  const navigate = useNavigate();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.clear();
          navigate('/login');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  return (
    <div className={`fixed inset-0 z-[9999] ${dark ? "bg-gray-900" : "bg-white"} flex flex-col items-center justify-center text-center px-4`}>
      <h1 className={`text-6xl font-extrabold ${dark ? "text-red-400" : "text-red-600"} drop-shadow-md`}>403</h1>
      <p className={`text-2xl mt-4 font-semibold ${dark ? "text-white" : "text-gray-800"}`}>Access Restricted</p>
      <p className={`mt-2 ${dark ? "text-gray-300" : "text-gray-500"}`}>You are not allowed to access this area.</p>
      <p className={`mt-6 text-sm ${dark ? "text-gray-300" : "text-gray-500"}`}>
        You will be redirected to login in <span className="font-mono">{count}</span> second{count !== 1 ? 's' : ''}...
      </p>
    </div>
  );
}
