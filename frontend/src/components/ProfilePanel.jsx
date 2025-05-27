import React, { useEffect, useRef, useState } from 'react';
import { useProfile } from '../context/ProfileContext';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { uploadAvatar, refreshUserState } from '../auth/authService';
import { useSelector } from 'react-redux';
import { Pencil } from 'lucide-react';
import EditProfilePanel from './EditProfilePanel';
import useIsMobile from '../hooks/useIsMobile';

const ProfilePanel = ({ user, dark }) => {
    const isMobile = useIsMobile();
    const formattedJoinDate = user.joinDate
        ? new Date(user.joinDate).toLocaleDateString('en-GB')
        : '';

    const { isOpen, closeProfile, closeEdit, openEdit } = useProfile();
    const navigate = useNavigate();
    const [avatar, setAvatar] = useState('');
    const avatarUrl = useSelector(state => state.auth.avatarUrl);

    const role = useSelector(state => state.auth.role);
    const username = useSelector(state => state.auth.username); // update if stored
    const name = useSelector(state => state.auth.name);
    const email = useSelector(state => state.auth.email);
    const phone = useSelector(state => state.auth.phone);
    const joinDate = useSelector(state => state.auth.joinDate);
    // const userId = useSelector(state => state.auth.userId);
    // const [avatar, setAvatar] = useState(avatarUrl || 'https://i.pravatar.cc/100');


    useEffect(() => {
        setAvatar(avatarUrl || 'https://i.pravatar.cc/100');
    }, [avatarUrl]);


    const fileInputRef = useRef(null);

    const panelRef = useRef();

    const { resetProfileState } = useProfile();

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (panelRef.current && !panelRef.current.contains(e.target)) {
                closeProfile();
                closeEdit();
            }
        };

        document.addEventListener('mousedown', handleClickOutside, true);
        return () => document.removeEventListener('mousedown', handleClickOutside, true);
    }, [closeProfile, closeEdit]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl);
            // TODO: Upload to backend or store persistently
            try {
                await uploadAvatar(file); // Upload to backend
                await refreshUserState(); // Re-fetch and sync Redux
            } catch (err) {
                alert("Avatar upload failed");
            }
        };
    };

    if (!isOpen) return null;
    
    // ✅ Desktop Floating Panel
    return (
        <div ref={panelRef} className={`absolute right-4 top-11 w-80 z-50 rounded-xl shadow-xl border ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-lg font-bold ${dark ? 'text-white' : 'text-blue-900'}`}>Profile</h2>
                <button onClick={closeProfile}>
                    <X size={20} className="hover:text-red-500" />
                </button>
            </div>

            {/* Avatar & Name */}
            <div className="p-5 text-center">
                <div className="relative w-24 h-24 mx-auto rounded-full shadow">
                    <img src={avatar} alt="Avatar" className={`rounded-full w-full h-full object-cover border-4 ${dark ? 'border-gray-800' : 'border-white'}`} />
                    <button
                        onClick={(e) => {
                            e.stopPropagation(); // prevents it from triggering the "outside click" close logic
                            openEdit();          // opens the Edit Floating Panel
                        }}
                        className={`absolute right-0 bottom-0 p-1 bg-gray-200 text-white rounded-full border-2 shadow-sm ${dark ? 'border-gray-800' : 'border-white'}`}
                        title="Edit"
                    >
                        <Pencil size={16} className={` ${dark ? 'text-gray-700' : 'text-gray-600'}`} />
                    </button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/*"
                        onChange={handleFileChange}
                    />
                </div>
                <div className={`mt-3 font-semibold ${dark ? 'text-white' : 'text-indigo-600'} text-lg`}>{user.username}</div>
                <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{user.role}</div>
            </div>

            {/* Details */}
            <div className="px-6 pb-5 text-sm space-y-2">
                <div className={`font-bold text-md ${dark ? 'text-white' : 'text-black'}`}>Information</div>
                <div className="grid grid-cols-[90px_1fr] gap-y-2">
                    <div className="font-medium">Name:</div>
                    <div className="break-words truncate text-sm">{user.name}</div>
                    <div className="font-medium">Email:</div>
                    <div className="break-words truncate text-sm leading-snug" title={user.email}>{user.email}</div>
                    <div className="font-medium">Phone:</div>
                    <div className="break-words truncate text-sm">{user.phone}</div>
                    <div className="font-medium">Join Date:</div>
                    <div>{formattedJoinDate}</div>
                </div>
            </div>

            {/* Logout */}
            <div className="px-6 pb-6">
                <button
                    onClick={() => {
                        localStorage.clear();
                        resetProfileState();
                        navigate('/login');
                    }}
                    className={`w-full py-2 rounded-md border ${dark ? 'border-slate-300 text-slate-300 hover:bg-gray-700 hover:text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}  transition font-medium`}
                >
                    Log out
                </button>
            </div>
            <EditProfilePanel dark={dark} />
        </div>
    );
};

export default ProfilePanel;
