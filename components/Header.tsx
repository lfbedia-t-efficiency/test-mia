
import React from 'react';
import { SearchIcon, BellIcon, MenuIcon, AIAssistantIcon, HistoryIcon } from './icons/Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onAiClick: () => void;
  onHistoryClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onAiClick, onHistoryClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex justify-between items-center border-b border-gray-200 z-10">
      <div className="flex items-center gap-4">
         <button onClick={onMenuClick} className="text-gray-500 hover:text-gray-900 transition-colors">
            <MenuIcon />
        </button>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      </div>
      <div className="flex items-center gap-4">
        
        {/* AI Assistant Button */}
        <button 
            onClick={onAiClick} 
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-3 py-1.5 rounded-full shadow-md hover:shadow-lg transition-all hover:scale-105"
            title="Abrir AI Assistant"
        >
            <AIAssistantIcon className="w-5 h-5" />
            <span className="text-xs font-bold hidden md:inline">AI Assistant</span>
        </button>

        {/* Recent History Button */}
        <button 
            onClick={onHistoryClick} 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-all hover:scale-105"
            title="Historial Reciente"
        >
            <HistoryIcon className="w-5 h-5 text-gray-500" />
            <span className="text-xs font-bold hidden md:inline">Recent History</span>
        </button>

        <button className="text-gray-500 hover:text-gray-900 transition-colors">
          <SearchIcon />
        </button>
        <button className="text-gray-500 hover:text-gray-900 transition-colors relative">
          <BellIcon />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
        </button>
        <div className="w-px h-6 bg-gray-200"></div>
        <div className="flex items-center gap-3">
            <img 
                src="https://picsum.photos/seed/user/40/40" 
                alt="User Avatar" 
                className="w-10 h-10 rounded-full border-2 border-gray-300"
            />
            <div>
                <p className="font-semibold text-sm text-gray-800">Ana Lopez</p>
                <p className="text-xs text-gray-500">Supervisora</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
