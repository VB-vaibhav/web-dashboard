// src/pages/ManageRenewalsPage.jsx
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import Select from 'react-select';
import { components } from 'react-select';
import useIsMobile from '../hooks/useIsMobile';
import { useOutletContext } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

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
      <div className={`flex flex-col duration-300 ease-in-out ${dark ? 'bg-gray-800 text-blue-300' : 'bg-white text-gray-800'}`}>
        <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} mb-2`}>
          <Select
            components={{
              IndicatorSeparator: () => null,
              DropdownIndicator: (props) => (
                <components.DropdownIndicator {...props} style={{ paddingLeft: 2, paddingRight: 2 }} />
              )
            }}
            value={RENEWAL_SECTIONS.find(opt => opt.value === current)}
            onChange={(selected) => navigate(`/renewals/${selected.value}`)}
            options={RENEWAL_SECTIONS}
            className="w-[210px] text-md ml-2 top-3 rounded"
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

        <div className={` rounded  transition-all 
        ${dark
            ? 'bg-gray-800 text-slate-300'
            : 'bg-white text-gray-800'}`}>
          <AnimatePresence mode="wait">
            <Outlet context={{ dark }} key={location.pathname}/>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
