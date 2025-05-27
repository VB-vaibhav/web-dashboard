import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';

export default function ServiceAccessSettings() {
  const [users, setUsers] = useState([]);
  const [selected, setSelected] = useState([]);

  const dark = document.documentElement.classList.contains('dark');

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

  const handleToggle = (id, key) => {
    setUsers(prev =>
      prev.map(user =>
        user.id === id ? { ...user, [key]: user[key] ? 0 : 1 } : user
      )
    );
    // Optional: call an update API here to persist
  };

  const renderCell = (user, key) => (
    <div className="flex gap-1">
      <button
        className={`px-2 py-1 border rounded text-xs font-medium
          ${user[key] === 0
            ? 'bg-indigo-600 text-white'
            : 'bg-transparent text-indigo-600 border-indigo-600'}`}
        onClick={() => handleToggle(user.id, key)}
      >
        Exclude
      </button>
      <button
        className={`px-2 py-1 border rounded text-xs font-medium
          ${user[key] === 1
            ? 'bg-indigo-600 text-white'
            : 'bg-transparent text-indigo-600 border-indigo-600'}`}
        onClick={() => handleToggle(user.id, key)}
      >
        Include
      </button>
    </div>
  );

  return (
    <div className={`overflow-x-auto rounded shadow border 
      ${dark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'}`}>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th><input type="checkbox" checked={selected.length === users.length} onChange={() =>
              setSelected(selected.length === users.length ? [] : users.map(u => u.id))} /></th>
            <th>Name</th>
            <th>Role</th>
            <th>Cloud Server</th>
            <th>Cerberus</th>
            <th>Proxy</th>
            <th>Storage Server</th>
            <th>Varys</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-t">
              <td>
                <input
                  type="checkbox"
                  checked={selected.includes(user.id)}
                  onChange={() => handleCheckboxChange(user.id)}
                />
              </td>
              <td>{user.name}</td>
              <td>{user.role}</td>
              <td>{renderCell(user, 'is_vps')}</td>
              <td>{renderCell(user, 'is_cerberus')}</td>
              <td>{renderCell(user, 'is_proxy')}</td>
              <td>{renderCell(user, 'is_storage')}</td>
              <td>{renderCell(user, 'is_varys')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
