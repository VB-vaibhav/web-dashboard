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

export const getClients = async ({ dateFilter = 'last30', customRange, service, page = 1, limit = 50 } = {}) => {
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

export const getCloudClients = async ({ dateFilter = 'last30', customRange, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    // const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // params.append('from', formatDate(customRange.startDate));
    // params.append('to', formatDate(customRange.endDate));
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  console.log('/clients/cloud?' + params.toString());

  const res = await axios.get(`/clients/cloud?${params.toString()}`);
  return res.data;
};


// export const getClientsByService = async (service) => {
//   const res = await axios.get(`/clients/${service}`);
//   return res.data;
// };

export const getCerberusClients = async ({ dateFilter = 'last30', customRange, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  console.log('/clients/cerberus?' + params.toString());

  const res = await axios.get(`/clients/cerberus?${params.toString()}`);
  return res.data;
};

export const getProxyClients = async ({ dateFilter = 'last30', customRange, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    // const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // params.append('from', formatDate(customRange.startDate));
    // params.append('to', formatDate(customRange.endDate));
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  console.log('/clients/proxy?' + params.toString());

  const res = await axios.get(`/clients/proxy?${params.toString()}`);
  return res.data;
};

export const getStorageClients = async ({ dateFilter = 'last30', customRange, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    // const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // params.append('from', formatDate(customRange.startDate));
    // params.append('to', formatDate(customRange.endDate));
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  console.log('/clients/storage?' + params.toString());

  const res = await axios.get(`/clients/storage?${params.toString()}`);
  return res.data;
};

export const getVarysClients = async ({ dateFilter = 'last30', customRange, page = 1, limit = 50 } = {}) => {
  const params = new URLSearchParams();

  if (dateFilter) params.append('dateFilter', dateFilter);
  if (page) params.append('page', page);
  if (limit) params.append('limit', limit);

  if (customRange?.startDate && customRange?.endDate) {
    // const formatDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    // params.append('from', formatDate(customRange.startDate));
    // params.append('to', formatDate(customRange.endDate));
    const toLocalDateString = (d) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    const from = toLocalDateString(customRange.startDate);
    const to = toLocalDateString(customRange.endDate);

    params.append('from', from);
    params.append('to', to);
  }

  console.log('/clients/varys?' + params.toString());

  const res = await axios.get(`/clients/varys?${params.toString()}`);
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

// clientService.js
// export const getExpiringClients = async ({ page = 1, limit = 20, service = '', search = '' } = {}) => {
//   const params = new URLSearchParams();
//   params.append('page', page);
//   params.append('limit', limit);
//   if (service) params.append('service', service);
//   if (search) params.append('search', search);

//   const res = await axios.get(`/clients/expiring-clients?${params.toString()}`);
//   return res.data;
// };

export const getExpiringClients = async (params = {}) => {
  const response = await axios.get('/clients/expiring-clients', { params });
  return response.data;
};

export const bulkRenewClients = async (clientIds, startDate, expiryDate) => {
  const res = await axios.post('/clients/bulk-renew', { clientIds, startDate, expiryDate });
  return res.data;
};

export const bulkCancelClients = async (clientIds) => {
  const promises = clientIds.map(id =>
    axios.put(`/clients/${id}`, { is_cancelled: 1 })
  );
  return Promise.all(promises);
};

// Add column
export const addExpiringClientColumn = async (label, isGlobal) => {
  return await axios.post('/admin/add-column', {
    pageKey: 'expiringClients',
    label,
    isGlobal
  });
};

// Delete column
export const deleteExpiringClientColumn = async (columnName) => {
  return await axios.delete('/admin/delete-column', {
    data: { columnName, pageKey: 'expiringClients' }
  });
};

export const getCancelledClients = async ({ from, to, service, page = 1, limit = 50 }) => {
  const params = new URLSearchParams();
  if (from && to) {
    params.append('from', from);
    params.append('to', to);
  }
  if (service && service !== 'all') {
    params.append('service', service);
  }
  params.append('page', page);
  params.append('limit', limit);

  const res = await axios.get(`/clients/cancelled-clients?${params.toString()}`);
  return res.data;
};

export const bulkRestoreClients = async (clientIds) => {
  const res = await axios.patch('/clients/bulk-restore', { clientIds });
  return res.data;
};

export const bulkDeleteClients = async (clientIds) => {
  const res = await axios.patch('/clients/bulk-delete', { clientIds });
  return res.data;
};


// export const getDeletedClients = async (params = {}) => {
//   const response = await axios.get('/clients/deleted-clients', { params });
//   return response.data;
// };

export const getDeletedClients = async ({ from, to, service, page = 1, limit = 50 }) => {
  const params = new URLSearchParams();
  if (from && to) {
    params.append('from', from);
    params.append('to', to);
  }
  if (service && service !== 'all') {
    params.append('service', service);
  }
  params.append('page', page);
  params.append('limit', limit);

  const res = await axios.get(`/clients/deleted-clients?${params.toString()}`);
  return res.data;
};

export const bulkDeleteClientsPermanently = async (clientIds) => {
  const res = await axios.patch('/clients/bulk-delete-permanent', { clientIds }); // ✅ wrap in object
  return res.data;
};

