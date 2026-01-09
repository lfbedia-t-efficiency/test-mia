
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SearchIcon, FilterIcon, PlusCircleIcon, XIcon, WrenchScrewdriverIcon, CheckCircleIcon, ClockIcon, MicrophoneIcon, PaperclipIcon, CameraIcon, AIAssistantIcon, SendIcon, EyeIcon, SignalIcon, DocumentTextIcon, UserIcon, ArrowUpOnSquareIcon, TicketIcon, CalendarIcon, CodeBracketIcon, TrashIcon, ArrowDownIcon, ArrowUpIcon, ArrowPathIcon, ChartBarIcon } from '../components/icons/Icons';
import { Plant, Process, Subprocess, Machine, WorkOrder, WorkOrderStatus, WorkOrderPriority, RiskLevel, MachineStatus, WorkOrderLog, TechnicalReport, SupplyItem } from '../types';
import CreateWorkOrderModal from '../components/CreateWorkOrderModal';

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
        on_hold: 'Pendiente Ref.', 
        testing: 'En Pruebas',
        closed: 'Cerrada',
        cancelled: 'Cancelada',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${styles[status]}`}>{labels[status]}</span>;
};

const getPriorityBadge = (priority: WorkOrderPriority) => {
    const styles = {
        P1: 'bg-red-100 text-red-700 border-red-200',
        P2: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        P3: 'bg-blue-50 text-blue-600 border-blue-100',
    };
    return <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${styles[priority]}`}>{priority}</span>;
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

const formatDuration = (ms: number) => {
    if (ms < 0) ms = 0;
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    const pad = (n: number) => n.toString().padStart(2, '0');
    // HHH:MM:SS format as requested
    return `${hours.toString().padStart(3, '0')}:${pad(minutes)}:${pad(seconds)}`;
};

const calculateNextOt = (orders: WorkOrder[]) => {
    const ids = orders.map(o => {
        const match = o.otNumber.match(/^OT-(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
    });
    const maxId = Math.max(0, ...ids);
    const nextId = maxId + 1;
    return `OT-${nextId.toString().padStart(3, '0')}`;
};

// --- SUB-COMPONENTS (Extracted) ---

const KPICard = ({ title, value, colorClass, subtitle, trendColor }: any) => (
    <div className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-[90px]`}>
        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">{title}</p>
        <div className="mt-2">
            <span className={`text-2xl font-bold ${colorClass}`}>{value}</span>
            {subtitle && <p className={`text-[10px] font-medium mt-1 ${trendColor || 'text-gray-400'}`}>{subtitle}</p>}
        </div>
    </div>
);

const DictationInput = ({ label, value, onChange, multiline = false, disabled = false }: any) => (
    <div className="mb-2">
        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">{label}</label>
        <div className="relative">
            {multiline ? (
                <textarea 
                    className="w-full p-2 pr-8 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-600" 
                    rows={4}
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            ) : (
                <input 
                    type="text" 
                    className="w-full p-2 pr-8 bg-white border border-gray-300 rounded text-xs text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm disabled:bg-gray-100 disabled:text-gray-600"
                    value={value}
                    onChange={onChange}
                    disabled={disabled}
                />
            )}
            {!disabled && (
                <button className="absolute right-2 top-2 text-gray-400 hover:text-blue-500 transition-colors" title="Dictar por voz">
                    <MicrophoneIcon className="w-3 h-3" />
                </button>
            )}
        </div>
    </div>
);

const DetailField = ({ label, value, highlight = false, alert = false }: { label: string, value: string | React.ReactNode, highlight?: boolean, alert?: boolean }) => (
    <div className="flex flex-col">
        <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
        <span className={`text-xs font-medium whitespace-normal break-words ${alert ? 'text-red-600' : highlight ? 'text-blue-700' : 'text-gray-800'}`} title={typeof value === 'string' ? value : ''}>
            {value || '--'}
        </span>
    </div>
);

// --- MODALS ---

const ImageViewerModal: React.FC<{ isOpen: boolean; url: string | null; onClose: () => void }> = ({ isOpen, url, onClose }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        setScale(1);
        setRotation(0);
    }, [url]);

    if (!isOpen || !url) return null;

    const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.5, 4)); };
    const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.5, 0.5)); };
    const handleRotate = (e: React.MouseEvent) => { e.stopPropagation(); setRotation(prev => (prev + 90) % 360); };
    const handleReset = (e: React.MouseEvent) => { e.stopPropagation(); setScale(1); setRotation(0); };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in" onClick={onClose}>
            <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <EyeIcon className="w-4 h-4"/> Visualizador de Evidencia
                </h3>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 rounded-lg p-1 flex items-center gap-1 border border-gray-700">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-700 rounded transition-colors"><ArrowDownIcon className="w-4 h-4" /></button>
                        <span className="text-xs font-mono w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-700 rounded transition-colors"><ArrowUpIcon className="w-4 h-4" /></button>
                    </div>
                    <button onClick={handleRotate} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><ArrowPathIcon className="w-5 h-5"/></button>
                    <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-xs font-bold px-3">Reset</button>
                    <div className="w-px h-6 bg-gray-700 mx-2"></div>
                    <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-full transition-colors ml-2"><XIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
                <div className="transition-transform duration-200 ease-out" style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
                    <img src={url} alt="Evidence Detail" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm" draggable={false}/>
                </div>
            </div>
        </div>
    );
};

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
    onStatusChange: (id: string, newStatus: WorkOrderStatus, actionLabel: string, comment?: string, closedAt?: string) => void;
}

const SidePanel: React.FC<SidePanelProps> = ({ selectedOrder, orders, onClose, onAssign, onStatusChange }) => {
    const o = orders.find(ord => ord.id === selectedOrder.id) || selectedOrder;
    const [tab, setTab] = useState<'form' | 'tracking'>('form');
    
    // Timer State
    const [timerDisplay, setTimerDisplay] = useState('000:00:00');

    // Local state for form
    const [techReport, setTechReport] = useState<TechnicalReport>(o.technicalReport || {
         inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
    });
    
    // AI Consultation State
    const [isConsulting, setIsConsulting] = useState(false);
    const [generatedDiagnosis, setGeneratedDiagnosis] = useState<{problem: string, repair: string, precautions: string} | null>(null);

    // Confirmation State
    const [confirmAction, setConfirmAction] = useState<{ isOpen: boolean, action: 'hold' | 'close' | 'cancel' | null }>({ isOpen: false, action: null });

    // Viewer State
    const [viewerUrl, setViewerUrl] = useState<string | null>(null);

    // Available Actions Checkboxes
    const actionOptions = [
        'Ajuste', 'Limpieza', 'Sustitución', 'Calibración', 'Software',
        'Rep. Eléctrica', 'Rep. Mecánica', 'Temporal', 'Verificación', 'Otro'
    ];

    const isClosed = o.status === 'closed' || o.status === 'cancelled';

    // Timer Logic
    useEffect(() => {
        const updateTimer = () => {
            const start = new Date(o.reportDate).getTime();
            const end = o.closedAt ? new Date(o.closedAt).getTime() : Date.now();
            const diff = end - start;
            setTimerDisplay(formatDuration(diff));
        };

        updateTimer(); // Initial call
        
        let interval: ReturnType<typeof setInterval>;
        if (!isClosed) {
            interval = setInterval(updateTimer, 1000);
        }

        return () => clearInterval(interval);
    }, [o.reportDate, o.closedAt, isClosed]);

    const handleCheckboxChange = (option: string) => {
        if (isClosed) return;
        setTechReport(prev => {
            const newActions = prev.actions.includes(option) 
                ? prev.actions.filter(a => a !== option)
                : [...prev.actions, option];
            return { ...prev, actions: newActions };
        });
    };

    const handleAddSupply = () => {
        if (isClosed) return;
        setTechReport(prev => ({
            ...prev,
            supplies: [...prev.supplies, { id: Date.now().toString(), description: '', quantity: '' }]
        }));
    };

    const handleRemoveSupply = (id: string) => {
        if (isClosed) return;
        setTechReport(prev => ({
            ...prev,
            supplies: prev.supplies.filter(s => s.id !== id)
        }));
    };

    const handleUpdateSupply = (id: string, field: 'description' | 'quantity', value: string) => {
        if (isClosed) return;
        setTechReport(prev => ({
            ...prev,
            supplies: prev.supplies.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const validateClosing = () => {
        const r = techReport;
        if (!r.inspections.trim() || !r.measurements.trim() || !r.diagnosis.trim() || !r.rootCause.trim() || !r.preventiveMeasures.trim()) {
            alert("Para cerrar la orden, debe completar todos los campos de texto (Inspecciones, Medidas, Diagnóstico, Causa Raíz, Medidas Preventivas).");
            return false;
        }
        if (r.actions.length === 0) {
            alert("Debe seleccionar al menos una acción ejecutada.");
            return false;
        }
        if (r.aiMatch === null) {
            alert("Debe indicar si el diagnóstico coincidió con la IA.");
            return false;
        }
        if (r.supplies.length === 0) {
            alert("Debe registrar los Insumos Utilizados (o indicar 'Ninguno' si aplica, pero la lista no puede estar vacía).");
            return false;
        }
        // Check if supply rows are filled
        for (const s of r.supplies) {
            if (!s.description.trim() || !s.quantity.trim()) {
                alert("Complete la descripción y cantidad de todos los insumos agregados.");
                return false;
            }
        }
        return true;
    };

    const handleExecuteAction = () => {
        if (!confirmAction.action) return;
        
        if (confirmAction.action === 'close') {
            if (!validateClosing()) {
                setConfirmAction({ isOpen: false, action: null });
                return;
            }
        }
        
        let status: WorkOrderStatus = 'in_progress'; // default
        let label = '';
        let closedAt = undefined;
        
        switch (confirmAction.action) {
            case 'hold': status = 'on_hold'; label = 'Pendiente Refacciones'; break;
            case 'close': status = 'closed'; label = 'Cierre de OT'; closedAt = new Date().toISOString(); break;
            case 'cancel': status = 'cancelled'; label = 'Cancelación de OT'; closedAt = new Date().toISOString(); break;
        }
        
        // Save the tech report to the order object in the parent state
        const updatedOrder = { ...o, technicalReport: techReport };
        
        onStatusChange(o.id, status, label, `Acción ejecutada desde panel.`, closedAt);
        setConfirmAction({ isOpen: false, action: null });
        if (status === 'closed' || status === 'cancelled') onClose();
    };

    const handleTechnicalConsultation = () => {
        if (isClosed) return;
        setIsConsulting(true);
        // Simulate advanced AI processing of documents + live input
        setTimeout(() => {
            const result = {
                problem: `Basado en la lectura de "${techReport.measurements}" y la observación "${techReport.observations}", el manual del fabricante para ${o.machineName} indica una posible desalineación del eje principal o desgaste en el rodamiento frontal.`,
                repair: `1. Bloquear energía (LOTO). 2. Desmontar cubierta frontal. 3. Verificar holgura con galgas. 4. Si >0.5mm, reemplazar rodamiento SKF-6205.`,
                precautions: `ATENCIÓN: El eje puede conservar temperatura >80°C. Utilizar guantes térmicos. Verificar torque de 45Nm al cerrar.`
            };
            setGeneratedDiagnosis(result);
            setIsConsulting(false);
        }, 2000);
    };

    return (
        <div className="fixed inset-y-0 right-0 w-full md:w-[600px] bg-white shadow-2xl z-40 flex flex-col animate-slide-in font-sans">
            
            {/* 1. COMPACT HEADER */}
            <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-start shrink-0">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg font-black text-gray-900">{o.otNumber}</span>
                        {getStatusBadge(o.status)}
                        {getPriorityBadge(o.aiData?.priority || 'P3')}
                    </div>
                    <div className="flex flex-col text-xs text-gray-500">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-700">{o.machineName}</span>
                            <span className="px-1">•</span>
                            <span>{o.plantName}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <ClockIcon className="w-3 h-3 text-blue-500" />
                            <span className={`font-mono font-bold ${isClosed ? 'text-gray-600' : 'text-blue-600 animate-pulse'}`}>
                                {timerDisplay}
                            </span>
                            <span className="text-gray-400 font-medium">acumulado</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {o.status === 'unassigned' && !isClosed && (
                        <button onClick={() => onAssign(o.id)} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded hover:bg-blue-700 transition-colors shadow-sm">
                            Asignar
                        </button>
                    )}
                    <button onClick={onClose} className="p-1.5 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"><XIcon /></button>
                </div>
            </div>

            {/* 2. TABS */}
            <div className="flex border-b border-gray-200 bg-white sticky top-0 z-10 shrink-0 px-2">
                <button onClick={() => setTab('form')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === 'form' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    Gestión & Diagnóstico
                </button>
                <button onClick={() => setTab('tracking')} className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${tab === 'tracking' ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                    Historial & Tiempos
                </button>
            </div>

            {/* 3. SCROLLABLE CONTENT */}
            <div className="flex-1 overflow-y-auto p-5 bg-gray-100 space-y-4 custom-scrollbar">
                {tab === 'form' && (
                    <>
                        {/* CARD: SUMMARY DATA */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200 flex justify-between items-center">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Datos del Reporte</h4>
                                <span className="text-[10px] text-gray-400">{new Date(o.reportDate).toLocaleString()}</span>
                            </div>
                            <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-y-3 gap-x-4">
                                <DetailField label="Solicitante" value={o.detectorName} />
                                <DetailField label="Tipo Solicitud" value={o.requestType} />
                                <DetailField label="Turno" value={o.shift} />
                                
                                <DetailField label="Estado Máquina" value={getMachineStatusBadge(o.machineStatus)} />
                                <DetailField label="Responsable" value={o.assignedTo} highlight />
                                <DetailField label="Riesgo Seguridad" value={o.safetyRisk} alert={o.safetyRisk === 'Riesgo alto'} />
                            </div>
                        </div>

                        {/* CARD: PROBLEM DETAIL */}
                        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                            <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Detalle de la Falla</h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <div>
                                    <p className="text-xs text-gray-800 italic bg-gray-50 p-2 rounded border border-gray-100 mb-2">"{o.description}"</p>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        <DetailField label="Síntomas" value={o.symptoms?.join(', ')} />
                                        <DetailField label="Alarmas" value={`${o.alarmCodes || ''} ${o.alarmMessages || ''}`} />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-gray-100">
                                    <DetailField label="Desde Cuándo" value={o.sinceWhen} />
                                    <DetailField label="Frecuencia" value={o.frequency} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-gray-100 bg-orange-50/30 -mx-4 px-4 py-2">
                                    <DetailField label="Ajustes Recientes" value={o.recentAdjustments === 'yes' ? o.adjustmentsDetail : 'No'} highlight={o.recentAdjustments === 'yes'} />
                                    <DetailField label="Impacto en Producción" value={o.impactProduction} />
                                    <DetailField label="Impacto en Calidad" value={o.impactQuality === 'yes' ? o.defectDescription : 'No'} alert={o.impactQuality === 'yes'} />
                                </div>
                                {o.evidenceFiles && o.evidenceFiles.length > 0 && (
                                    <div className="flex gap-2 overflow-x-auto pt-2">
                                        {o.evidenceFiles.map((file, i) => (
                                            <div 
                                                key={i} 
                                                className="w-16 h-16 bg-gray-200 rounded border border-gray-300 flex items-center justify-center shrink-0 cursor-pointer hover:border-blue-500 relative group"
                                                onClick={() => setViewerUrl(file)}
                                            >
                                                <img src={file} alt="evidence" className="w-full h-full object-cover rounded" />
                                                <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center text-[9px] text-white font-bold rounded">Ver</div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 1: SEGUIMIENTO TÉCNICO & CONSULTA IA */}
                        <div className="bg-white rounded-lg border border-blue-200 shadow-md ring-1 ring-blue-50 overflow-hidden">
                            <div className="bg-blue-50 px-4 py-2 border-b border-blue-200 flex justify-between items-center">
                                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-2">
                                    <SignalIcon className="w-4 h-4"/> Seguimiento Técnico
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <DictationInput disabled={isClosed} label="Inspecciones Realizadas" value={techReport.inspections} onChange={(e: any) => setTechReport({...techReport, inspections: e.target.value})} multiline />
                                    <DictationInput disabled={isClosed} label="Medidas / Lecturas Clave" value={techReport.measurements} onChange={(e: any) => setTechReport({...techReport, measurements: e.target.value})} multiline />
                                </div>
                                <DictationInput disabled={isClosed} label="Observaciones Adicionales" value={techReport.observations} onChange={(e: any) => setTechReport({...techReport, observations: e.target.value})} multiline />
                                
                                {/* AI CONSULTATION BUTTON */}
                                <button 
                                    onClick={handleTechnicalConsultation}
                                    disabled={isConsulting || isClosed}
                                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-2.5 rounded-lg font-bold text-xs shadow hover:shadow-md transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isConsulting ? (
                                        <>
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Consultando Documentación...
                                        </>
                                    ) : (
                                        <>
                                            <AIAssistantIcon className="w-4 h-4" />
                                            Consulta Técnica IA (Docs & Contexto)
                                        </>
                                    )}
                                </button>

                                {/* GENERATED DIAGNOSIS RESULT */}
                                {generatedDiagnosis && (
                                    <div className="mt-4 bg-indigo-50 border border-indigo-200 rounded-lg p-3 animate-fade-in">
                                        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-indigo-100">
                                            <CodeBracketIcon className="w-4 h-4 text-indigo-600"/>
                                            <span className="text-xs font-bold text-indigo-800 uppercase">Nuevo Pre-Diagnóstico (Documentado)</span>
                                        </div>
                                        <div className="space-y-3 text-xs text-indigo-900">
                                            <div>
                                                <span className="font-bold block text-indigo-700">Problema Identificado:</span>
                                                {generatedDiagnosis.problem}
                                            </div>
                                            <div>
                                                <span className="font-bold block text-indigo-700">Procedimiento Reparación:</span>
                                                {generatedDiagnosis.repair}
                                            </div>
                                            <div className="bg-indigo-100 p-2 rounded text-indigo-800 italic border border-indigo-200">
                                                <span className="font-bold">Precaución:</span> {generatedDiagnosis.precautions}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SECTION 2: RESOLUCIÓN DE OT */}
                        <div className="bg-white rounded-lg border border-green-200 shadow-md ring-1 ring-green-50 overflow-hidden">
                            <div className="bg-green-50 px-4 py-2 border-b border-green-200 flex justify-between items-center">
                                <h4 className="text-xs font-bold text-green-800 uppercase tracking-wider flex items-center gap-2">
                                    <WrenchScrewdriverIcon className="w-4 h-4"/> Resolución de OT
                                </h4>
                            </div>
                            <div className="p-4 space-y-4">
                                <DictationInput disabled={isClosed} label="Diagnóstico Técnico Final" value={techReport.diagnosis} onChange={(e: any) => setTechReport({...techReport, diagnosis: e.target.value})} multiline />
                                
                                <div className="bg-gray-50 p-2 rounded border border-gray-200">
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2">Acciones Ejecutadas</label>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                        {actionOptions.map(opt => (
                                            <label key={opt} className={`flex items-center gap-2 text-xs text-gray-700 cursor-pointer hover:bg-gray-100 rounded px-1 ${isClosed ? 'pointer-events-none opacity-70' : ''}`}>
                                                <input 
                                                    type="checkbox" 
                                                    checked={techReport.actions.includes(opt)} 
                                                    onChange={() => handleCheckboxChange(opt)}
                                                    disabled={isClosed}
                                                    className="w-3 h-3 text-blue-600 rounded"
                                                />
                                                {opt}
                                            </label>
                                        ))}
                                    </div>
                                    {techReport.actions.includes('Otro') && (
                                        <input 
                                            type="text" 
                                            placeholder="Especifique..." 
                                            className="w-full mt-2 p-1.5 text-xs border border-gray-300 rounded bg-white"
                                            value={techReport.otherActionDetail}
                                            onChange={e => setTechReport({...techReport, otherActionDetail: e.target.value})}
                                            disabled={isClosed}
                                        />
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Insumos Utilizados</label>
                                        {!isClosed && (
                                            <button onClick={handleAddSupply} className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 font-semibold">+ Agregar Insumo</button>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        {techReport.supplies.map(supply => (
                                            <div key={supply.id} className="flex gap-2 items-center">
                                                <input 
                                                    type="text" 
                                                    placeholder="Descripción (Ej. Sensor)" 
                                                    value={supply.description} 
                                                    onChange={(e) => handleUpdateSupply(supply.id, 'description', e.target.value)}
                                                    className="flex-1 p-1.5 border border-gray-300 rounded text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 disabled:bg-gray-100"
                                                    disabled={isClosed}
                                                />
                                                <input 
                                                    type="text" 
                                                    placeholder="Cant." 
                                                    value={supply.quantity} 
                                                    onChange={(e) => handleUpdateSupply(supply.id, 'quantity', e.target.value)}
                                                    className="w-16 p-1.5 border border-gray-300 rounded text-xs text-center focus:ring-1 focus:ring-blue-500 focus:outline-none bg-white text-gray-900 disabled:bg-gray-100"
                                                    disabled={isClosed}
                                                />
                                                {!isClosed && (
                                                    <button onClick={() => handleRemoveSupply(supply.id)} className="text-gray-400 hover:text-red-500 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                                )}
                                            </div>
                                        ))}
                                        {techReport.supplies.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded border border-dashed border-gray-200">No se han registrado insumos.</p>}
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <DictationInput disabled={isClosed} label="Causa Raíz Confirmada" value={techReport.rootCause} onChange={(e: any) => setTechReport({...techReport, rootCause: e.target.value})} multiline />
                                </div>
                                <DictationInput disabled={isClosed} label="Medidas Preventivas" value={techReport.preventiveMeasures} onChange={(e: any) => setTechReport({...techReport, preventiveMeasures: e.target.value})} multiline />

                                <div className="flex items-center gap-4 text-xs text-gray-600 bg-gray-50 p-2 rounded border border-gray-200">
                                    <span className="font-bold">¿Coincidió con IA?</span>
                                    <label className={`flex items-center gap-1 cursor-pointer ${isClosed ? 'pointer-events-none opacity-70' : ''}`}><input type="radio" name="aiMatch" checked={techReport.aiMatch === 'yes'} onChange={() => setTechReport({...techReport, aiMatch: 'yes'})} disabled={isClosed}/> Sí</label>
                                    <label className={`flex items-center gap-1 cursor-pointer ${isClosed ? 'pointer-events-none opacity-70' : ''}`}><input type="radio" name="aiMatch" checked={techReport.aiMatch === 'no'} onChange={() => setTechReport({...techReport, aiMatch: 'no'})} disabled={isClosed}/> No</label>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {tab === 'tracking' && (
                    <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Tiempo Transcurrido</p>
                                <p className="text-2xl font-mono font-bold text-gray-800">{timerDisplay}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold text-gray-400 uppercase">Inicio Reporte</p>
                                <p className="text-sm font-medium text-gray-600">{new Date(o.reportDate).toLocaleString()}</p>
                                {o.closedAt && (
                                    <>
                                        <p className="text-[10px] font-bold text-gray-400 uppercase mt-2">Cierre Reporte</p>
                                        <p className="text-sm font-medium text-gray-600">{new Date(o.closedAt).toLocaleString()}</p>
                                    </>
                                )}
                            </div>
                        </div>
                        
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">Bitácora de Eventos</h4>
                            <div className="relative border-l-2 border-gray-200 ml-2 space-y-6 pl-6 pb-2">
                                {o.logs.map((log, idx) => (
                                    <div key={idx} className="relative group">
                                        <div className="absolute -left-[29px] top-1 w-3 h-3 rounded-full bg-white border-2 border-blue-50 group-hover:bg-blue-500 transition-colors"></div>
                                        <div className="flex justify-between items-start">
                                            <p className="text-sm font-bold text-gray-800">{log.action}</p>
                                            <p className="text-xs text-gray-400">{new Date(log.date).toLocaleString()}</p>
                                        </div>
                                        <p className="text-xs text-gray-600 mb-1 flex items-center gap-1"><UserIcon className="w-3 h-3"/> {log.user}</p>
                                        {log.comment && <p className="text-xs bg-yellow-50 text-yellow-800 p-2 rounded border border-yellow-100 italic">"{log.comment}"</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. FOOTER ACTIONS */}
            <div className="p-4 bg-white border-t border-gray-200 shrink-0 flex justify-end gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-20">
                <button 
                    disabled={isClosed}
                    onClick={() => setConfirmAction({ isOpen: true, action: 'hold' })}
                    className="px-4 py-2 bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Pausar (Refacciones)
                </button>
                <button 
                    disabled={isClosed}
                    onClick={() => setConfirmAction({ isOpen: true, action: 'cancel' })}
                    className="px-4 py-2 bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 rounded-lg font-bold text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Cancelar
                </button>
                <button 
                    disabled={isClosed}
                    onClick={() => setConfirmAction({ isOpen: true, action: 'close' })}
                    className="px-6 py-2 bg-green-600 text-white hover:bg-green-700 rounded-lg font-bold text-xs transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <CheckCircleIcon className="w-4 h-4"/> Cerrar Orden
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

            {/* Image Viewer */}
            <ImageViewerModal 
                isOpen={!!viewerUrl} 
                url={viewerUrl} 
                onClose={() => setViewerUrl(null)} 
            />
        </div>
    );
};

const TaWorkOrders: React.FC<TaWorkOrdersProps> = ({ plants = [], orders, setOrders }) => {
    const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [assignModal, setAssignModal] = useState<{isOpen: boolean, otId: string | null}>({isOpen: false, otId: null});
    
    // Live Timer for the Dashboard
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Filters State
    const [searchText, setSearchText] = useState('');
    const [plantFilter, setPlantFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [priorityFilter, setPriorityFilter] = useState('');
    const [riskFilter, setRiskFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    
    // Metrics Period Filter
    const [metricsFilter, setMetricsFilter] = useState('30d');

    const nextOtNumber = useMemo(() => calculateNextOt(orders), [orders]);

    const handleCreateOT = (newOrderData: any) => {
        const newOT: WorkOrder = {
            id: Date.now().toString(),
            otNumber: newOrderData.otNumber,
            plantId: newOrderData.plantId,
            plantName: plants.find(p => p.id === newOrderData.plantId)?.name || '',
            processName: 'Proceso', // Simplified lookup
            subprocessName: 'Subproceso',
            machineId: newOrderData.machineId,
            machineCode: newOrderData.machineCode,
            machineName: newOrderData.machineName,
            reportDate: new Date().toISOString(),
            detectorName: newOrderData.detectorName,
            shift: newOrderData.shift,
            requestType: newOrderData.requestType,
            machineStatus: newOrderData.currentStatus as MachineStatus,
            description: newOrderData.failureDescription,
            symptoms: newOrderData.symptoms,
            operatingHours: newOrderData.operatingHours,
            safetyRisk: newOrderData.safetyRisk,
            failureMoment: newOrderData.failureMoment,
            alarmCodes: newOrderData.alarmCodes,
            alarmMessages: newOrderData.alarmMessages,
            sinceWhen: newOrderData.sinceWhen,
            frequency: newOrderData.frequency,
            productModel: newOrderData.productModel,
            recentAdjustments: newOrderData.recentAdjustments,
            adjustmentsDetail: newOrderData.adjustmentsDetail,
            impactProduction: newOrderData.productionImpact,
            impactQuality: newOrderData.qualityImpact,
            defectType: newOrderData.defectType,
            defectDescription: newOrderData.defectDescription,
            evidenceFiles: newOrderData.files ? Array.from(newOrderData.files).map((f: any) => URL.createObjectURL(f)) : [],
            aiData: newOrderData.aiDiagnosis,
            status: 'unassigned',
            assignedTo: '',
            slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
            logs: [{ date: new Date().toISOString(), action: 'Creación', user: newOrderData.userId }],
            technicalReport: {
                 inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
            }
        };
        setOrders(prev => [newOT, ...prev]);
        setIsCreateModalOpen(false);
    };

    const handleAssign = (user: string) => {
        if (assignModal.otId) {
            setOrders(prev => prev.map(o => o.id === assignModal.otId ? { ...o, status: 'assigned', assignedTo: user, logs: [...o.logs, { date: new Date().toISOString(), action: 'Asignación', user: 'Supervisor' }] } : o));
            setAssignModal({ isOpen: false, otId: null });
        }
    };

    const handleStatusChange = (id: string, newStatus: WorkOrderStatus, actionLabel: string, comment?: string, closedAt?: string) => {
        setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus, closedAt: closedAt || o.closedAt, logs: [...o.logs, { date: new Date().toISOString(), action: actionLabel, user: 'Usuario', comment }] } : o));
    };

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const searchLower = searchText.toLowerCase();
        const matchesSearch = !searchText || 
            order.otNumber.toLowerCase().includes(searchLower) ||
            order.machineName.toLowerCase().includes(searchLower) ||
            order.description.toLowerCase().includes(searchLower);
        
        const matchesPlant = !plantFilter || order.plantId === plantFilter;
        const matchesStatus = !statusFilter || order.status === statusFilter;
        const matchesPriority = !priorityFilter || order.aiData?.priority === priorityFilter;
        const matchesRisk = !riskFilter || order.aiData?.riskLevel === riskFilter;
        
        // Date comparison (assuming ISO strings, basic check for day match)
        const matchesDate = !dateFilter || order.reportDate.startsWith(dateFilter);

        return matchesSearch && matchesPlant && matchesStatus && matchesPriority && matchesRisk && matchesDate;
    });

    // --- METRICS CALCULATION (Real-time + Time Window) ---
    const metrics = useMemo(() => {
        const now = Date.now();
        const hoursMap: Record<string, number> = { '24hr': 24, '48hr': 48, '72hr': 72, '7d': 168, '14d': 336, '30d': 720 };
        const hours = hoursMap[metricsFilter] || 720;
        const cutoff = now - (hours * 60 * 60 * 1000);

        // Active Counts (Real-time snapshot, ignores time filter for status)
        const activeOrders = orders.filter(o => o.status !== 'closed' && o.status !== 'cancelled');
        const activeTotal = activeOrders.length;
        const activeP1 = activeOrders.filter(o => o.aiData?.priority === 'P1').length;
        const paroTotal = activeOrders.filter(o => o.machineStatus === 'Paro total').length;
        const falla = activeOrders.filter(o => o.machineStatus === 'Funciona con falla').length;
        const highRisk = activeOrders.filter(o => o.aiData?.riskLevel === 'Alto' || o.safetyRisk === 'Riesgo alto').length;

        // Time-based calculations (MTTR, Availability) based on selected Period
        // 1. Availability Calculation
        let totalMachines = 0;
        plants.forEach(p => {
            if(p.machines) totalMachines += p.machines.length;
            p.processes?.forEach(proc => {
                if(proc.machines) totalMachines += proc.machines.length;
                proc.subprocesses?.forEach(sub => {
                    if(sub.machines) totalMachines += sub.machines.length;
                })
            })
        });
        const totalPotentialHours = totalMachines * hours;
        let totalDowntimeHours = 0;
        
        // Look at ALL orders that overlap with the window for downtime calculation
        orders.forEach(o => {
            if (o.machineStatus === 'Paro total' && o.status !== 'cancelled') {
                const start = new Date(o.reportDate).getTime();
                const end = o.closedAt ? new Date(o.closedAt).getTime() : now;
                // Intersection logic: max(start, cutoff) to min(end, now)
                const effectiveStart = Math.max(start, cutoff);
                const effectiveEnd = Math.min(end, now);
                
                if (effectiveEnd > effectiveStart) {
                    totalDowntimeHours += (effectiveEnd - effectiveStart) / (1000 * 60 * 60);
                }
            }
        });
        
        const availability = totalPotentialHours > 0 
            ? ((totalPotentialHours - totalDowntimeHours) / totalPotentialHours) * 100 
            : 100;

        // 2. MTTR (Mean Time To Repair) - Only closed orders in window
        const closedInWindow = orders.filter(o => 
            o.status === 'closed' && 
            o.closedAt && 
            new Date(o.closedAt).getTime() >= cutoff
        );
        
        let totalRepairTimeHours = 0;
        closedInWindow.forEach(o => {
            const start = new Date(o.reportDate).getTime();
            const end = new Date(o.closedAt!).getTime();
            totalRepairTimeHours += (end - start) / (1000 * 60 * 60);
        });
        
        const mttr = closedInWindow.length > 0 
            ? totalRepairTimeHours / closedInWindow.length 
            : 0;

        return {
            activeTotal,
            activeP1,
            paroTotal,
            falla,
            highRisk,
            availability: availability.toFixed(1),
            mttr: mttr.toFixed(1)
        };
    }, [orders, plants, metricsFilter]);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            {/* HEADER */}
            <div className="flex flex-col gap-4 mb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">Tablero de Órdenes de Trabajo</h2>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            Monitoreo en Tiempo Real - Actualizado al momento
                        </p>
                    </div>
                    <button onClick={() => setIsCreateModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-bold shadow-sm transition-colors">
                        <PlusCircleIcon className="w-5 h-5"/> Crear OT
                    </button>
                </div>

                {/* FILTERS BAR */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <input 
                            type="text" 
                            placeholder="Buscar por OT, Máquina o Descripción..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-300 rounded bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                    </div>

                    <select value={plantFilter} onChange={(e) => setPlantFilter(e.target.value)} className="p-2 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las Plantas</option>
                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>

                    <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todos los Estados</option>
                        <option value="unassigned">Por Asignar</option>
                        <option value="assigned">Asignada</option>
                        <option value="in_progress">En Ejecución</option>
                        <option value="on_hold">Pendiente</option>
                        <option value="testing">En Pruebas</option>
                        <option value="closed">Cerrada</option>
                        <option value="cancelled">Cancelada</option>
                    </select>

                    <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="p-2 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todas las Prioridades</option>
                        <option value="P1">P1 - Crítica</option>
                        <option value="P2">P2 - Alta</option>
                        <option value="P3">P3 - Normal</option>
                    </select>

                    <select value={riskFilter} onChange={(e) => setRiskFilter(e.target.value)} className="p-2 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="">Todos los Riesgos</option>
                        <option value="Alto">Alto</option>
                        <option value="Medio">Medio</option>
                        <option value="Bajo">Bajo</option>
                    </select>

                    <div className="relative">
                        <input 
                            type="date" 
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                            className="pl-8 pr-3 py-1.5 text-xs border border-gray-300 rounded bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <CalendarIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"/>
                    </div>

                    {(searchText || plantFilter || statusFilter || priorityFilter || riskFilter || dateFilter) && (
                        <button 
                            onClick={() => {
                                setSearchText('');
                                setPlantFilter('');
                                setStatusFilter('');
                                setPriorityFilter('');
                                setRiskFilter('');
                                setDateFilter('');
                            }}
                            className="text-xs text-red-500 hover:text-red-700 font-semibold underline px-2"
                        >
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* REAL INDICATORS RIBBON */}
            <div className="mb-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                <KPICard title="OT Activas Totales" value={metrics.activeTotal} colorClass="text-gray-900" />
                <KPICard title="OT P1 Activa" value={metrics.activeP1} colorClass={metrics.activeP1 > 0 ? "text-red-600" : "text-gray-400"} />
                <KPICard title="Máquinas en Paro" value={metrics.paroTotal} colorClass={metrics.paroTotal > 0 ? "text-red-600" : "text-green-600"} subtitle="Paro Total" />
                <KPICard title="Máquinas con Falla" value={metrics.falla} colorClass={metrics.falla > 0 ? "text-yellow-600" : "text-gray-400"} subtitle="Operando" />
                <KPICard title="OT Riesgo Alto" value={metrics.highRisk} colorClass={metrics.highRisk > 0 ? "text-orange-600" : "text-gray-400"} />
                
                {/* Time Based Metrics with Filter */}
                <div className="col-span-2 grid grid-cols-2 gap-3 bg-gray-50 p-2 rounded-lg border border-gray-200 relative">
                    <div className="absolute top-1 right-1 z-10">
                        <select 
                            value={metricsFilter} 
                            onChange={(e) => setMetricsFilter(e.target.value)} 
                            className="text-[9px] border border-gray-300 rounded bg-white text-gray-700 py-0.5 px-1 focus:outline-none cursor-pointer hover:border-blue-400"
                        >
                            <option value="24hr">24h</option>
                            <option value="48hr">48h</option>
                            <option value="72hr">72h</option>
                            <option value="7d">7d</option>
                            <option value="14d">14d</option>
                            <option value="30d">30d</option>
                        </select>
                    </div>
                    <div className="flex flex-col justify-between pt-3">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">MTTR Promedio</p>
                        <span className="text-xl font-bold text-blue-600">{metrics.mttr} h</span>
                    </div>
                    <div className="flex flex-col justify-between pt-3">
                        <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wide">Disp. Promedio</p>
                        <span className={`text-xl font-bold ${Number(metrics.availability) > 90 ? 'text-green-600' : Number(metrics.availability) > 80 ? 'text-yellow-600' : 'text-red-600'}`}>{metrics.availability}%</span>
                    </div>
                </div>
            </div>
            
            <div className="flex-1 overflow-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">OT #</th>
                            <th className="px-4 py-3">Prioridad</th>
                            <th className="px-4 py-3">Estado Maq.</th>
                            <th className="px-4 py-3">Tiempo</th>
                            <th className="px-4 py-3">Máquina</th>
                            <th className="px-4 py-3">Falla</th>
                            <th className="px-4 py-3">Asignado</th>
                            <th className="px-4 py-3 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredOrders.length > 0 ? filteredOrders.map(order => {
                            const start = new Date(order.reportDate).getTime();
                            const end = order.closedAt ? new Date(order.closedAt).getTime() : currentTime.getTime();
                            const duration = formatDuration(end - start);
                            const isClosed = order.status === 'closed' || order.status === 'cancelled';

                            return (
                                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 font-bold text-blue-600">{order.otNumber}</td>
                                    <td className="px-4 py-3">{getPriorityBadge(order.aiData?.priority || 'P3')}</td>
                                    <td className="px-4 py-3">{getMachineStatusBadge(order.machineStatus)}</td>
                                    <td className={`px-4 py-3 font-mono text-xs font-bold ${isClosed ? 'text-gray-600' : 'text-blue-700 animate-pulse'}`}>
                                        {duration}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-semibold text-gray-800">{order.machineName}</div>
                                        <div className="text-xs text-gray-400">{order.plantName}</div>
                                    </td>
                                    <td className="px-4 py-3 max-w-xs truncate">{order.description}</td>
                                    <td className="px-4 py-3 text-xs">
                                        {order.assignedTo ? (
                                            <span className="font-semibold text-gray-700">{order.assignedTo}</span>
                                        ) : (
                                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded border border-red-100">Por asignar</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button onClick={() => setSelectedOrder(order)} className="text-blue-600 hover:text-blue-800 font-semibold text-xs">Ver Detalle</button>
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={8} className="text-center py-8 text-gray-400">
                                    No se encontraron órdenes que coincidan con los filtros.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {selectedOrder && (
                <SidePanel 
                    selectedOrder={selectedOrder} 
                    orders={orders}
                    onClose={() => setSelectedOrder(null)} 
                    onAssign={(id) => setAssignModal({ isOpen: true, otId: id })}
                    onStatusChange={handleStatusChange}
                />
            )}

            <CreateWorkOrderModal 
                isOpen={isCreateModalOpen} 
                onClose={() => setIsCreateModalOpen(false)} 
                plants={plants || []} 
                onSave={handleCreateOT}
                nextOtNumber={nextOtNumber}
            />

            <AssignUserModal 
                isOpen={assignModal.isOpen} 
                onClose={() => setAssignModal({ isOpen: false, otId: null })} 
                onSelect={handleAssign} 
            />
        </div>
    );
};

export default TaWorkOrders;
