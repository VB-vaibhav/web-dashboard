// const Header = ({dark, onToggleMobile, onToggleTheme }) => {
//     return (
//         <header className={`h-16 shadow flex items-center justify-between px-4 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
//         {/* <header className="h-16 shadow flex items-center justify-between bg-white px-4"> */}
//             <div className="flex items-center gap-2">
//                 <button className="md:hidden" onClick={onToggleMobile}>☰</button>
//                 <input className="px-3 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm bg-white dark:bg-gray-700 dark:placeholder-gray-400 focus:outline-none focus:ring focus:ring-blue-300" placeholder="Search..." />
//             </div>
//             <div className="flex items-center gap-4 text-xl">
//                 <button>🔔</button>
//                 <button onClick={onToggleTheme}>🌓</button>
//                 <button>👤</button>
//             </div>
//         </header>
//     );
// };

// export default Header;


// src/components/Header.jsx
import { Sun, Moon } from 'lucide-react';

const Header = ({ dark, onToggleMobile, onToggleTheme }) => {
  return (
    <header className={`h-16 duration-300 ease-in-out shadow flex items-center justify-between px-4 ${dark ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'}`}>
      <div className="flex items-center gap-2">
        <button className="md:hidden" onClick={onToggleMobile}>☰</button>
        <input
          className={`px-3 py-1 duration-300 ease-in-out shadow border rounded text-sm focus:outline-none focus:ring focus:ring-blue-300
            ${dark
              ? 'bg-gray-700 border-gray-700 text-white placeholder-gray-400'
              : 'bg-white border-gray-300 text-gray-900'
            }`}
          placeholder="Search..."
        />
      </div>
      <div className="flex items-center gap-4 text-xl">
        <button>🔔</button>
        <button onClick={onToggleTheme}>
          {dark ? <Moon size={22} /> : <Sun size={22} />}
        </button>
        <button>👤</button>
      </div>
    </header>
  );
};

export default Header;
