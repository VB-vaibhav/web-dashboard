import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { uploadAvatar, refreshUserState } from '../auth/authService';
import { Pencil } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';

export default function ProfilePage() {
    const navigate = useNavigate();
    const { dark } = useOutletContext();

    const avatarUrl = useSelector(state => state.auth.avatarUrl);
    const role = useSelector(state => state.auth.role);
    const username = useSelector(state => state.auth.username); // update if stored
    const name = useSelector(state => state.auth.name);
    const email = useSelector(state => state.auth.email);
    const phone = useSelector(state => state.auth.phone);
    const joinDate = useSelector(state => state.auth.joinDate);
    const [avatar, setAvatar] = useState(avatarUrl || 'https://i.pravatar.cc/100');
    const fileInputRef = useRef(null);
    const formattedJoinDate = joinDate
        ? new Date(joinDate).toLocaleDateString('en-GB') // gives dd/mm/yyyy
        : '';

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const previewUrl = URL.createObjectURL(file);
            setAvatar(previewUrl); // show preview instantly

            try {
                await uploadAvatar(file); // backend save
                await refreshUserState(); // get updated profile
            } catch (err) {
                alert("Avatar upload failed");
            }
        }
    };


    return (
        // <div className={`flex flex-col min-h-[calc(100vh-8rem)] max-w-xl mx-auto mt-2 px-2 py-4 rounded duration-300 ease-in-out ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <div className="flex flex-col justify-between h-full w-full flex-grow">

            {/* <div className={`flex justify-between items-center mb-6 pb-2 border-b ${dark ? 'border-gray-700' : 'border-gray-200'}`}>
                <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-blue-900'}`}>Profile</h2>
                <button onClick={() => navigate(-1)} className="text-xl font-md text-blue-900">✖</button>
            </div> */}

            <div className="p-3 text-center">
                <div className="relative w-24 h-24 mx-auto mb-4 rounded-full shadow">
                    <img
                        src={avatar}
                        alt="User"
                        className={`rounded-full w-full h-full object-cover border-4 ${dark ? 'border-gray-800' : 'border-white'}`}
                    />
                    <button
                        onClick={() => navigate('/profile/edit')}
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
                <div className={` font-semibold ${dark ? 'text-white' : 'text-indigo-600'} text-lg`}>{username}</div>
                <div className={`text-sm ${dark ? 'text-gray-400' : 'text-gray-500'}`}>{role}</div>
            </div>

            <div className="mx-auto w-fit">
                <div className="flex flex-col items-start mt-4 space-y-3 text-sm px-2">
                    <div className={`font-bold text-md ${dark ? 'text-white' : 'text-black'}`}>Information</div>
                    <div className="grid grid-cols-[90px_1fr] gap-y-3">
                        <div className="font-medium text-left">Name:</div>
                        <div className="text-right break-words truncate text-sm">{name}</div>
                        <div className="font-medium text-left">Email:</div>
                        <div className="text-right break-words truncate text-sm leading-snug" title={email}>{email}</div>
                        <div className="font-medium text-left">Phone:</div>
                        <div className="text-right break-words truncate text-sm">{phone}</div>
                        <div className="font-medium text-left">Join Date:</div>
                        <div className="text-right">{formattedJoinDate}</div>
                    </div>
                </div>
            </div>

            <div className="w-full px-6 pt-6 mt-auto">
                <button
                    onClick={() => {
                        localStorage.clear();
                        navigate('/login');
                    }}
                    className={` w-full py-2 rounded-md border ${dark ? 'border-slate-300 text-slate-300 hover:bg-gray-700 hover:text-white' : 'border-indigo-600 text-indigo-600 hover:bg-indigo-50'}  transition font-medium`}
                >
                    Log out
                </button>
            </div>
        </div>
        
    );
}
