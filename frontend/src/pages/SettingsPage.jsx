import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';

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

  const { dark } = useOutletContext();

  return (
    <div className={`flex flex-col min-h-[calc(100vh-100px)] p-4 rounded duration-300 ease-in-out shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] space-y-6 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex justify-between items-center">
        {/* <h2 className={`text-xl font-bold ${dark ? 'text-white' : 'text-gray-800'}`}>Settings</h2> */}
        <select
          value={current}
          onChange={handleChange}
          className={`px-3 py-2 rounded-md text-md font-medium transition-all
            ${dark
              ? 'bg-gray-800 text-white'
              : 'bg-white text-indigo-600'}`}
        >
          {SETTINGS_SECTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className={` p-4 rounded  transition-all
        ${dark
          ? 'bg-gray-800 text-white'
          : 'bg-white text-gray-800'}`}>
        <Outlet context={{ dark }} />
      </div>
    </div>
  );
}
