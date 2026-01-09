
import React, { useState, useEffect, useMemo } from 'react';
import { Plant, Process, Subprocess, Machine, MachineDocument, WorkOrder, WorkOrderPriority, RiskLevel, MachineStatus, HistoryEvent, AiStartContext } from '../types';
import { QrCodeIcon, PlusCircleIcon, AIAssistantIcon, ArrowUpOnSquareIcon, DocumentTextIcon, WrenchScrewdriverIcon, HistoryIcon, SignalIcon, ChevronDownIcon, XIcon, FilterIcon, PrinterIcon, CheckCircleIcon, EyeIcon, ArrowDownIcon, CalendarIcon, UserIcon, TechSupportIcon } from '../components/icons/Icons';
import CreateWorkOrderModal, { CreateWorkOrderState } from '../components/CreateWorkOrderModal';

interface TaMachinesProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
    onAddWorkOrder: (order: WorkOrder) => void;
    workOrders: WorkOrder[];
    historyEvents: HistoryEvent[];
    onAiConsultation: (context: AiStartContext) => void;
}

type TimeFilter = '24hr' | '48hr' | '72hr' | '7d' | '14d' | '30d';

interface FilterState {
    period: TimeFilter;
}

interface Stats {
    count: number; // Number of machines
    availSum: number; // Sum of availability percentages
    mtbfSum: number; // Sum of MTBF hours
    mttrSum: number; // Sum of MTTR hours
    otsOpen: number; // Total open OTs
    otsTotal: number; // Total OTs in period
}

interface ModalState {
    isOpen: boolean;
    parentId: string | null; // ID of Plant, Process, or Subprocess
}

// --- HELPER FUNCTIONS FOR CALCULATIONS ---

const getHoursFromFilter = (filter: TimeFilter): number => {
    switch (filter) {
        case '24hr': return 24;
        case '48hr': return 48;
        case '72hr': return 72;
        case '7d': return 168; // 7 * 24
        case '14d': return 336; // 14 * 24
        case '30d': return 720; // 30 * 24
        default: return 720;
    }
};

const calculateMachineMetrics = (machine: Machine, workOrders: WorkOrder[], periodHours: number) => {
    const now = new Date();
    const startTime = new Date(now.getTime() - periodHours * 60 * 60 * 1000);

    // 1. Filter OTs for this machine within the period
    const relevantOTs = workOrders.filter(wo => {
        if (wo.machineId !== machine.id) return false;
        
        // EXCLUDE CANCELLED ORDERS from indicators
        if (wo.status === 'cancelled') return false;

        const woDate = new Date(wo.reportDate);
        return woDate >= startTime; // Simple logic: OT started within period
    });

    let downTimeHours = 0;
    let failureCount = 0;
    let openOtsCount = 0;

    relevantOTs.forEach(wo => {
        // Count Open OTs
        if (wo.status !== 'closed') {
            openOtsCount++;
        }

        // Calculate Downtime only for 'Paro total'
        if (wo.machineStatus === 'Paro total') {
            failureCount++;
            const start = new Date(wo.reportDate).getTime();
            // If closed, use closedAt, otherwise use Now
            const end = wo.closedAt ? new Date(wo.closedAt).getTime() : now.getTime();
            
            // Calculate duration in hours
            const durationMs = end - start;
            const durationHrs = durationMs / (1000 * 60 * 60);
            
            downTimeHours += durationHrs;
        }
    });

    // Clamp downtime to period max (in case of overlap or bad data)
    if (downTimeHours > periodHours) downTimeHours = periodHours;

    // 2. Availability Formula: (Period - DownTime) / Period
    const availability = ((periodHours - downTimeHours) / periodHours) * 100;

    // 3. MTBF Formula: Operating Time / Failures
    // Operating Time = Period - DownTime
    // If failures is 0, MTBF is effectively the whole period (or infinite, we cap at Period for display)
    const operatingTime = periodHours - downTimeHours;
    const mtbf = failureCount > 0 ? operatingTime / failureCount : periodHours;

    // 4. MTTR Formula: DownTime / Failures
    const mttr = failureCount > 0 ? downTimeHours / failureCount : 0;

    return {
        availability: Math.max(0, availability),
        mtbf,
        mttr,
        otsTotal: relevantOTs.length,
        otsOpen: openOtsCount,
        failureCount
    };
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


// --- PREVIEW COMPONENT ---
const DocumentPreviewModal: React.FC<{ doc: MachineDocument | null; onClose: () => void }> = ({ doc, onClose }) => {
    if (!doc) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-5xl h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                            <DocumentTextIcon className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{doc.title}</h3>
                            <p className="text-xs text-gray-500 font-mono">{doc.type} • v{doc.version}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors">
                            <PrinterIcon className="w-4 h-4" /> Imprimir
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm">
                            <ArrowDownIcon className="w-4 h-4" /> Descargar
                        </button>
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>
                        <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar Info */}
                    <div className="w-72 bg-white border-r border-gray-200 p-6 overflow-y-auto shrink-0">
                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Detalles del Documento</h4>
                        
                        <div className="space-y-5">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Estado</p>
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border bg-green-50 text-green-700 border-green-200">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                    Vigente
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Fecha de Carga</p>
                                    <p className="text-sm text-gray-600">{doc.uploadDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <DocumentTextIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Tipo de Archivo</p>
                                    <p className="text-sm text-gray-600">{doc.type}</p>
                                </div>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Nombre de Archivo</p>
                                <p className="text-xs font-mono text-gray-600 break-all bg-gray-100 p-1.5 rounded">{doc.fileName}</p>
                            </div>
                        </div>
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto relative">
                        {/* Simulated Paper Document */}
                        <div className="bg-white shadow-lg w-[595px] min-h-[842px] p-12 text-gray-800 relative transform transition-transform hover:scale-[1.01] origin-top">
                            {/* Header Simulation */}
                            <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">{doc.title}</h1>
                                    <p className="text-sm text-gray-500 mt-1">{doc.type} - Documentación Técnica</p>
                                </div>
                                <div className="text-right">
                                    <div className="border border-black px-2 py-1 text-xs font-mono font-bold">{doc.id.split('-')[1]}</div>
                                    <p className="text-xs mt-1">Rev: {doc.version}</p>
                                </div>
                            </div>

                            {/* Body Simulation */}
                            <div className="space-y-4 text-justify text-xs leading-relaxed text-gray-600 font-serif">
                                <p><strong>1. INTRODUCCIÓN</strong></p>
                                <p>Este documento técnico proporciona las especificaciones y guías operativas necesarias para el componente o máquina referenciada.</p>
                                
                                <p className="mt-4"><strong>2. ESPECIFICACIONES TÉCNICAS</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Modelo Referencia: {doc.title}</li>
                                    <li>Versión del Documento: {doc.version}</li>
                                    <li>Fecha de Emisión: {doc.uploadDate}</li>
                                </ul>

                                <p className="mt-4"><strong>3. PROCEDIMIENTO</strong></p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                <div className="h-40 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 italic mt-4 mb-4">
                                    [Plano Técnico / Diagrama]
                                </div>
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            </div>

                            {/* Footer Simulation */}
                            <div className="absolute bottom-10 left-10 right-10 border-t border-gray-300 pt-2 flex justify-between text-[10px] text-gray-400">
                                <span>Confidencial - Uso Interno de Planta</span>
                                <span>Página 1 de 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MANAGE COMPONENT ---
const ManageMachineDocModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    doc: MachineDocument | null;
    onUpdate: (docId: string, version: string, file: File | null) => void;
}> = ({ isOpen, onClose, doc, onUpdate }) => {
    const [version, setVersion] = useState('');
    const [file, setFile] = useState<File | null>(null);

    useEffect(() => {
        if (isOpen && doc) {
            setVersion((parseFloat(doc.version) + 0.1).toFixed(1)); // Suggest next version
            setFile(null);
        }
    }, [isOpen, doc]);

    if (!isOpen || !doc) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(doc.id, version, file);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Gestionar Documento</h3>
                        <p className="text-xs text-gray-500">{doc.title}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-xs text-gray-600 mb-4">
                        <p><strong>Versión Actual:</strong> {doc.version}</p>
                        <p><strong>Archivo Actual:</strong> {doc.fileName}</p>
                        <p><strong>Fecha:</strong> {doc.uploadDate}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nueva Versión</label>
                        <input required type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" placeholder="Ej. 2.0" />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nuevo Archivo (Actualización)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors relative">
                            <ArrowUpOnSquareIcon className="w-8 h-8 mb-2 text-gray-400"/>
                            <span className="text-xs text-center">{file ? file.name : 'Click para seleccionar nuevo archivo'}</span>
                            <input type="file" onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold text-sm hover:bg-gray-200">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 flex items-center gap-2">
                            Actualizar Documento
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const KPI: React.FC<{ title: string; value: string; trend?: string; filterText?: string; colorClass?: string }> = ({ title, value, trend, filterText, colorClass = "text-gray-900" }) => (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className='flex justify-between items-start'>
            <p className="text-xs text-gray-500 font-medium truncate" title={title}>{title}</p>
            {filterText && <span className='text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold'>{filterText}</span>}
        </div>
        <p className={`text-xl font-bold mt-1 ${colorClass}`}>{value}</p>
        {trend && <p className={`text-xs mt-0.5 ${trend.includes('+') ? 'text-green-600' : trend.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>{trend}</p>}
    </div>
);

const GlobalStatCard: React.FC<{ 
    title: string; 
    value: string; 
    trend?: string; 
    trendColor?: string;
    filterValue?: TimeFilter;
    onFilterChange?: (val: TimeFilter) => void;
}> = ({ title, value, trend, trendColor = 'text-green-600', filterValue, onFilterChange }) => (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-[110px]">
        <div className="flex justify-between items-start mb-2">
            <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold max-w-[70%]">{title}</p>
            {onFilterChange && filterValue && (
                <select 
                    value={filterValue} 
                    onChange={(e) => onFilterChange(e.target.value as TimeFilter)}
                    className="text-[10px] border-gray-300 border rounded bg-gray-50 text-gray-700 focus:ring-blue-500 focus:border-blue-500 py-0.5 pl-1 pr-0 cursor-pointer outline-none"
                >
                    <option value="24hr">24h</option>
                    <option value="48hr">48h</option>
                    <option value="72hr">72h</option>
                    <option value="7d">7d</option>
                    <option value="14d">14d</option>
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

// --- TAB CONTENT COMPONENTS ---

const SummaryTab: React.FC<{ 
    machine: Machine; 
    workOrders: WorkOrder[];
    historyEvents: HistoryEvent[];
}> = ({ machine, workOrders, historyEvents }) => {
    
    // Merge and Sort Events
    const timeline = useMemo(() => {
        const items = [];

        // 1. Documents
        if (machine.documents) {
            items.push(...machine.documents.map(d => ({
                id: d.id,
                type: 'document',
                date: d.uploadDate, // Assuming DD/MM/YYYY
                rawDate: new Date(d.uploadDate.split('/').reverse().join('-')).getTime(),
                title: `Documento Subido: ${d.title}`,
                subtitle: `v${d.version} - ${d.type}`,
                user: 'Sistema',
                icon: <DocumentTextIcon className="w-4 h-4 text-purple-600"/>,
                color: 'bg-purple-100 border-purple-200'
            })));
        }

        // 2. Work Orders
        const machineOTs = workOrders.filter(wo => wo.machineId === machine.id);
        items.push(...machineOTs.map(ot => ({
            id: ot.id,
            type: 'ot',
            date: new Date(ot.reportDate).toLocaleDateString(),
            rawDate: new Date(ot.reportDate).getTime(),
            title: `Orden de Trabajo: ${ot.otNumber}`,
            subtitle: ot.description,
            user: ot.detectorName,
            icon: <TechSupportIcon className="w-4 h-4 text-orange-600"/>,
            color: 'bg-orange-100 border-orange-200'
        })));

        // 3. AI/History Events
        const machineHistory = historyEvents.filter(h => h.hierarchy.includes(machine.name));
        items.push(...machineHistory.map(h => ({
            id: h.id,
            type: 'history',
            date: h.timestamp, // "hace 5 min" or date string
            rawDate: Date.now(), // Fallback for sorting if text, ideally parse real date
            title: h.title,
            subtitle: h.type,
            user: h.user,
            icon: <AIAssistantIcon className="w-4 h-4 text-blue-600"/>,
            color: 'bg-blue-100 border-blue-200'
        })));

        // Sort Descending
        return items.sort((a, b) => b.rawDate - a.rawDate);
    }, [machine, workOrders, historyEvents]);

    if (timeline.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                <HistoryIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                <p className="text-sm">No hay actividad reciente registrada para esta máquina.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 space-y-4">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Intervenciones Recientes</h4>
            <div className="relative border-l-2 border-gray-200 ml-3 space-y-6 pl-6 pb-2">
                {timeline.map((item, idx) => (
                    <div key={idx} className="relative">
                        <div className={`absolute -left-[33px] top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${item.color}`}>
                            {item.icon}
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-gray-400">{item.date}</span>
                                <span className="text-xs text-gray-500 flex items-center gap-1"><UserIcon className="w-3 h-3"/> {item.user}</span>
                            </div>
                            <h5 className="text-sm font-bold text-gray-800">{item.title}</h5>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{item.subtitle}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const OrdersTab: React.FC<{ machineId: string, workOrders: WorkOrder[] }> = ({ machineId, workOrders }) => {
    const machineOTs = workOrders
        .filter(wo => wo.machineId === machineId)
        .sort((a, b) => new Date(b.reportDate).getTime() - new Date(a.reportDate).getTime());

    if (machineOTs.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                <TechSupportIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                <p className="text-sm">No hay órdenes de trabajo registradas para esta máquina.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">OT #</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3">Estado</th>
                        <th className="px-4 py-3">Descripción</th>
                        <th className="px-4 py-3">Asignado</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {machineOTs.map((ot) => (
                        <tr key={ot.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-bold text-blue-600">{ot.otNumber}</td>
                            <td className="px-4 py-3 text-xs">{new Date(ot.reportDate).toLocaleDateString()}</td>
                            <td className="px-4 py-3">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                    ot.status === 'closed' ? 'bg-green-100 text-green-700 border-green-200' :
                                    ot.status === 'in_progress' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                }`}>
                                    {ot.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 max-w-xs truncate text-xs" title={ot.description}>{ot.description}</td>
                            <td className="px-4 py-3 text-xs">{ot.assignedTo || '-'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const MachineDocumentsTab: React.FC<{ 
    documents?: MachineDocument[];
    onView: (doc: MachineDocument) => void;
    onManage: (doc: MachineDocument) => void;
}> = ({ documents, onView, onManage }) => {
    if (!documents || documents.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-300 mt-4">
                <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                <p className="text-sm">No hay documentos registrados para esta máquina.</p>
                <p className="text-xs mt-1">Utilice el botón "Subir Doc" para agregar manuales o planos.</p>
            </div>
        );
    }

    return (
        <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Versión</th>
                        <th className="px-4 py-3">Fecha</th>
                        <th className="px-4 py-3 text-right">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <tr key={doc.id} className="hover:bg-gray-50 group">
                            <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                                <DocumentTextIcon className="w-4 h-4 text-blue-500"/>
                                {doc.title}
                            </td>
                            <td className="px-4 py-3">{doc.type}</td>
                            <td className="px-4 py-3">{doc.version}</td>
                            <td className="px-4 py-3 text-xs">{doc.uploadDate}</td>
                            <td className="px-4 py-3 text-right">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                        className="text-gray-400 hover:text-blue-600 p-1 hover:bg-blue-50 rounded transition-colors" 
                                        title="Visualizar"
                                        onClick={() => onView(doc)}
                                    >
                                        <EyeIcon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline hover:bg-blue-50 px-2 py-1 rounded transition-colors" 
                                        title="Gestionar / Actualizar"
                                        onClick={() => onManage(doc)}
                                    >
                                        Gestionar
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const MachineCard: React.FC<{ 
    machine: Machine; 
    locationName: string; 
    filter: TimeFilter;
    onUploadDoc: (machine: Machine) => void;
    onViewDoc: (doc: MachineDocument) => void;
    onManageDoc: (doc: MachineDocument) => void;
    onCreateOT: (machine: Machine) => void;
    onAiConsultation: (machine: Machine) => void;
    workOrders: WorkOrder[];
    historyEvents: HistoryEvent[];
}> = ({ machine, locationName, filter, onUploadDoc, onViewDoc, onManageDoc, onCreateOT, onAiConsultation, workOrders, historyEvents }) => {
    const [activeTab, setActiveTab] = useState('Resumen');
    
    // Updated Tabs Structure
    const tabs = [
        { name: 'Resumen', icon: <HistoryIcon /> }, // Summary / Timeline
        { name: 'Documentos', icon: <DocumentTextIcon /> },
        { name: 'Ordenes', icon: <TechSupportIcon /> },
        { name: 'Diagnóstico', icon: <WrenchScrewdriverIcon /> },
        { name: 'Sensores', icon: <SignalIcon /> },
    ];

    // Real Calculation
    const periodHours = getHoursFromFilter(filter);
    const metrics = calculateMachineMetrics(machine, workOrders, periodHours);

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6 mt-4">
            <header className="flex justify-between items-start">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        {machine.name}
                        <span className="text-sm font-mono font-normal bg-gray-100 text-gray-600 px-2 py-0.5 rounded border border-gray-200">{machine.code}</span>
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Fabricante: {machine.manufacturer} | Modelo: {machine.model} | Serie: {machine.serial}</p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                        <span className="font-semibold text-gray-600">Ubicación:</span>
                        <span className="text-gray-500">{locationName}</span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="p-1.5 border border-gray-200 rounded-lg bg-gray-50">
                        <QrCodeIcon className="w-10 h-10 text-gray-800" />
                    </div>
                </div>
            </header>

            <section className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <KPI 
                    title="Disponibilidad" 
                    value={`${metrics.availability.toFixed(1)}%`} 
                    filterText={filter} 
                    colorClass={metrics.availability > 90 ? 'text-green-600' : metrics.availability > 80 ? 'text-yellow-600' : 'text-red-600'}
                />
                <KPI title="MTBF" value={`${metrics.mtbf.toFixed(0)}h`} filterText={filter} />
                <KPI title="MTTR" value={`${metrics.mttr.toFixed(1)}h`} filterText={filter} />
                <KPI title="OTs Totales" value={`${metrics.otsTotal}`} filterText={filter} />
                <KPI title="OTs Abiertas" value={`${metrics.otsOpen}`} trend="Activas" colorClass={metrics.otsOpen > 0 ? 'text-red-600' : 'text-green-600'}/>
            </section>

            <section className="flex flex-wrap items-center gap-2 border-t border-b border-gray-200 py-3">
                <button 
                    onClick={() => onCreateOT(machine)}
                    className="flex items-center gap-2 text-xs text-white hover:bg-blue-700 bg-blue-600 px-3 py-1.5 rounded-md font-semibold"
                >
                    <PlusCircleIcon className="w-4 h-4"/> <span>Crear OT</span>
                </button>
                <button 
                    onClick={() => onAiConsultation(machine)} 
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-md font-semibold"
                >
                    <AIAssistantIcon className="w-4 h-4" /> <span>Consulta IA</span>
                </button>
                <button 
                    onClick={() => onUploadDoc(machine)}
                    className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-md font-semibold"
                >
                    <ArrowUpOnSquareIcon className="w-4 h-4" /> <span>Subir Doc</span>
                </button>
            </section>

            <main>
                <nav className="flex border-b border-gray-200 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.name}
                            onClick={() => setActiveTab(tab.name)}
                            className={`flex-shrink-0 flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors ${activeTab === tab.name ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                        >
                            {React.cloneElement(tab.icon, { className: 'w-4 h-4' })} {tab.name}
                        </button>
                    ))}
                </nav>
                
                {/* Dynamic Content Based on Tab */}
                <div className="min-h-[200px]">
                    {activeTab === 'Resumen' && <SummaryTab machine={machine} workOrders={workOrders} historyEvents={historyEvents} />}
                    {activeTab === 'Documentos' && <MachineDocumentsTab documents={machine.documents} onView={onViewDoc} onManage={onManageDoc} />}
                    {activeTab === 'Ordenes' && <OrdersTab machineId={machine.id} workOrders={workOrders} />}
                    
                    {(activeTab !== 'Resumen' && activeTab !== 'Documentos' && activeTab !== 'Ordenes') && (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <WrenchScrewdriverIcon className="w-8 h-8 mb-2 opacity-50"/>
                            <p className="text-sm">Contenido de "{activeTab}" en desarrollo</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

const AddMachineModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: any) => void 
}> = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        code: '', name: '', manufacturer: '', model: '', serial: '', availability: 100, mtbf: 720, mttr: 0, totalOts: 0, openOts: 0
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ code: '', name: '', manufacturer: '', model: '', serial: '', availability: 100, mtbf: 720, mttr: 0, totalOts: 0, openOts: 0 });
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Agregar Nueva Máquina</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-1">
                             <label className="text-xs font-semibold text-gray-600">Código</label>
                             <input name="code" placeholder="Ej. M-001" onChange={handleChange} value={formData.code} required className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                        </div>
                        <div className="col-span-1">
                             <label className="text-xs font-semibold text-gray-600">Nombre</label>
                             <input name="name" placeholder="Nombre Máquina" onChange={handleChange} value={formData.name} required className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Fabricante</label>
                        <input name="manufacturer" placeholder="Fabricante" onChange={handleChange} value={formData.manufacturer} required className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Modelo</label>
                        <input name="model" placeholder="Modelo" onChange={handleChange} value={formData.model} required className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                    </div>
                    <div>
                        <label className="text-xs font-semibold text-gray-600">Número de Serie</label>
                        <input name="serial" placeholder="Número de Serie" onChange={handleChange} value={formData.serial} required className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                    </div>

                    <div className="flex justify-end gap-2 mt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded text-sm font-semibold text-gray-700 hover:bg-gray-300">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-semibold hover:bg-blue-700">Guardar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UploadMachineDocModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    machineName: string;
    onSave: (data: any) => void;
}> = ({ isOpen, onClose, machineName, onSave }) => {
    const [title, setTitle] = useState('');
    const [docType, setDocType] = useState('');
    const [version, setVersion] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTitle('');
            setDocType('');
            setVersion('');
            setFile(null);
            setIsSaving(false);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate upload delay
        setTimeout(() => {
            onSave({ title, docType, version, fileName: file ? file.name : 'unknown' });
            setIsSaving(false);
        }, 1500);
    };

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
                <div className="flex justify-between items-center mb-4 border-b border-gray-100 pb-2">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Subir Documento</h3>
                        <p className="text-xs text-gray-500">Para: <span className="font-semibold text-blue-600">{machineName}</span></p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Título del Documento</label>
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" placeholder="Ej. Manual de Mantenimiento" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                            <select required value={docType} onChange={e => setDocType(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900">
                                <option value="">Seleccionar...</option>
                                <option value="Manual">Manual</option>
                                <option value="Plano">Plano Eléctrico/Mecánico</option>
                                <option value="Checksheet">Checksheet</option>
                                <option value="Historial">Historial de Falla</option>
                                <option value="Backup">Backup PLC/HMI</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Versión</label>
                            <input required type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" placeholder="Ej. 1.0" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Archivo</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 cursor-pointer transition-colors relative">
                            <ArrowUpOnSquareIcon className="w-8 h-8 mb-2 text-gray-400"/>
                            <span className="text-xs text-center">{file ? file.name : 'Click para seleccionar archivo'}</span>
                            <input type="file" required onChange={e => setFile(e.target.files ? e.target.files[0] : null)} className="absolute inset-0 opacity-0 cursor-pointer"/>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 text-gray-700 rounded font-semibold text-sm hover:bg-gray-200">Cancelar</button>
                        <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 text-white rounded font-semibold text-sm hover:bg-blue-700 flex items-center gap-2 disabled:opacity-70">
                            {isSaving ? 'Subiendo...' : 'Subir Documento'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TaMachines: React.FC<TaMachinesProps> = ({ plants, setPlants, onAddWorkOrder, workOrders, historyEvents, onAiConsultation }) => {
    const [modal, setModal] = useState<ModalState>({ isOpen: false, parentId: null });
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; machine: Machine | null }>({ isOpen: false, machine: null });
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    
    // Preview and Manage Document States
    const [previewDoc, setPreviewDoc] = useState<MachineDocument | null>(null);
    const [manageDocState, setManageDocState] = useState<{ isOpen: boolean, doc: MachineDocument | null, machine: Machine | null }>({
        isOpen: false, doc: null, machine: null
    });

    // Create OT Modal State
    const [otModalState, setOtModalState] = useState<{ isOpen: boolean, initialData: Partial<CreateWorkOrderState> | undefined }>({
        isOpen: false, initialData: undefined
    });

    // Global Filter State with Persistence
    const [filters, setFilters] = useState<FilterState>(() => {
        const saved = localStorage.getItem('ta_machines_filters');
        return saved ? JSON.parse(saved) : { period: '30d' };
    });

    const nextOtNumber = useMemo(() => calculateNextOt(workOrders), [workOrders]);

    // Persist filters
    useEffect(() => {
        localStorage.setItem('ta_machines_filters', JSON.stringify(filters));
    }, [filters]);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFilterChange = (value: TimeFilter) => {
        setFilters({ period: value });
    };

    const handleDownloadReport = () => {
        setTimeout(() => {
            window.print();
        }, 100);
    };

    const handleOpenUpload = (machine: Machine) => {
        setUploadModal({ isOpen: true, machine });
    };

    const handleConfirmUpload = (data: any) => {
        if (!uploadModal.machine) return;

        const newDoc: MachineDocument = {
            id: `doc-${Date.now()}`,
            title: data.title,
            type: data.docType,
            version: data.version,
            fileName: data.fileName,
            uploadDate: new Date().toLocaleDateString()
        };

        const newPlants = JSON.parse(JSON.stringify(plants));
        
        const addDocToMachine = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.machines) {
                    const mIndex = node.machines.findIndex((m: Machine) => m.id === uploadModal.machine!.id);
                    if (mIndex !== -1) {
                        if (!node.machines[mIndex].documents) node.machines[mIndex].documents = [];
                        node.machines[mIndex].documents.unshift(newDoc); // Add to top
                        return true;
                    }
                }
                if (node.processes && addDocToMachine(node.processes)) return true;
                if (node.subprocesses && addDocToMachine(node.subprocesses)) return true;
            }
            return false;
        };

        addDocToMachine(newPlants);
        setPlants(newPlants);
        
        alert(`Documento "${data.title}" subido exitosamente.`);
        setUploadModal({ isOpen: false, machine: null });
    };

    // --- MANAGE DOCUMENT LOGIC ---
    const handleOpenManage = (doc: MachineDocument, machine: Machine) => {
        setManageDocState({ isOpen: true, doc, machine });
    };

    const handleUpdateDocument = (docId: string, version: string, file: File | null) => {
        if (!manageDocState.machine) return;

        const newPlants = JSON.parse(JSON.stringify(plants));
        
        const updateDocInMachine = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.machines) {
                    const mIndex = node.machines.findIndex((m: Machine) => m.id === manageDocState.machine!.id);
                    if (mIndex !== -1) {
                        const m = node.machines[mIndex];
                        if (m.documents) {
                            const dIndex = m.documents.findIndex((d: MachineDocument) => d.id === docId);
                            if (dIndex !== -1) {
                                // Update properties
                                m.documents[dIndex].version = version;
                                m.documents[dIndex].uploadDate = new Date().toLocaleDateString();
                                if (file) m.documents[dIndex].fileName = file.name;
                                return true;
                            }
                        }
                    }
                }
                if (node.processes && updateDocInMachine(node.processes)) return true;
                if (node.subprocesses && updateDocInMachine(node.subprocesses)) return true;
            }
            return false;
        };

        updateDocInMachine(newPlants);
        setPlants(newPlants);
        
        alert("Documento actualizado correctamente.");
        setManageDocState({ isOpen: false, doc: null, machine: null });
    };

    // --- CONTEXT SEARCH LOGIC ---
    const findMachineContext = (machineId: string) => {
        for (const plant of plants) {
            if (plant.machines?.some(m => m.id === machineId)) return { plant, process: null, subprocess: null };
            for (const proc of plant.processes || []) {
                if (proc.machines?.some(m => m.id === machineId)) return { plant, process: proc, subprocess: null };
                for (const sub of proc.subprocesses || []) {
                    if (sub.machines?.some(m => m.id === machineId)) return { plant, process: proc, subprocess: sub };
                }
            }
        }
        return null;
    };

    // --- CREATE OT LOGIC ---
    const handleCreateOT = (machine: Machine) => {
        const context = findMachineContext(machine.id);
        const initialData: Partial<CreateWorkOrderState> = {
            machineId: machine.id,
            machineCode: machine.code,
            machineName: machine.name,
            plantId: context?.plant.id,
            processId: context?.process?.id,
            subprocessId: context?.subprocess?.id
        };
        setOtModalState({ isOpen: true, initialData });
    };

    const handleSaveOT = (newOrderData: any) => {
        const newOT: WorkOrder = {
            id: Date.now().toString(),
            otNumber: newOrderData.otNumber || `OT-${Math.floor(Math.random()*10000)}`,
            plantId: newOrderData.plantId,
            plantName: plants.find(p => p.id === newOrderData.plantId)?.name || '',
            processName: newOrderData.processId ? 'Proceso Seleccionado' : '', 
            subprocessName: newOrderData.subprocessId ? 'Subproceso Seleccionado' : '', 
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
                 inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
            }
        };
        
        onAddWorkOrder(newOT);
        setOtModalState({ isOpen: false, initialData: undefined });
        alert(`Orden de trabajo ${newOT.otNumber} creada exitosamente.`);
    };

    // --- AI CONSULTATION LOGIC ---
    const handleMachineAiConsultation = (machine: Machine) => {
        const context = findMachineContext(machine.id);
        const aiContext: AiStartContext = {
            plantId: context?.plant.id,
            processId: context?.process?.id,
            subprocessId: context?.subprocess?.id,
            machineId: machine.id,
            machineName: machine.name,
            intent: 'query'
        };
        onAiConsultation(aiContext);
    };


    // Helper to recursively aggregate stats based on CURRENT FILTERS
    // STRATEGY: 
    // 1. Leaf (Machines): Calculate raw metrics.
    // 2. Node (Plant/Process): Average children's metrics.
    const aggregateStats = (node: any): Stats => {
        let stats: Stats = { count: 0, availSum: 0, mtbfSum: 0, mttrSum: 0, otsOpen: 0, otsTotal: 0 };
        
        const periodHours = getHoursFromFilter(filters.period);

        // Own machines (Leaf calculation)
        if (node.machines && node.machines.length > 0) {
            node.machines.forEach((m: Machine) => {
                const metrics = calculateMachineMetrics(m, workOrders, periodHours);
                stats.count++;
                stats.availSum += metrics.availability;
                stats.mtbfSum += metrics.mtbf;
                stats.mttrSum += metrics.mttr;
                stats.otsOpen += metrics.otsOpen;
                stats.otsTotal += metrics.otsTotal;
            });
        }

        // Children processes
        if (node.processes) {
            node.processes.forEach((p: any) => {
                const childStats = aggregateStats(p);
                stats.count += childStats.count;
                stats.availSum += childStats.availSum;
                stats.mtbfSum += childStats.mtbfSum;
                stats.mttrSum += childStats.mttrSum;
                stats.otsOpen += childStats.otsOpen;
                stats.otsTotal += childStats.otsTotal;
            });
        }
        // Children subprocesses
        if (node.subprocesses) {
             node.subprocesses.forEach((s: any) => {
                const childStats = aggregateStats(s);
                stats.count += childStats.count;
                stats.availSum += childStats.availSum;
                stats.mtbfSum += childStats.mtbfSum;
                stats.mttrSum += childStats.mttrSum;
                stats.otsOpen += childStats.otsOpen;
                stats.otsTotal += childStats.otsTotal;
            });
        }

        return stats;
    };

    // Calculate totals for the Global Ribbon using the filtered aggregation
    let globalStats = { count: 0, availSum: 0, mtbfSum: 0, mttrSum: 0, otsOpen: 0, otsTotal: 0 };
    plants.forEach(p => {
        const s = aggregateStats(p);
        globalStats.count += s.count;
        globalStats.availSum += s.availSum;
        globalStats.mtbfSum += s.mtbfSum;
        globalStats.mttrSum += s.mttrSum;
        globalStats.otsOpen += s.otsOpen;
        globalStats.otsTotal += s.otsTotal;
    });

    // Normalize globals (Average of Averages logic for indicators)
    const gCount = globalStats.count || 1;
    const gAvail = (globalStats.availSum / gCount).toFixed(1);
    const gMtbf = (globalStats.mtbfSum / gCount).toFixed(0);
    const gMttr = (globalStats.mttrSum / gCount).toFixed(1);

    const handleSaveMachine = (data: any) => {
        const newPlants = JSON.parse(JSON.stringify(plants));
        const newMachine: Machine = {
            id: `mach-${Date.now()}`,
            ...data
        };

        const findAndAdd = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.id === modal.parentId) {
                    if (!node.machines) node.machines = [];
                    node.machines.push(newMachine);
                    return true;
                }
                if (node.processes && findAndAdd(node.processes)) return true;
                if (node.subprocesses && findAndAdd(node.subprocesses)) return true;
            }
            return false;
        };
        
        findAndAdd(newPlants);
        setPlants(newPlants);
        setModal({ isOpen: false, parentId: null });
    };


    const NodeHeader: React.FC<{ node: any, type: 'plant' | 'process' | 'subprocess', level: number, parentLocation: string, onUpload: (m: Machine) => void }> = ({ node, type, level, parentLocation, onUpload }) => {
        const stats = aggregateStats(node);
        // Normalize aggregated sums to averages for display
        const displayCount = stats.count || 1;
        const avgAvail = stats.count > 0 ? (stats.availSum / displayCount).toFixed(1) : '0';
        const avgMtbf = stats.count > 0 ? (stats.mtbfSum / displayCount).toFixed(0) : '0';
        const avgMttr = stats.count > 0 ? (stats.mttrSum / displayCount).toFixed(1) : '0';
        
        const bgColors = {
            plant: 'bg-blue-50 border-l-4 border-blue-600',
            process: 'bg-gray-50 border-l-4 border-gray-400 ml-4',
            subprocess: 'bg-white border-l-4 border-gray-200 ml-8'
        };
        
        const isExpanded = expanded[node.id];

        return (
            <div className="mb-4">
                <div 
                    className={`p-3 rounded-r-lg shadow-sm border-y border-r border-gray-200 flex items-center justify-between ${bgColors[type]}`}
                >
                    <div className="flex items-center gap-3 cursor-pointer flex-1" onClick={() => toggleExpand(node.id)}>
                         <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         <div>
                             <h3 className="font-bold text-gray-800 text-lg">{node.name}</h3>
                             <div className="flex items-center gap-2">
                                <p className="text-xs text-gray-500 uppercase">{type}</p>
                                {stats.count === 0 && <span className="text-[10px] text-amber-600 bg-amber-100 px-1 rounded">Sin máquinas</span>}
                             </div>
                         </div>
                    </div>
                    
                    {/* Group Indicators - Aggregated & Filtered */}
                    <div className="hidden xl:flex items-center gap-4 mr-4 overflow-x-auto">
                         <div className="text-center px-2 min-w-[60px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Maq.</p>
                            <p className="font-bold text-gray-700">{stats.count}</p>
                         </div>
                         <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Disp {filters.period}</p>
                            <p className="font-bold text-green-600">{avgAvail}%</p>
                         </div>
                          <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">MTBF {filters.period}</p>
                            <p className="font-bold text-blue-600">{avgMtbf}h</p>
                         </div>
                          <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">MTTR {filters.period}</p>
                            <p className="font-bold text-blue-600">{avgMttr}h</p>
                         </div>
                         <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">OTs {filters.period}</p>
                            <p className="font-bold text-gray-700">{stats.otsTotal}</p>
                         </div>
                         <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Abiertas</p>
                            <p className={`font-bold ${stats.otsOpen > 0 ? 'text-red-500' : 'text-gray-700'}`}>{stats.otsOpen}</p>
                         </div>
                    </div>

                    <button 
                        onClick={() => setModal({ isOpen: true, parentId: node.id })}
                        className="flex items-center gap-1 text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-semibold transition-colors shadow-sm shrink-0"
                    >
                        <PlusCircleIcon className="w-4 h-4" /> + Máquina
                    </button>
                </div>

                {/* Content Area */}
                {isExpanded && (
                    <div className="mt-2 space-y-4">
                        {/* Render Machines in this node */}
                        {node.machines && node.machines.length > 0 && (
                            <div className={`grid grid-cols-1 gap-4 ${level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8'}`}>
                                {node.machines.map((m: Machine) => (
                                    <MachineCard 
                                        key={m.id} 
                                        machine={m} 
                                        locationName={`${parentLocation} / ${node.name}`} 
                                        filter={filters.period} 
                                        onUploadDoc={onUpload}
                                        onViewDoc={(doc) => setPreviewDoc(doc)}
                                        onManageDoc={(doc) => handleOpenManage(doc, m)}
                                        onCreateOT={handleCreateOT}
                                        onAiConsultation={handleMachineAiConsultation}
                                        workOrders={workOrders}
                                        historyEvents={historyEvents}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Render Children */}
                        {node.processes && node.processes.map((p: Process) => (
                            <NodeHeader key={p.id} node={p} type="process" level={level + 1} parentLocation={`${parentLocation} / ${node.name}`} onUpload={onUpload} />
                        ))}
                        {node.subprocesses && node.subprocesses.map((s: Subprocess) => (
                             <NodeHeader key={s.id} node={s} type="subprocess" level={level + 1} parentLocation={`${parentLocation} / ${node.name}`} onUpload={onUpload} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
             {/* Global Stats Ribbon with Filters */}
             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                <GlobalStatCard 
                    title="Cantidad de Máquinas" 
                    value={globalStats.count.toString()} 
                    trend="Total Activas" 
                    trendColor="text-gray-500"
                    // No filter for count
                />
                <GlobalStatCard 
                    title="Disponibilidad (Promedio)" 
                    value={`${globalStats.count > 0 ? gAvail : 0}%`} 
                    trend="KPI Global" 
                    trendColor="text-green-600"
                    filterValue={filters.period}
                    onFilterChange={handleFilterChange}
                />
                <GlobalStatCard 
                    title="MTBF (Promedio)" 
                    value={`${globalStats.count > 0 ? gMtbf : 0} h`} 
                    trend="Tiempo entre Fallas" 
                    trendColor="text-green-600"
                    filterValue={filters.period}
                    onFilterChange={handleFilterChange}
                />
                <GlobalStatCard 
                    title="MTTR (Promedio)" 
                    value={`${globalStats.count > 0 ? gMttr : 0} h`} 
                    trend="Tiempo Respuesta" 
                    trendColor="text-green-600"
                    filterValue={filters.period}
                    onFilterChange={handleFilterChange}
                />
                <GlobalStatCard 
                    title="OTs Totales (Suma)" 
                    value={globalStats.otsTotal.toString()} 
                    trend="Generadas en Periodo" 
                    trendColor="text-gray-600"
                    filterValue={filters.period}
                    onFilterChange={handleFilterChange}
                />
                 <GlobalStatCard 
                    title="OTs Abiertas" 
                    value={globalStats.otsOpen.toString()} 
                    trend={`${globalStats.otsOpen} Pendientes`} 
                    trendColor={globalStats.otsOpen > 0 ? "text-red-500" : "text-green-600"}
                    // No filter for Open OTs
                />
                {/* New Date Controls and Report Button */}
                <div className="bg-white p-2 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between min-h-[110px]">
                    <div className="flex flex-col gap-1.5 h-full justify-center">
                        <button 
                            onClick={handleDownloadReport}
                            className="w-full bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                            title="Descargar Informe PDF"
                        >
                            <PrinterIcon className="w-3 h-3"/> Informe
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FilterIcon className="w-6 h-6 text-gray-500" />
                    Monitor de Maquinaria
                </h2>
                
                {/* Hierarchical View */}
                {plants.map(plant => (
                    <NodeHeader 
                        key={plant.id} 
                        node={plant} 
                        type="plant" 
                        level={0} 
                        parentLocation="" 
                        onUpload={handleOpenUpload}
                    />
                ))}
            </div>
            
            <AddMachineModal isOpen={modal.isOpen} onClose={() => setModal({ isOpen: false, parentId: null })} onSave={handleSaveMachine} />
            <UploadMachineDocModal 
                isOpen={uploadModal.isOpen} 
                onClose={() => setUploadModal({ isOpen: false, machine: null })} 
                machineName={uploadModal.machine?.name || ''}
                onSave={handleConfirmUpload}
            />
            
            <DocumentPreviewModal 
                doc={previewDoc} 
                onClose={() => setPreviewDoc(null)} 
            />

            <ManageMachineDocModal 
                isOpen={manageDocState.isOpen} 
                doc={manageDocState.doc} 
                onClose={() => setManageDocState({ isOpen: false, doc: null, machine: null })}
                onUpdate={handleUpdateDocument}
            />

            <CreateWorkOrderModal 
                isOpen={otModalState.isOpen} 
                onClose={() => setOtModalState({ isOpen: false, initialData: undefined })} 
                plants={plants} 
                onSave={handleSaveOT}
                initialData={otModalState.initialData}
                nextOtNumber={nextOtNumber}
            />

             <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default TaMachines;
