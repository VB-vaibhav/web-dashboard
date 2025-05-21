import axios from './axios';

// export const getClients = async () => {
//   const res = await axios.get('/clients', {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
//   return res.data;
// };

// ✅ General list — for default usage if needed
export const getClients = async () => {
  const res = await axios.get('/clients');
  return res.data;
};

// ✅ New: GET /clients/:service
export const getClientsByService = async (service) => {
  const res = await axios.get(`/clients/${service}`);
  return res.data;
};

// POST /clients
export const addClient = async (clientData) => {
  const res = await axios.post('/clients', clientData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return res.data;
};

// PUT /clients/:id
export const updateClient = async (id, updatedData) => {
  const res = await axios.put(`/clients/${id}`, updatedData, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return res.data;
};

// DELETE /clients/:id
export const deleteClient = async (id) => {
  const res = await axios.delete(`/clients/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem('accessToken')}`
    }
  });
  return res.data;
};
