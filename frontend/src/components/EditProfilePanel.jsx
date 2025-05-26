import React, { useRef, useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useProfile } from '../context/ProfileContext';
import { X, Upload } from 'lucide-react';
import { uploadAvatar, refreshUserState } from '../auth/authService';

const EditProfilePanel = ({ dark }) => {
    const { isEditOpen, closeEdit } = useProfile();
    const fileInputRef = useRef(null);

    // Select values individually from Redux (no object to avoid re-renders)
    const avatarUrl = useSelector(state => state.auth.avatarUrl);
    const userId = useSelector(state => state.auth.userId);
    const nameFromRedux = useSelector(state => state.auth.name);
    const email = useSelector(state => state.auth.email);
    const phone = useSelector(state => state.auth.phone);

    // Local state
    const [name, setName] = useState('');
    const [formEmail, setFormEmail] = useState('');
    const [formPhone, setFormPhone] = useState('');
    const [avatarPreview, setAvatarPreview] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);

    useEffect(() => {
        setName(nameFromRedux || '');
        setFormEmail(email || '');
        setFormPhone(phone || '');
        setAvatarPreview(avatarUrl || 'https://i.pravatar.cc/100');
    }, [nameFromRedux, email, phone, avatarUrl]);


    if (!isEditOpen) return null;

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatarPreview(URL.createObjectURL(file));
            setAvatarFile(file);
        }
    };

    const handleSave = async () => {
        try {
            if (avatarFile) await uploadAvatar(avatarFile);

            await fetch(`http://localhost:5000/api/auth/update-profile`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({
                    name, 
                    email: formEmail,
                    phone: formPhone
                })
            });

            await refreshUserState();
            closeEdit();
        } catch (err) {
            alert('Failed to update profile.');
        }
    };

    return (
        <div className={`absolute right-4 top-[4rem] w-[22rem] z-50 rounded-xl shadow-xl border ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
            <div className={`flex justify-between items-center px-4 py-3 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`font-semibold text-lg ${dark ? 'text-white' : 'text-blue-900'}`}>Edit Profile</h2>
                <button onClick={closeEdit}><X size={20} className="hover:text-red-500"/></button>
            </div>

            <div className="p-4 space-y-4">
                <div className="flex flex-col items-center">
                    <img src={avatarPreview} className={`w-20 h-20 rounded-full object-cover border-2 ${dark ? 'border-gray-800' : 'border-white'}`}/>
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
                        onChange={handleImageSelect}
                    />
                </div>

                <div className="space-y-2">
                    <div>
                        <label className="block text-sm font-medium">Name</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Email</label>
                        <input value={formEmail} onChange={(e) => setFormEmail(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium">Phone</label>
                        <input value={formPhone} onChange={(e) => setFormPhone(e.target.value)} className="w-full rounded border px-2 py-1 text-sm" />
                    </div>
                </div>

                <button onClick={handleSave} className="w-full bg-indigo-600 text-white py-2 rounded text-sm hover:bg-indigo-700">Save</button>
            </div>
        </div>
    );
};

export default EditProfilePanel;
