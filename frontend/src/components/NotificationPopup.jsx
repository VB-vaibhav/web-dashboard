import React, { useEffect, useState, useRef } from 'react';
import axios from '../api/axios';
import { MessageSquareText } from 'lucide-react';

const NotificationPopup = ({ isOpen, dark, onClose, anchorRef, setNotificationCount }) => {
  const [notifications, setNotifications] = useState([]);
  const popoverRef = useRef();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await axios.get('/notifications');
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      }
    };
    fetchNotifs();
  }, []);

  const handleIgnore = async (id) => {
    try {
      await axios.patch(`/notifications/ignore/${id}`);
      if (setNotificationCount) {
        setNotificationCount(prev => Math.max(prev - 1, 0));  // avoid going negative
      }
      setNotifications(notifications.filter(n => n.id !== id));
    } catch (err) {
      console.error("Failed to ignore notification:", err);
    }
  };

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose, anchorRef]);

  if (!isOpen) return null;
  return (
    <div
      ref={popoverRef}
      className={`absolute w-[340px] right-15 top-12 z-50 max-h-[60vh] overflow-y-auto rounded-xl shadow-xl border transition-transform duration-200 transform {isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>

      <div className="p-4 text-sm">
        <div className={`w-full flex items-center gap-2 px-3 py-2 sticky top-0 ${dark ? 'text-white bg-gray-800' : 'text-blue-900 bg-white'}`}>
          <MessageSquareText size={25} />
          <span>
            <h2 className={`text-lg  font-semibold `}>Notification</h2>
          </span>

        </div>

        {notifications.length === 0 ? (
          <div className={`font-medium ml-2 ${dark ? 'text-gray-400' : 'text-blue-900'}`}>No new notifications.</div>
        ) : notifications.map((notif) => (
          <div key={notif.id} className={`ml-2 mb-6 space-y-1 p-2 font-normal rounded ${dark ? 'text-gray-400 hover:bg-gray-700' : 'text-blue-900 hover:bg-indigo-50'}`}>
            <p >Client Name: {notif.client_name}</p>
            <p >Service: {notif.service}</p>
            <p >Expiry Date: {new Date(notif.expiry_date).toLocaleDateString()}</p>
            <p >Status: {notif.status}</p>
            {/* <div className="flex items-center gap-3">
              <div> */}
            <button onClick={() => handleIgnore(notif.id)} className={` px-3 py-1 text-sm ${dark ? 'bg-gray-700 text-slate-300 hover:bg-gray-600' : 'bg-indigo-600 text-white hover:bg-indigo-700'} rounded cursor-pointer`}>
              Ignore
            </button>
            <p className="text-xs text-right">
              {new Date(notif.sent_at).toLocaleString()}
            </p>
            {/* </div>
            </div> */}

          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationPopup;
