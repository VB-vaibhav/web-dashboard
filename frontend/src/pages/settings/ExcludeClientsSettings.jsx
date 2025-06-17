// Updated ExcludeClientsSettings.jsx with full feature set
import React, { useEffect, useState, useRef } from 'react';
import axios from '../../api/axios';
import { useOutletContext } from 'react-router-dom';
import AlertModal from '../../components/AlertModal';
import { useSelector } from 'react-redux';
import { Search, MoreVertical } from 'lucide-react';
import useIsMobile from '../../hooks/useIsMobile';
import { useTableSearch } from '../../hooks/useTableSearch';
import { usePersistentWidths } from '../../hooks/usePersistentWidths';

export default function ExcludeClientsSettings() {
  const [clients, setClients] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [selectedAdmin, setSelectedAdmin] = useState({});
  const [selected, setSelected] = useState([]);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const { dark } = useOutletContext();
  const isMobile = useIsMobile();

  const [columnWidths, setColumnWidths] = useState([]);
  const [columnInitDone, setColumnInitDone] = useState(false);
  const defaultWidths = [40, 160, 120, 160, 200, 160, 160];

  const { columnWidths: persistedWidths, startResizing } = usePersistentWidths('exclude_clients', defaultWidths);

  useEffect(() => {
    if (!columnInitDone) {
      setColumnWidths(persistedWidths);
      setColumnInitDone(true);
    }
  }, [persistedWidths, columnInitDone]);

  const fetchData = async () => {
    const [clientRes, adminRes] = await Promise.all([
      axios.get('/admin/exclusion-settings'),
      axios.get('/admin/admin-users')
    ]);
    setClients(clientRes.data);
    setAdmins(adminRes.data);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSelect = (clientId, value) => {
    setSelectedAdmin(prev => ({ ...prev, [clientId]: value }));
  };

  const handleAction = async (clientId, action) => {
    const adminId = selectedAdmin[clientId];
    if (!adminId) return alert('Select admin first.');
    try {
      await axios.patch(`/admin/exclusion-settings/${clientId}`, { action, adminId });
      setAlertMessage(`${action === 'exclude' ? 'Excluded' : 'Included'} successfully.`);
      setShowAlert(true);
      fetchData();
    } catch (err) {
      setAlertMessage('Action failed.');
      setShowAlert(true);
    }
  };

  return (
    <div className={`overflow-x-auto ${dark ? 'text-white' : 'text-gray-800'}`}>
      <h2 className="text-lg font-semibold mb-4">Exclude Clients From Admins</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className={`${dark ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <th className="p-2 border">#</th>
              <th className="p-2 border">Client</th>
              <th className="p-2 border">Service</th>
              <th className="p-2 border">Expiry</th>
              <th className="p-2 border">Currently Excluded</th>
              <th className="p-2 border">Admin</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, idx) => (
              <tr key={client.client_id} className="text-center">
                <td className="p-2 border">
                  <input
                    type="checkbox"
                    checked={selected.includes(client.client_id)}
                    onChange={(e) => {
                      const isChecked = e.target.checked;
                      setSelected(prev => isChecked
                        ? [...prev, client.client_id]
                        : prev.filter(id => id !== client.client_id));
                    }}
                  />
                </td>
                <td className="p-2 border">{client.client_name}</td>
                <td className="p-2 border">{client.service}</td>
                <td className="p-2 border">{client.expiry_date}</td>
                <td className="p-2 border">{client.excluded_admins || 'None'}</td>
                <td className="p-2 border">
                  <select
                    className={`p-1 border rounded ${dark ? 'bg-gray-800 text-white' : 'bg-white'}`}
                    value={selectedAdmin[client.client_id] || ''}
                    onChange={e => handleSelect(client.client_id, e.target.value)}
                  >
                    <option value="">Select Admin</option>
                    {admins.map(admin => (
                      <option key={admin.id} value={admin.id}>{admin.name}</option>
                    ))}
                  </select>
                </td>
                <td className="p-2 border space-x-2">
                  <button
                    className={`px-2 py-1 border rounded ${dark ? 'border-slate-400' : 'border-indigo-600 text-indigo-600'}`}
                    onClick={() => handleAction(client.client_id, 'exclude')}
                  >Exclude</button>
                  <button
                    className={`px-2 py-1 border rounded ${dark ? 'border-slate-400' : 'border-indigo-600 text-indigo-600'}`}
                    onClick={() => handleAction(client.client_id, 'include')}
                  >Include</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        message={alertMessage}
        success={alertMessage.includes('successfully')}
      />
    </div>
  );
}
