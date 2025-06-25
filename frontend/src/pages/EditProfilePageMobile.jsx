import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { uploadAvatar, updateProfile, refreshUserState } from '../auth/authService';
import { useNavigate } from 'react-router-dom';
import { Pencil } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

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
    const { dark } = useOutletContext();

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
        <div className={`flex flex-col min-h-[calc(100vh-140px)] max-w-xl mx-auto mt-2 px-2 py-4 rounded duration-300 ease-in-out ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
            {/* <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-blue-900'}`}>Edit Profile</h2>
                <button onClick={() => navigate('/profile')} className="text-2xl text-gray-600">✖</button>
            </div> */}

            <div className="space-y-4 p-4">
                <div className="flex flex-col items-center ">
                    <img src={preview || 'https://i.pravatar.cc/100'} className={`w-20 h-20 rounded-full object-cover border-2 ${dark ? 'border-gray-800' : 'border-white'}`} alt="avatar" />
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
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium pb-2">Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium pb-2">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
                <div>
                    <label className="block text-sm font-medium pb-2">Phone</label>
                    <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full border px-2 py-1 rounded text-sm" />
                </div>
            </div>
            <div className="px-6 pb-6 mt-auto">
                <button onClick={handleSubmit} className={`w-full mt-12 py-2 rounded-md transition font-medium border ${dark ? 'border-slate-300 text-slate-300 hover:bg-gray-700 hover:text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}`}>Save</button>
            </div>
        </div>
    );
};

export default EditProfilePageMobile;
