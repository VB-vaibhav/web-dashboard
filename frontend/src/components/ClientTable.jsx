import React, { useEffect, useState } from 'react';
import { getClientsByService, deleteClient } from '../api/clientService';

export default function ClientTable({ service }) {
  const [clients, setClients] = useState([]);
  const [error, setError] = useState('');

  const fetchClients = async () => {
    try {
      const data = await getClientsByService(service);
      setClients(data);
    } catch (err) {
      setError('Failed to load clients.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this client?')) return;
    try {
      await deleteClient(id);
      fetchClients(); // Refresh
    } catch (err) {
      alert('Failed to cancel client.');
    }
  };

  useEffect(() => {
    fetchClients();
  }, [service]);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">{service} Clients</h2>
      {error && <p className="text-red-500">{error}</p>}
      <table className="min-w-full border bg-white">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="p-2 border">Client Name</th>
            <th className="p-2 border">Service</th>
            <th className="p-2 border">Middleman</th>
            <th className="p-2 border">Price</th>
            <th className="p-2 border">Expiry</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map(client => (
            <tr key={client.id}>
              <td className="p-2 border">{client.client_name}</td>
              <td className="p-2 border">{client.service}</td>
              <td className="p-2 border">{client.middleman_name}</td>
              <td className="p-2 border">${client.price}</td>
              <td className="p-2 border">{client.expiry_date}</td>
              <td className="p-2 border">
                <button
                  onClick={() => handleDelete(client.id)}
                  className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                >
                  Cancel
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
