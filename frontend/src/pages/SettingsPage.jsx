import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import Select from 'react-select';
import { components } from 'react-select';
import useIsMobile from '../hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  const current = location.pathname.split('/').pop();

  // const handleChange = (e) => {
  //   navigate(`/settings/${e.target.value}`);
  // };

  const { dark } = useOutletContext();
  // shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)]
  return (
    <div className='relative'>
      <div className={`flex flex-col duration-300 ease-in-out  ${dark ? 'bg-gray-800 text-blue-300' : 'bg-white text-gray-800'}`}>
        {/* <div className="flex justify-between items-center flex-wrap gap-2 mb-4"> */}
        <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
          {/* {!isMobile && <h1 className="text-xl font-semibold ml-6">Settings</h1>} */}
          <Select
            components={{
              IndicatorSeparator: () => null,
              DropdownIndicator: (props) => (
                <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
              )
            }}
            value={SETTINGS_SECTIONS.find(opt => opt.value === current)}
            onChange={(selected) => navigate(`/settings/${selected.value}`)}
            options={SETTINGS_SECTIONS}
            className="w-[250px] text-md ml-2 top-3 rounded"
            styles={{
              control: (base) => ({
                ...base,
                boxShadow: 'none',
                backgroundColor: dark ? '#1F2937' : '#ffffff',
                color: dark ? '#99C2FF' : '#1F2937',
                borderColor: '#E5E7EB',
                '&:hover': {
                  borderColor: '#CBD5E1',
                },
                minHeight: 36,
                paddingRight: 2,
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: dark ? '#1F2937' : '#ffffff',
                zIndex: 99,
                padding: '4px',
                borderRadius: '8px',
                overflowX: 'hidden'
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused
                  ? (dark ? '#374151' : '#E0E7FF') // gray-700 or indigo-100
                  : 'transparent',
                color: dark ? '#99C2FF' : '#1F2937',
                borderRadius: '6px',
                margin: '4px 0',
                padding: '8px 10px',
                cursor: 'pointer',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }),
              singleValue: (base) => ({
                ...base,
                color: dark ? '#ffffff' : '#4F46E5',
              }),
              valueContainer: (base) => ({
                ...base,
                paddingLeft: 8,
                paddingRight: 4, // shrink right padding
              }),

              placeholder: (base) => ({
                ...base,
                color: dark ? '#9CA3AF' : '#6B7280',
              }),
            }}
          />

        </div>

        <div className={` p-4 rounded  transition-all 
        ${dark
            ? 'bg-gray-800 text-slate-300'
            : 'bg-white text-gray-800'}`}>

          <Outlet context={{ dark }} />

        </div>
      </div>
    </div>
  );
}
