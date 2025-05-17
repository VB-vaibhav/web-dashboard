import React from 'react';

const Header = ({ onToggleMobile, onToggleTheme }) => {
  return (
    <header className="h-16 shadow flex items-center justify-between bg-white px-4">
      <div className="flex items-center gap-2">
        <button className="md:hidden" onClick={onToggleMobile}>☰</button>
        <input className="px-3 py-1 border rounded text-sm" placeholder="Search..." />
      </div>
      <div className="flex items-center gap-4 text-xl">
        <button>🔔</button>
        <button onClick={onToggleTheme}>🌓</button>
        <button>👤</button>
      </div>
    </header>
  );
};

export default Header;
