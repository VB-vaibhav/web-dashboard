// import React from 'react';

// const SettingsPage = () => {
//   return (
//     <div className="p-4 bg-white rounded shadow text-gray-800">
//       <h2 className="text-xl font-semibold mb-2">SettingsPage</h2>
//       <p className="text-sm text-gray-600">This is a placeholder for reports.</p>
//     </div>
//   );
// };

// export default SettingsPage;

import { useNavigate, Outlet, useLocation } from 'react-router-dom';

const SETTINGS_SECTIONS = [
  { label: 'Access to Service Panels', value: 'service-access' },
  { label: 'Access to Panels', value: 'panel-access' },
  { label: 'Exclude Clients from Admin', value: 'exclude-clients' },
  { label: 'Manage Role', value: 'role-management' },
  { label: 'Manage Users', value: 'users' }
];

export default function SettingsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname.split('/').pop();

  const handleChange = (e) => {
    navigate(`/settings/${e.target.value}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Settings</h2>
        <select
          value={current}
          onChange={handleChange}
          className="px-3 py-2 border rounded-md bg-white dark:bg-gray-800 text-sm"
        >
          {SETTINGS_SECTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 border p-4 rounded shadow bg-white dark:bg-gray-800">
        <Outlet />
      </div>
    </div>
  );
}
