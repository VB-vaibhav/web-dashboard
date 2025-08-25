// import React, { useEffect, useState } from 'react';
import React, { useEffect, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import axios from '../api/axios';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import useIsMobile from '../hooks/useIsMobile';
import { useOutletContext } from 'react-router-dom';
import { PlusCircle, MoreVertical, CheckCheck } from 'lucide-react';
import AddClientModal from '../components/AddClientModal';
import PageWrapper from '../components/PageWrapper';
import DOMPurify from 'dompurify';
import AlertModal from '../components/AlertModal';

const DashboardPage = () => {
  const { user, role } = useSelector(state => state.auth);
  const username = useSelector(state => state.auth.username);
  const name = useSelector(state => state.auth.name);
  const { dark } = useOutletContext();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  // const dropdownRef = useRef(null);
  // const [showDropdown, setShowDropdown] = useState(false);
  const headerMenuRef = useRef(null);
  const annMenuBtnRef = useRef(null);
  const annMenuRef = useRef(null);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);
  const [showAnnMenu, setShowAnnMenu] = useState(false);
  const [annMenuPos, setAnnMenuPos] = useState({ x: 0, y: 0 });  // viewport coords
  const [showAddClientModal, setShowAddClientModal] = useState(false);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await axios.get('/clients/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to fetch dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const cardStyle = `p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] 
  ${dark ? 'bg-gray-700 ' : 'bg-white'} 
  text-center transform transition-all duration-300 hover:scale-[1.025] cursor-pointer`;

  const labelClass = "text-xs text-gray-400 uppercase tracking-wider mb-1";

  const formatDate = (raw) => {
    if (!raw) return '';
    const date = new Date(raw);
    return `${String(date.getDate()).padStart(2, '0')}-${String(date.getMonth() + 1).padStart(2, '0')}-${date.getFullYear()}`;
  };

  useEffect(() => {
    if (!loading) console.log("Fetched Stats:", stats);
  }, [loading]);

  // useEffect(() => {
  //   const handleClickOutside = (event) => {
  //     if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
  //       setShowDropdown(false);
  //     }
  //   };
  //   document.addEventListener('mousedown', handleClickOutside);
  //   return () => document.removeEventListener('mousedown', handleClickOutside);
  // }, []);
  useEffect(() => {
    const onDocClick = (e) => {
      if (!headerMenuRef.current?.contains(e.target)) setShowHeaderMenu(false);
      const inAnnBtn = !!annMenuBtnRef.current?.contains(e.target);
      const inAnnMenu = !!annMenuRef.current?.contains(e.target);
      if (!inAnnBtn && !inAnnMenu) setShowAnnMenu(false);
    };
    const onEsc = (e) => { if (e.key === 'Escape') { setShowHeaderMenu(false); setShowAnnMenu(false); } };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, []);

  const [ann, setAnn] = useState([]);

  const [selectedAnn, setSelectedAnn] = useState([]); // number[]
  const toggleAnn = (id) => {
    setSelectedAnn(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };
  const selectAllAnn = () => setSelectedAnn(ann.map(a => a.id));
  const clearAllAnn = () => setSelectedAnn([]);


  const clean = (html) => DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
    ADD_TAGS: ['img', 'span', 'u', 'ol', 'ul', 'li', 'table', 'thead', 'tbody', 'tr', 'td', 'th'],
    ADD_ATTR: ['style', 'class', 'target', 'rel', 'type', 'start', 'src', 'alt'],
    // allow data: for inline images from Jodit
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel|data:image\/)|[^:]+$)/i
  });

  // useEffect(() => {
  //   let mounted = true;
  //   (async () => {
  //     try {
  //       const { data } = await axios.get('/custom-notifications/feed?limit=10');
  //       if (mounted) setAnn(data.data || []);
  //     } catch (e) { console.error('Announcements load failed', e); }
  //   })();
  //   return () => { mounted = false; };
  // }, []);
  const loadAnnouncements = async () => {
    try {
      const { data } = await axios.get('/custom-notifications/feed?limit=10');
      setAnn(data.data || []);
    } catch (e) {
      console.error('Announcements load failed', e);
    }
  };
  useEffect(() => { loadAnnouncements(); }, []);

  const [alertMsg, setAlertMsg] = useState('');
  const [showAlert, setShowAlert] = useState(false);

  const markSelectedAsRead = async () => {
    if (!selectedAnn.length) {
      setAlertMsg('Please select at least one announcement.');
      setShowAlert(true);
      return;
    }
    try {
      await axios.post('/custom-notifications/read/bulk', { ids: selectedAnn });
      setAlertMsg('Marked as read');
      setShowAlert(true);
      clearAllAnn();
      setShowAnnMenu(false);
      await loadAnnouncements(); // whatever function you use to refetch feed
    } catch (e) {
      console.error(e);
      setAlertMsg('Failed to mark as read');
      setShowAlert(true);
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center gap-4 h-[calc(100vh-7em)]">
        <div className={`animate-spin rounded-full h-12 w-12 border-4 ${dark ? 'border-blue-300' : 'border-blue-500'}  border-t-transparent`}></div>
        <p className={`text-sm ${dark ? 'text-blue-300' : 'text-blue-600'} `}>Loading dashboard...</p>
      </div>
    );
  }
  if (!stats) return <div className="p-6 text-red-500">Failed to load dashboard stats.</div>;

  if (isMobile) return <div className="p-4">Mobile View Not Yet Implemented</div>;

  return (
    <PageWrapper>
      <div className="p-2">
        {/* Welcome Section */}
        <div className={`flex ${isMobile ? 'flex-col items-start gap-2' : 'flex-row justify-between items-center'} px-2`}>
          <h1 className={`text-xl font-semibold ${dark ? "text-blue-300" : "text-indigo-600 "}`}>
            Welcome, {name || username || 'User'}!
          </h1>
          <div className="right-4 top-3 flex items-center gap-2 z-10">
            {role !== 'middleman' && (
              // <div className="relative" ref={dropdownRef}>
              //   <button
              //     className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
              //     onClick={() => setShowDropdown(prev => !prev)}
              //   >
              //     <MoreVertical size={18} />
              //   </button>
              //   {showDropdown && (
              //     <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
              //       <>
              //         <button
              //           onClick={() => setShowAddClientModal(true)}
              //           className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'
              //             }`}
              //         >
              //           <PlusCircle size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
              //           <span>Add Client/Services</span>
              //         </button>
              //       </>
              //     </div>
              //   )}
              // </div>
              <div className="relative" ref={headerMenuRef}>
                <button
                  className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
                  onClick={() => { setShowHeaderMenu(v => !v); setShowAnnMenu(false); }}  // close the other
                >
                  <MoreVertical size={18} />
                </button>

                {showHeaderMenu && (
                  <div className={`absolute right-0 mt-2 w-48 rounded-md shadow-lg z-20 p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                    <button
                      onClick={() => { setShowHeaderMenu(false); setShowAddClientModal(true); }}
                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                    >
                      <PlusCircle size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                      <span>Add Client/Services</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className='px-2'>
          <p className={`text-md font-semibold py-2 ${dark ? "text-blue-300" : "text-indigo-600"} capitalize`}>{role}</p>
          <p className={` text-md ${dark ? "text-slate-300" : "text-blue-950"}`}>
            This is your central dashboard for managing clients, services, and performance metrics.
            Keep track of everything in one place.
          </p>
        </div>

        <div className="w-full max-w-[calc(100vw-4rem)]   min-h-[calc(100vh-15em)] ">
          <div className="h-full max-h-[calc(100vh-17em)]">
            <div className=" mt-1">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 px-1 py-4">
                <div className={cardStyle}>
                  <div className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{stats?.totalClients ?? '-'}</div>
                  <h4 className="text-sm text-slate-400 font-semibold">Total Clients</h4>
                </div>
                <div className={cardStyle}>
                  <div className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{stats?.totalActiveServices ?? '-'}</div>
                  <h4 className="text-sm text-slate-400 font-semibold">Active Services</h4>
                </div>
                <div className={cardStyle}>
                  <div className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>{stats?.upcomingExpiries ?? '-'}</div>
                  <h4 className="text-sm text-slate-400 font-semibold">Upcoming Expiries (3 days)</h4>
                </div>
                <div className={cardStyle}>
                  <div className={`text-xl font-semibold ${dark ? 'text-slate-300' : 'text-blue-900'}`}>${stats?.revenueUSD ?? '-'}</div>
                  <h4 className="text-sm text-slate-400 font-semibold">Revenue This Month (USD)</h4>
                </div>
              </div>

              {/* Bottom Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-2 py-2">
                {/* Announcements / Notes */}
                <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="w-full max-w-[calc(100vw-4em)] overflow-x-auto  min-h-[calc(100vh-25em)] ">
                    <div className="h-full max-h-[calc(100vh-38em)]">
                      <div className=" mt-2">
                        <div className={`sticky top-0 z-60 flex w-full items-center justify-between ${dark ? 'bg-gray-700' : 'bg-white'
                          } relative overflow-visible`}>
                          <h3 className={`text-lg px-2 font-semibold ${dark ? "text-blue-300" : "text-indigo-600"}`}>Announcements / Admin Notes</h3>

                          <div className="ml-auto flex items-center gap-2">
                            <div className="relative" ref={annMenuBtnRef}>
                              <button
                                ref={annMenuBtnRef}
                                className={`p-1.5 rounded-md border text-gray-400 ${dark ? 'border-gray-700 bg-gray-700' : 'border-gray-100 bg-gray-100'}`}
                                // onClick={() => { setShowAnnMenu(v => !v); setShowHeaderMenu(false); }} // close the other
                                onClick={(e) => {
                                  const r = e.currentTarget.getBoundingClientRect();
                                  // position menu just below the button; it will STILL be above messages because it's fixed & high z-index
                                  setAnnMenuPos({ x: r.right, y: r.bottom + 8 });
                                  setShowAnnMenu(v => !v);
                                  setShowHeaderMenu(false);
                                }}
                              >
                                <MoreVertical size={18} />
                              </button>

                              {/* Portal menu: position: fixed so it stays on top while scrolling */}
                              {showAnnMenu && createPortal(
                                <div
                                  className="fixed z-[1000]"
                                  style={{ top: annMenuPos.y, left: annMenuPos.x - 154 /* menu width 12rem */ }}
                                  // onClick={(e) => e.stopPropagation()}
                                  ref={annMenuRef}
                                  onMouseDown={(e) => e.stopPropagation()}  // <— critical so doc mousedown doesn’t close the menu before onClick
                                >
                                  <div className={`w-38 rounded-md shadow-lg p-2 ${dark ? 'bg-gray-800 text-white border border-gray-700' : 'bg-white text-blue-900 border border-gray-200'}`}>
                                    <button
                                      onClick={() => { setShowAnnMenu(false); markSelectedAsRead(); }}
                                      className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-md ${dark ? 'hover:bg-gray-700' : 'hover:bg-indigo-100'}`}
                                    >
                                      <CheckCheck size={16} className={dark ? 'text-white' : 'text-indigo-900'} />
                                      <span>Mark as read</span>
                                    </button>
                                  </div>
                                </div>,
                                document.body
                              )}
                            </div>
                          </div>

                        </div>
                        <hr className='text-indigo-200 mx-2 my-3' />
                        {/* <ul className={`list-disc pl-5 text-sm space-y-1 ${dark ? "text-slate-300" : "text-blue-950"}`}>
                          <li>Stay updated on upcoming expiries and renewals.</li>
                          <li>New clients must be added with proper plan & dates.</li>
                          <li>Reports section now supports filters by month.</li>
                          <li>Stay updated on upcoming expiries and renewals.</li>
                          <li>New clients must be added with proper plan & dates.</li>
                          <li>Reports section now supports filters by month.</li>
                          <li>Stay updated on upcoming expiries and renewals.</li>
                          <li>New clients must be added with proper plan & dates.</li>
                          <li>Reports section now supports filters by month.</li>
                          <li>Stay updated on upcoming expiries and renewals.</li>
                          <li>New clients must be added with proper plan & dates.</li>
                          <li>Reports section now supports filters by month.</li>
                          <li>Stay updated on upcoming expiries and renewals.</li>
                          <li>New clients must be added with proper plan & dates.</li>
                          <li>Reports section now supports filters by month.</li>
                        </ul> */}
                        {ann.length === 0 ? (
                          <div className="text-sm text-gray-500">No announcements yet.</div>
                        ) : (
                          <>
                            <style>{`
  .announcement-content ul { list-style: disc; padding-left: 1.25rem; }
  .announcement-content ol { list-style: decimal; padding-left: 1.25rem; }
  .announcement-content img { max-width: 100%; height: auto; }
`}</style>
                            <div className="space-y-4">
                              {ann.map(row => (
                                <div key={row.id} className="border-b pb-3 relative">
                                  <div className="flex items-start gap-3 px-2">
                                    <input
                                      type="checkbox"
                                      className={`mt-1 ${dark ? 'accent-gray-500' : 'accent-indigo-600'}`}
                                      checked={selectedAnn.includes(row.id)}
                                      onChange={() => toggleAnn(row.id)}
                                    />
                                    <div className="flex-1">
                                      <div className="font-semibold">{row.title}</div>
                                      {/* <div
                                    className="prose prose-sm max-w-none"
                                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(row.message_html || '') }}
                                  /> */}

                                      <div
                                        className="announcement-content prose max-w-none dark:prose-invert"
                                        dangerouslySetInnerHTML={{ __html: clean(row.message_html) }}
                                      />
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recently Added Clients Table */}
                <div className={`p-4 rounded-xl shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_-4px_6px_-1px_rgba(0,0,0,0.06)] ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                  <div className="w-full max-w-[calc(100vw-4em)] overflow-x-auto  min-h-[calc(100vh-25em)] ">
                    <div className="h-full max-h-[calc(100vh-38em)]">
                      <div className=" mt-2">
                        <div className={`sticky top-0 ${dark ? 'bg-gray-700' : 'bg-white'}`}>
                          <h3 className={`text-lg px-2 font-semibold ${dark ? "text-blue-300" : "text-indigo-600"}`}> Recently Added Clients</h3>
                          <hr className='text-indigo-200 mx-2 my-3' />
                        </div>
                        <div>
                          <table className="table-auto w-full text-sm">
                            <thead className={`sticky top-11 text-slate-400 border-b ${dark ? "bg-gray-700 border-gray-500" : "bg-white border-gray-300"}`}>
                              <tr>
                                <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Client Name</th>
                                <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Service</th>
                                <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Plan</th>
                                {role !== 'middleman' && (
                                  <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Middleman</th>
                                )}
                                <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Start</th>
                                <th className={`relative px-2 py-3 font-semibold border-r group  
        ${dark ? 'border-gray-500' : 'border-gray-300'}  
        'text-center whitespace-nowrap`}>Expiry</th>
                              </tr>
                            </thead>
                            <tbody className={`${dark ? "text-slate-300" : "text-blue-950"}`}>
                              {stats.recentClients.map((client, idx) => (
                                <tr key={idx}
                                  className="transition-all duration-300 ease-in-out transform animate-fade-in">
                                  <td className="py-1 px-2 text-center">{client.client_name}</td>
                                  <td className="py-1 px-2 text-center">{client.service}</td>
                                  <td className="py-1 px-2 text-center">{client.plan}</td>
                                  {role !== 'middleman' && (
                                    <td className="py-1 px-2 text-center">{client.middleman_name}</td>
                                  )}
                                  <td className="py-1 px-2 text-center">{formatDate(client.start_date)}</td>
                                  <td className="py-1 px-2 text-center">{formatDate(client.expiry_date)}</td>
                                </tr>
                              ))}
                              {stats.recentClients.length === 0 && (
                                <tr>
                                  <td colSpan={role !== 'middleman' ? 6 : 5} className="text-center py-8 text-sm text-gray-400">
                                    No recent clients found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {showAddClientModal && (
          <AddClientModal
            onClose={() => setShowAddClientModal(false)}
            onClientAdded={() => {
              fetchClients(dynamicKeysRef.current); // reload data
              setShowAddClientModal(false);
            }}
            dark={dark}
            animate
          />
        )}
        <AlertModal
          isOpen={showAlert}
          message={alertMsg}
          onClose={() => setShowAlert(false)}
          dark={dark}
        />
      </div>
    </PageWrapper >
  );
};

export default DashboardPage;
