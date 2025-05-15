import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowPathIcon } from '@heroicons/react/24/solid';

export default function ForgotPassword() {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.emailOrUsername) {
      setEmailOrUsername(location.state.emailOrUsername);
    }
  }, [location]);
  const [isLoading, setIsLoading] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername })
      });

      if (!res.ok) throw new Error('Failed to send OTP');
      const data = await res.json();
      setMessage(data.message);

      // 🔁 Redirect to OTP verify page
      setTimeout(() => {
        navigate('/verify-otp', { state: { emailOrUsername } });
      }, 1000);
    }
    catch (err) {
      setError('Could not send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4">
      <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow space-y-4">
        <h2 className="text-xl font-semibold text-center text-gray-800">Forgot Password</h2>
        <input
          type="text"
          placeholder="Enter your email or username"
          value={emailOrUsername}
          onChange={(e) => setEmailOrUsername(e.target.value)}
          required
          className="w-full px-4 py-2 border border-slate-200 rounded"
        />
        <button
          type="submit"
          disabled={isLoading}
          //   className="w-full bg-indigo-500 text-white py-2 hover:bg-indigo-600 font-semibold rounded-lg transition"
          // >
          className={`w-full py-2 rounded transition text-white font-semibold 
    ${isLoading ? 'bg-indigo-300 cursor-not-allowed' : 'bg-indigo-500 hover:bg-indigo-600'}`}
        >


          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <ArrowPathIcon className="h-5 w-5 animate-spin" />
              Sending…
            </span>
          ) : ("Send OTP")}
        </button>
        {message && <p className="text-green-600 text-sm">{message}</p>}
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </form>
    </div>
  );
}
