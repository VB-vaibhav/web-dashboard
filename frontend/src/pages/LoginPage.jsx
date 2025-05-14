// // src/pages/LoginPage.jsx
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
//       // alert(`Welcome, ${data.username}`);
//       console.log(`Welcome ${data.username}`);
//       // window.location.href = '/dashboard'; // redirect after login
//       navigate('/');
//     } catch (err) {
//       setError("Login failed. Check credentials.");
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
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
//         {error && <p className="text-red-500 text-sm">{error}</p>}
//       </form>
//     </div>
//   );
// }


// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/authService';

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const data = await login(emailOrUsername, password);
      alert(`Welcome, ${data.username}`);
      navigate('/');
    } catch (err) {
      setError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-tr from-blue-100 via-white to-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md">
        <h2 className="text-2xl font-semibold text-center text-gray-800 mb-6">Login</h2>
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Username or Email*
            </label>
            <input
              id="email"
              type="text"
              placeholder="Enter your username"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password*
            </label>
            <input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={keepLoggedIn}
                onChange={() => setKeepLoggedIn(!keepLoggedIn)}
                className="accent-blue-500"
              />
              Keep me logged in
            </label>
            <a href="#" className="text-blue-600 hover:underline">
              Forgot Password?
            </a>
          </div>
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            Login
          </button>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}
