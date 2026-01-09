
import React, { useState } from 'react';
import { View, ViewTitle, Plant, WorkOrder, HistoryEvent, AiStartContext } from './types';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import AIAssistant from './pages/AIAssistant';
import RecentHistory from './pages/RecentHistory';
import ProductionAudit from './pages/ProductionAudit';
import TechnicalAssistance from './pages/TechnicalAssistance';
import CertificationDocuments from './pages/CertificationDocuments';
import PlantsProcess from './pages/PlantsProcess';
import Administration from './pages/Administration';
import Settings from './pages/Settings';
import ComplianceMap from './pages/ComplianceMap';
import ComplianceForms from './pages/ComplianceForms';
import TaWorkOrders from './pages/TaWorkOrders';
import TaMachines from './pages/TaMachines';
import TaProcedures from './pages/TaProcedures';
import IaCrmAssistant from './pages/IaCrmAssistant';
import IaRhAssistant from './pages/IaRhAssistant';
import TaDashboard from './pages/TaDashboard';
import PaDashboard from './pages/PaDashboard';
import AiVisionQuality from './pages/AiVisionQuality';
import DocumentControl from './pages/DocumentControl';
import WorkInstructions from './pages/WorkInstructions';

const initialPlantsData: Plant[] = [
  {
    id: 'plant-1', name: 'Planta Monterrey', location: 'Monterrey, NL', description: 'Planta principal de ensamblaje.',
    reports: [
        {
            id: 'rep-plant-01',
            code: 'REP-5S-001',
            name: 'Auditoría de Seguridad y 5S',
            description: 'Revisión diaria de condiciones de orden, limpieza y seguridad en pasillos generales.',
            schedules: [
                { id: 'sch-1', time: '09:00', loadResponsibles: ['Juan Pérez'], reviewResponsibles: ['Ana Lopez'] }
            ],
            generalReviewers: ['Ana Lopez', 'Carlos Ruiz'],
            notifyOutOfParam: { platform: true, email: false, whatsapp: false },
            notifyLate: { platform: true, email: true, whatsapp: true },
            resultIntegration: 'Promedio',
            integratedMinParam: 90,
            integratedMaxParam: 100,
            integratedOptimalResult: 'Igual o Superior',
            integratedOptimalValue: 95,
            fields: [
                { id: 'fld-1', code: '5S-01', ocrId: 'PASILLOS_LIBRES', format: 'Porcentaje', uom: '%', minParam: 90, maxParam: 100, optimalResult: 'Igual', optimalValue: 100, hasObservations: true },
                { id: 'fld-2', code: '5S-02', ocrId: 'EXTINTORES_VIG', format: 'Texto', uom: '', minParam: '', maxParam: '', optimalResult: 'Igual', optimalValue: '', hasObservations: false }
            ]
        }
    ],
    machines: [],
    procedures: [
        { 
            id: 'proc-gen-001',
            title: 'Procedimientos Generales de Planta',
            description: 'Normativas de seguridad y acceso a planta.',
            reviewer: 'Ana Lopez',
            responsible: 'Carlos Ruiz',
            notifyEmail: true,
            notifyWhatsapp: false,
            status: 'active',
            documents: [
                {
                    id: 'doc-item-1',
                    code: 'SEG-001',
                    name: 'Política de EPP',
                    versions: [
                        {
                            id: 'v-1',
                            version: '1.0',
                            file: 'politica_epp_v1.pdf',
                            uploadDate: '2023-01-10',
                            renewalDate: '2024-01-10',
                            status: 'obsolete',
                            updatedBy: 'Carlos Ruiz'
                        },
                         {
                            id: 'v-2',
                            version: '2.0',
                            file: 'politica_epp_v2.pdf',
                            uploadDate: '2023-10-15',
                            renewalDate: '2024-10-15',
                            status: 'current', // Green
                            updatedBy: 'Carlos Ruiz'
                        }
                    ]
                },
                {
                    id: 'doc-item-2',
                    code: 'SEG-002',
                    name: 'Control de Accesos',
                    versions: [
                        {
                            id: 'v-acc-1',
                            version: '1.0',
                            file: 'accesos_v1.pdf',
                            uploadDate: '2024-05-01',
                            renewalDate: '2025-05-01',
                            status: 'in_review', // Yellow
                            updatedBy: 'Pedro Gomez'
                        }
                    ]
                }
            ]
        }
    ],
    processes: [
      {
        id: 'proc-1-1', name: 'Línea de Ensamblaje 1', description: 'Ensamblaje de chasis.',
        machines: [],
        procedures: [],
        subprocesses: [
          { 
              id: 'sub-1-1-1', name: 'Preparación de materiales', description: 'Corte y doblado de piezas.', machines: [],
              procedures: [
                   { 
                        id: 'proc-corte-01',
                        title: 'Estándares de Corte',
                        description: 'Guías para operación de guillotinas y dobladoras.',
                        reviewer: 'Juan Pérez',
                        responsible: 'Maria Garcia',
                        notifyEmail: true,
                        notifyWhatsapp: true,
                        status: 'active',
                        documents: [
                            {
                                id: 'doc-item-corte-1',
                                code: 'COR-005',
                                name: 'Guía de Calibres',
                                versions: [
                                    {
                                        id: 'v-c-1',
                                        version: '1.2',
                                        file: 'guia_calibres_1.2.pdf',
                                        uploadDate: '2023-11-02',
                                        renewalDate: '2024-11-02',
                                        status: 'current',
                                        updatedBy: 'Maria Garcia'
                                    }
                                ]
                            },
                            {
                                id: 'doc-item-corte-2',
                                code: 'COR-006',
                                name: 'Mantenimiento de Cuchillas',
                                versions: [
                                    {
                                        id: 'v-c-2',
                                        version: '1.0',
                                        file: 'manto_cuchillas.pdf',
                                        uploadDate: '2022-01-01',
                                        renewalDate: '2023-01-01',
                                        status: 'expired', // Red
                                        updatedBy: 'Maria Garcia'
                                    }
                                ]
                            }
                        ]
                   }
              ]
          },
          { id: 'sub-1-1-2', name: 'Soldadura', description: 'Unión de componentes principales.', machines: [], procedures: [] },
        ],
      },
      {
          id: 'proc-1-2', name: 'Control de Calidad', description: 'Inspección final de productos.', subprocesses: [],
          machines: [],
          procedures: []
      },
      {
          id: 'proc-1-3', name: 'Prensado', description: 'Área de prensas hidráulicas.', 
          reports: [
              {
                  id: 'rep-proc-01',
                  code: 'REP-PREN-VAR',
                  name: 'Control de Variables Hidráulicas',
                  description: 'Monitoreo de presión y temperatura del sistema central de aceite.',
                  schedules: [
                      { id: 'sch-p1', time: '08:00', loadResponsibles: ['Pedro Gomez'], reviewResponsibles: ['Carlos Ruiz'] },
                      { id: 'sch-p2', time: '14:00', loadResponsibles: ['Pedro Gomez'], reviewResponsibles: ['Carlos Ruiz'] }
                  ],
                  generalReviewers: ['Carlos Ruiz'],
                  notifyOutOfParam: { platform: true, email: true, whatsapp: false },
                  notifyLate: { platform: true, email: false, whatsapp: false },
                  resultIntegration: 'Promedio',
                  integratedMinParam: 1800,
                  integratedMaxParam: 2200,
                  integratedOptimalResult: 'Igual',
                  integratedOptimalValue: 2000,
                  fields: [
                      { id: 'fld-p1', code: 'PREN-01', ocrId: 'PRESION_PRINCIPAL', format: 'Entero', uom: 'PSI', minParam: 1800, maxParam: 2200, optimalResult: 'Igual', optimalValue: 2000, hasObservations: false },
                      { id: 'fld-p2', code: 'PREN-02', ocrId: 'TEMP_ACEITE', format: 'Decimal', uom: '°C', minParam: 40, maxParam: 65, optimalResult: 'Igual', optimalValue: 50, hasObservations: true }
                  ]
              }
          ],
          procedures: [],
          subprocesses: [
               { 
                   id: 'sub-1-3-1', name: 'Línea 1', description: 'Prensado de alto tonelaje.',
                   reports: [
                       {
                           id: 'rep-sub-01',
                           code: 'REP-PROD-L1',
                           name: 'Registro de Producción Horaria',
                           description: 'Conteo de piezas OK y Scrap por hora en la línea.',
                           schedules: [
                               { id: 'sch-l1', time: '10:00', loadResponsibles: ['Luis Hernandez'], reviewResponsibles: ['Ana Lopez'] },
                               { id: 'sch-l2', time: '12:00', loadResponsibles: ['Luis Hernandez'], reviewResponsibles: ['Ana Lopez'] },
                               { id: 'sch-l3', time: '15:00', loadResponsibles: ['Luis Hernandez'], reviewResponsibles: ['Ana Lopez'] }
                           ],
                           generalReviewers: ['Ana Lopez'],
                           notifyOutOfParam: { platform: true, email: false, whatsapp: true },
                           notifyLate: { platform: true, email: false, whatsapp: true },
                           resultIntegration: 'Suma',
                           integratedMinParam: 500,
                           integratedMaxParam: 600,
                           integratedOptimalResult: 'Igual o Superior',
                           integratedOptimalValue: 550,
                           fields: [
                               { id: 'fld-l1', code: 'PROD-01', ocrId: 'PIEZAS_OK', format: 'Entero', uom: 'Pzas', minParam: 100, maxParam: 200, optimalResult: 'Igual o Superior', optimalValue: 150, hasObservations: false },
                               { id: 'fld-l2', code: 'PROD-02', ocrId: 'PIEZAS_NOK', format: 'Entero', uom: 'Pzas', minParam: 0, maxParam: 5, optimalResult: 'Igual o Inferior', optimalValue: 0, hasObservations: true }
                           ]
                       }
                   ],
                   machines: [
                       {
                           id: 'mach-ph02',
                           code: 'M-PH02',
                           name: 'Prensa Hidráulica PH-02',
                           manufacturer: 'Schuler',
                           model: 'T-200',
                           serial: '98765-B',
                           availability: 98.2,
                           mtbf: 125,
                           mttr: 2.1,
                           totalOts: 12,
                           openOts: 1
                       }
                   ],
                   procedures: []
               }
          ],
          machines: []
      }
    ],
  },
  { id: 'plant-2', name: 'Planta Guadalajara', location: 'Guadalajara, JAL', description: 'Planta de componentes electrónicos.', processes: [], machines: [], procedures: [] },
];

const generateMockOrders = (): WorkOrder[] => [
    {
        id: '1', otNumber: 'OT-591',
        plantId: 'plant-1', plantName: 'Planta Monterrey', processName: 'Prensado', subprocessName: 'Línea 1',
        machineId: 'mach-ph02', machineCode: 'M-PH02', machineName: 'Prensa Hidráulica PH-02',
        reportDate: new Date(Date.now() - 1000 * 60 * 45).toISOString(), 
        detectorName: 'Juan Operador', shift: 'Turno 1', requestType: 'Mantenimiento correctivo',
        machineStatus: 'Paro total',
        description: 'La máquina se detuvo abruptamente y huele a quemado.',
        symptoms: ['Olor a quemado', 'Paros frecuentes durante el ciclo'],
        aiData: {
            classification: 'Falla en Sistema de Potencia',
            priority: 'P1',
            riskLevel: 'Alto',
            productionImpact: 'Paro total',
            qualityImpact: false,
            operatorInstructions: 'No intentar reiniciar. Cortar energía.',
            rootCauses: [{ cause: 'Cortocircuito en motor', probability: '90%' }],
            suggestedActions: ['Revisar fusibles', 'Medir voltaje']
        },
        status: 'assigned',
        assignedTo: 'Carlos Ruiz',
        slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), 
        logs: [
            { date: new Date(Date.now() - 1000 * 60 * 45).toISOString(), action: 'Creación', user: 'Juan Operador' },
            { date: new Date(Date.now() - 1000 * 60 * 30).toISOString(), action: 'Asignación', user: 'Supervisor' },
        ],
        technicalReport: {
            inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
        }
    },
    {
        id: '2', otNumber: 'OT-592',
        plantId: 'plant-1', plantName: 'Planta Monterrey', processName: 'Ensamblaje', subprocessName: 'Soldadura',
        machineId: 'mach-sol-01', machineCode: 'M-SOL-01', machineName: 'Robot Soldador Kuka',
        reportDate: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), 
        detectorName: 'Maria Calidad', shift: 'Turno 1', requestType: 'Comportamiento anómalo',
        machineStatus: 'Funciona con falla',
        description: 'El robot tiene vibración al soldar esquinas.',
        symptoms: ['Vibración excesiva'],
        aiData: {
            classification: 'Descalibración de Eje',
            priority: 'P2',
            riskLevel: 'Medio',
            productionImpact: 'Reducción de velocidad',
            qualityImpact: true,
            operatorInstructions: 'Reducir velocidad al 80%.',
            rootCauses: [{ cause: 'Desgaste en articulación 3', probability: '75%' }],
            suggestedActions: ['Engrasar articulaciones', 'Recalibrar TCP']
        },
        status: 'unassigned',
        assignedTo: '',
        slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
        logs: [{ date: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), action: 'Creación', user: 'Maria Calidad' }],
        technicalReport: {
            inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
        }
    }
];

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('AI_ASSISTANT');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [plants, setPlants] = useState<Plant[]>(initialPlantsData);
  const [language, setLanguage] = useState('Español'); 
  
  // State for AI Context Handover
  const [aiContext, setAiContext] = useState<AiStartContext | null>(null);

  // Lifted State for Work Orders
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(generateMockOrders());
  
  // Lifted State for History Events
  const [historyEvents, setHistoryEvents] = useState<HistoryEvent[]>([]);

  // Lifted State for Document Code Structure (Default Pattern)
  const [docCodePattern, setDocCodePattern] = useState('AAA-1111-A');

  const handleAddWorkOrder = (order: WorkOrder) => {
      setWorkOrders(prev => [order, ...prev]);
  };

  const handleAddHistoryEvent = (event: HistoryEvent) => {
      setHistoryEvents(prev => [event, ...prev]);
  };

  const handleAiConsultation = (context: AiStartContext) => {
      setAiContext(context);
      setActiveView('AI_ASSISTANT');
  };

  const renderView = () => {
    switch (activeView) {
      case 'AI_ASSISTANT':
        return <AIAssistant plants={plants} onAddWorkOrder={handleAddWorkOrder} onAddHistoryEvent={handleAddHistoryEvent} initialContext={aiContext} onClearContext={() => setAiContext(null)} />;
      case 'RECENT_HISTORY':
        return <RecentHistory extraEvents={historyEvents} />;
      case 'DOCUMENT_CONTROL_SYSTEM':
        return <DocumentControl setActiveView={setActiveView} />;
      case 'DOCUMENTS_BY_PROCESS':
        return <TaProcedures plants={plants} setPlants={setPlants} docCodePattern={docCodePattern} />;
      case 'CERTIFICATION_DOCUMENTS':
        return <CertificationDocuments plants={plants} setPlants={setPlants} />;
      case 'WORK_INSTRUCTIONS':
        return <WorkInstructions plants={plants} />;
      case 'IA_CRM_ASSISTANT':
        return <IaCrmAssistant />;
      case 'IA_RH_ASSISTANT':
        return <IaRhAssistant />;
      case 'AI_VISION_QUALITY':
        return <AiVisionQuality />;
      
      case 'PRODUCTION_AUDIT':
        return <ProductionAudit setActiveView={setActiveView} />;
      case 'TECHNICAL_ASSISTANCE':
        return <TechnicalAssistance setActiveView={setActiveView} />;
      case 'PLANTS_PROCESS':
        return <PlantsProcess plants={plants} setPlants={setPlants} />;
      case 'ADMINISTRATION':
        return <Administration plants={plants} docCodePattern={docCodePattern} setDocCodePattern={setDocCodePattern} />;
      case 'SETTINGS':
        return <Settings language={language} setLanguage={setLanguage} />;
      
      // Production Audit Sub-views
      case 'PA_DASHBOARD':
        return <PaDashboard plants={plants} />;
      case 'PA_COMPLIANCE_MAP':
        return <ComplianceMap plants={plants} />;
      case 'PA_FORMS':
        return <ComplianceForms plants={plants} setPlants={setPlants} />;

      // Technical Assistance Sub-views
      case 'TA_DASHBOARD':
         return <TaDashboard plants={plants} />;
      case 'TA_WORK_ORDERS':
        return <TaWorkOrders plants={plants} orders={workOrders} setOrders={setWorkOrders} />;
      case 'TA_MACHINES':
        return <TaMachines plants={plants} setPlants={setPlants} onAddWorkOrder={handleAddWorkOrder} workOrders={workOrders} historyEvents={historyEvents} onAiConsultation={handleAiConsultation} />;
      case 'TA_PROCEDURES':
        return <TaProcedures plants={plants} setPlants={setPlants} docCodePattern={docCodePattern} />;
      
      default:
        return <div className="text-gray-800">View not found</div>;
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 text-gray-800 font-sans">
      <Sidebar 
        activeView={activeView} 
        setActiveView={setActiveView} 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        language={language}
      />
      <div className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isSidebarOpen ? (isCollapsed ? 'ml-20' : 'ml-64') : 'ml-0'}`}>
        <Header 
            title={ViewTitle[activeView]} 
            onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
            onAiClick={() => setActiveView('AI_ASSISTANT')}
            onHistoryClick={() => setActiveView('RECENT_HISTORY')}
            onProfileClick={() => setActiveView('SETTINGS')}
            language={language}
        />
        <main className="flex-1 p-6 overflow-y-auto">
          {renderView()}
        </main>
      </div>
    </div>
  );
};

export default App;