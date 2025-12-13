
import React, { useState, useEffect } from 'react';
import { Plant, Process, Subprocess, Machine, MachineDocument } from '../types';
import { QrCodeIcon, PlusCircleIcon, AIAssistantIcon, ArrowUpOnSquareIcon, DocumentTextIcon, WrenchScrewdriverIcon, HistoryIcon, SignalIcon, ChevronDownIcon, XIcon, FilterIcon, PrinterIcon, CheckCircleIcon, EyeIcon, ArrowDownIcon } from '../components/icons/Icons';

interface TaMachinesProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
}

type TimeFilter = '24hr' | '48hr' | '72hr' | '7d' | '14d' | '30d';

interface FilterState {
    availability: TimeFilter;
    mtbf: TimeFilter;
    mttr: TimeFilter;
    totalOts: TimeFilter;
}

interface Stats {
    count: number;
    avail: number;
    mtbf: number;
    mttr: number;
    otsOpen: number;
    otsTotal: number;
}

interface ModalState {
    isOpen: boolean;
    parentId: string | null; // ID of Plant, Process, or Subprocess
}

// Helper to simulate data changes based on time filters
const getFilteredValue = (base: number, type: 'avail' | 'mtbf' | 'mttr' | 'ots', filter: TimeFilter, dateRange?: {start: string, end: string}): number => {
    let modifier = 1;
    // Deterministic simulation of variation
    const factors: Record<string, number> = {
        '24hr': 1.0,
        '48hr': 0.99,
        '72hr': 0.98,
        '7d': 1.01,
        '14d': 1.02,
        '30d': 0.97
    };

    modifier = factors[filter] || 1;

    // If custom date range is active, apply a "simulation" factor
    if (dateRange && dateRange.start && dateRange.end) {
        const start = new Date(dateRange.start).getTime();
        const end = new Date(dateRange.end).getTime();
        if (end >= start) {
             // Pseudo-random modifier based on days difference to simulate range impact
             const days = (end - start) / (1000 * 3600 * 24);
             if (days > 0) modifier = 1 + (days % 10) / 100; 
        }
    }

    if (type === 'ots') {
        // Assuming base is approx 30d value for simulation
        switch(filter) {
            case '24hr': return Math.max(0, Math.round(base / 30 * (Math.random() * 0.5 + 0.5))); // Randomize slightly
            case '48hr': return Math.max(0, Math.round(base / 15));
            case '72hr': return Math.max(0, Math.round(base / 10));
            case '7d': return Math.max(0, Math.round(base / 4));
            case '14d': return Math.max(0, Math.round(base / 2));
            case '30d': return base;
            default: return base;
        }
    }
    
    if (type === 'avail') {
        // Cap at 100
        const val = base * modifier;
        return val > 100 ? 100 : Number(val.toFixed(1));
    }

    return Number((base * modifier).toFixed(type === 'mtbf' ? 0 : 1));
}

const KPI: React.FC<{ title: string; value: string; trend: string; filterText?: string }> = ({ title, value, trend, filterText }) => (
    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
        <div className='flex justify-between items-start'>
            <p className="text-xs text-gray-500 font-medium truncate" title={title}>{title}</p>
            {filterText && <span className='text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold'>{filterText}</span>}
        </div>
        <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        <p className={`text-xs mt-0.5 ${trend.includes('+') ? 'text-green-600' : trend.includes('-') ? 'text-red-500' : 'text-gray-500'}`}>{trend}</p>
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

const TabContent: React.FC = () => {
    return (
        <div className="mt-4">
            <table className="w-full text-sm text-left text-gray-600">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                    <tr>
                        <th className="px-4 py-3">Título</th>
                        <th className="px-4 py-3">Tipo</th>
                        <th className="px-4 py-3">Versión</th>
                        <th className="px-4 py-3">Fecha</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-blue-600 cursor-pointer">Manual de Operación</td>
                        <td className="px-4 py-3">Manual</td>
                        <td className="px-4 py-3">3.1</td>
                        <td className="px-4 py-3">15/12/2025</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
};

const MachineDocumentsTab: React.FC<{ documents?: MachineDocument[] }> = ({ documents }) => {
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
                                        onClick={() => alert(`Visualizando: ${doc.fileName}`)}
                                    >
                                        <EyeIcon className="w-4 h-4"/>
                                    </button>
                                    <button 
                                        className="text-gray-400 hover:text-green-600 p-1 hover:bg-green-50 rounded transition-colors" 
                                        title="Descargar"
                                        onClick={() => alert(`Descargando: ${doc.fileName}`)}
                                    >
                                        <ArrowDownIcon className="w-4 h-4"/>
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
    filters: FilterState; 
    dateRange: {start: string, end: string};
    onUploadDoc: (machine: Machine) => void;
}> = ({ machine, locationName, filters, dateRange, onUploadDoc }) => {
    const [activeTab, setActiveTab] = useState('Resumen');
    const tabs = [
        { name: 'Resumen', icon: <DocumentTextIcon /> },
        { name: 'Documentos', icon: <DocumentTextIcon /> },
        { name: 'Diagnóstico', icon: <WrenchScrewdriverIcon /> },
        { name: 'Ordenes', icon: <WrenchScrewdriverIcon /> },
        { name: 'Historial', icon: <HistoryIcon /> },
        { name: 'Sensores', icon: <SignalIcon /> },
    ];

    // Calculate filtered values for this machine
    const fAvail = getFilteredValue(machine.availability, 'avail', filters.availability, dateRange);
    const fMtbf = getFilteredValue(machine.mtbf, 'mtbf', filters.mtbf, dateRange);
    const fMttr = getFilteredValue(machine.mttr, 'mttr', filters.mttr, dateRange);
    const fTotalOts = getFilteredValue(machine.totalOts, 'ots', filters.totalOts, dateRange);

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
                <KPI title="Disponibilidad" value={`${fAvail}%`} trend="+1.5%" filterText={filters.availability} />
                <KPI title="MTBF" value={`${fMtbf}h`} trend="-3h" filterText={filters.mtbf} />
                <KPI title="MTTR" value={`${fMttr}h`} trend="+0.2h" filterText={filters.mttr} />
                <KPI title="OTs Totales" value={`${fTotalOts}`} trend="" filterText={filters.totalOts} />
                <KPI title="OTs Abiertas" value={`${machine.openOts}`} trend="Activas" />
            </section>

            <section className="flex flex-wrap items-center gap-2 border-t border-b border-gray-200 py-3">
                <button className="flex items-center gap-2 text-xs text-white hover:bg-blue-700 bg-blue-600 px-3 py-1.5 rounded-md font-semibold"><PlusCircleIcon className="w-4 h-4"/> <span>Crear OT</span></button>
                <button className="flex items-center gap-2 text-xs text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-3 py-1.5 rounded-md font-semibold"><AIAssistantIcon className="w-4 h-4" /> <span>Consulta IA</span></button>
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
                {activeTab === 'Resumen' && <TabContent />}
                {activeTab === 'Documentos' && <MachineDocumentsTab documents={machine.documents} />}
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
        code: '', name: '', manufacturer: '', model: '', serial: '', availability: 95, mtbf: 100, mttr: 2, totalOts: 0, openOts: 0
    });

    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
        setFormData({ code: '', name: '', manufacturer: '', model: '', serial: '', availability: 95, mtbf: 100, mttr: 2, totalOts: 0, openOts: 0 });
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

                    <div className="grid grid-cols-3 gap-2 pt-2">
                        <div className='text-xs'>
                            <label className="font-semibold text-gray-600">Disp (%)</label>
                            <input type="number" name="availability" value={formData.availability} onChange={handleChange} className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                        </div>
                        <div className='text-xs'>
                            <label className="font-semibold text-gray-600">MTBF (h)</label>
                            <input type="number" name="mtbf" value={formData.mtbf} onChange={handleChange} className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                        </div>
                         <div className='text-xs'>
                            <label className="font-semibold text-gray-600">MTTR (h)</label>
                            <input type="number" name="mttr" value={formData.mttr} onChange={handleChange} className="w-full p-2 bg-gray-50 border border-gray-300 text-gray-900 rounded" />
                        </div>
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
                        <input required type="text" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. Manual de Mantenimiento" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo</label>
                            <select required value={docType} onChange={e => setDocType(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white">
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
                            <input required type="text" value={version} onChange={e => setVersion(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Ej. 1.0" />
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


const TaMachines: React.FC<TaMachinesProps> = ({ plants, setPlants }) => {
    const [modal, setModal] = useState<ModalState>({ isOpen: false, parentId: null });
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; machine: Machine | null }>({ isOpen: false, machine: null });
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    
    // Global Filter State with Persistence
    const [filters, setFilters] = useState<FilterState>(() => {
        const saved = localStorage.getItem('ta_machines_filters');
        return saved ? JSON.parse(saved) : {
            availability: '24hr',
            mtbf: '30d',
            mttr: '30d',
            totalOts: '30d'
        };
    });

    // Date Range State with Persistence
    const [dateRange, setDateRange] = useState<{start: string, end: string}>(() => {
        const saved = localStorage.getItem('ta_machines_dates');
        return saved ? JSON.parse(saved) : { start: '', end: '' };
    });

    // Persist filters
    useEffect(() => {
        localStorage.setItem('ta_machines_filters', JSON.stringify(filters));
    }, [filters]);

    // Persist dates
    useEffect(() => {
        localStorage.setItem('ta_machines_dates', JSON.stringify(dateRange));
    }, [dateRange]);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleFilterChange = (key: keyof FilterState, value: TimeFilter) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDownloadReport = () => {
        // Simulate PDF report download
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
        
        // Show success alert
        alert(`Documento "${data.title}" subido exitosamente.`);
        setUploadModal({ isOpen: false, machine: null });
    };

    // Helper to recursively aggregate stats based on CURRENT FILTERS
    const aggregateStats = (node: any): Stats => {
        let stats = { count: 0, avail: 0, mtbf: 0, mttr: 0, otsOpen: 0, otsTotal: 0 };
        
        // Own machines
        if (node.machines && node.machines.length > 0) {
            node.machines.forEach((m: Machine) => {
                stats.count++;
                stats.avail += getFilteredValue(m.availability, 'avail', filters.availability, dateRange);
                stats.mtbf += getFilteredValue(m.mtbf, 'mtbf', filters.mtbf, dateRange);
                stats.mttr += getFilteredValue(m.mttr, 'mttr', filters.mttr, dateRange);
                stats.otsOpen += Number(m.openOts);
                stats.otsTotal += getFilteredValue(m.totalOts, 'ots', filters.totalOts, dateRange);
            });
        }

        // Children processes
        if (node.processes) {
            node.processes.forEach((p: any) => {
                const childStats = aggregateStats(p);
                stats.count += childStats.count;
                stats.avail += childStats.avail; 
                stats.mtbf += childStats.mtbf;
                stats.mttr += childStats.mttr;
                stats.otsOpen += childStats.otsOpen;
                stats.otsTotal += childStats.otsTotal;
            });
        }
        // Children subprocesses
        if (node.subprocesses) {
             node.subprocesses.forEach((s: any) => {
                const childStats = aggregateStats(s);
                stats.count += childStats.count;
                stats.avail += childStats.avail;
                stats.mtbf += childStats.mtbf;
                stats.mttr += childStats.mttr;
                stats.otsOpen += childStats.otsOpen;
                stats.otsTotal += childStats.otsTotal;
            });
        }

        return stats;
    };

    // Calculate totals for the Global Ribbon using the filtered aggregation
    let globalStats = { count: 0, avail: 0, mtbf: 0, mttr: 0, otsOpen: 0, otsTotal: 0 };
    plants.forEach(p => {
        const s = aggregateStats(p);
        globalStats.count += s.count;
        globalStats.avail += s.avail;
        globalStats.mtbf += s.mtbf;
        globalStats.mttr += s.mttr;
        globalStats.otsOpen += s.otsOpen;
        globalStats.otsTotal += s.otsTotal;
    });

    // Normalize globals
    const gCount = globalStats.count || 1;
    const gAvail = (globalStats.avail / gCount).toFixed(1);
    const gMtbf = (globalStats.mtbf / gCount).toFixed(0);
    const gMttr = (globalStats.mttr / gCount).toFixed(1);

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
        const avgAvail = stats.count > 0 ? (stats.avail / displayCount).toFixed(1) : '0';
        const avgMtbf = stats.count > 0 ? (stats.mtbf / displayCount).toFixed(0) : '0';
        const avgMttr = stats.count > 0 ? (stats.mttr / displayCount).toFixed(1) : '0';
        
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
                            <p className="text-[10px] text-gray-400 font-bold uppercase">Disp {filters.availability}</p>
                            <p className="font-bold text-green-600">{avgAvail}%</p>
                         </div>
                          <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">MTBF {filters.mtbf}</p>
                            <p className="font-bold text-blue-600">{avgMtbf}h</p>
                         </div>
                          <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">MTTR {filters.mttr}</p>
                            <p className="font-bold text-blue-600">{avgMttr}h</p>
                         </div>
                         <div className="text-center px-2 border-l border-gray-200 min-w-[80px]">
                            <p className="text-[10px] text-gray-400 font-bold uppercase">OTs {filters.totalOts}</p>
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
                                        filters={filters} 
                                        dateRange={dateRange} 
                                        onUploadDoc={onUpload}
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
                    trend="+1.8% vs anterior" 
                    trendColor="text-green-600"
                    filterValue={filters.availability}
                    onFilterChange={(val) => handleFilterChange('availability', val)}
                />
                <GlobalStatCard 
                    title="MTBF (Promedio)" 
                    value={`${globalStats.count > 0 ? gMtbf : 0} h`} 
                    trend="+5.2% vs anterior" 
                    trendColor="text-green-600"
                    filterValue={filters.mtbf}
                    onFilterChange={(val) => handleFilterChange('mtbf', val)}
                />
                <GlobalStatCard 
                    title="MTTR (Promedio)" 
                    value={`${globalStats.count > 0 ? gMttr : 0} h`} 
                    trend="-10% vs anterior" 
                    trendColor="text-green-600"
                    filterValue={filters.mttr}
                    onFilterChange={(val) => handleFilterChange('mttr', val)}
                />
                <GlobalStatCard 
                    title="OTs Totales (Suma)" 
                    value={globalStats.otsTotal.toString()} 
                    trend="Generadas" 
                    trendColor="text-gray-600"
                    filterValue={filters.totalOts}
                    onFilterChange={(val) => handleFilterChange('totalOts', val)}
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
                    <div className="flex flex-col gap-1.5">
                         <div className="flex items-center gap-1">
                             <label className="text-[10px] text-gray-500 font-bold uppercase w-5 text-right">Del</label>
                             <input 
                                type="date" 
                                value={dateRange.start}
                                onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))}
                                className="flex-1 min-w-0 text-[10px] bg-gray-50 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 h-6"
                             />
                        </div>
                        <div className="flex items-center gap-1">
                             <label className="text-[10px] text-gray-500 font-bold uppercase w-5 text-right">Al</label>
                             <input 
                                type="date" 
                                value={dateRange.end}
                                onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))}
                                className="flex-1 min-w-0 text-[10px] bg-gray-50 border border-gray-300 rounded px-1 py-0.5 focus:ring-1 focus:ring-blue-500 outline-none text-gray-700 h-6"
                             />
                        </div>
                    </div>
                    <button 
                        onClick={handleDownloadReport}
                        className="w-full mt-1 bg-gray-800 hover:bg-gray-900 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-2 transition-colors shadow-sm"
                        title="Descargar Informe PDF"
                    >
                        <PrinterIcon className="w-3 h-3"/> Informe
                    </button>
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
        </div>
    );
};

export default TaMachines;
