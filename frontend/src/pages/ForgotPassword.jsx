import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

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


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername })
            });

            if (!res.ok) throw new Error('Failed to send OTP');
            const data = await res.json();
            setMessage(data.message);
            // Redirect to /verify-otp
            navigate('/verify-otp', { state: { emailOrUsername } });
        } catch (err) {
            setError('Could not send OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow space-y-4">
                <h2 className="text-xl font-semibold text-center text-gray-800">Forgot Password</h2>
                <input
                    type="text"
                    placeholder="Enter your email or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-900 transition"
                >
                    Send OTP
                </button>
                {message && <p className="text-green-600 text-sm">{message}</p>}
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
}
