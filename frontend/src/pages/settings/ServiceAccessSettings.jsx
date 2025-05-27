import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import AlertModal from '../../components/AlertModal';
import { useOutletContext } from 'react-router-dom';

export default function ServiceAccessSettings() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  // const dark = document.documentElement.classList.contains('dark');
  const { dark } = useOutletContext();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await axios.get('/admin/service-access-users');
    setUsers(res.data);
  };

  const handleCheckboxChange = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleToggle = async (id, key) => {
    const updatedValue = users.find(u => u.id === id)?.[key] ? 0 : 1;

    // Optimistic UI update
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, [key]: updatedValue } : user
      )
    );

    try {
      await axios.patch(`/admin/update-service-access/${id}`, { [key]: updatedValue });
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to save. Try again.');
    }
  };

  const showModal = (message) => {
    setAlertMessage(message);
    setShowAlert(true);
  };

  const closeModal = () => setShowAlert(false);

  const renderCell = (user, key) => {
    const isIncluded = user[key] === 1;

    const handleClick = (actionType) => {
      if ((isIncluded && actionType === 'included') || (!isIncluded && actionType === 'excluded')) {
        const msg = isIncluded
          ? 'This service is already included for this user.'
          : 'This service is already excluded for this user.';
        showModal(msg);
        return;
      }
      handleToggle(user.id, key);
    };


    return (
      <div className="flex gap-2 justify-center items-center">
        <button
          className={`px-3 py-1.5 rounded-sm text-xs font-medium border transition-all
            ${!isIncluded
              ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
              : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
            }`}
          onClick={() => handleClick('excluded')}
        >
          {isIncluded ? 'Exclude' : 'Excluded'}
        </button>

        <button
          className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all
            ${isIncluded
              ? `${dark ? 'bg-gray-700 text-slate-300 border-gray-700' : 'bg-indigo-600 text-white border-indigo-600'}`
              : `{ ${dark ? 'hover:bg-gray-500 text-slate-300 border-slate-300' : 'text-indigo-600 border-indigo-600 hover:bg-indigo-100'} bg-transparent}`
            }`}
          onClick={() => handleClick('included')}
        >
          {isIncluded ? 'Included' : 'Include'}
        </button>
      </div>
    );
  };

  return (
    <>
      <div className={`overflow-x-auto rounded-sm 
      ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
        <table className="min-w-full text-sm table-auto">
          <thead className={`${dark ? 'bg-gray-800 text-slate-400' : 'bg-white text-slate-400'}`}>
            <tr className={`border-b ${dark ? 'border-gray-700' : 'border-gray-300'} text-sm font-medium`}>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}><input type="checkbox" checked={selected.length === users.length} onChange={() =>
                setSelected(selected.length === users.length ? [] : users.map(u => u.id))} /></th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Name</th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Role</th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Cloud Server</th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Cerberus</th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Proxy</th>
              <th className={`px-4 py-3 font-semibold border-r ${dark ? 'border-gray-700' : 'border-gray-300'}`}>Storage Server</th>
              <th className="px-4 py-3 font-semibold">Varys</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td className="px-4 py-2 text-center">
                  <input
                    type="checkbox"
                    checked={selected.includes(user.id)}
                    onChange={() => handleCheckboxChange(user.id)}
                  />
                </td>
                <td className="px-4 py-2 text-center">{user.name}</td>
                <td className="px-4 py-2 capitalize text-center">{user.role}</td>
                <td className="px-4 py-2 text-center">{renderCell(user, 'is_vps')}</td>
                <td className="px-4 py-2 text-center">{renderCell(user, 'is_cerberus')}</td>
                <td className="px-4 py-2 text-center">{renderCell(user, 'is_proxy')}</td>
                <td className="px-4 py-2 text-center">{renderCell(user, 'is_storage')}</td>
                <td className="px-4 py-2 text-center">{renderCell(user, 'is_varys')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AlertModal
        isOpen={showAlert}
        message={alertMessage}
        onClose={closeModal}
      />
    </>
  );
}
