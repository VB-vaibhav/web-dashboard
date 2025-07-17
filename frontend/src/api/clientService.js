// import axios from './axios';

// // ✅ General list — for default usage if needed
// export const getClients = async ({ dateFilter = 'last30', customRange, service } = {}) => {
//   const res = await axios.get('/clients');
//   return res.data;
// };

// // ✅ New: GET /clients/:service
// export const getClientsByService = async (service) => {
//   const res = await axios.get(`/clients/${service}`);
//   return res.data;
// };

// // POST /clients
// export const addClient = async (clientData) => {
//   const res = await axios.post('/clients', clientData, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
//   return res.data;
// };

// // PUT /clients/:id
// export const updateClient = async (id, updatedData) => {
//   const res = await axios.put(`/clients/${id}`, updatedData, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
//   return res.data;
// };

// // DELETE /clients/:id
// export const deleteClient = async (id) => {
//   const res = await axios.delete(`/clients/${id}`, {
//     headers: {
//       Authorization: `Bearer ${localStorage.getItem('accessToken')}`
//     }
//   });
//   return res.data;
// };




import axios from './axios';

// export const getClients = async ({ dateFilter = 'last30', customRange, service } = {}) => {
//   const params = new URLSearchParams();

//   if (dateFilter) params.append('dateFilter', dateFilter);
//   if (customRange?.from && customRange?.to) {
//     params.append('from', customRange.from);
//     params.append('to', customRange.to);
//   }
//   if (service && service !== 'all') {
//     params.append('service', service);
//   }

//   const res = await axios.get(`/clients?${params.toString()}`);
//   return res.data;
// };

// ✅ New: GET /clients/:service

export const getClients = async ({ dateFilter = 'last30', customRange, service, page = 1,limit = 20 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    // const from = customRange.startDate.toISOString().split('T')[0];
    // const to = customRange.endDate.toISOString().split('T')[0];
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  if (service && service !== 'all') {
    params.append('service', service);
  }
  console.log('/clients?' + params.toString());

  const res = await axios.get(`/clients?${params.toString()}`);
  return res.data;
};

// export const getClientsByService = async (service) => {
//   const res = await axios.get(`/clients/${service}`);
//   return res.data;
// };

export const getClientsByService = async (service, { dateFilter = 'last30', customRange, page = 1, limit = 20 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    params.append('from', formatDate(customRange.startDate));
    params.append('to', formatDate(customRange.endDate));
  }

  const res = await axios.get(`/clients/${service}?${params.toString()}`);
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
