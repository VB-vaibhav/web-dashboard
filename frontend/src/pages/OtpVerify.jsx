import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function OtpVerify() {
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [otp, setOtp] = useState('');
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


        try {
            const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ emailOrUsername, otp })
            });

            if (!res.ok) throw new Error("Invalid or expired OTP");

            // Navigate to reset password page with emailOrUsername as state
            navigate('/reset-password', { state: { emailOrUsername } });
        } catch (err) {
            setError("OTP verification failed. Please check and try again.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            <form onSubmit={handleSubmit} className="max-w-md w-full bg-white p-6 rounded shadow space-y-4">
                <h2 className="text-xl font-semibold text-center text-gray-800">Verify OTP</h2>
                <input
                    type="text"
                    placeholder="Enter your email or username"
                    value={emailOrUsername}
                    onChange={(e) => setEmailOrUsername(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded"
                />
                <button
                    type="submit"
                    className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
                >
                    Verify OTP
                </button>
                {error && <p className="text-red-600 text-sm">{error}</p>}
            </form>
        </div>
    );
}
