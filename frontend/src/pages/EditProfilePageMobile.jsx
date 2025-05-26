import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { uploadAvatar, updateProfile, refreshUserState } from '../auth/authService';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';

const EditProfilePageMobile = () => {
    const avatarUrl = useSelector(state => state.auth.avatarUrl);
    const nameRedux = useSelector(state => state.auth.name);
    const emailRedux = useSelector(state => state.auth.email);
    const phoneRedux = useSelector(state => state.auth.phone);
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [name, setName] = useState(nameRedux || '');
    const [email, setEmail] = useState(emailRedux || '');
    const [phone, setPhone] = useState(phoneRedux || '');
    const [preview, setPreview] = useState(avatarUrl);
    const dark = document.documentElement.classList.contains('dark');

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const previewURL = URL.createObjectURL(file);
        setPreview(previewURL);

        try {
            await uploadAvatar(file);
            await refreshUserState();
        } catch (err) {
            alert("Failed to upload avatar");
        }
    };

    const handleSubmit = async () => {
        try {
            await updateProfile({ name, email, phone });
            await refreshUserState();
            navigate('/profile'); // ✅ go back to profile page
        } catch (err) {
            alert("Failed to update profile.");
        }
    };

    return (
        <div className={`p-4 w-full max-w-lg mx-auto rounded duration-300 ease-in-out shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-blue-900'}`}>Edit Profile</h2>
                {/* <button onClick={() => navigate('/profile')} className="text-2xl text-gray-600">✖</button> */}
            </div>

            <div className="flex flex-col items-center mb-6">
                <div className="relative w-24 h-24 mb-2">
                    <img src={preview || 'https://i.pravatar.cc/100'} className={`w-full h-full rounded-full object-coverborder-2 ${dark ? 'border-gray-800' : 'border-white'}`} alt="avatar" />
                    <button
                        className={`mt-2 text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}
                        onClick={() => fileInputRef.current.click()}
                    >
                        Change profile photo
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                    />
                    {/* <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleImageUpload} /> */}
                </div>
            </div>

            <div className="space-y-4">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" className="w-full border p-2 rounded" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 rounded" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="w-full border p-2 rounded" />
            </div>

            <button onClick={handleSubmit} className="w-full mt-6 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save</button>
        </div>
    );
};

export default EditProfilePageMobile;
