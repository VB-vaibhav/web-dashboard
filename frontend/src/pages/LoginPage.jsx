// src/pages/LoginPage.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { login } from '../auth/authService';

// export default function LoginPage() {
//   const [emailOrUsername, setEmailOrUsername] = useState('');
//   const [password, setPassword] = useState('');
//   const [error, setError] = useState('');
//   const navigate = useNavigate();

//   const handleLogin = async (e) => {
//     e.preventDefault();
//     try {
//       const data = await login(emailOrUsername, password);
//       console.log(`Welcome ${data.username}`)
//     //   alert(`Welcome, ${data.username}`);
//       navigate('/'); // redirects to App.jsx via route protection
//     } catch (err) {
//       setError("Login failed. Check your credentials.");
//     }
//   };

//   return (
//     <div className="p-6 max-w-sm mx-auto mt-24 bg-white shadow rounded">
//       <h2 className="text-xl font-bold mb-4">Login</h2>
//       <form onSubmit={handleLogin} className="space-y-4">
//         <input
//           type="text"
//           placeholder="Username or Email"
//           value={emailOrUsername}
//           onChange={(e) => setEmailOrUsername(e.target.value)}
//           className="w-full p-2 border rounded"
//           required
//         />
//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full p-2 border rounded"
//           required
//         />
//         <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">
//           Login
//         </button>
//         {error && <p className="text-red-500">{error}</p>}
//       </form>
//     </div>
//   );
// }

// src/pages/LoginPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/authService';
import logo from '../assets/logo.png';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';


export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // ✅ Load saved username/email if present
  useEffect(() => {
    const saved = localStorage.getItem('rememberMeUsername');
    if (saved) {
      setEmailOrUsername(saved);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      if (rememberMe) {
        localStorage.setItem('rememberMeUsername', emailOrUsername);
      } else {
        localStorage.removeItem('rememberMeUsername');
      }

      const data = await login(emailOrUsername, password);
      // alert(`Welcome, ${data.username}`);
      console.log(`Welcome, ${data.username}`)
      navigate('/');
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <img
          src={logo} // assumes it's placed in public folder
          alt="Logo"
          className="w-28 h-28 mx-auto mb-6 rounded-full object-cover"
        />
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Username or Email<span className='text-indigo-500'>*</span>
            </label>
            <input
              id="email"
              type="text"
              placeholder="Enter your username or email"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="relative">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password<span className='text-indigo-500'>*</span>
            </label>
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-600 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-8.5 text-gray-500 hover:text-indigo-500"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeSlashIcon className="h-5 w-5" />
              ) : (
                <EyeIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
                className="accent-indigo-500"
              />
              Remember Me
            </label>
            <Link to="/forgot-password" 
            state={{ emailOrUsername }}
            className="text-indigo-500 hover:underline">
              Forgot Password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-lg transition"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
