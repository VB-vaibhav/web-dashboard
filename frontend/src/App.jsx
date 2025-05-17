import React from "react";
import ClientTable from './components/ClientTable';

const App = () => {
  return (
    // <></>
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">Dashboard</h2>
        <nav className="flex flex-col gap-4">
          <a href="#" className="hover:text-blue-500">Dashboard</a>
          <a href="#" className="hover:text-blue-500">Manage Renewals</a>
          <a href="#" className="hover:text-blue-500">Clients</a>
          <a href="#" className="hover:text-blue-500">Reports</a>
          <a href="#" className="hover:text-amber-200">Proxy Clients</a>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-800 shadow px-4 flex items-center justify-between">
          <h1 className="text-lg font-semibold">Welcome, Umang</h1>
          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">🔍</button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">🔔</button>
            <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">👤</button>
          </div>
        </header>

        {/* Page Body */}
        {/* <main className="flex-1 p-6 overflow-auto">
          <div className="text-2xl font-bold mb-4">Main Content</div>
          <p className="text-gray-600 dark:text-gray-300">
            This is your placeholder. Replace it with your dashboard cards, tables, or charts.
          </p>
        </main> */}
      </div>
        <div>
          <ClientTable />
        </div>
    </div>
  );
};

export default App;
