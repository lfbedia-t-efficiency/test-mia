
import React, { useState, useRef, useEffect } from 'react';
import { Plant, Process, Subprocess, ProductionReport, ReportField, ReportSchedule } from '../types';
import { 
    PlusCircleIcon, XIcon, ChevronDownIcon, CheckCircleIcon, 
    DocumentTextIcon, BellIcon, WhatsAppIcon, EmailIcon, 
    TrashIcon, EyeIcon, PencilIcon, ArrowUpIcon, ArrowDownIcon, 
    QrCodeIcon, CameraIcon, UserIcon, GripVerticalIcon, ArrowUpOnSquareIcon,
    FilterIcon, ChartBarIcon, ClockIcon, CalendarIcon
} from '../components/icons/Icons';

interface ComplianceFormsProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
}

const MOCK_USERS = [
    { id: 'u1', name: 'Ana Lopez', role: 'Supervisor' },
    { id: 'u2', name: 'Juan Pérez', role: 'Técnico' },
    { id: 'u3', name: 'Carlos Ruiz', role: 'Gerente' },
    { id: 'u4', name: 'Maria Garcia', role: 'Auditor' },
    { id: 'u5', name: 'Pedro Gomez', role: 'Operador' },
];

// --- WIZARD COMPONENTS ---

const WizardStep: React.FC<{ step: number; current: number; title: string; icon?: React.ReactNode }> = ({ step, current, title, icon }) => {
    const isActive = step === current;
    const isCompleted = step < current;
    
    return (
        <div className={`flex items-center ${isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 text-sm font-bold ${isActive ? 'border-blue-600 bg-blue-50' : isCompleted ? 'border-green-600 bg-green-50' : 'border-gray-300 bg-white'}`}>
                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : step}
            </div>
            <span className="ml-2 font-semibold text-sm hidden md:block">{title}</span>
            <div className="w-10 h-0.5 bg-gray-200 mx-3 hidden md:block"></div>
        </div>
    );
}

const GlobalStatCard: React.FC<{ 
    title: string; 
    value: string; 
    trend?: string; 
    trendColor?: string;
    icon?: React.ReactNode;
    filterValue?: string;
    onFilterChange?: (val: string) => void;
}> = ({ title, value, trend, trendColor = 'text-green-600', icon, filterValue, onFilterChange }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-[110px]">
        <div className="flex justify-between items-start mb-2">
            <div className="flex items-center gap-2 max-w-[80%]">
                {icon}
                <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold">{title}</p>
            </div>
            {onFilterChange && filterValue && (
                <select 
                    value={filterValue} 
                    onChange={(e) => onFilterChange(e.target.value)}
                    className="text-[10px] border-gray-300 border rounded bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-0.5 pl-1 pr-0 cursor-pointer outline-none"
                >
                    <option value="24hr">24h</option>
                    <option value="48hr">48h</option>
                    <option value="72hr">72h</option>
                    <option value="7d">7d</option>
                    <option value="30d">30d</option>
                </select>
            )}
        </div>
        <div>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {trend && <p className={`text-xs mt-1 font-medium ${trendColor}`}>{trend}</p>}
        </div>
    </div>
);

const MultiUserSelect: React.FC<{
    label?: string;
    selectedUsers: string[]; // Array of names
    onChange: (users: string[]) => void;
    compact?: boolean;
}> = ({ label, selectedUsers, onChange, compact = false }) => {
    const [currentSelect, setCurrentSelect] = useState('');

    const handleAdd = () => {
        if (currentSelect && !selectedUsers.includes(currentSelect)) {
            onChange([...selectedUsers, currentSelect]);
            setCurrentSelect('');
        }
    };

    const handleRemove = (name: string) => {
        onChange(selectedUsers.filter(u => u !== name));
    };

    return (
        <div className="w-full">
            {label && <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">{label}</label>}
            <div className={`flex gap-1 mb-1 ${compact ? 'flex-row' : ''}`}>
                <select 
                    value={currentSelect} 
                    onChange={e => setCurrentSelect(e.target.value)}
                    className={`flex-1 ${compact ? 'p-1 text-xs' : 'p-1.5 text-sm'} border border-gray-300 rounded bg-white text-gray-900 focus:ring-1 focus:ring-blue-500`}
                >
                    <option value="">+ Usuario</option>
                    {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name} - {u.role}</option>)}
                </select>
                <button 
                    onClick={handleAdd}
                    type="button"
                    disabled={!currentSelect}
                    className="bg-blue-100 text-blue-600 px-2 rounded hover:bg-blue-200 disabled:opacity-50 font-bold"
                >
                    +
                </button>
            </div>
            <div className="flex flex-wrap gap-1">
                {selectedUsers.map(u => (
                    <span key={u} className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                        {u}
                        <button onClick={() => handleRemove(u)} className="text-gray-400 hover:text-red-500"><XIcon className="w-3 h-3"/></button>
                    </span>
                ))}
                {selectedUsers.length === 0 && <span className="text-[10px] text-gray-400 italic">...</span>}
            </div>
        </div>
    );
};

const DeleteConfirmationModal: React.FC<{
    isOpen: boolean;
    step: 1 | 2;
    reportName: string;
    onClose: () => void;
    onNext: () => void;
    onConfirm: () => void;
}> = ({ isOpen, step, reportName, onClose, onNext, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{step === 1 ? 'Confirmar Borrado' : 'Advertencia Final'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                
                {step === 1 ? (
                    <p className="text-gray-600 mb-6">¿Desea eliminar el reporte "{reportName}"?</p>
                ) : (
                    <p className="text-gray-600 mb-6">Esta acción es irreversible. Se perderá toda la configuración y el historial asociado a este reporte. ¿Está seguro?</p>
                )}

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">Cancelar</button>
                    {step === 1 ? (
                        <button onClick={onNext} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-semibold">Continuar</button>
                    ) : (
                        <button onClick={onConfirm} className="px-4 py-2 bg-red-800 text-white rounded-md hover:bg-red-900 font-semibold">Eliminar Definitivamente</button>
                    )}
                </div>
            </div>
        </div>
    );
};

const ViewReportModal: React.FC<{
    isOpen: boolean;
    report: ProductionReport | null;
    onClose: () => void;
}> = ({ isOpen, report, onClose }) => {
    if (!isOpen || !report) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-3xl m-4 flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">{report.name}</h3>
                        <p className="text-xs text-gray-500 font-mono">{report.code}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 p-3 rounded border border-gray-200">
                             <p className="text-[10px] font-bold text-gray-500 uppercase">Horarios de Carga</p>
                             <div className="flex flex-wrap gap-2 mt-1">
                                {report.schedules.map(sch => (
                                    <span key={sch.id} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded font-mono">{sch.time}</span>
                                ))}
                             </div>
                        </div>
                         <div className="bg-gray-50 p-3 rounded border border-gray-200">
                             <p className="text-[10px] font-bold text-gray-500 uppercase">Alertas Activas</p>
                             <div className="flex gap-2 mt-1">
                                {report.notifyOutOfParam.email && <span className="text-xs bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Email</span>}
                                {report.notifyOutOfParam.whatsapp && <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">WA</span>}
                                {report.notifyOutOfParam.platform && <span className="text-xs bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded">Plat</span>}
                                {!report.notifyOutOfParam.email && !report.notifyOutOfParam.whatsapp && !report.notifyOutOfParam.platform && <span className="text-xs text-gray-400">Ninguna</span>}
                             </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Campos Configurados</h4>
                        <div className="overflow-x-auto border border-gray-200 rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-gray-100 uppercase font-bold text-gray-500">
                                    <tr>
                                        <th className="p-2">Código</th>
                                        <th className="p-2">OCR ID</th>
                                        <th className="p-2">Formato</th>
                                        <th className="p-2">Rango</th>
                                        <th className="p-2 text-center">Obs</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {report.fields.map(f => (
                                        <tr key={f.id} className="hover:bg-gray-50">
                                            <td className="p-2 font-mono font-bold text-blue-600">{f.code}</td>
                                            <td className="p-2">{f.ocrId}</td>
                                            <td className="p-2">{f.format} {f.uom ? `(${f.uom})` : ''}</td>
                                            <td className="p-2">{f.minParam && f.maxParam ? `${f.minParam} - ${f.maxParam}` : '-'}</td>
                                            <td className="p-2 text-center">{f.hasObservations ? <CheckCircleIcon className="w-4 h-4 text-green-500 mx-auto"/> : '-'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {report.documentImage && (
                        <div>
                             <h4 className="text-sm font-bold text-gray-700 mb-2 border-b pb-1">Vista Previa Documento</h4>
                             <div className="border border-gray-300 rounded p-2 bg-gray-100 flex justify-center">
                                 <div className="relative w-full h-64 bg-white shadow-sm" style={{backgroundImage: `url(${report.documentImage})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
                                 </div>
                             </div>
                        </div>
                    )}
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-lg flex justify-end">
                    <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded font-bold hover:bg-blue-700">Cerrar</button>
                </div>
            </div>
        </div>
    );
};

const ComplianceForms: React.FC<ComplianceFormsProps> = ({ plants, setPlants }) => {
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [currentStep, setCurrentStep] = useState(1);
    const [wizardProcessId, setWizardProcessId] = useState<string | null>(null);
    
    // Delete State
    const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; step: 1 | 2; report: ProductionReport | null; parentId: string | null }>({ 
        isOpen: false, step: 1, report: null, parentId: null 
    });

    // View State
    const [viewModal, setViewModal] = useState<{ isOpen: boolean; report: ProductionReport | null }>({
        isOpen: false, report: null
    });
    
    // --- WIZARD STATE ---
    const [newReport, setNewReport] = useState<ProductionReport>({
        id: '', code: '', name: '', description: '', 
        schedules: [], generalReviewers: [],
        notifyOutOfParam: { platform: true, email: false, whatsapp: false },
        notifyLate: { platform: true, email: false, whatsapp: false },
        resultIntegration: 'Promedio',
        integratedMinParam: '',
        integratedMaxParam: '',
        integratedOptimalResult: 'Igual',
        integratedOptimalValue: '',
        fields: []
    });
    
    const [tempField, setTempField] = useState<Partial<ReportField>>({});
    
    // Mapping State
    const [mappingTarget, setMappingTarget] = useState<{ fieldId: string, type: 'value' | 'observation' } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPos, setStartPos] = useState({ x: 0, y: 0 });
    const [previewFile, setPreviewFile] = useState<string | null>(null);

    const toggleExpand = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

    // --- HANDLERS ---
    
    const handleDeleteReport = () => {
        if (!deleteModal.parentId || !deleteModal.report) return;
        
        const newPlants = JSON.parse(JSON.stringify(plants));
        
        const deleteInTree = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.id === deleteModal.parentId) {
                    if (node.reports) {
                        node.reports = node.reports.filter((r: ProductionReport) => r.id !== deleteModal.report!.id);
                        return true;
                    }
                }
                if (node.processes && deleteInTree(node.processes)) return true;
                if (node.subprocesses && deleteInTree(node.subprocesses)) return true;
            }
            return false;
        };

        deleteInTree(newPlants);
        setPlants(newPlants);
        setDeleteModal({ isOpen: false, step: 1, report: null, parentId: null });
    };

    const handleOpenWizard = (processId: string | null, reportToEdit?: ProductionReport) => {
        setWizardProcessId(processId);
        
        if (reportToEdit) {
            // Editing existing report
            setNewReport(JSON.parse(JSON.stringify(reportToEdit))); // Deep copy
            setPreviewFile(reportToEdit.documentImage || null);
            setTempField({ 
                code: `${reportToEdit.code}-${(reportToEdit.fields.length + 1).toString().padStart(2, '0')}`,
                ocrId: '', format: 'Entero', uom: '', 
                hasObservations: false,
                minParam: '', maxParam: '', optimalValue: ''
            });
        } else {
            // Creating new report
            const reportId = `rep-${Date.now()}`;
            const initialCode = `REP-${Math.floor(Math.random() * 1000)}`;
            setNewReport({
                id: reportId,
                code: initialCode,
                name: '', description: '', 
                schedules: [], generalReviewers: [],
                notifyOutOfParam: { platform: true, email: false, whatsapp: false },
                notifyLate: { platform: true, email: false, whatsapp: false },
                resultIntegration: 'Promedio',
                integratedMinParam: '',
                integratedMaxParam: '',
                integratedOptimalResult: 'Igual',
                integratedOptimalValue: '',
                fields: []
            });
            setTempField({ 
                code: `${initialCode}-01`,
                ocrId: '', format: 'Entero', uom: '', 
                hasObservations: false,
                minParam: '', maxParam: '', optimalValue: ''
            });
            setPreviewFile(null);
        }
        
        setCurrentStep(1);
        setIsWizardOpen(true);
    };

    const handleAddSchedule = () => {
        const newSchedule: ReportSchedule = {
            id: `sch-${Date.now()}`,
            time: '08:00',
            loadResponsibles: [],
            reviewResponsibles: []
        };
        setNewReport(prev => ({ ...prev, schedules: [...prev.schedules, newSchedule] }));
    };

    const handleRemoveSchedule = (id: string) => {
        setNewReport(prev => ({ ...prev, schedules: prev.schedules.filter(s => s.id !== id) }));
    };

    const handleUpdateSchedule = (id: string, field: keyof ReportSchedule, value: any) => {
        setNewReport(prev => ({
            ...prev,
            schedules: prev.schedules.map(s => s.id === id ? { ...s, [field]: value } : s)
        }));
    };

    const handleAddField = () => {
        if (!tempField.code || !tempField.ocrId) {
            alert("Código y OCR ID son requeridos");
            return;
        }
        
        const field: ReportField = {
            id: `fld-${Date.now()}`,
            code: tempField.code,
            ocrId: tempField.ocrId,
            format: tempField.format as any || 'Entero',
            uom: tempField.uom || '',
            minParam: tempField.minParam || '',
            maxParam: tempField.maxParam || '',
            optimalResult: tempField.optimalResult as any || 'Igual',
            optimalValue: tempField.optimalValue || '',
            hasObservations: tempField.hasObservations || false
        };
        
        setNewReport(prev => ({ ...prev, fields: [...prev.fields, field] }));
        
        const nextSeq = newReport.fields.length + 2;
        const nextCode = `${newReport.code}-${nextSeq.toString().padStart(2, '0')}`;
        setTempField({ 
            code: nextCode,
            ocrId: '', format: 'Entero', uom: '', 
            hasObservations: false,
            minParam: '', maxParam: '', optimalValue: ''
        });
    };

    const handleRemoveField = (id: string) => {
        if (window.confirm("¿Confirma que desea eliminar este campo de extracción?")) {
            setNewReport(prev => ({ ...prev, fields: prev.fields.filter(f => f.id !== id) }));
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setPreviewFile(url);
            setNewReport(prev => ({ ...prev, documentImage: url })); 
        }
    };

    // --- MAPPING LOGIC ---
    const imageRef = useRef<HTMLDivElement>(null);

    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!mappingTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setStartPos({ x, y });
        setIsDrawing(true);
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDrawing || !mappingTarget) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const currentX = ((e.clientX - rect.left) / rect.width) * 100;
        const currentY = ((e.clientY - rect.top) / rect.height) * 100;
        
        const w = Math.abs(currentX - startPos.x);
        const h = Math.abs(currentY - startPos.y);
        const x = Math.min(currentX, startPos.x);
        const y = Math.min(currentY, startPos.y);

        setNewReport(prev => ({
            ...prev,
            fields: prev.fields.map(f => {
                if (f.id === mappingTarget.fieldId) {
                    return mappingTarget.type === 'value' 
                        ? { ...f, mapping: { x, y, w, h } } 
                        : { ...f, obsMapping: { x, y, w, h } };
                }
                return f;
            })
        }));
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
        setMappingTarget(null); 
    };

    const handleSaveReport = () => {
        if (!wizardProcessId) return;
        const newPlants = JSON.parse(JSON.stringify(plants));
        
        const saveToTree = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.id === wizardProcessId) {
                    if (!node.reports) node.reports = [];
                    // Check if updating existing
                    const idx = node.reports.findIndex((r: ProductionReport) => r.id === newReport.id);
                    if (idx !== -1) {
                        node.reports[idx] = newReport;
                    } else {
                        node.reports.push(newReport);
                    }
                    return true;
                }
                if (node.processes && saveToTree(node.processes)) return true;
                if (node.subprocesses && saveToTree(node.subprocesses)) return true;
            }
            return false;
        };
        saveToTree(newPlants);
        setPlants(newPlants);
        setIsWizardOpen(false);
    };

    // --- RENDER STEP 1: CONFIGURATION (REDESIGNED) ---
    const renderStep1 = () => (
        <div className="space-y-4 pb-10">
            {/* BLOCK 1: DEFINICIÓN DEL REPORTE */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center gap-2">
                    <DocumentTextIcon className="w-5 h-5 text-blue-600"/> Definición del Reporte
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                    <div>
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Código</label>
                        <input disabled value={newReport.code} className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm font-mono text-gray-900"/>
                    </div>
                    <div className="col-span-3">
                        <label className="text-[10px] font-bold text-gray-500 uppercase">Nombre del Reporte</label>
                        <input value={newReport.name} onChange={e => setNewReport({...newReport, name: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-blue-500" placeholder="Ej. Reporte de Producción Linea 1"/>
                    </div>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase">Descripción</label>
                    <textarea value={newReport.description} onChange={e => setNewReport({...newReport, description: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded text-sm text-gray-900 focus:ring-1 focus:ring-blue-500" rows={2}/>
                </div>
                
                {/* Integration & Notification Sub-block */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-100">
                    {/* Integration */}
                    <div className="bg-blue-50 p-3 rounded border border-blue-100">
                        <h5 className="text-xs font-bold text-blue-800 uppercase mb-2 flex items-center gap-1"><ChartBarIcon className="w-3 h-3"/> Cálculo de Resultado</h5>
                        <div className="grid grid-cols-2 gap-2">
                            <div className="col-span-2">
                                <select value={newReport.resultIntegration} onChange={e => setNewReport({...newReport, resultIntegration: e.target.value as any})} className="w-full p-1.5 bg-white border border-blue-200 rounded text-xs text-gray-900">
                                    <option value="Promedio">Promedio</option>
                                    <option value="Suma">Suma</option>
                                    <option value="N/A">N/A (Solo Captura)</option>
                                </select>
                            </div>
                            {newReport.resultIntegration !== 'N/A' && (
                                <>
                                    <input placeholder="Min" type="number" value={newReport.integratedMinParam} onChange={e => setNewReport({...newReport, integratedMinParam: e.target.value})} className="w-full p-1.5 bg-white border border-blue-200 rounded text-xs text-gray-900"/>
                                    <input placeholder="Max" type="number" value={newReport.integratedMaxParam} onChange={e => setNewReport({...newReport, integratedMaxParam: e.target.value})} className="w-full p-1.5 bg-white border border-blue-200 rounded text-xs text-gray-900"/>
                                    <div className="col-span-2 flex gap-1">
                                        <select className="text-xs border-r-0 rounded-l bg-white border border-blue-200 w-16 text-gray-900" value={newReport.integratedOptimalResult} onChange={e => setNewReport({...newReport, integratedOptimalResult: e.target.value as any})}>
                                            <option value="Igual">=</option>
                                            <option value="Igual o Superior">{'>='}</option>
                                            <option value="Igual o Inferior">{'<='}</option>
                                        </select>
                                        <input placeholder="Óptimo" type="number" value={newReport.integratedOptimalValue} onChange={e => setNewReport({...newReport, integratedOptimalValue: e.target.value})} className="w-full p-1.5 bg-white border border-blue-200 rounded-r text-xs text-gray-900"/>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Notifications (Redesigned Grid) */}
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 h-full">
                        <h5 className="text-xs font-bold text-gray-700 uppercase mb-3 flex items-center gap-1"><BellIcon className="w-3 h-3"/> Alertas</h5>
                        
                        <div className="grid grid-cols-4 gap-2 text-[10px] font-bold text-gray-400 uppercase mb-1 text-center">
                            <div className="text-left">Evento</div>
                            <div>Plat</div>
                            <div>Mail</div>
                            <div>WA</div>
                        </div>
                        
                        <div className="space-y-2">
                            <div className="grid grid-cols-4 gap-2 items-center text-xs">
                                <span className="font-medium text-gray-600">Fuera Param</span>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyOutOfParam.platform} onChange={e => setNewReport(p => ({...p, notifyOutOfParam: {...p.notifyOutOfParam, platform: e.target.checked}}))} className="cursor-pointer" /></div>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyOutOfParam.email} onChange={e => setNewReport(p => ({...p, notifyOutOfParam: {...p.notifyOutOfParam, email: e.target.checked}}))} className="cursor-pointer" /></div>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyOutOfParam.whatsapp} onChange={e => setNewReport(p => ({...p, notifyOutOfParam: {...p.notifyOutOfParam, whatsapp: e.target.checked}}))} className="cursor-pointer" /></div>
                            </div>
                            <div className="grid grid-cols-4 gap-2 items-center text-xs">
                                <span className="font-medium text-gray-600">Fuera Horario</span>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyLate.platform} onChange={e => setNewReport(p => ({...p, notifyLate: {...p.notifyLate, platform: e.target.checked}}))} /></div>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyLate.email} onChange={e => setNewReport(p => ({...p, notifyLate: {...p.notifyLate, email: e.target.checked}}))} /></div>
                                <div className="flex justify-center"><input type="checkbox" checked={newReport.notifyLate.whatsapp} onChange={e => setNewReport(p => ({...p, notifyLate: {...p.notifyLate, whatsapp: e.target.checked}}))} /></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* BLOCK 2: LOGÍSTICA OPERATIVA */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                <h4 className="font-bold text-gray-800 border-b border-gray-100 pb-2 mb-3 flex items-center justify-between">
                    <span className="flex items-center gap-2"><CalendarIcon className="w-5 h-5 text-purple-600"/> Logística Operativa</span>
                    <button onClick={handleAddSchedule} className="text-xs bg-purple-50 text-purple-700 px-3 py-1 rounded font-bold hover:bg-purple-100 border border-purple-200">
                        + Agregar Horario
                    </button>
                </h4>
                
                <div className="space-y-3 mb-4">
                    {newReport.schedules.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2 bg-gray-50 rounded">No se han configurado horarios de carga.</p>}
                    {newReport.schedules.map((sch) => (
                        <div key={sch.id} className="flex flex-col md:flex-row gap-3 bg-white p-3 rounded border border-gray-200 shadow-sm items-start md:items-center">
                            <div className="w-full md:w-auto">
                                <label className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Hora</label>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-4 h-4 text-gray-400"/>
                                    <input type="time" value={sch.time} onChange={e => handleUpdateSchedule(sch.id, 'time', e.target.value)} className="p-1 border border-gray-300 rounded text-xs font-bold w-24 bg-white text-gray-900"/>
                                </div>
                            </div>
                            <div className="flex-1 w-full">
                                <MultiUserSelect label="Resp. Carga" compact selectedUsers={sch.loadResponsibles} onChange={users => handleUpdateSchedule(sch.id, 'loadResponsibles', users)}/>
                            </div>
                            <div className="flex-1 w-full">
                                <MultiUserSelect label="Resp. Revisión" compact selectedUsers={sch.reviewResponsibles} onChange={users => handleUpdateSchedule(sch.id, 'reviewResponsibles', users)}/>
                            </div>
                            <button onClick={() => handleRemoveSchedule(sch.id)} className="text-gray-400 hover:text-red-500 p-2 mt-4 md:mt-0"><TrashIcon className="w-4 h-4"/></button>
                        </div>
                    ))}
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                    <MultiUserSelect label="Revisores Generales del Reporte (Opcional)" selectedUsers={newReport.generalReviewers} onChange={(users) => setNewReport({...newReport, generalReviewers: users})} compact/>
                </div>
            </div>

            {/* BLOCK 3: MAPEO DE DATOS */}
            <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300 shadow-sm">
                <h4 className="font-bold text-gray-800 flex items-center justify-between gap-2 mb-4">
                    <span className="flex items-center gap-2"><PlusCircleIcon className="w-5 h-5 text-green-600"/> Campos de Extracción</span>
                </h4>
                
                {/* Add Field Form - Compact Grid */}
                <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-12 gap-2 items-end">
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Código</label>
                            <input disabled value={tempField.code || ''} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs font-mono"/>
                        </div>
                        <div className="col-span-1 md:col-span-3">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">OCR ID</label>
                            <input value={tempField.ocrId || ''} onChange={e => setTempField({...tempField, ocrId: e.target.value})} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs" placeholder="Ej. TEMP_ZONA_1"/>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Formato</label>
                            <select value={tempField.format} onChange={e => setTempField({...tempField, format: e.target.value as any})} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs">
                                <option value="Entero">Entero</option>
                                <option value="Decimal">Decimal</option>
                                <option value="Porcentaje">%</option>
                                <option value="Texto">Texto</option>
                            </select>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">U. Medida</label>
                            <input value={tempField.uom || ''} onChange={e => setTempField({...tempField, uom: e.target.value})} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs" placeholder="UOM"/>
                        </div>
                        <div className="col-span-2 md:col-span-3">
                             {/* Space filler or actions if needed */}
                        </div>

                        {/* Row 2 */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Min</label>
                            <input type="number" value={tempField.minParam || ''} onChange={e => setTempField({...tempField, minParam: e.target.value})} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs"/>
                        </div>
                        <div className="col-span-1 md:col-span-2">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Max</label>
                            <input type="number" value={tempField.maxParam || ''} onChange={e => setTempField({...tempField, maxParam: e.target.value})} className="w-full p-1.5 bg-white border border-gray-300 rounded text-xs"/>
                        </div>
                        <div className="col-span-2 md:col-span-4">
                            <label className="text-[9px] font-bold text-gray-500 uppercase">Óptimo</label>
                            <div className="flex">
                                <select className="text-xs border-r-0 rounded-l bg-gray-50 border border-gray-300 w-12 text-gray-900" value={tempField.optimalResult} onChange={e => setTempField({...tempField, optimalResult: e.target.value as any})}>
                                    <option value="Igual">=</option>
                                    <option value="Igual o Superior">{'>='}</option>
                                    <option value="Igual o Inferior">{'<='}</option>
                                </select>
                                <input type="number" value={tempField.optimalValue || ''} onChange={e => setTempField({...tempField, optimalValue: e.target.value})} className="w-full p-1.5 bg-white border border-gray-300 rounded-r text-xs"/>
                            </div>
                        </div>
                        <div className="col-span-2 md:col-span-4 flex items-center justify-between gap-2">
                             <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer bg-white px-2 py-1.5 rounded border border-gray-200">
                                <input type="checkbox" checked={tempField.hasObservations || false} onChange={e => setTempField({...tempField, hasObservations: e.target.checked})} className="w-3 h-3 text-blue-600 rounded" />
                                Obs. OCR
                            </label>
                            <button onClick={handleAddField} className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded font-bold text-xs shadow-sm flex-1">
                                + Agregar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Fields List Table */}
                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-60 overflow-y-auto">
                    <table className="w-full text-xs text-left text-gray-600">
                        <thead className="bg-gray-100 uppercase font-bold text-gray-500 sticky top-0">
                            <tr>
                                <th className="px-3 py-2">Código</th>
                                <th className="px-3 py-2">OCR ID</th>
                                <th className="px-3 py-2">Formato</th>
                                <th className="px-3 py-2">Rango</th>
                                <th className="px-3 py-2 text-center">Obs</th>
                                <th className="px-3 py-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {newReport.fields.map((field) => (
                                <tr key={field.id} className="hover:bg-gray-50">
                                    <td className="px-3 py-2 font-mono font-bold text-blue-600">{field.code}</td>
                                    <td className="px-3 py-2">{field.ocrId}</td>
                                    <td className="px-3 py-2">{field.format} {field.uom ? `(${field.uom})` : ''}</td>
                                    <td className="px-3 py-2">
                                        {field.minParam !== '' && field.maxParam !== '' 
                                            ? `${field.minParam} - ${field.maxParam}` 
                                            : 'N/A'}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {field.hasObservations ? <CheckCircleIcon className="w-3 h-3 text-green-500 mx-auto"/> : '-'}
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <button onClick={() => handleRemoveField(field.id)} className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50">
                                            <TrashIcon className="w-3 h-3"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {newReport.fields.length === 0 && (
                                <tr><td colSpan={6} className="text-center py-4 text-gray-400 italic">No se han configurado campos aún.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="flex flex-col items-center justify-center h-full py-10 space-y-6">
            <div className="w-full max-w-lg p-10 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center text-center relative hover:bg-blue-50 transition-colors cursor-pointer">
                <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*,.pdf" onChange={handleFileUpload} />
                <ArrowUpOnSquareIcon className="w-16 h-16 text-gray-400 mb-4"/>
                <h4 className="text-lg font-bold text-gray-700">Subir Documento Físico</h4>
                <p className="text-sm text-gray-500 mt-2">Arrastre aquí el PDF o Imagen del formato físico</p>
            </div>
            {previewFile && (
                <div className="text-green-600 font-bold flex items-center gap-2 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                    <CheckCircleIcon className="w-5 h-5"/> Archivo cargado correctamente
                </div>
            )}
        </div>
    );

    const renderStep3 = () => (
        <div className="flex h-full gap-4">
            <div className="w-1/3 bg-gray-50 p-4 border-r overflow-y-auto">
                <h4 className="font-bold text-sm mb-4 text-gray-700">Campos a Mapear</h4>
                <div className="space-y-3">
                    {newReport.fields.map(f => (
                        <div key={f.id} className="bg-white border rounded-lg p-2 shadow-sm">
                            <div className="flex justify-between items-center mb-2">
                                <span className="font-bold text-xs text-gray-800">{f.code}</span>
                                <span className="text-[10px] text-gray-500">{f.ocrId}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    onClick={() => setMappingTarget({ fieldId: f.id, type: 'value' })}
                                    className={`text-[10px] py-1 px-2 rounded border transition-colors flex items-center justify-between ${mappingTarget?.fieldId === f.id && mappingTarget.type === 'value' ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'}`}
                                >
                                    Valor {f.mapping && <CheckCircleIcon className="w-3 h-3"/>}
                                </button>
                                {f.hasObservations ? (
                                    <button 
                                        onClick={() => setMappingTarget({ fieldId: f.id, type: 'observation' })}
                                        className={`text-[10px] py-1 px-2 rounded border transition-colors flex items-center justify-between ${mappingTarget?.fieldId === f.id && mappingTarget.type === 'observation' ? 'bg-orange-500 text-white border-orange-500' : 'bg-gray-50 hover:bg-gray-100 text-gray-600 border-gray-200'}`}
                                    >
                                        Obs. {f.obsMapping && <CheckCircleIcon className="w-3 h-3"/>}
                                    </button>
                                ) : (
                                    <span className="text-[10px] text-gray-300 italic py-1 px-2 text-center">Sin Obs.</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="flex-1 bg-gray-200 flex items-center justify-center relative overflow-hidden rounded-lg border border-gray-300">
                {previewFile ? (
                    <div 
                        ref={imageRef} 
                        className="relative bg-white shadow-2xl cursor-crosshair" 
                        style={{width:'500px', height:'700px', backgroundImage: `url(${previewFile})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}} 
                        onMouseDown={handleMouseDown} 
                        onMouseMove={handleMouseMove} 
                        onMouseUp={handleMouseUp}
                    >
                        {/* Draw Mappings */}
                        {newReport.fields.map(f => (
                            <React.Fragment key={f.id}>
                                {f.mapping && (
                                    <div className="absolute bg-blue-500/30 border-2 border-blue-600 flex items-center justify-center group z-10" style={{left:`${f.mapping.x}%`, top:`${f.mapping.y}%`, width:`${f.mapping.w}%`, height:`${f.mapping.h}%`}}>
                                        <span className="bg-blue-600 text-white text-[8px] px-1 rounded opacity-80">{f.code}</span>
                                    </div>
                                )}
                                {f.obsMapping && (
                                    <div className="absolute bg-orange-500/30 border-2 border-orange-500 flex items-center justify-center group z-10" style={{left:`${f.obsMapping.x}%`, top:`${f.obsMapping.y}%`, width:`${f.obsMapping.w}%`, height:`${f.obsMapping.h}%`}}>
                                        <span className="bg-orange-500 text-white text-[8px] px-1 rounded opacity-80">Obs</span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                        
                        {/* Overlay Messages */}
                        {!mappingTarget && <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-1 rounded-full text-xs pointer-events-none z-20">Seleccione Valor u Obs a la izquierda para dibujar</div>}
                        {mappingTarget && (
                            <div className={`absolute top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs pointer-events-none animate-pulse z-20 text-white font-bold ${mappingTarget.type === 'value' ? 'bg-blue-600' : 'bg-orange-500'}`}>
                                Dibujando {mappingTarget.type === 'value' ? 'Valor' : 'Observación'}
                            </div>
                        )}
                    </div>
                ) : <div className="text-gray-500">Vista previa no disponible. Suba un archivo en el paso anterior.</div>}
            </div>
        </div>
    );

    const renderStep4 = () => (
        <div className="flex h-full gap-6 p-6">
            <div className="flex-1 space-y-6">
                <div className="bg-white p-5 rounded-lg border border-gray-200 shadow-sm">
                    <h4 className="font-bold text-gray-800 border-b pb-2 mb-4">Resumen de Configuración</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <p><strong>Reporte:</strong> {newReport.name}</p>
                        <p><strong>Código:</strong> {newReport.code}</p>
                        <p><strong>Campos:</strong> {newReport.fields.length}</p>
                        <p><strong>Integración:</strong> {newReport.resultIntegration}</p>
                        <p><strong>Alertas Config:</strong> {Object.values(newReport.notifyOutOfParam).filter(Boolean).length + Object.values(newReport.notifyLate).filter(Boolean).length} canales</p>
                        <p><strong>Horarios Carga:</strong> {newReport.schedules.length}</p>
                    </div>
                </div>
                <div className="bg-green-50 p-5 rounded-lg border border-green-200 flex items-center gap-4">
                    <QrCodeIcon className="w-16 h-16 text-green-600"/>
                    <div>
                        <h5 className="font-bold text-green-800 text-lg">Listo para Publicar</h5>
                        <p className="text-sm text-green-700">Se generará el código QR único y se activarán las notificaciones automáticas.</p>
                    </div>
                </div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg border border-gray-300 flex items-center justify-center relative overflow-hidden">
                 {previewFile && (
                    <div className="relative bg-white shadow-lg scale-90" style={{width:'500px', height:'700px', backgroundImage: `url(${previewFile})`, backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'center'}}>
                        {newReport.fields.map(f => (
                            <React.Fragment key={f.id}>
                                {f.mapping && (
                                    <div className="absolute border-2 border-blue-600 bg-blue-500/10" style={{left:`${f.mapping.x}%`, top:`${f.mapping.y}%`, width:`${f.mapping.w}%`, height:`${f.mapping.h}%`}}>
                                        <span className="absolute -top-3 left-0 bg-blue-600 text-white text-[8px] px-1 rounded">{f.code}</span>
                                    </div>
                                )}
                                {f.obsMapping && (
                                    <div className="absolute border-2 border-orange-500 bg-orange-500/10" style={{left:`${f.obsMapping.x}%`, top:`${f.obsMapping.y}%`, width:`${f.obsMapping.w}%`, height:`${f.obsMapping.h}%`}}>
                                        <span className="absolute -bottom-3 right-0 bg-orange-500 text-white text-[8px] px-1 rounded">Obs</span>
                                    </div>
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                 )}
            </div>
        </div>
    );

    // --- AGGREGATION & VIEW COMPONENTS ---
    interface Stats { reports: number; fields: number; integrated: number; notifications: number; }
    const aggregateStats = (node: any): Stats => {
        let stats = { reports: 0, fields: 0, integrated: 0, notifications: 0 };
        if (node.reports && node.reports.length > 0) {
            stats.reports += node.reports.length;
            node.reports.forEach((r: ProductionReport) => {
                stats.fields += r.fields.length;
                if (r.resultIntegration !== 'N/A') stats.integrated++;
                if (r.notifyOutOfParam.email || r.notifyOutOfParam.whatsapp || r.notifyOutOfParam.platform) stats.notifications++;
            });
        }
        if (node.processes) node.processes.forEach((p: any) => { const s = aggregateStats(p); stats.reports += s.reports; stats.fields += s.fields; stats.integrated += s.integrated; stats.notifications += s.notifications; });
        if (node.subprocesses) node.subprocesses.forEach((s: any) => { const st = aggregateStats(s); stats.reports += st.reports; stats.fields += st.fields; stats.integrated += st.integrated; stats.notifications += st.notifications; });
        return stats;
    };

    let globalStats = { reports: 0, fields: 0, integrated: 0, notifications: 0 };
    plants.forEach(p => { const s = aggregateStats(p); globalStats.reports += s.reports; globalStats.fields += s.fields; globalStats.integrated += s.integrated; globalStats.notifications += s.notifications; });

    const ReportCard: React.FC<{ report: ProductionReport, parentId: string }> = ({ report, parentId }) => (
        <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow relative group">
            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => handleOpenWizard(parentId, report)} className="p-1.5 bg-gray-100 hover:bg-blue-100 text-gray-500 hover:text-blue-600 rounded" title="Modificar">
                    <PencilIcon className="w-4 h-4"/>
                </button>
                <button 
                    onClick={() => setDeleteModal({ isOpen: true, step: 1, report: report, parentId: parentId })}
                    className="p-1.5 bg-gray-100 hover:bg-red-100 text-gray-500 hover:text-red-600 rounded"
                    title="Borrar"
                >
                    <TrashIcon className="w-4 h-4"/>
                </button>
            </div>
            <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
                    <DocumentTextIcon className="w-6 h-6 text-blue-600"/>
                </div>
                <div>
                    <h5 className="font-bold text-gray-800 text-sm leading-tight">{report.name}</h5>
                    <span className="text-[10px] font-mono bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded mt-1 inline-block border border-gray-200">{report.code}</span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-4">
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Integración</p>
                    <p className="font-semibold">{report.resultIntegration}</p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Campos</p>
                    <p className="font-semibold">{report.fields.length} Datos</p>
                </div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100 col-span-2">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-0.5">Parámetros</p>
                    {report.resultIntegration !== 'N/A' ? (
                        <div className="flex justify-between items-center">
                            <span>Min: {report.integratedMinParam}</span>
                            <span>Max: {report.integratedMaxParam}</span>
                            <span className="text-green-600 font-bold">Opt: {report.integratedOptimalValue}</span>
                        </div>
                    ) : (
                        <span className="italic text-gray-400">Sin parámetros integrados</span>
                    )}
                </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex gap-2">
                    {report.notifyOutOfParam.email && <span className="text-blue-500" title="Email"><EmailIcon className="w-4 h-4"/></span>}
                    {report.notifyOutOfParam.whatsapp && <span className="text-green-500" title="WhatsApp"><WhatsAppIcon className="w-4 h-4"/></span>}
                    {report.notifyOutOfParam.platform && <span className="text-yellow-500" title="Plataforma"><BellIcon className="w-4 h-4"/></span>}
                    {!report.notifyOutOfParam.email && !report.notifyOutOfParam.whatsapp && !report.notifyOutOfParam.platform && <span className="text-gray-300 text-[10px]">Sin notif.</span>}
                </div>
                <button 
                    onClick={() => setViewModal({ isOpen: true, report: report })}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                >
                    <EyeIcon className="w-3 h-3"/> Ver Formato
                </button>
            </div>
        </div>
    );

    const NodeHeader: React.FC<{ node: any, type: 'plant' | 'process' | 'subprocess', level: number }> = ({ node, type, level }) => {
        const stats = aggregateStats(node);
        const bgColors = {
            plant: 'bg-blue-50 border-l-4 border-blue-600',
            process: 'bg-gray-50 border-l-4 border-gray-400 ml-4',
            subprocess: 'bg-white border-l-4 border-gray-200 ml-8'
        };
        const isExpanded = expanded[node.id];

        return (
            <div className="mb-4">
                <div className={`p-3 rounded-r-lg shadow-sm border-y border-r border-gray-200 flex items-center justify-between ${bgColors[type]}`}>
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleExpand(node.id)}>
                         <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg">{node.name}</h3>
                             <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 uppercase">{type}</p>
                                {stats.reports > 0 && <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{stats.reports} Reportes</span>}
                             </div>
                         </div>
                    </div>
                    <div className="hidden md:flex items-center gap-6 mr-6 text-xs text-gray-600">
                        <div className="text-center"><span className="block font-bold text-lg">{stats.fields}</span><span className="text-[10px] text-gray-400 uppercase">Campos Totales</span></div>
                        <div className="text-center border-l border-gray-300 pl-6"><span className="block font-bold text-lg">{stats.integrated}</span><span className="text-[10px] text-gray-400 uppercase">Integrados</span></div>
                        <div className="text-center border-l border-gray-300 pl-6"><span className="block font-bold text-lg">{stats.notifications}</span><span className="text-[10px] text-gray-400 uppercase">Notificaciones</span></div>
                    </div>
                    <button onClick={() => handleOpenWizard(node.id)} className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm shrink-0">
                        <PlusCircleIcon className="w-4 h-4" /> + Reporte
                    </button>
                </div>
                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        {node.reports && node.reports.length > 0 && (
                            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6 ${level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8'}`}>
                                {node.reports.map((rep: ProductionReport) => (
                                    <ReportCard key={rep.id} report={rep} parentId={node.id} />
                                ))}
                            </div>
                        )}
                        {node.processes && node.processes.map((p: any) => <NodeHeader key={p.id} node={p} type="process" level={level + 1} />)}
                        {node.subprocesses && node.subprocesses.map((s: any) => <NodeHeader key={s.id} node={s} type="subprocess" level={level + 1} />)}
                    </div>
                )}
            </div>
        );
    };

    // --- MAIN RETURN ---

    if (isWizardOpen) {
        return (
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
                    <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
                        <h2 className="text-xl font-bold text-gray-800">
                            {newReport.id ? 'Editar Reporte de Cumplimiento' : 'Configuración de Nuevo Reporte'}
                        </h2>
                        <button onClick={() => setIsWizardOpen(false)} className="p-2 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500"><XIcon/></button>
                    </div>
                    <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-center">
                        <WizardStep step={1} current={currentStep} title="Configuración" />
                        <WizardStep step={2} current={currentStep} title="Documento" />
                        <WizardStep step={3} current={currentStep} title="Mapeo IA" />
                        <WizardStep step={4} current={currentStep} title="Validar" />
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 bg-white">
                        {currentStep === 1 && renderStep1()}
                        {currentStep === 2 && renderStep2()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                    </div>
                    <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-between shrink-0">
                        <button disabled={currentStep === 1} onClick={() => setCurrentStep(p => p - 1)} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 disabled:opacity-50">Atrás</button>
                        {currentStep < 4 ? <button onClick={() => setCurrentStep(p => p + 1)} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 shadow-sm">Siguiente</button> : <button onClick={handleSaveReport} className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 shadow-lg flex items-center gap-2"><CheckCircleIcon className="w-5 h-5"/> Guardar Reporte</button>}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 h-full flex flex-col">
            {/* GLOBAL RIBBON */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                <GlobalStatCard title="Total Reportes" value={globalStats.reports.toString()} icon={<DocumentTextIcon className="w-6 h-6 text-blue-500"/>} trend="Activos" trendColor="text-gray-500"/>
                <GlobalStatCard title="Datos a Extraer" value={globalStats.fields.toString()} icon={<ChartBarIcon className="w-6 h-6 text-purple-500"/>} trend="Puntos de control" trendColor="text-purple-600"/>
                <GlobalStatCard title="Reportes Integrados" value={globalStats.integrated.toString()} icon={<FilterIcon className="w-6 h-6 text-green-500"/>} trend="Con cálculo auto" trendColor="text-green-600"/>
                <GlobalStatCard title="Alertas Config" value={globalStats.notifications.toString()} icon={<BellIcon className="w-6 h-6 text-yellow-500"/>} trend="Notificaciones" trendColor="text-yellow-600"/>
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-center items-center text-center">
                    <p className="text-xs text-gray-400 uppercase font-bold mb-2">Accesos Rápidos</p>
                    <button className="w-full mb-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold py-1.5 rounded flex items-center justify-center gap-2 transition-colors">
                        <QrCodeIcon className="w-3 h-3"/> Imprimir QRs
                    </button>
                    <button className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm">
                        <ArrowUpOnSquareIcon className="w-3 h-3"/> Carga Masiva
                    </button>
                </div>
            </div>

            {/* CONSOLE CONTENT */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex-1 overflow-y-auto">
                <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <DocumentTextIcon className="w-6 h-6 text-gray-500" />
                        Consola de Configuración
                    </h2>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Buscar reporte..." className="text-xs border border-gray-300 rounded px-3 py-1.5 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                    </div>
                </div>

                {plants.map(plant => (
                    <NodeHeader key={plant.id} node={plant} type="plant" level={0} />
                ))}
            </div>

            {/* Modals */}
            <DeleteConfirmationModal 
                isOpen={deleteModal.isOpen}
                step={deleteModal.step}
                reportName={deleteModal.report?.name || ''}
                onClose={() => setDeleteModal({ isOpen: false, step: 1, report: null, parentId: null })}
                onNext={() => setDeleteModal(prev => ({ ...prev, step: 2 }))}
                onConfirm={handleDeleteReport}
            />

            <ViewReportModal 
                isOpen={viewModal.isOpen}
                report={viewModal.report}
                onClose={() => setViewModal({ isOpen: false, report: null })}
            />
        </div>
    );
};

export default ComplianceForms;
