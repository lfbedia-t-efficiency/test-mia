import React from 'react';
import { View } from '../types';
import { AIAssistantIcon, HistoryIcon, AuditIcon, AlarmIcon, DocsIcon, PlantIcon, AdminIcon, SettingsIcon, ManufacturingIcon, ChevronDownIcon, CrmIcon, RhIcon, BookOpenIcon, EyeIcon, TEfficiencyIcon, ArrowUpIcon } from './icons/Icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
}

const menuItems = [
  { 
    view: 'PRODUCTION_AUDIT', label: 'Auditoria Produccion Inteligente', icon: <AuditIcon />,
    subItems: [
      { view: 'PA_DASHBOARD', label: 'Dashboard Auditorias Produccion' },
      { view: 'PA_COMPLIANCE_MAP', label: 'Mapa de Cumplimiento' },
      { view: 'PA_FORMS', label: 'Reportes & Formatos' },
    ]
  },
  { 
    view: 'TECHNICAL_ASSISTANCE', label: 'Monitoreo Técnico Avanzado', icon: <AlarmIcon />,
    subItems: [
      { view: 'TA_DASHBOARD', label: 'Dashboard Mantenimiento' },
      { view: 'TA_WORK_ORDERS', label: 'Órdenes de Trabajo' },
      { view: 'TA_MACHINES', label: 'Maquinas' },
    ]
  },
  {
    view: 'DOCUMENT_CONTROL_SYSTEM', label: 'Control de Documentos', icon: <BookOpenIcon />,
    subItems: [
        { view: 'DOCUMENTS_BY_PROCESS', label: 'Documentos & Procedimientos' },
        { view: 'CERTIFICATION_DOCUMENTS', label: 'Documentos Certificados' },
        { view: 'WORK_INSTRUCTIONS', label: 'Instrucciones de Trabajo' }
    ]
  },
  { view: 'AI_VISION_QUALITY', label: 'AI Vision Quality Check', icon: <EyeIcon /> },
  { view: 'IA_CRM_ASSISTANT', label: 'AI Customer Service', icon: <CrmIcon /> },
  { view: 'IA_RH_ASSISTANT', label: 'AI Employee Service', icon: <RhIcon /> },
];

const bottomMenuItems = [
    { view: 'PLANTS_PROCESS', label: 'Plants & Processes', icon: <PlantIcon /> },
    { view: 'ADMINISTRATION', label: 'Admin', icon: <AdminIcon /> },
    { view: 'SETTINGS', label: 'Config', icon: <SettingsIcon /> },
]

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, isCollapsed, setIsCollapsed }) => {
  
  const NavLink: React.FC<{ view: string; label: string; icon?: React.ReactNode; isSubItem?: boolean }> = ({ view, label, icon, isSubItem }) => (
      <button
          onClick={() => setActiveView(view as View)}
          className={`w-full flex items-center gap-3 px-3 py-2 my-0.5 rounded-md text-left text-xs font-normal transition-all duration-200 
          ${activeView === view 
              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600' 
              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
          } ${isSubItem ? (isCollapsed ? '' : 'pl-9') : ''} ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? label : ''}
      >
          {icon && <span className={`${activeView === view ? 'text-blue-600' : 'text-gray-400'} ${isCollapsed ? 'w-6 h-6' : ''}`}>{icon}</span>}
          {!isCollapsed && <span className="truncate">{label}</span>}
      </button>
  );

  const SectionHeader: React.FC<{ label: string; icon?: React.ReactNode }> = ({ label, icon }) => (
      !isCollapsed ? (
        <div className="px-3 mt-6 mb-2 flex items-center gap-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
            {icon && React.cloneElement(icon as React.ReactElement<any>, { className: 'w-4 h-4' })}
            <span>{label}</span>
        </div>
      ) : <div className="mt-4 border-t border-gray-100 pt-2"></div>
  );

  return (
    <aside className={`fixed top-0 left-0 h-full ${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col shadow-lg z-20 transform transition-all duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      {/* Brand Header */}
      <div className={`flex items-center gap-3 px-6 py-5 border-b border-gray-100 ${isCollapsed ? 'justify-center px-2' : ''}`}>
        <div className="bg-blue-600 p-1.5 rounded-lg shadow-sm shrink-0">
            <TEfficiencyIcon className="text-white w-6 h-6" />
        </div>
        {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
                <h1 className="text-lg font-extrabold text-gray-800 leading-none truncate">T-Efficiency</h1>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-0.5">System</p>
            </div>
        )}
        {!isCollapsed && (
             <button onClick={() => setIsCollapsed(true)} className="ml-auto text-gray-400 hover:text-gray-600">
                <ChevronDownIcon className="w-4 h-4 rotate-90" />
             </button>
        )}
      </div>
      
      {isCollapsed && (
          <button onClick={() => setIsCollapsed(false)} className="w-full flex justify-center py-2 text-gray-400 hover:text-gray-600">
                <ChevronDownIcon className="w-4 h-4 -rotate-90" />
          </button>
      )}

      <nav className="flex-1 overflow-y-auto px-2 py-4 custom-scrollbar overflow-x-hidden">
        {/* Main Modules */}
        {menuItems.map((item) => (
            <div key={item.view}>
                {item.subItems ? (
                    <>
                        <SectionHeader label={item.label} icon={item.icon} />
                        <div className="space-y-0.5">
                            {item.subItems.map(subItem => (
                                <NavLink 
                                    key={subItem.view} 
                                    view={subItem.view} 
                                    label={subItem.label} 
                                    isSubItem 
                                    icon={isCollapsed ? <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> : undefined}
                                />
                            ))}
                        </div>
                    </>
                ) : (
                    <div className="mt-1">
                        <NavLink view={item.view} label={item.label} icon={item.icon} />
                    </div>
                )}
            </div>
        ))}

        {/* System Section */}
        <div className="mt-6 border-t border-gray-100 pt-2">
            <SectionHeader label="Sistema" />
            {bottomMenuItems.map((item) => (
                <NavLink key={item.view} view={item.view} label={item.label} icon={item.icon} />
            ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;