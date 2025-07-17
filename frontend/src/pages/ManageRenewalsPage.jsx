// src/pages/ManageRenewalsPage.jsx
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Select from 'react-select';
import useIsMobile from '../hooks/useIsMobile';
import { useOutletContext } from 'react-router-dom';

const RENEWAL_SECTIONS = [
  { label: 'Expiring Clients Table', value: 'expiring-clients' },
  { label: 'Cancelled Clients Table', value: 'cancelled-clients' },
  { label: 'Deleted Clients Table', value: 'deleted-clients' }
];

export default function ManageRenewalsPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const current = location.pathname.split('/').pop();
  const isMobile = useIsMobile();
  const { dark } = useOutletContext();

  return (
    <div className='relative'>
      <div className={`flex flex-col ${dark ? 'bg-gray-800 text-blue-300' : 'bg-white text-gray-800'}`}>
        <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
          <Select
            value={RENEWAL_SECTIONS.find(opt => opt.value === current)}
            onChange={(selected) => navigate(`/renewals/${selected.value}`)}
            options={RENEWAL_SECTIONS}
            className="w-[300px] text-md ml-2 top-3 rounded"
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: dark ? '#1F2937' : '#ffffff',
                color: dark ? '#99C2FF' : '#1F2937',
                borderColor: '#E5E7EB',
                minHeight: 36
              }),
              menu: (base) => ({
                ...base,
                backgroundColor: dark ? '#1F2937' : '#ffffff',
                zIndex: 99
              }),
              option: (base, state) => ({
                ...base,
                backgroundColor: state.isFocused ? (dark ? '#374151' : '#E0E7FF') : 'transparent',
                color: dark ? '#99C2FF' : '#1F2937',
                cursor: 'pointer'
              }),
              singleValue: (base) => ({
                ...base,
                color: dark ? '#ffffff' : '#4F46E5',
              })
            }}
          />
        </div>

        <div className="p-4 rounded transition-all">
          <Outlet context={{ dark }} />
        </div>
      </div>
    </div>
  );
}
