
import React, { useState, useMemo, useEffect } from 'react';
import { Plant, Procedure, DocVersionStatus, DocumentVersion } from '../types';
import { 
    SearchIcon, FilterIcon, DocumentTextIcon, EyeIcon, ArrowDownIcon, XIcon, 
    PrinterIcon, CalendarIcon, UserIcon, PencilIcon, ArrowUpOnSquareIcon, 
    CheckCircleIcon, ClockIcon, PaperclipIcon 
} from '../components/icons/Icons';

interface CertificationDocumentsProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
}

interface DerivedDocument {
    id: string;
    code: string;
    name: string;
    type: string; // Procedure Title
    version: string;
    status: DocVersionStatus;
    nextReview: string;
    owner: string;
    file: string;
    uploadDate?: string;
    procedureId: string;
}

// Mock User for context
const CURRENT_USER = { name: 'Ana Lopez', role: 'Supervisor' };

const DocumentPreviewModal: React.FC<{ doc: DerivedDocument | null; onClose: () => void }> = ({ doc, onClose }) => {
    if (!doc) return null;

    const handlePrint = () => {
        window.print();
    };

    const handleDownload = () => {
        const link = document.createElement('a');
        link.href = '#'; 
        link.download = doc.file;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

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
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{doc.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{doc.code} • v{doc.version}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                        >
                            <PrinterIcon className="w-4 h-4" /> Imprimir
                        </button>
                        <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors shadow-sm"
                        >
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
                                <p className="text-xs text-gray-500 mb-1">Estado Actual</p>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${
                                    doc.status === 'current' ? 'bg-green-50 text-green-700 border-green-200' :
                                    doc.status === 'in_review' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${
                                        doc.status === 'current' ? 'bg-green-500' :
                                        doc.status === 'in_review' ? 'bg-yellow-500' : 'bg-red-500'
                                    }`}></span>
                                    {doc.status === 'current' ? 'Vigente' : doc.status === 'in_review' ? 'En Revisión' : 'Caducado'}
                                </span>
                            </div>

                            <div className="flex items-start gap-3">
                                <CalendarIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Próxima Revisión</p>
                                    <p className="text-sm text-gray-600">{doc.nextReview}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Responsable</p>
                                    <p className="text-sm text-gray-600">{doc.owner}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-500 mb-1">Procedimiento Padre</p>
                                <p className="text-xs font-medium text-blue-600">{doc.type}</p>
                            </div>

                            <div>
                                <p className="text-xs text-gray-500 mb-1">Nombre de Archivo</p>
                                <p className="text-xs font-mono text-gray-600 break-all bg-gray-100 p-1.5 rounded">{doc.file}</p>
                            </div>
                        </div>
                    </div>

                    {/* Viewer Area */}
                    <div className="flex-1 bg-gray-100 p-8 flex items-center justify-center overflow-auto relative">
                        <div className="bg-white shadow-lg w-[595px] min-h-[842px] p-12 text-gray-800 relative transform transition-transform hover:scale-[1.01] origin-top">
                            {doc.status !== 'current' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <div className="text-red-500 opacity-10 text-9xl font-black -rotate-45 uppercase border-8 border-red-500 p-10 rounded-xl">
                                        {doc.status === 'expired' ? 'CADUCADO' : 'OBSOLETO'}
                                    </div>
                                </div>
                            )}
                            
                            <div className="border-b-2 border-black pb-4 mb-8 flex justify-between items-end">
                                <div>
                                    <h1 className="text-2xl font-bold uppercase tracking-tight text-gray-900">{doc.name}</h1>
                                    <p className="text-sm text-gray-500 mt-1">{doc.type}</p>
                                </div>
                                <div className="text-right">
                                    <div className="border border-black px-2 py-1 text-xs font-mono font-bold">{doc.code}</div>
                                    <p className="text-xs mt-1">Rev: {doc.version}</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-justify text-xs leading-relaxed text-gray-600 font-serif">
                                <p><strong>1. OBJETIVO</strong></p>
                                <p>El presente documento tiene como objetivo establecer los lineamientos para la correcta ejecución de las actividades descritas.</p>
                                <p className="mt-4"><strong>2. DESARROLLO</strong></p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                                <div className="h-32 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 italic mt-4 mb-4">
                                    [Contenido del Documento]
                                </div>
                            </div>

                            <div className="absolute bottom-10 left-10 right-10 border-t border-gray-300 pt-2 flex justify-between text-[10px] text-gray-400">
                                <span>Confidencial - Uso Interno</span>
                                <span>Página 1 de 1</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- DOCUMENT DETAIL & HISTORY MODAL ---
const DocumentDetailModal: React.FC<{ 
    isOpen: boolean; 
    docId: string | null;
    procedureId: string | null;
    onClose: () => void;
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
    onPreview: (doc: DerivedDocument) => void;
}> = ({ isOpen, docId, procedureId, onClose, plants, setPlants, onPreview }) => {
    const [isRenewing, setIsRenewing] = useState(false);
    const [renewForm, setRenewForm] = useState({ version: '', renewalDate: '', file: null as File | null });

    const context = useMemo(() => {
        if (!docId || !procedureId) return null;
        let foundProc: Procedure | undefined;
        let foundDoc: any; 
        
        const traverse = (nodes: any[]) => {
            for (const node of nodes) {
                if (node.procedures) {
                    const p = node.procedures.find((x: Procedure) => x.id === procedureId);
                    if (p) {
                        const d = p.documents.find((x: any) => x.id === docId);
                        if (d) {
                            foundProc = p;
                            foundDoc = d;
                            return true;
                        }
                    }
                }
                if (node.processes && traverse(node.processes)) return true;
                if (node.subprocesses && traverse(node.subprocesses)) return true;
            }
            return false;
        };
        traverse(plants);
        return { proc: foundProc, doc: foundDoc };
    }, [plants, docId, procedureId, isOpen]);

    useEffect(() => {
        if (isOpen) {
            setIsRenewing(false);
            setRenewForm({ version: '', renewalDate: '', file: null });
        }
    }, [isOpen]);

    if (!isOpen || !context?.doc || !context?.proc) return null;
    
    const { doc, proc } = context;
    const activeVersion = doc.versions.find((v: DocumentVersion) => v.status !== 'obsolete');
    const isReviewer = proc.reviewer === CURRENT_USER.name;

    const StatusBadge: React.FC<{ status: DocVersionStatus }> = ({ status }) => {
        switch (status) {
            case 'current': return <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">Vigente</span>;
            case 'in_review': return <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded text-xs font-bold">En Revisión</span>;
            case 'expired': return <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-xs font-bold">Caducado</span>;
            case 'obsolete': return <span className="bg-gray-100 text-gray-500 px-2 py-0.5 rounded text-xs font-bold line-through">Obsoleto</span>;
            default: return null;
        }
    };

    const handleSaveRenewal = (e: React.FormEvent) => {
        e.preventDefault();
        const newVersion: DocumentVersion = {
            id: `ver-${Date.now()}`,
            version: renewForm.version,
            file: renewForm.file ? renewForm.file.name : 'nuevo_archivo.pdf',
            uploadDate: new Date().toLocaleDateString(),
            renewalDate: renewForm.renewalDate,
            status: 'in_review',
            updatedBy: CURRENT_USER.name
        };

        const newPlants = JSON.parse(JSON.stringify(plants));
        const findAndUpdate = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.procedures) {
                    const procIndex = node.procedures.findIndex((p: Procedure) => p.id === procedureId);
                    if (procIndex !== -1) {
                         const docIndex = node.procedures[procIndex].documents.findIndex((d: any) => d.id === docId);
                         if (docIndex !== -1) {
                             const docRef = node.procedures[procIndex].documents[docIndex];
                             docRef.versions.forEach((v: DocumentVersion) => {
                                 if (v.status === 'current' || v.status === 'in_review' || v.status === 'expired') v.status = 'obsolete';
                             });
                             docRef.versions.unshift(newVersion);
                             return true;
                         }
                    }
                }
                if (node.processes && findAndUpdate(node.processes)) return true;
                if (node.subprocesses && findAndUpdate(node.subprocesses)) return true;
            }
            return false;
        };
        findAndUpdate(newPlants);
        setPlants(newPlants);
        setIsRenewing(false);
    };

    const handleApproveReview = () => {
        const newPlants = JSON.parse(JSON.stringify(plants));
        const findAndApprove = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.procedures) {
                    const procIndex = node.procedures.findIndex((p: Procedure) => p.id === procedureId);
                    if (procIndex !== -1) {
                        const docIndex = node.procedures[procIndex].documents.findIndex((d: any) => d.id === docId);
                        if (docIndex !== -1) {
                            const docRef = node.procedures[procIndex].documents[docIndex];
                            const version = docRef.versions.find((v: DocumentVersion) => v.status === 'in_review');
                            if (version) {
                                version.status = 'current';
                                return true;
                            }
                        }
                    }
                }
                if (node.processes && findAndApprove(node.processes)) return true;
                if (node.subprocesses && findAndApprove(node.subprocesses)) return true;
            }
            return false;
        };
        findAndApprove(newPlants);
        setPlants(newPlants);
    };

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh] relative">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{doc.name}</h3>
                        <p className="text-sm text-gray-500 font-mono">{doc.code}</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="mb-6">
                        <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-blue-600"/> Versión Actual</h4>
                        {activeVersion ? (
                            <div className={`border rounded-lg p-4 flex items-center justify-between ${activeVersion.status === 'in_review' ? 'bg-yellow-50 border-yellow-200' : activeVersion.status === 'expired' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="text-lg font-bold text-gray-800">v{activeVersion.version}</p>
                                        <StatusBadge status={activeVersion.status} />
                                    </div>
                                    <p className="text-xs text-gray-700 mt-1">Subido: {activeVersion.uploadDate} por {activeVersion.updatedBy}</p>
                                    <p className="text-xs text-gray-700">Renovación: {activeVersion.renewalDate}</p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <button 
                                        onClick={() => onPreview({
                                            id: doc.id,
                                            code: doc.code,
                                            name: doc.name,
                                            type: proc.title,
                                            version: activeVersion.version,
                                            status: activeVersion.status,
                                            nextReview: activeVersion.renewalDate,
                                            owner: proc.responsible,
                                            file: activeVersion.file,
                                            procedureId: proc.id
                                        })}
                                        className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium w-full text-left"
                                    >
                                        <PaperclipIcon className="w-4 h-4 text-blue-500"/> {activeVersion.file}
                                    </button>
                                    
                                    {activeVersion.status === 'in_review' && isReviewer && (
                                        <button 
                                            onClick={handleApproveReview}
                                            className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm font-bold shadow-sm justify-center"
                                        >
                                            <CheckCircleIcon className="w-4 h-4"/> Aprobar Revisión
                                        </button>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <p className="text-red-500 text-sm italic">No hay versiones activas.</p>
                        )}
                    </div>

                    {!isRenewing ? (
                        <button onClick={() => setIsRenewing(true)} className="w-full py-2 border-2 border-dashed border-blue-300 text-blue-600 font-semibold rounded hover:bg-blue-50 mb-6">
                            + Cargar Nueva Versión (Renovar)
                        </button>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 animate-fade-in relative">
                             <button onClick={() => setIsRenewing(false)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500"><XIcon className="w-4 h-4"/></button>
                            <h5 className="font-bold text-gray-800 text-sm mb-3">Renovar Documento (Nueva Versión)</h5>
                            <form onSubmit={handleSaveRenewal} className="space-y-3">
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Nueva Versión</label>
                                        <input required type="text" placeholder="Ej. 2.0" value={renewForm.version} onChange={e => setRenewForm({...renewForm, version: e.target.value})} className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-900"/>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-gray-600">Nueva Fecha Renovación</label>
                                        <input required type="date" value={renewForm.renewalDate} onChange={e => setRenewForm({...renewForm, renewalDate: e.target.value})} className="w-full p-2 bg-white border border-gray-300 rounded text-sm text-gray-900"/>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-gray-600">Archivo</label>
                                    <input required type="file" onChange={e => setRenewForm({...renewForm, file: e.target.files ? e.target.files[0] : null})} className="w-full text-sm"/>
                                </div>
                                <div className="flex justify-end gap-2 mt-2">
                                    <button type="button" onClick={() => setIsRenewing(false)} className="text-xs text-gray-500 hover:text-gray-800 font-medium px-3 py-1">Cancelar</button>
                                    <button type="submit" className="text-xs bg-blue-600 text-white px-3 py-1 rounded font-medium hover:bg-blue-700">Guardar Nueva Versión</button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div>
                        <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><ClockIcon className="w-4 h-4"/> Historial (Obsoletos)</h4>
                        <div className="space-y-2">
                            {doc.versions.filter((v: any) => v.status === 'obsolete').map((ver: any) => (
                                <div key={ver.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
                                    <div>
                                        <p className="text-sm font-bold text-gray-600">v{ver.version} <span className="text-[10px] font-normal text-gray-400 ml-1">(Obsoleto)</span></p>
                                        <p className="text-[10px] text-gray-400">Subido: {ver.uploadDate}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                            <span className="text-xs text-gray-500">{ver.file}</span>
                                            <EyeIcon 
                                                className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                                onClick={() => onPreview({
                                                    id: doc.id,
                                                    code: doc.code,
                                                    name: doc.name,
                                                    type: proc.title,
                                                    version: ver.version,
                                                    status: 'obsolete',
                                                    nextReview: ver.renewalDate,
                                                    owner: ver.updatedBy,
                                                    file: ver.file,
                                                    procedureId: proc.id
                                                })}
                                            />
                                    </div>
                                </div>
                            ))}
                            {doc.versions.filter((v: any) => v.status === 'obsolete').length === 0 && (
                                <p className="text-xs text-gray-400 italic ml-6">No hay versiones anteriores.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const CertificationDocuments: React.FC<CertificationDocumentsProps> = ({ plants, setPlants }) => {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');
    const [selectedDoc, setSelectedDoc] = useState<DerivedDocument | null>(null);
    const [detailModal, setDetailModal] = useState<{ isOpen: boolean; docId: string | null; procedureId: string | null }>({ isOpen: false, docId: null, procedureId: null });

    const documents = useMemo(() => {
        const docs: DerivedDocument[] = [];
        
        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.procedures) {
                    node.procedures.forEach((proc: Procedure) => {
                        if (proc.status === 'active') {
                            proc.documents.forEach(doc => {
                                const activeVersion = doc.versions.find(v => v.status !== 'obsolete') || doc.versions[0];
                                
                                if (activeVersion) {
                                    docs.push({
                                        id: doc.id,
                                        code: doc.code,
                                        name: doc.name,
                                        type: proc.title, 
                                        version: activeVersion.version,
                                        status: activeVersion.status,
                                        nextReview: activeVersion.renewalDate,
                                        owner: proc.responsible,
                                        file: activeVersion.file,
                                        uploadDate: activeVersion.uploadDate,
                                        procedureId: proc.id
                                    });
                                }
                            });
                        }
                    });
                }
                if (node.processes) traverse(node.processes);
                if (node.subprocesses) traverse(node.subprocesses);
            });
        };

        traverse(plants);
        return docs;
    }, [plants]);

    const getStatusBadge = (status: DocVersionStatus) => {
        switch (status) {
            case 'current': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">Vigente</span>;
            case 'in_review': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">En Revisión</span>;
            case 'expired': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold border border-red-200">Caducado</span>;
            case 'obsolete': return <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold border border-gray-200">Obsoleto</span>;
            default: return null;
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.name.toLowerCase().includes(searchText.toLowerCase()) || doc.code.toLowerCase().includes(searchText.toLowerCase());
        const matchesStatus = statusFilter ? doc.status === statusFilter : true;
        const matchesType = typeFilter ? doc.type.toLowerCase().includes(typeFilter.toLowerCase()) : true;
        return matchesSearch && matchesStatus && matchesType;
    });

    const distinctTypes = Array.from(new Set(documents.map(d => d.type)));

    return (
        <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <DocumentTextIcon className="w-6 h-6 text-blue-600"/>
                            Gestión de Documentos (ISO 9001 / IATF 16949)
                        </h3>
                        <p className="text-gray-500 text-sm mt-1">
                            Vista centralizada de documentos vigentes. La creación y edición se realiza en el módulo "Documentos & Procedimientos".
                        </p>
                    </div>
                </div>

                {/* FILTERS TOOLBAR */}
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[250px]">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Buscar Documento</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                placeholder="Buscar por código o nombre..." 
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                className="w-full pl-9 pr-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
                        </div>
                    </div>
                    
                    <div className="w-48">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Procedimiento / Origen</label>
                        <div className="relative">
                            <select 
                                value={typeFilter} 
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="">Todos</option>
                                {distinctTypes.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                            <FilterIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>

                    <div className="w-40">
                        <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Estado</label>
                        <div className="relative">
                            <select 
                                value={statusFilter} 
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                            >
                                <option value="">Todos</option>
                                <option value="current">Vigente</option>
                                <option value="in_review">En Revisión</option>
                                <option value="expired">Caducado</option>
                                <option value="obsolete">Obsoleto</option>
                            </select>
                            <ArrowDownIcon className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"/>
                        </div>
                    </div>
                    
                    <button 
                        onClick={() => {setSearchText(''); setStatusFilter(''); setTypeFilter('');}}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold underline mb-2 px-2"
                    >
                        Limpiar Filtros
                    </button>
                </div>
                
                {/* TABLE */}
                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full text-sm text-left text-gray-700">
                        <thead className="text-xs text-gray-500 uppercase bg-gray-100 font-semibold">
                            <tr>
                                <th scope="col" className="px-6 py-3">Código</th>
                                <th scope="col" className="px-6 py-3">Nombre del Documento</th>
                                <th scope="col" className="px-6 py-3">Procedimiento Asociado</th>
                                <th scope="col" className="px-6 py-3 text-center">Versión</th>
                                <th scope="col" className="px-6 py-3">Estado</th>
                                <th scope="col" className="px-6 py-3">Próxima Revisión</th>
                                <th scope="col" className="px-6 py-3">Responsable</th>
                                <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredDocs.length > 0 ? (
                                filteredDocs.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-xs font-bold text-gray-600">{doc.code}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{doc.name}</td>
                                        <td className="px-6 py-4 text-xs text-gray-600">{doc.type}</td>
                                        <td className="px-6 py-4 text-center">{doc.version}</td>
                                        <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                                        <td className="px-6 py-4 text-xs font-mono">{doc.nextReview}</td>
                                        <td className="px-6 py-4 text-xs text-gray-500">{doc.owner}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => setSelectedDoc(doc)}
                                                    className="text-gray-500 hover:text-blue-600 font-semibold p-1.5 hover:bg-blue-50 rounded transition-colors" 
                                                    title="Ver"
                                                >
                                                    <EyeIcon className="w-5 h-5"/>
                                                </button>
                                                <button 
                                                    onClick={() => setDetailModal({ isOpen: true, docId: doc.id, procedureId: doc.procedureId })}
                                                    className="text-blue-600 hover:text-blue-800 font-bold text-xs p-1.5 hover:bg-blue-50 rounded transition-colors flex items-center gap-1" 
                                                    title="Actualizar / Revisar"
                                                >
                                                    <PencilIcon className="w-4 h-4"/> Gestionar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <DocumentTextIcon className="w-12 h-12 mx-auto text-gray-300 mb-2"/>
                                        <p>No se encontraron documentos vigentes que coincidan con los filtros.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="mt-4 text-xs text-gray-500 flex justify-between items-center">
                    <span>Mostrando {filteredDocs.length} documentos</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
                    </div>
                </div>
            </div>

            {/* Document Preview Modal */}
            <DocumentPreviewModal 
                doc={selectedDoc} 
                onClose={() => setSelectedDoc(null)} 
            />

            {/* Document Detail & History Modal */}
            <DocumentDetailModal
                isOpen={detailModal.isOpen}
                docId={detailModal.docId}
                procedureId={detailModal.procedureId}
                onClose={() => setDetailModal({ isOpen: false, docId: null, procedureId: null })}
                plants={plants}
                setPlants={setPlants}
                onPreview={(doc) => {
                    setSelectedDoc(doc);
                    setDetailModal({ isOpen: false, docId: null, procedureId: null });
                }}
            />

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default CertificationDocuments;
