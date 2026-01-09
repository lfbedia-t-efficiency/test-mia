
import React, { useMemo } from 'react';
import { View } from '../types';
import { AIAssistantIcon, HistoryIcon, AuditIcon, AlarmIcon, DocsIcon, PlantIcon, AdminIcon, SettingsIcon, ManufacturingIcon, ChevronDownIcon, CrmIcon, RhIcon, BookOpenIcon, EyeIcon, TEfficiencyIcon, ArrowUpIcon, ClipboardDocumentCheckIcon } from './icons/Icons';

interface SidebarProps {
  activeView: View;
  setActiveView: (view: View) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  isCollapsed: boolean;
  setIsCollapsed: (isCollapsed: boolean) => void;
  language: string;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, isOpen, isCollapsed, setIsCollapsed, language }) => {
  
  // Translation Dictionary
  const getTranslatedLabels = (lang: string) => {
      // Default to Spanish labels if not found
      const labels: Record<string, any> = {
          'Español': {
              audit: 'Auditoria Produccion Inteligente',
              audit_dash: 'Dashboard Auditorias Produccion',
              audit_map: 'Mapa de Cumplimiento',
              audit_forms: 'Reportes & Formatos',
              maint: 'Monitoreo Técnico Avanzado',
              maint_dash: 'Dashboard Mantenimiento',
              maint_wo: 'Órdenes de Trabajo',
              maint_mach: 'Maquinas',
              docs: 'Control de Documentos',
              docs_proc: 'Documentos & Procedimientos',
              docs_cert: 'Documentos Certificados',
              docs_inst: 'Instrucciones de Trabajo',
              ai_vision: 'AI Vision Quality Check',
              ai_crm: 'AI Customer Service',
              ai_rh: 'AI Employee Service',
              system: 'Sistema',
              plants: 'Plants & Processes',
              admin: 'Admin'
          },
          'English': {
              audit: 'Intelligent Production Audit',
              audit_dash: 'Production Audit Dashboard',
              audit_map: 'Compliance Map',
              audit_forms: 'Reports & Forms',
              maint: 'Advanced Tech Monitoring',
              maint_dash: 'Maintenance Dashboard',
              maint_wo: 'Work Orders',
              maint_mach: 'Machines',
              docs: 'Document Control',
              docs_proc: 'Documents & Procedures',
              docs_cert: 'Certified Documents',
              docs_inst: 'Work Instructions',
              ai_vision: 'AI Vision Quality Check',
              ai_crm: 'AI Customer Service',
              ai_rh: 'AI Employee Service',
              system: 'System',
              plants: 'Plants & Processes',
              admin: 'Admin'
          },
          'Deutsch': {
              audit: 'Intelligente Produktionsprüfung',
              audit_dash: 'Produktions-Dashboard',
              audit_map: 'Compliance-Karte',
              audit_forms: 'Berichte & Formulare',
              maint: 'Erweiterte Überwachung',
              maint_dash: 'Wartungs-Dashboard',
              maint_wo: 'Arbeitsaufträge',
              maint_mach: 'Maschinen',
              docs: 'Dokumentenkontrolle',
              docs_proc: 'Dokumente & Verfahren',
              docs_cert: 'Zertifizierte Dokumente',
              docs_inst: 'Arbeitsanweisungen',
              ai_vision: 'KI-Qualitätsprüfung',
              ai_crm: 'KI-Kundendienst',
              ai_rh: 'KI-Mitarbeiterdienst',
              system: 'System',
              plants: 'Anlagen & Prozesse',
              admin: 'Verwaltung'
          },
          // Basic fallback for other languages (using English structure as base)
          'Français': { audit: 'Audit de Production', maint: 'Surveillance Technique', docs: 'Contrôle Documentaire', system: 'Système', admin: 'Admin', ai_vision: 'Contrôle Qualité IA', ai_crm: 'Service Client IA', ai_rh: 'Service RH IA' },
          'Português': { audit: 'Auditoria de Produção', maint: 'Monitoramento Técnico', docs: 'Controle de Documentos', system: 'Sistema', admin: 'Admin', ai_vision: 'Visão Computacional IA', ai_crm: 'Atendimento IA', ai_rh: 'RH IA' },
          'Italiano': { audit: 'Revisione Produzione', maint: 'Monitoraggio Tecnico', docs: 'Controllo Documenti', system: 'Sistema', admin: 'Admin', ai_vision: 'Visione Artificiale', ai_crm: 'Assistenza Clienti IA', ai_rh: 'Risorse Umane IA' },
          'Pусский': { audit: 'Аудит производства', maint: 'Технический мониторинг', docs: 'Управление документами', system: 'Система', admin: 'Админ', ai_vision: 'ИИ контроль качества', ai_crm: 'ИИ обслуживание', ai_rh: 'ИИ HR' },
          'العربية': { audit: 'تدقيق الإنتاج', maint: 'المراقبة الفنية', docs: 'مراقبة الوثائق', system: 'نظام', admin: 'مشرف', ai_vision: 'فحص الجودة بالذكاء الاصطناعي', ai_crm: 'خدمة العملاء بالذكاء الاصطناعي', ai_rh: 'موارد بشرية بالذكاء الاصطناعي' },
          '中文': { audit: '智能生产审核', maint: '高级技术监控', docs: '文件控制', system: '系统', admin: '管理', ai_vision: 'AI视觉质量检查', ai_crm: 'AI客户服务', ai_rh: 'AI员工服务' },
          '日本語': { audit: 'インテリジェント生産監査', maint: '高度な技術監視', docs: '文書管理', system: 'システム', admin: '管理', ai_vision: 'AIビジョン品質チェック', ai_crm: 'AIカスタマーサービス', ai_rh: 'AI従業員サービス' },
          '한국어': { audit: '지능형 생산 감사', maint: '고급 기술 모니터링', docs: '문서 제어', system: '시스템', admin: '관리', ai_vision: 'AI 비전 품질 확인', ai_crm: 'AI 고객 서비스', ai_rh: 'AI 직원 서비스' }
      };

      const selected = labels[lang] || labels['English']; // Fallback
      // Merge with default english/spanish if keys missing in other langs
      return { ...labels['English'], ...selected };
  };

  const t = getTranslatedLabels(language);

  const menuItems = useMemo(() => [
    { 
      view: 'PRODUCTION_AUDIT', label: t.audit, icon: <AuditIcon />,
      subItems: [
        { view: 'PA_DASHBOARD', label: t.audit_dash },
        { view: 'PA_COMPLIANCE_MAP', label: t.audit_map },
        { view: 'PA_FORMS', label: t.audit_forms },
      ]
    },
    { 
      view: 'TECHNICAL_ASSISTANCE', label: t.maint, icon: <AlarmIcon />,
      subItems: [
        { view: 'TA_DASHBOARD', label: t.maint_dash },
        { view: 'TA_WORK_ORDERS', label: t.maint_wo },
        { view: 'TA_MACHINES', label: t.maint_mach },
      ]
    },
    {
      view: 'DOCUMENT_CONTROL_SYSTEM', label: t.docs, icon: <BookOpenIcon />,
      subItems: [
          { view: 'DOCUMENTS_BY_PROCESS', label: t.docs_proc },
          { view: 'CERTIFICATION_DOCUMENTS', label: t.docs_cert },
          { view: 'WORK_INSTRUCTIONS', label: t.docs_inst, icon: <ClipboardDocumentCheckIcon className="w-4 h-4"/> }
      ]
    },
    { view: 'AI_VISION_QUALITY', label: t.ai_vision, icon: <EyeIcon /> },
    { view: 'IA_CRM_ASSISTANT', label: t.ai_crm, icon: <CrmIcon /> },
    { view: 'IA_RH_ASSISTANT', label: t.ai_rh, icon: <RhIcon /> },
  ], [t]);

  const bottomMenuItems = useMemo(() => [
      { view: 'PLANTS_PROCESS', label: t.plants, icon: <PlantIcon /> },
      { view: 'ADMINISTRATION', label: t.admin, icon: <AdminIcon /> },
  ], [t]);

  
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
                                    icon={(subItem as any).icon || (isCollapsed ? <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div> : undefined)}
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
            <SectionHeader label={t.system} />
            {bottomMenuItems.map((item) => (
                <NavLink key={item.view} view={item.view} label={item.label} icon={item.icon} />
            ))}
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
