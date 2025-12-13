
import React, { useState, useEffect, useRef } from 'react';
import { SearchIcon, FilterIcon, PlusCircleIcon, XIcon, WrenchScrewdriverIcon, CheckCircleIcon, ClockIcon, MicrophoneIcon, PaperclipIcon, CameraIcon, AIAssistantIcon, SendIcon, EyeIcon, SignalIcon, DocumentTextIcon, UserIcon, ArrowUpOnSquareIcon, TicketIcon, CalendarIcon } from '../components/icons/Icons';
import { Plant, Process, Subprocess, Machine, WorkOrder, WorkOrderStatus, WorkOrderPriority, RiskLevel, MachineStatus, WorkOrderLog, TechnicalReport } from '../types';

interface TaWorkOrdersProps {
    plants?: Plant[];
    orders: WorkOrder[];
    setOrders: React.Dispatch<React.SetStateAction<WorkOrder[]>>;
}

// --- CONSTANTS ---

const MOCK_TECH_USERS = [
    { id: 'u1', name: 'Juan Pérez', role: 'Técnico Mecánico' },
    { id: 'u2', name: 'Carlos Ruiz', role: 'Técnico Eléctrico' },
    { id: 'u3', name: 'Maria Garcia', role: 'Ingeniera de Control' },
    { id: 'u4', name: 'Pedro Gomez', role: 'Técnico General' },
    { id: 'u5', name: 'Luis Hernandez', role: 'Lubricador' },
];

// --- HELPERS ---

const getStatusBadge = (status: WorkOrderStatus) => {
    const styles: Record<WorkOrderStatus, string> = {
        unassigned: 'bg-gray-100 text-gray-600 border-gray-200',
        assigned: 'bg-blue-50 text-blue-600 border-blue-200',
        in_progress: 'bg-blue-100 text-blue-700 border-blue-300',
        on_hold: 'bg-orange-100 text-orange-700 border-orange-300',
        testing: 'bg-purple-100 text-purple-700 border-purple-300',
        closed: 'bg-green-100 text-green-700 border-green-300',
        cancelled: 'bg-red-50 text-red-600 border-red-200',
    };
    const labels: Record<WorkOrderStatus, string> = {
        unassigned: 'Por Asignar',
        assigned: 'Asignada',
        in_progress: 'En Ejecución',
        on_hold: 'Pendiente Refacciones', 
        testing: 'En Pruebas',
        closed: 'Cerrada',
        cancelled: 'Cancelada',
    };
    return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${styles[status]}`}>{labels[status]}</span>;
};

const getPriorityBadge = (priority: WorkOrderPriority) => {
    const styles = {
        P1: 'bg-red-100 text-red-700 border-red-200',
        P2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        P3: 'bg-blue-50 text-blue-600 border-blue-100',
    };
    return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${styles[priority]}`}>{priority}</span>;
};

const getMachineStatusBadge = (status: MachineStatus) => {
     const styles: Record<MachineStatus, string> = {
        'Paro total': 'bg-red-600 text-white',
        'Funciona con falla': 'bg-yellow-400 text-yellow-900',
        'Solo alarma en pantalla': 'bg-blue-400 text-white',
        'Duda de operación': 'bg-gray-400 text-white',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${styles[status]}`}>{status}</span>;
};

const calculateTimeElapsed = (dateString: string) => {
    const start = new Date(dateString).getTime();
    const now = new Date().getTime();
    const diff = now - start;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// --- SUB-COMPONENTS (Extracted) ---

const KPICard = ({ title, value, colorClass, subtitle }: any) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 ${colorClass} flex flex-col justify-between`}>
        <p className="text-xs text-gray-500 uppercase font-bold">{title}</p>
        <div className="flex items-end justify-between mt-2">
            <span className="text-2xl font-bold text-gray-800">{value}</span>
            {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
    </div>
);

const DictationInput = ({ label, value, onChange, multiline = false }: any) => (
    <div className="mb-3">
        <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
        <div className="relative">
            {multiline ? (
                <textarea 
                    className="w-full p-2 pr-8 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500" 
                    rows={2}
                    value={value}
                    onChange={onChange}
                />
            ) : (
                <input 
                    type="text" 
                    className="w-full p-2 pr-8 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:ring-blue-500 focus:border-blue-500"
                    value={value}
                    onChange={onChange}
                />
            )}
            <button className="absolute right-2 top-2 text-gray-400 hover:text-red-500 transition-colors" title="Dictar por voz">
                <MicrophoneIcon className="w-4 h-4" />
            </button>
        </div>
    </div>
);

// -- MODALS --

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel, confirmColor = 'bg-blue-600' }: any) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm m-4">
                <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
                <p className="text-gray-600 mb-6 text-sm">{message}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onCancel} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-sm">Cancelar</button>
                    <button onClick={onConfirm} className={`px-4 py-2 text-white rounded font-semibold text-sm ${confirmColor}`}>Confirmar</button>
                </div>
            </div>
        </div>
    );
};

const AssignUserModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean, onClose: () => void, onSelect: (user: string) => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md m-4 flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-gray-800">Asignar Orden de Trabajo</h3>
                    <button onClick={onClose}><XIcon className="w-5 h-5 text-gray-400 hover:text-red-500" /></button>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                    <p className="text-sm text-gray-500 mb-3">Seleccione un técnico para asignar:</p>
                    <div className="space-y-2">
                        {MOCK_TECH_USERS.map(user => (
                            <button 
                                key={user.id}
                                onClick={() => onSelect(user.name)}
                                className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center gap-3 group"
                            >
                                <div className="bg-gray-100 p-2 rounded-full group-hover:bg-blue-200 text-gray-600 group-hover:text-blue-700">
                                    <UserIcon className="w-5 h-5"/>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800 text-sm">{user.name}</p>
                                    <p className="text-xs text-gray-500">{user.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

interface SidePanelProps {
    selectedOrder: WorkOrder;
    orders: WorkOrder[];
    onClose: () => void;
    onAssign: (id: string) => void;
    onStatusChange: (id: string, newStatus: WorkOrderStatus, actionLabel: string, comment?: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedOrder, orders, onClose, onAssign, onStatusChange }) => {
    const o = orders.find(ord => ord.id === selectedOrder.id) || selectedOrder;
    const [tab, setTab] = useState<'form' | 'tracking'>('form');
    
    // Local state for form
    const [techReport, setTechReport] = useState<TechnicalReport>(o.technicalReport || {
         inspections: '', measurements: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: '', preventiveMeasures: ''
    });
    
    // Confirmation State
    const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean, action: 'hold' | 'close' | 'cancel' | null }>({ isOpen: false, action: null });

    // Available Actions Checkboxes
    const actionOptions = [
        'Ajuste', 'Limpieza', 'Sustitución de componente', 'Calibración', 'Actualización software',
        'Reparación eléctrica', 'Reparación mecánica', 'Acción temporal', 'Solo verificación', 'Otro'
    ];

    const handleCheckboxChange = (option: string) => {
        setTechReport(prev => {
            const newActions = prev.actions.includes(option) 
                ? prev.actions.filter(a => a !== option)
                : [...prev.actions, option];
            return { ...prev, actions: newActions };
        });
    };

    const handleExecuteAction = () => {
        if (!confirmAction.action) return;
        
        let status: WorkOrderStatus = 'in_progress'; // default
        let label = '';
        
        switch (confirmAction.action) {
            case 'hold':
                status = 'on_hold';
                label = 'Pendiente Refacciones';
                break;
            case 'close':
                status = 'closed';
                label = 'Cierre de OT';
                break;
            case 'cancel':
                status = 'cancelled';
                label = 'Cancelación de OT';
                break;
        }
        
        // In a real app, we would save the techReport here too
        onStatusChange(o.id, status, label, `Acción ejecutada desde panel.`);
        setConfirmAction({ isOpen: false, action: null });
        if (status === 'closed' || status === 'cancelled') onClose();
    };

    const openAIContext = () => {
        alert("Abriendo Asistente IA con contexto de:\n" + o.machineName + "\nFalla: " + o.description);
        // In real impl, this would navigate or open overlay
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[550px] bg-white shadow-2xl z-40 flex flex-col animate-slide-in">
            {/* Header */}
            <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {o.otNumber}
                        {getStatusBadge(o.status)}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">{o.machineName}</p>
                </div>
                <button onClick={onClose} className="p-1 hover:bg-gray-200 rounded text-gray-500"><XIcon /></button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10">
                <button 
                    onClick={() => setTab('form')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'form' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    Formulario OT
                </button>
                <button 
                    onClick={() => setTab('tracking')}
                    className={`flex-1 py-3 text-sm font-bold border-b-2 transition-colors ${tab === 'tracking' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
                >
                    Historial y Tiempos
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-50">
                {tab === 'form' && (
                    <div className="space-y-6 pb-20">
                        {/* 1. Summary Info */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                             <div className="flex justify-between items-center mb-3">
                                <h4 className="text-xs font-bold text-gray-400 uppercase">Datos Generales</h4>
                                {o.status === 'unassigned' && (
                                    <button onClick={() => onAssign(o.id)} className="px-2 py-1 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700">Asignar Ahora</button>
                                )}
                            </div>
                             <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                <div><span className="font-semibold text-gray-600">Responsable:</span> <span className='text-gray-800'>{o.assignedTo || 'Sin asignar'}</span></div>
                                <div><span className="font-semibold text-gray-600">Turno:</span> <span className='text-gray-800'>{o.shift}</span></div>
                                <div><span className="font-semibold text-gray-600">Prioridad IA:</span> {getPriorityBadge(o.aiData?.priority || 'P3')}</div>
                                <div><span className="font-semibold text-gray-600">Estado Maq:</span> {getMachineStatusBadge(o.machineStatus)}</div>
                             </div>
                        </div>

                        {/* 2. Report Description & AI Diagnosis */}
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Descripción del Reporte</h4>
                            <p className="text-sm text-gray-800 mb-4 leading-relaxed bg-gray-50 p-2 rounded border border-gray-100">{o.description}</p>
                            
                            {/* Integrated AI Diagnosis */}
                            {o.aiData && (
                                <div className="mt-4 border-t border-indigo-100 pt-4">
                                    <div className="flex items-center gap-2 mb-3 text-indigo-700 font-bold">
                                        <AIAssistantIcon className="w-5 h-5" />
                                        PRE-DIAGNÓSTICO IA
                                    </div>
                                    <div className="bg-indigo-50 p-3 rounded-md border border-indigo-100 space-y-3">
                                        <div>
                                            <span className="text-xs font-bold text-indigo-800">Clasificación:</span>
                                            <span className="ml-2 text-sm text-gray-800">{o.aiData.classification}</span>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-indigo-800 block mb-1">Instrucciones al Operador:</span>
                                            <p className="text-sm text-gray-700 bg-white p-2 rounded border border-indigo-100">{o.aiData.operatorInstructions}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold text-indigo-800 block mb-1">Posibles Causas Raíz:</span>
                                            <ul className="list-disc pl-5 text-sm text-gray-700">
                                                {o.aiData.rootCauses.map((rc, i) => <li key={i}>{rc.cause} ({rc.probability})</li>)}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 3. Technical Follow-up Form */}
                        <div className="bg-white p-4 rounded-lg border border-blue-200 shadow-sm ring-1 ring-blue-100">
                            <h4 className="text-sm font-bold text-blue-800 uppercase mb-4 flex items-center gap-2">
                                <WrenchScrewdriverIcon className="w-4 h-4"/> Seguimiento Técnico
                            </h4>
                            
                            <DictationInput label="Inspecciones realizadas" value={techReport.inspections} onChange={(e: any) => setTechReport({...techReport, inspections: e.target.value})} multiline />
                            <DictationInput label="Medidas / lecturas clave tomadas" value={techReport.measurements} onChange={(e: any) => setTechReport({...techReport, measurements: e.target.value})} multiline />
                            
                            <button 
                                onClick={openAIContext}
                                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2 rounded-lg font-bold text-sm shadow hover:shadow-md transition-all mb-4"
                            >
                                <AIAssistantIcon className="w-5 h-5" /> Consulta Técnica IA
                            </button>

                            <DictationInput label="Diagnóstico Técnico" value={techReport.diagnosis} onChange={(e: any) => setTechReport({...techReport, diagnosis: e.target.value})} multiline />
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 mb-2">¿Coincidencia entre diagnóstico IA y técnico?</label>
                                <div className="flex gap-4">
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" name="aiMatch" checked={techReport.aiMatch === 'yes'} onChange={() => setTechReport({...techReport, aiMatch: 'yes'})} className="text-blue-600"/> Sí
                                    </label>
                                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                                        <input type="radio" name="aiMatch" checked={techReport.aiMatch === 'no'} onChange={() => setTechReport({...techReport, aiMatch: 'no'})} className="text-blue-600"/> No
                                    </label>
                                </div>
                            </div>

                            <DictationInput label="Causa raíz técnica confirmada" value={techReport.rootCause} onChange={(e: any) => setTechReport({...techReport, rootCause: e.target.value})} multiline />
                            
                            <div className="mb-4">
                                <label className="block text-xs font-bold text-gray-700 mb-2">Tipo de acción ejecutada</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {actionOptions.map(opt => (
                                        <label key={opt} className="flex items-start gap-2 text-xs text-gray-700 cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                checked={techReport.actions.includes(opt)} 
                                                onChange={() => handleCheckboxChange(opt)}
                                                className="mt-0.5 rounded text-blue-600"
                                            />
                                            {opt}
                                        </label>
                                    ))}
                                </div>
                                {techReport.actions.includes('Otro') && (
                                    <input 
                                        type="text" 
                                        placeholder="Especifique otra acción..." 
                                        className="w-full mt-2 p-2 bg-white border border-gray-300 rounded text-sm"
                                        value={techReport.otherActionDetail}
                                        onChange={e => setTechReport({...techReport, otherActionDetail: e.target.value})}
                                    />
                                )}
                            </div>

                            <DictationInput label="Insumos Utilizados" value={techReport.supplies} onChange={(e: any) => setTechReport({...techReport, supplies: e.target.value})} multiline />
                            <DictationInput label="Medidas preventivas" value={techReport.preventiveMeasures} onChange={(e: any) => setTechReport({...techReport, preventiveMeasures: e.target.value})} multiline />
                        </div>
                    </div>
                )}

                {tab === 'tracking' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between text-sm bg-white p-3 rounded border border-gray-200">
                            <span className="text-gray-500">Tiempo Transcurrido</span>
                            <span className="font-mono font-bold text-lg text-gray-800">{calculateTimeElapsed(o.reportDate)}</span>
                        </div>
                        <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6 pb-2">
                            {o.logs.map((log, idx) => (
                                <div key={idx} className="relative">
                                    <div className="absolute -left-[31px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500"></div>
                                    <p className="text-xs text-gray-400 mb-0.5">{new Date(log.date).toLocaleString()}</p>
                                    <p className="text-sm font-bold text-gray-800">{log.action}</p>
                                    <p className="text-xs text-gray-600">{log.user}</p>
                                    {log.comment && <p className="mt-1 text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 italic">"{log.comment}"</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Action Bar */}
            <div className="p-4 border-t border-gray-200 bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] flex justify-end gap-2 z-20">
                <button 
                    onClick={() => setConfirmAction({ isOpen: true, action: 'hold' })}
                    className="px-4 py-2 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-bold text-xs transition-colors"
                >
                    Pendiente Refacciones
                </button>
                <button 
                    onClick={() => setConfirmAction({ isOpen: true, action: 'cancel' })}
                    className="px-4 py-2 bg-red-100 text-red-700 hover:bg-red-200 rounded-lg font-bold text-xs transition-colors"
                >
                    Cancelar
                </button>
                <button 
                    onClick={() => setConfirmAction({ isOpen: true, action: 'close' })}
                    className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold text-xs transition-colors shadow-md"
                >
                    Cerrar OT
                </button>
            </div>

            {/* Confirm Dialog */}
            <ConfirmationModal 
                isOpen={confirmAction.isOpen}
                title={confirmAction.action === 'close' ? 'Cerrar Orden de Trabajo' : confirmAction.action === 'hold' ? 'Pausar por Refacciones' : 'Cancelar Orden'}
                message={`¿Está seguro que desea proceder con esta acción? El estado de la OT cambiará.`}
                onConfirm={handleExecuteAction}
                onCancel={() => setConfirmAction({ isOpen: false, action: null })}
                confirmColor={confirmAction.action === 'close' ? 'bg-green-600' : confirmAction.action === 'hold' ? 'bg-orange-500' : 'bg-red-600'}
            />
        </div>
    );
};

// --- CREATE WORK ORDER MODAL (Restored Full Functionality) ---

interface CreateWorkOrderState {
    // 1. Encabezado
    otNumber: string;
    reportDate: string;
    userId: string;
    detectorName: string;
    shift: string;
    requestType: string;

    // 2. Maquina
    plantId: string;
    processId: string;
    subprocessId: string;
    machineId: string;
    machineCode: string;
    machineName: string;
    operatingHours: string;

    // 3. Estado Actual
    currentStatus: string; // Machine Status
    safetyRisk: string;
    failureMoment: string;

    // 4. Descripción
    failureDescription: string;
    symptoms: string[];
    otherSymptomDetail: string;
    alarmCodes: string;
    alarmMessages: string;
    sinceWhen: string;
    frequency: string;

    // 5. Condiciones Operación
    productModel: string;
    recentAdjustments: string; // "yes" | "no"
    adjustmentsDetail: string;

    // 6. Impacto
    productionImpact: string;
    qualityImpact: string; // "yes" | "no"
    defectType: string;
    defectDescription: string;

    // 7. Evidencia
    files: FileList | null;
}

interface CreateWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    plants: Plant[];
    onSave: (data: any) => void;
}

const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({ isOpen, onClose, plants, onSave }) => {
    const [formData, setFormData] = useState<CreateWorkOrderState>({
        otNumber: `OT-${Math.floor(100000 + Math.random() * 900000)}`,
        reportDate: new Date().toLocaleString(),
        userId: 'Ana Lopez', // Mock current user
        detectorName: '',
        shift: '',
        requestType: '',
        plantId: '', processId: '', subprocessId: '', machineId: '', machineCode: '', machineName: '', operatingHours: '',
        currentStatus: '', safetyRisk: '', failureMoment: '',
        failureDescription: '', symptoms: [], otherSymptomDetail: '', alarmCodes: '', alarmMessages: '', sinceWhen: '', frequency: '',
        productModel: '', recentAdjustments: '', adjustmentsDetail: '',
        productionImpact: '', qualityImpact: '', defectType: '', defectDescription: '',
        files: null
    });

    const [aiDiagnosis, setAiDiagnosis] = useState<any>(null);
    const [isSimulatingAI, setIsSimulatingAI] = useState(false);

    // Cascading Logic Helpers
    const selectedPlant = plants.find(p => p.id === formData.plantId);
    const selectedProcess = selectedPlant?.processes.find(p => p.id === formData.processId);
    const selectedSubprocess = selectedProcess?.subprocesses.find(s => s.id === formData.subprocessId);
    const availableMachines = selectedSubprocess?.machines || selectedProcess?.machines || selectedPlant?.machines || [];

    const handleChange = (field: keyof CreateWorkOrderState, value: any) => {
        setFormData(prev => {
            const updates: any = { [field]: value };
            
            // Reset downstream selections if upstream changes
            if (field === 'plantId') {
                updates.processId = ''; updates.subprocessId = ''; updates.machineId = ''; updates.machineCode = ''; updates.machineName = '';
            }
            if (field === 'processId') {
                updates.subprocessId = ''; updates.machineId = ''; updates.machineCode = ''; updates.machineName = '';
            }
            if (field === 'subprocessId') {
                 updates.machineId = ''; updates.machineCode = ''; updates.machineName = '';
            }
            // Auto-fill machine info
            if (field === 'machineId') {
                const m = availableMachines.find(m => m.id === value);
                if (m) {
                    updates.machineCode = m.code;
                    updates.machineName = m.name;
                }
            }

            return { ...prev, ...updates };
        });
    };

    const handleSymptomToggle = (symptom: string) => {
        setFormData(prev => {
            const exists = prev.symptoms.includes(symptom);
            return {
                ...prev,
                symptoms: exists ? prev.symptoms.filter(s => s !== symptom) : [...prev.symptoms, symptom]
            };
        });
    };

    const simulateAIDiagnosis = () => {
        // Simple validation
        if (!formData.plantId || !formData.machineId || !formData.failureDescription) {
             alert("Por favor complete los campos obligatorios de máquina y falla.");
             return;
        }

        setIsSimulatingAI(true);
        
        // Simulate API latency
        setTimeout(() => {
            // Mock Logic based on inputs
            const isHighRisk = formData.safetyRisk === 'Riesgo alto' || formData.currentStatus === 'Paro total';
            const mockResult = {
                operatorInstructions: "DETENER MÁQUINA INMEDIATAMENTE. No intentar reiniciar. Verificar suministro eléctrico principal.",
                classification: formData.symptoms.includes('Olor a quemado') ? "Posible Cortocircuito / Sobrecalentamiento Motor" : "Falla Mecánica General",
                priority: isHighRisk ? "P1" : "P2",
                riskLevel: isHighRisk ? "Alto" : "Medio",
                rootCauses: [
                    { cause: "Desgaste prematuro de componentes", probability: "85%" },
                    { cause: "Falla en sensor de posición", probability: "60%" },
                    { cause: "Error de operación / sobrecarga", probability: "40%" }
                ],
                suggestedActions: [
                    "Verificar voltajes de entrada",
                    "Inspeccionar visualmente cableado",
                    "Revisar logs de error en HMI"
                ]
            };
            setAiDiagnosis(mockResult);
            setIsSimulatingAI(false);
            // Simulate notification
            alert(`Notificación enviada a: ${formData.userId} (Email/WhatsApp) con estatus: Enviado`);
        }, 2500);
    };

    const handleFinalSave = () => {
        onSave({ ...formData, aiDiagnosis });
        onClose();
    };

    if (!isOpen) return null;

    // --- RENDER AI RESULT VIEW ---
    if (aiDiagnosis) {
        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center animate-fade-in">
                <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 p-4 flex items-center gap-3 text-white">
                         <AIAssistantIcon className="w-8 h-8"/>
                         <div>
                             <h3 className="font-bold text-lg">PRE-DIAGNÓSTICO GENERADO POR IA</h3>
                             <p className="text-blue-100 text-xs">Análisis basado en historial y síntomas reportados</p>
                         </div>
                    </div>
                    <div className="p-6 overflow-y-auto flex-1 space-y-6">
                         <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                             <h4 className="text-sm font-bold text-blue-800 mb-2">Instrucciones al Operador</h4>
                             <p className="text-gray-800 text-base font-medium">{aiDiagnosis.operatorInstructions}</p>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Clasificación</p>
                                 <p className="font-bold text-indigo-700">{aiDiagnosis.classification}</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Prioridad Sugerida</p>
                                 <p className={`font-bold ${aiDiagnosis.priority === 'P1' ? 'text-red-600' : 'text-yellow-600'}`}>{aiDiagnosis.priority}</p>
                             </div>
                             <div className="bg-gray-50 p-3 rounded border border-gray-200">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Nivel de Riesgo</p>
                                 <p className={`font-bold ${aiDiagnosis.riskLevel === 'Alto' ? 'text-red-600' : 'text-orange-600'}`}>{aiDiagnosis.riskLevel}</p>
                             </div>
                         </div>

                         <div>
                             <h4 className="text-sm font-bold text-gray-700 mb-2">Probables Causas Raíz</h4>
                             <ul className="space-y-2">
                                 {aiDiagnosis.rootCauses.map((rc: any, i: number) => (
                                     <li key={i} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded">
                                         <span className="text-sm text-gray-700">{rc.cause}</span>
                                         <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded">{rc.probability}</span>
                                     </li>
                                 ))}
                             </ul>
                         </div>

                         <div>
                             <h4 className="text-sm font-bold text-gray-700 mb-2">Acciones Sugeridas</h4>
                             <ul className="list-disc list-inside text-sm text-gray-600 bg-gray-50 p-3 rounded border border-gray-200">
                                 {aiDiagnosis.suggestedActions.map((act: string, i: number) => (
                                     <li key={i}>{act}</li>
                                 ))}
                             </ul>
                         </div>
                    </div>
                    <div className="p-4 bg-gray-50 border-t flex justify-end">
                        <button onClick={handleFinalSave} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-bold shadow-lg transition-transform transform hover:scale-105">
                            Enterado (Guardar OT)
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[70] flex items-center justify-center animate-fade-in">
            <div className="bg-white w-full max-w-4xl rounded-xl shadow-2xl overflow-hidden flex flex-col h-[90vh]">
                {/* HEADER */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-xl">Solicitud de Orden de Trabajo Técnico</h3>
                        <p className="text-gray-400 text-xs mt-1">Complete la información para iniciar el diagnóstico IA</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>

                {/* LOADING STATE */}
                {isSimulatingAI ? (
                    <div className="flex-1 flex flex-col items-center justify-center bg-white space-y-6">
                        <div className="relative">
                            <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <AIAssistantIcon className="w-8 h-8 text-blue-600 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
                        </div>
                        <div className="text-center">
                            <h4 className="text-xl font-bold text-gray-800">Analizando Solicitud...</h4>
                            <p className="text-gray-500 mt-2">Consultando historial de máquina y documentos técnicos</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-6">
                        
                        {/* SECCIÓN 1: ENCABEZADO */}
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">1. Encabezado de la Solicitud</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Número OT</label><input disabled value={formData.otNumber} className="w-full bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-500"/></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Fecha Reporte</label><input disabled value={formData.reportDate} className="w-full bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-500"/></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Usuario</label><input disabled value={formData.userId} className="w-full bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-500"/></div>
                                <div className="space-y-1"><label className="text-xs font-bold text-gray-700">Detectó Falla *</label><input value={formData.detectorName} onChange={e => handleChange('detectorName', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm focus:ring-2 focus:ring-blue-500"/></div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Turno *</label>
                                    <select value={formData.shift} onChange={e => handleChange('shift', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Turno 1">Turno 1</option>
                                        <option value="Turno 2">Turno 2</option>
                                        <option value="Turno 3">Turno 3</option>
                                        <option value="Mixto">Mixto</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Tipo Solicitud *</label>
                                    <select value={formData.requestType} onChange={e => handleChange('requestType', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Mantenimiento correctivo">Mantenimiento correctivo</option>
                                        <option value="Alarma en equipo">Alarma en equipo</option>
                                        <option value="Comportamiento anómalo">Comportamiento anómalo</option>
                                        <option value="Duda operación">Duda operación</option>
                                        <option value="Otro">Otro</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 2: MAQUINA */}
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">2. Identificación de Máquina y Proceso</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Planta *</label>
                                    <select value={formData.plantId} onChange={e => handleChange('plantId', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar Planta...</option>
                                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Proceso *</label>
                                    <select value={formData.processId} onChange={e => handleChange('processId', e.target.value)} disabled={!formData.plantId} className="w-full bg-white border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100">
                                        <option value="">Seleccionar Proceso...</option>
                                        {selectedPlant?.processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Subproceso *</label>
                                    <select value={formData.subprocessId} onChange={e => handleChange('subprocessId', e.target.value)} disabled={!formData.processId} className="w-full bg-white border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100">
                                        <option value="">Seleccionar Subproceso...</option>
                                        {selectedProcess?.subprocesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Máquina (Código) *</label>
                                    <select value={formData.machineId} onChange={e => handleChange('machineId', e.target.value)} disabled={!formData.processId} className="w-full bg-white border border-gray-300 rounded p-2 text-sm disabled:bg-gray-100">
                                        <option value="">Buscar Máquina...</option>
                                        {availableMachines.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Nombre Descriptivo</label>
                                    <input disabled value={formData.machineName} className="w-full bg-gray-100 border border-gray-300 rounded p-2 text-sm text-gray-600"/>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Horas Operación</label>
                                    <input type="number" value={formData.operatingHours} onChange={e => handleChange('operatingHours', e.target.value)} placeholder="Ej. 12500" className="w-full bg-white border border-gray-300 rounded p-2 text-sm"/>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 3: ESTADO ACTUAL */}
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">3. Estado Actual de la Máquina</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Estado *</label>
                                    <select value={formData.currentStatus} onChange={e => handleChange('currentStatus', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Paro total">Paro total (No produce)</option>
                                        <option value="Funciona con falla">Funciona con falla</option>
                                        <option value="Solo alarma en pantalla">Solo alarma en pantalla</option>
                                        <option value="Duda de operación">Duda de operación</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Riesgo Seguridad *</label>
                                    <select value={formData.safetyRisk} onChange={e => handleChange('safetyRisk', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Ningún riesgo aparente">Ningún riesgo aparente</option>
                                        <option value="Riesgo potencial">Riesgo potencial</option>
                                        <option value="Riesgo alto">Riesgo alto</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-700">Momento Falla *</label>
                                    <select value={formData.failureMoment} onChange={e => handleChange('failureMoment', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                        <option value="">Seleccionar...</option>
                                        <option value="Continua">Continua</option>
                                        <option value="Intermitente">Intermitente</option>
                                        <option value="Al arrancar">Al arrancar</option>
                                        <option value="Operación normal">Operación normal</option>
                                    </select>
                                </div>
                            </div>
                        </section>

                        {/* SECCIÓN 4: DESCRIPCIÓN */}
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">4. Descripción de la Falla</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-1 block">Descripción Detallada *</label>
                                    <div className="relative">
                                        <textarea value={formData.failureDescription} onChange={e => handleChange('failureDescription', e.target.value)} rows={3} className="w-full bg-white border border-gray-300 rounded p-2 pr-8 text-sm" placeholder="Describa qué sucede..."/>
                                        <MicrophoneIcon className="absolute right-2 top-2 w-5 h-5 text-gray-400 cursor-pointer hover:text-blue-500"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-gray-700 mb-2 block">Síntomas Observados *</label>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                        {['Ruidos anormales', 'Vibración excesiva', 'Fugas aceite', 'Fugas agua', 'Fugas aire', 'Temp alta', 'Pérdida presión', 'Piezas fuera medida', 'Paros frecuentes', 'Olor quemado', 'Fallo eléctrico', 'Alarmas recurrentes', 'Otro'].map(sym => (
                                            <label key={sym} className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer bg-gray-50 p-2 rounded hover:bg-gray-100">
                                                <input type="checkbox" checked={formData.symptoms.includes(sym)} onChange={() => handleSymptomToggle(sym)} className="rounded text-blue-600"/>
                                                {sym}
                                            </label>
                                        ))}
                                    </div>
                                    {formData.symptoms.includes('Otro') && (
                                        <input placeholder="Especifique otro síntoma" value={formData.otherSymptomDetail} onChange={e => handleChange('otherSymptomDetail', e.target.value)} className="mt-2 w-full border border-gray-300 rounded p-2 text-sm"/>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div><label className="text-xs font-bold text-gray-700">Códigos Alarma</label><input value={formData.alarmCodes} onChange={e => handleChange('alarmCodes', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm" placeholder="Ej. E-101, F-45"/></div>
                                    <div><label className="text-xs font-bold text-gray-700">Mensaje Alarma</label><input value={formData.alarmMessages} onChange={e => handleChange('alarmMessages', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm"/></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700">¿Desde cuándo?</label>
                                        <select value={formData.sinceWhen} onChange={e => handleChange('sinceWhen', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                            <option value="">Seleccionar...</option>
                                            <option value="Ahora">Ahora</option>
                                            <option value="Este turno">Este turno</option>
                                            <option value="48 hrs">48 hrs</option>
                                            <option value="+72hrs">+72hrs</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700">Frecuencia</label>
                                        <select value={formData.frequency} onChange={e => handleChange('frequency', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                            <option value="">Seleccionar...</option>
                                            <option value="Primera vez">Primera vez</option>
                                            <option value="Esporádica">Esporádica</option>
                                            <option value="Siempre">Siempre</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </section>
                        
                        {/* SECCIÓN 5 & 6: CONDICIONES & IMPACTO */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                             <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">5. Condiciones Operación</h4>
                                <div className="space-y-3">
                                    <div><label className="text-xs font-bold text-gray-700">Modelo/Producto</label><input value={formData.productModel} onChange={e => handleChange('productModel', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm"/></div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">¿Se realizaron ajustes recientes a la maquina?</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="adj" checked={formData.recentAdjustments === 'yes'} onChange={() => handleChange('recentAdjustments', 'yes')}/> Sí</label>
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="adj" checked={formData.recentAdjustments === 'no'} onChange={() => handleChange('recentAdjustments', 'no')}/> No</label>
                                        </div>
                                    </div>
                                    {formData.recentAdjustments === 'yes' && (
                                        <textarea placeholder="Describa los ajustes..." value={formData.adjustmentsDetail} onChange={e => handleChange('adjustmentsDetail', e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm" rows={2}/>
                                    )}
                                </div>
                             </section>

                             <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">6. Impacto</h4>
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-bold text-gray-700">Impacto Producción *</label>
                                        <select value={formData.productionImpact} onChange={e => handleChange('productionImpact', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm">
                                            <option value="">Seleccionar...</option>
                                            <option value="Paro total">Paro total</option>
                                            <option value="Paros frecuentes">Paros frecuentes</option>
                                            <option value="Reducción velocidad">Reducción velocidad</option>
                                            <option value="Sin impacto">Sin impacto</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-gray-700 block mb-1">Impacto Calidad *</label>
                                        <div className="flex gap-4">
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="qual" checked={formData.qualityImpact === 'yes'} onChange={() => handleChange('qualityImpact', 'yes')}/> Sí</label>
                                            <label className="flex items-center gap-1 text-sm"><input type="radio" name="qual" checked={formData.qualityImpact === 'no'} onChange={() => handleChange('qualityImpact', 'no')}/> No</label>
                                        </div>
                                    </div>
                                    {formData.qualityImpact === 'yes' && (
                                        <>
                                            <select value={formData.defectType} onChange={e => handleChange('defectType', e.target.value)} className="w-full bg-white border border-gray-300 rounded p-2 text-sm mt-2">
                                                <option value="">Tipo Defecto...</option>
                                                <option value="Dimensional">Dimensional</option>
                                                <option value="Apariencia">Apariencia</option>
                                                <option value="Funcional">Funcional</option>
                                            </select>
                                            <textarea placeholder="Descripción del defecto..." value={formData.defectDescription} onChange={e => handleChange('defectDescription', e.target.value)} className="w-full border border-gray-300 rounded p-2 text-sm mt-2" rows={2}/>
                                        </>
                                    )}
                                </div>
                             </section>
                        </div>

                        {/* SECCIÓN 7: EVIDENCIA */}
                        <section className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                            <h4 className="text-xs font-bold text-blue-600 uppercase mb-4 border-b pb-2">7. Evidencia Adjunta</h4>
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer">
                                <CameraIcon className="w-8 h-8 mb-2"/>
                                <span className="text-sm font-medium">Haga clic para cargar fotos o videos</span>
                                <span className="text-xs text-gray-400 mt-1">(JPG, PNG, PDF permitidos)</span>
                                <input type="file" className="hidden" multiple onChange={e => handleChange('files', e.target.files)} />
                            </div>
                        </section>
                    </div>
                )}

                {/* FOOTER ACTION */}
                {!isSimulatingAI && (
                    <div className="p-4 bg-white border-t border-gray-200 flex justify-end gap-3 shrink-0">
                        <button onClick={onClose} className="px-6 py-2 bg-gray-200 text-gray-700 rounded font-bold hover:bg-gray-300">Cancelar</button>
                        <button onClick={simulateAIDiagnosis} className="px-6 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700 shadow-lg flex items-center gap-2">
                            <SendIcon className="w-4 h-4"/> Enviar Solicitud
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const TaWorkOrders: React.FC<TaWorkOrdersProps> = ({ plants = [], orders, setOrders }) => {
    // State
    const [filteredOrders, setFilteredOrders] = useState<WorkOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date()); // For live timers
    
    // Assignment State
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [assignTargetId, setAssignTargetId] = useState<string | null>(null);

    // Filters
    const [filters, setFilters] = useState({
        search: '',
        plantId: '',
        status: '',
        priority: '',
        risk: '',
        responsible: ''
    });

    // Clock tick
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filter Logic
    useEffect(() => {
        let result = orders;

        if (filters.search) {
            const s = filters.search.toLowerCase();
            result = result.filter(o => 
                o.otNumber.toLowerCase().includes(s) ||
                o.machineName.toLowerCase().includes(s) ||
                o.machineCode.toLowerCase().includes(s) ||
                o.description.toLowerCase().includes(s)
            );
        }
        if (filters.plantId) result = result.filter(o => o.plantId === filters.plantId);
        if (filters.status) result = result.filter(o => o.status === filters.status);
        if (filters.priority) result = result.filter(o => o.aiData?.priority === filters.priority);
        if (filters.risk) result = result.filter(o => o.aiData?.riskLevel === filters.risk);
        if (filters.responsible) result = result.filter(o => o.assignedTo.toLowerCase().includes(filters.responsible.toLowerCase()));

        // Sort: P1 first, then Paro Total, then Time
        result.sort((a, b) => {
            const pA = a.aiData?.priority === 'P1' ? 0 : a.aiData?.priority === 'P2' ? 1 : 2;
            const pB = b.aiData?.priority === 'P1' ? 0 : b.aiData?.priority === 'P2' ? 1 : 2;
            if (pA !== pB) return pA - pB;
            
            const msA = a.machineStatus === 'Paro total' ? 0 : 1;
            const msB = b.machineStatus === 'Paro total' ? 0 : 1;
            if (msA !== msB) return msA - msB;

            return new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime(); // Newest first
        });

        setFilteredOrders(result);
    }, [orders, filters]);

    // KPIs Calculation
    const kpis = {
        activeTotal: orders.filter(o => o.status !== 'closed' && o.status !== 'cancelled').length,
        machinesDown: orders.filter(o => o.status !== 'closed' && o.status !== 'cancelled' && o.machineStatus === 'Paro total').length,
        p1Active: orders.filter(o => o.status !== 'closed' && o.status !== 'cancelled' && o.aiData?.priority === 'P1').length,
        highRisk: orders.filter(o => o.status !== 'closed' && o.status !== 'cancelled' && o.aiData?.riskLevel === 'Alto').length,
        mttr: '2.5 h', // Mocked
        slaCompliance: '92%' // Mocked
    };

    // Actions
    const handleCreateOrder = (newOrderData: any) => {
        // Convert form data to WorkOrder object
        const newOT: WorkOrder = {
            id: Date.now().toString(),
            otNumber: newOrderData.otNumber || `OT-${Math.floor(Math.random()*10000)}`,
            plantId: newOrderData.plantId,
            plantName: plants.find(p => p.id === newOrderData.plantId)?.name || '',
            processName: 'Proceso Mock', // Would find name by ID in real app
            subprocessName: 'Subproceso Mock', // Would find name by ID
            machineId: newOrderData.machineId,
            machineCode: newOrderData.machineCode || 'M-NEW',
            machineName: newOrderData.machineName,
            reportDate: new Date().toISOString(),
            detectorName: newOrderData.detectorName,
            shift: newOrderData.shift,
            requestType: newOrderData.requestType,
            machineStatus: newOrderData.currentStatus as MachineStatus,
            description: newOrderData.failureDescription,
            symptoms: newOrderData.symptoms,
            aiData: newOrderData.aiDiagnosis ? {
                ...newOrderData.aiDiagnosis,
                riskLevel: newOrderData.aiDiagnosis.riskLevel as RiskLevel,
                priority: newOrderData.aiDiagnosis.priority as WorkOrderPriority
            } : undefined,
            status: 'unassigned',
            assignedTo: '',
            slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
            logs: [{ date: new Date().toISOString(), action: 'Creación', user: newOrderData.userId }],
            technicalReport: {
                 inspections: '', measurements: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: '', preventiveMeasures: ''
            }
        };
        setOrders(prev => [newOT, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleStatusChange = (id: string, newStatus: WorkOrderStatus, actionLabel: string, comment?: string) => {
        setOrders(prev => prev.map(o => {
            if (o.id === id) {
                return {
                    ...o,
                    status: newStatus,
                    logs: [...o.logs, { date: new Date().toISOString(), action: actionLabel, user: 'Usuario Actual', comment }]
                };
            }
            return o;
        }));
        // Update selected if open
        if (selectedOrder && selectedOrder.id === id) {
             setSelectedOrder(prev => prev ? ({ ...prev, status: newStatus }) : null);
        }
    };

    const handleAssign = (id: string) => {
        setAssignTargetId(id);
        setIsAssignModalOpen(true);
    };

    const handleConfirmAssign = (user: string) => {
        if (assignTargetId) {
            setOrders(prev => prev.map(o => o.id === assignTargetId ? { 
                ...o, 
                assignedTo: user, 
                status: 'assigned', 
                logs: [...o.logs, { date: new Date().toISOString(), action: 'Asignación', user: 'Supervisor', comment: `Asignado a ${user}` }] 
            } : o));
            
            // Also update selectedOrder if it matches the assigned one to reflect changes immediately in side panel
            if (selectedOrder && selectedOrder.id === assignTargetId) {
                 setSelectedOrder(prev => prev ? ({ ...prev, assignedTo: user, status: 'assigned' }) : null);
            }
        }
        setIsAssignModalOpen(false);
        setAssignTargetId(null);
    };

    // --- RENDER ---

    return (
        <div className="flex flex-col h-full space-y-4">
            
            {/* TOP CONTROL BAR */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Tablero de Órdenes de Trabajo</h2>
                        <p className="text-sm text-gray-500 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Monitoreo en Tiempo Real - Actualizado hace instantes
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar OT, Máquina, Falla..." 
                                className="pl-9 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-500 focus:ring-0 rounded-lg text-sm w-64 transition-all"
                                value={filters.search}
                                onChange={e => setFilters({...filters, search: e.target.value})}
                            />
                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                        <button 
                            onClick={() => setIsCreateModalOpen(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
                        >
                            <PlusCircleIcon className="w-5 h-5" /> Crear OT
                        </button>
                    </div>
                </div>
                
                {/* FILTERS */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-hide">
                     <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 font-medium focus:ring-blue-500" onChange={e => setFilters({...filters, plantId: e.target.value})}>
                        <option value="">Todas las Plantas</option>
                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                     </select>
                     <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 font-medium focus:ring-blue-500" onChange={e => setFilters({...filters, status: e.target.value})}>
                        <option value="">Todos los Estados</option>
                        <option value="unassigned">Por Asignar</option>
                        <option value="assigned">Asignadas</option>
                        <option value="on_hold">Pendiente Refacciones</option>
                     </select>
                     <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 font-medium focus:ring-blue-500" onChange={e => setFilters({...filters, priority: e.target.value})}>
                        <option value="">Prioridad</option>
                        <option value="P1">P1 - Alta</option>
                        <option value="P2">P2 - Media</option>
                        <option value="P3">P3 - Baja</option>
                     </select>
                     <select className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1.5 text-gray-700 font-medium focus:ring-blue-500" onChange={e => setFilters({...filters, risk: e.target.value})}>
                        <option value="">Riesgo IA</option>
                        <option value="Alto">Alto</option>
                        <option value="Medio">Medio</option>
                        <option value="Bajo">Bajo</option>
                     </select>
                </div>
            </div>

            {/* KPI RIBBON */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <KPICard title="OT Activas Totales" value={kpis.activeTotal} colorClass="border-blue-500" />
                <div onClick={() => setFilters({...filters, status: '', search: 'Paro total'})} className="cursor-pointer">
                     <KPICard title="Máquinas en Paro" value={kpis.machinesDown} colorClass="border-red-600" subtitle="Requiere Atención" />
                </div>
                <KPICard title="OT P1 Activas" value={kpis.p1Active} colorClass="border-red-400" />
                <KPICard title="Riesgo Alto (IA)" value={kpis.highRisk} colorClass="border-orange-500" />
                <KPICard title="MTTR Promedio" value={kpis.mttr} colorClass="border-green-500" />
                <KPICard title="Cumplimiento SLA" value={kpis.slaCompliance} colorClass="border-teal-500" />
            </div>

            {/* MAIN MATRIX (TABLE) */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 text-xs uppercase font-bold text-gray-500 border-b border-gray-200">
                            <tr>
                                <th className="p-3 w-10 text-center">#</th>
                                <th className="p-3">OT / Tiempo</th>
                                <th className="p-3">Ubicación</th>
                                <th className="p-3">Máquina / Estado</th>
                                <th className="p-3">Falla / Clasificación IA</th>
                                <th className="p-3">Prioridad / Riesgo</th>
                                <th className="p-3">Estado OT</th>
                                <th className="p-3">Responsable</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.map(order => {
                                // Visual Indicator Logic
                                const isCritical = (order.aiData?.priority === 'P1' && order.machineStatus === 'Paro total') || order.aiData?.riskLevel === 'Alto';
                                const isWarning = order.aiData?.priority === 'P1' || order.aiData?.riskLevel === 'Medio';
                                const rowBg = isCritical ? 'bg-red-50' : '';

                                return (
                                    <tr key={order.id} className={`hover:bg-gray-50 transition-colors ${rowBg}`}>
                                        <td className="p-3 text-center">
                                            <div className={`w-3 h-3 rounded-full mx-auto ${isCritical ? 'bg-red-500 animate-pulse' : isWarning ? 'bg-orange-400' : 'bg-green-500'}`}></div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-bold text-gray-900">{order.otNumber}</div>
                                            <div className="text-xs font-mono text-gray-500 mt-1 bg-gray-100 px-1 rounded w-fit">
                                                {calculateTimeElapsed(order.reportDate)}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="text-xs font-semibold text-gray-800">{order.plantName}</div>
                                            <div className="text-[10px] text-gray-500">{order.processName} &bull; {order.subprocessName}</div>
                                        </td>
                                        <td className="p-3">
                                            <div className="font-semibold text-gray-800 text-xs">{order.machineCode}</div>
                                            <div className="text-xs text-gray-500 mb-1">{order.machineName}</div>
                                            {getMachineStatusBadge(order.machineStatus)}
                                        </td>
                                        <td className="p-3 max-w-xs">
                                            <div className="text-xs text-gray-800 line-clamp-2" title={order.description}>{order.description}</div>
                                            {order.aiData && (
                                                <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-600 font-semibold">
                                                    <AIAssistantIcon className="w-3 h-3" /> {order.aiData.classification}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-3">
                                            <div className="flex flex-col items-start gap-1">
                                                {getPriorityBadge(order.aiData?.priority || 'P3')}
                                                <span className={`text-[10px] px-1.5 rounded border ${order.aiData?.riskLevel === 'Alto' ? 'bg-red-100 text-red-700 border-red-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                                                    Riesgo: {order.aiData?.riskLevel || 'N/A'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            {getStatusBadge(order.status)}
                                        </td>
                                        <td className="p-3 text-xs">
                                            {order.assignedTo ? (
                                                <div className="flex items-center gap-1 font-medium text-gray-700">
                                                    <UserIcon className="w-3 h-3 text-gray-400" /> {order.assignedTo}
                                                </div>
                                            ) : (
                                                <span className="text-gray-400 italic">--</span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <button 
                                                onClick={() => setSelectedOrder(order)}
                                                className="text-blue-600 hover:text-blue-800 font-bold text-xs border border-blue-200 hover:bg-blue-50 px-3 py-1.5 rounded transition-colors"
                                            >
                                                Gestionar
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 flex justify-between items-center">
                    <span>Mostrando {filteredOrders.length} órdenes</span>
                    <div className="flex gap-1">
                        <button className="px-2 py-1 border rounded hover:bg-white">Anterior</button>
                        <button className="px-2 py-1 border rounded hover:bg-white">Siguiente</button>
                    </div>
                </div>
            </div>

            {/* MODALS & PANELS */}
            {isCreateModalOpen && (
                 <CreateWorkOrderModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} plants={plants || []} onSave={handleCreateOrder} />
            )}
            
            {selectedOrder && (
                <SidePanel 
                    selectedOrder={selectedOrder} 
                    orders={orders} 
                    onClose={() => setSelectedOrder(null)} 
                    onAssign={handleAssign}
                    onStatusChange={handleStatusChange}
                />
            )}

            <AssignUserModal 
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                onSelect={handleConfirmAssign}
            />

            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TaWorkOrders;
