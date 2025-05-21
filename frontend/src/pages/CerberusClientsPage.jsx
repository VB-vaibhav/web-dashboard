// import React from 'react';

// const CerberusClientsPage = () => {
//   return (
//     <div className="p-4 bg-white rounded shadow text-gray-800">
//       <h2 className="text-xl font-semibold mb-2">Reports Page</h2>
//       <p className="text-sm text-gray-600">This is a placeholder for reports.</p>
//     </div>
//   );
// };

// export default CerberusClientsPage;

// src/pages/CerberusClientsPage.jsx
import React from 'react';
import ClientTable from '../components/ClientTable';

const CerberusClientsPage = () => {
  return (
    <div className="p-4">
      <ClientTable service="cerberus" />
    </div>
  );
};

export default CerberusClientsPage;
