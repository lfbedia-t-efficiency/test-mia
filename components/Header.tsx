
import React from 'react';
import { SearchIcon, BellIcon, MenuIcon, AIAssistantIcon, HistoryIcon } from './icons/Icons';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
  onAiClick: () => void;
  onHistoryClick: () => void;
  onProfileClick: () => void;
  language?: string;
}

const Header: React.FC<HeaderProps> = ({ title, onMenuClick, onAiClick, onHistoryClick, onProfileClick, language = 'Español' }) => {
  
  const getLabels = (lang: string) => {
      const dict: Record<string, any> = {
          'Español': { ai: 'AI Assistant', history: 'Historial Reciente', role: 'Supervisora' },
          'English': { ai: 'AI Assistant', history: 'Recent History', role: 'Supervisor' },
          'Deutsch': { ai: 'KI-Assistent', history: 'Verlauf', role: 'Vorgesetzter' },
          'Français': { ai: 'Assistant IA', history: 'Historique Récent', role: 'Superviseur' },
          'Português': { ai: 'Assistente IA', history: 'Histórico Recente', role: 'Supervisor' },
          'Italiano': { ai: 'Assistente IA', history: 'Cronologia Recente', role: 'Supervisore' },
          'Pусский': { ai: 'ИИ Помощник', history: 'Недавняя история', role: 'Руководитель' },
          'العربية': { ai: 'مساعد الذكاء الاصطناعي', history: 'السجل الحديث', role: 'مشرف' },
          '中文': { ai: 'AI助手', history: '最近历史', role: '主管' },
          '日本語': { ai: 'AIアシスタント', history: '最近の履歴', role: 'スーパーバイザー' },
          '한국어': { ai: 'AI 어시스턴트', history: '최근 기록', role: '관리자' }
      };
      return dict[lang] || dict['English']; // Fallback
  };

  const t = getLabels(language);

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
            title={t.ai}
        >
            <AIAssistantIcon className="w-5 h-5" />
            <span className="text-xs font-bold hidden md:inline">{t.ai}</span>
        </button>

        {/* Recent History Button */}
        <button 
            onClick={onHistoryClick} 
            className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-gray-50 transition-all hover:scale-105"
            title={t.history}
        >
            <HistoryIcon className="w-5 h-5 text-gray-500" />
            <span className="text-xs font-bold hidden md:inline">{t.history}</span>
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
        <div 
            className="flex items-center gap-3 cursor-pointer hover:bg-gray-100 p-1.5 rounded-lg transition-colors group"
            onClick={onProfileClick}
            title="Configuración de Perfil"
        >
            <div className="relative">
                <img 
                    src="https://picsum.photos/seed/user/40/40" 
                    alt="User Avatar" 
                    className="w-10 h-10 rounded-full border-2 border-gray-300 group-hover:border-blue-400 transition-colors"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
            </div>
            <div>
                <p className="font-semibold text-sm text-gray-800 group-hover:text-blue-700 transition-colors">Ana Lopez</p>
                <p className="text-xs text-gray-500">{t.role}</p>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
