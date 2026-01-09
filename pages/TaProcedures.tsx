
import React, { useState } from 'react';
import { Plant, Process, Subprocess, Procedure, ProcedureDocumentItem, DocumentVersion, DocVersionStatus } from '../types';
import { PlusCircleIcon, ChevronDownIcon, BookOpenIcon, ArrowUpOnSquareIcon, PaperclipIcon, TrashIcon, BellIcon, XIcon, EyeIcon, ClockIcon, CheckCircleIcon, PencilIcon, ArchiveBoxIcon, PrinterIcon, ArrowDownIcon, CalendarIcon, UserIcon, DocumentTextIcon } from '../components/icons/Icons';

interface TaProceduresProps {
    plants: Plant[];
    setPlants: (plants: Plant[]) => void;
    docCodePattern: string; // New prop
}

// Mock Current User for permissions
const CURRENT_USER = {
    name: 'Ana Lopez',
    role: 'Supervisor'
};

// -- Modals States --
interface CreateProcedureModalState {
    isOpen: boolean;
    parentId: string | null;
    editingId: string | null; // If present, we are editing
}

interface DocumentDetailModalState {
    isOpen: boolean;
    procedureId: string | null;
    documentItem: ProcedureDocumentItem | null;
}

interface ActionConfirmationState {
    isOpen: boolean;
    step: 1 | 2;
    type: 'delete' | 'archive' | null;
    parentId: string | null;
    procId: string | null;
    procTitle: string;
}

// -- Form Data Interfaces --
interface NewDocInput {
    code: string;
    name: string;
    version: string;
    renewalDate: string;
    file: File | null;
}

interface ProcedureFormData {
    title: string;
    description: string;
    reviewer: string;
    responsible: string;
    notifyEmail: boolean;
    notifyWhatsapp: boolean;
    newDocuments: NewDocInput[];
}

interface DocStats {
    current: number; // Green
    inReview: number; // Yellow
    expired: number; // Red
}

interface PreviewData {
    name: string;
    code: string;
    type: string; // Procedure Title
    version: string;
    status: DocVersionStatus;
    renewalDate: string;
    responsible: string;
    file: string;
}

const MOCK_USERS = [
    { id: 'u1', name: 'Ana Lopez', role: 'Supervisor' },
    { id: 'u2', name: 'Juan Pérez', role: 'Técnico' },
    { id: 'u3', name: 'Carlos Ruiz', role: 'Gerente' },
    { id: 'u4', name: 'Maria Garcia', role: 'Auditor' },
];

// Helper to generate code based on pattern
const generateCodeFromPattern = (pattern: string) => {
    return pattern.split('').map(char => {
        if (char === 'A') return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random Letter A-Z
        if (char === '1') return Math.floor(Math.random() * 10).toString(); // Random Number 0-9
        return char; // Separators or other chars
    }).join('');
};

const validateCode = (code: string, pattern: string) => {
    const upperCode = code.toUpperCase();
    const upperPattern = pattern.toUpperCase();
    
    if (upperCode.length !== upperPattern.length) return false;

    for (let i = 0; i < upperPattern.length; i++) {
        const pChar = upperPattern[i];
        const cChar = upperCode[i];
        
        if (pChar === 'A') {
            if (!/[A-Z]/.test(cChar)) return false;
        } else if (pChar === '1') {
            if (!/[0-9]/.test(cChar)) return false;
        } else {
            if (pChar !== cChar) return false;
        }
    }
    return true;
};

// --- Document Preview Modal ---
const DocumentPreviewModal: React.FC<{ doc: PreviewData | null; onClose: () => void }> = ({ doc, onClose }) => {
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
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{doc.name}</h3>
                            <p className="text-xs text-gray-500 font-mono">{doc.code} • v{doc.version}</p>
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
                                    <p className="text-xs font-bold text-gray-700">Renovación</p>
                                    <p className="text-sm text-gray-600">{doc.renewalDate}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <UserIcon className="w-4 h-4 text-gray-400 mt-0.5" />
                                <div>
                                    <p className="text-xs font-bold text-gray-700">Responsable</p>
                                    <p className="text-sm text-gray-600">{doc.responsible}</p>
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
                        {/* Simulated Paper Document */}
                        <div className="bg-white shadow-lg w-[595px] min-h-[842px] p-12 text-gray-800 relative transform transition-transform hover:scale-[1.01] origin-top">
                            {/* Watermark for non-current */}
                            {doc.status !== 'current' && (
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
                                    <div className="text-red-500 opacity-10 text-9xl font-black -rotate-45 uppercase border-8 border-red-500 p-10 rounded-xl">
                                        {doc.status === 'expired' ? 'CADUCADO' : 'OBSOLETO'}
                                    </div>
                                </div>
                            )}
                            
                            {/* Header Simulation */}
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

                            {/* Body Simulation */}
                            <div className="space-y-4 text-justify text-xs leading-relaxed text-gray-600 font-serif">
                                <p><strong>1. OBJETIVO</strong></p>
                                <p>El presente documento tiene como objetivo establecer los lineamientos para la correcta ejecución de las actividades descritas en el título, asegurando el cumplimiento de la normativa ISO 9001:2015 y los estándares internos de calidad.</p>
                                
                                <p className="mt-4"><strong>2. ALCANCE</strong></p>
                                <p>Aplica a todas las áreas operativas involucradas en el proceso de manufactura de la Planta Monterrey.</p>

                                <p className="mt-4"><strong>3. RESPONSABILIDADES</strong></p>
                                <ul className="list-disc pl-5 space-y-1">
                                    <li>Gerente de Planta: Aprobar el documento.</li>
                                    <li>Supervisor de Área: Asegurar la difusión.</li>
                                    <li>Operadores: Ejecutar conforme a lo descrito.</li>
                                </ul>

                                <p className="mt-4"><strong>4. DESARROLLO</strong></p>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
                                <div className="h-32 bg-gray-100 border border-gray-300 flex items-center justify-center text-gray-400 italic mt-4 mb-4">
                                    [Diagrama de Flujo del Proceso]
                                </div>
                                <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
                            </div>

                            {/* Footer Simulation */}
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

// --- Double Confirmation Modal Component ---
const ConfirmationModal: React.FC<{
    state: ActionConfirmationState;
    onClose: () => void;
    onNextStep: () => void;
    onConfirm: () => void;
}> = ({ state, onClose, onNextStep, onConfirm }) => {
    if (!state.isOpen) return null;

    const isDelete = state.type === 'delete';
    const actionLabel = isDelete ? 'Eliminar' : 'Marcar como Obsoleto';
    
    // Dynamic Text based on Step and Type
    let title = '';
    let message = '';
    let confirmBtnText = '';
    let btnColorClass = '';

    if (state.step === 1) {
        title = `Confirmar ${actionLabel}`;
        if (isDelete) {
            message = `¿Está seguro que desea eliminar el procedimiento "${state.procTitle}"?`;
            confirmBtnText = 'Continuar';
            btnColorClass = 'bg-red-600 hover:bg-red-700';
        } else {
            message = `¿Está seguro que desea marcar el procedimiento "${state.procTitle}" como obsoleto?`;
            confirmBtnText = 'Continuar';
            btnColorClass = 'bg-yellow-500 hover:bg-yellow-600';
        }
    } else {
        title = 'Advertencia Final';
        if (isDelete) {
            message = `Esta acción es irreversible. El procedimiento "${state.procTitle}" y todos sus documentos asociados se eliminarán permanentemente. ¿Desea proceder?`;
            confirmBtnText = 'Sí, Eliminar Definitivamente';
            btnColorClass = 'bg-red-800 hover:bg-red-900';
        } else {
            message = `El procedimiento "${state.procTitle}" dejará de estar visible en la lista activa y pasará al archivo histórico de obsoletos. ¿Confirma esta acción?`;
            confirmBtnText = 'Sí, Marcar Obsoleto';
            btnColorClass = 'bg-yellow-600 hover:bg-yellow-700';
        }
    }

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[60] flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-lg shadow-2xl p-6 w-full max-w-md m-4 relative">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                </div>
                <p className="text-gray-600 mb-8">{message}</p>
                <div className="flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-semibold">
                        Cancelar
                    </button>
                    <button 
                        type="button" 
                        onClick={state.step === 1 ? onNextStep : onConfirm} 
                        className={`px-4 py-2 text-white rounded-md font-semibold shadow-sm transition-colors ${btnColorClass}`}
                    >
                        {confirmBtnText}
                    </button>
                </div>
            </div>
        </div>
    );
};

const TaProcedures: React.FC<TaProceduresProps> = ({ plants, setPlants, docCodePattern }) => {
    const [expanded, setExpanded] = useState<Record<string, boolean>>({});
    const [showObsolete, setShowObsolete] = useState(false);
    
    // Modals
    const [createModal, setCreateModal] = useState<CreateProcedureModalState>({ isOpen: false, parentId: null, editingId: null });
    const [detailModal, setDetailModal] = useState<DocumentDetailModalState>({ isOpen: false, procedureId: null, documentItem: null });
    const [confirmModal, setConfirmModal] = useState<ActionConfirmationState>({ isOpen: false, step: 1, type: null, parentId: null, procId: null, procTitle: '' });
    
    // Preview Modal State
    const [previewDoc, setPreviewDoc] = useState<PreviewData | null>(null);

    // Form Data for creating/editing a Procedure
    const [procForm, setProcForm] = useState<ProcedureFormData>({
        title: '', description: '', reviewer: '', responsible: '', 
        notifyEmail: true, notifyWhatsapp: false,
        newDocuments: [] 
    });

    // Form Data for Renewing a Document (New Version)
    const [renewForm, setRenewForm] = useState<{ version: string; renewalDate: string; file: File | null }>({
        version: '', renewalDate: '', file: null
    });
    const [isRenewing, setIsRenewing] = useState(false);

    const toggleExpand = (id: string) => {
        setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
    };

    // Helper to calculate status based on date
    const getEffectiveStatus = (version: DocumentVersion): DocVersionStatus => {
        if (version.status === 'obsolete') return 'obsolete';
        if (version.status === 'expired') return 'expired';
        
        // Auto-check expiration date
        const today = new Date();
        const renewal = new Date(version.renewalDate);
        if (renewal < today && version.status === 'current') {
            return 'expired';
        }
        return version.status;
    };

    // Helper to Aggregate Stats
    const aggregateDocStats = (node: any): DocStats => {
        let stats: DocStats = { current: 0, inReview: 0, expired: 0 };

        // Check own procedures
        if (node.procedures) {
            node.procedures.forEach((proc: Procedure) => {
                if (proc.status === 'active') { // Only count active procedures
                    proc.documents.forEach((doc) => {
                        // Find latest non-obsolete version
                        const latest = doc.versions.find(v => v.status !== 'obsolete');
                        if (latest) {
                            const status = getEffectiveStatus(latest);
                            if (status === 'current') stats.current++;
                            else if (status === 'in_review') stats.inReview++;
                            else if (status === 'expired') stats.expired++;
                        }
                    });
                }
            });
        }

        // Recursion
        if (node.processes) {
            node.processes.forEach((p: any) => {
                const childStats = aggregateDocStats(p);
                stats.current += childStats.current;
                stats.inReview += childStats.inReview;
                stats.expired += childStats.expired;
            });
        }
        if (node.subprocesses) {
            node.subprocesses.forEach((s: any) => {
                const childStats = aggregateDocStats(s);
                stats.current += childStats.current;
                stats.inReview += childStats.inReview;
                stats.expired += childStats.expired;
            });
        }
        return stats;
    };

    // --- CREATE / EDIT PROCEDURE LOGIC ---

    const openCreateModal = (e: React.MouseEvent, parentId: string) => {
        e.stopPropagation();
        setProcForm({
            title: '', description: '', reviewer: '', responsible: '', 
            notifyEmail: true, notifyWhatsapp: false,
            newDocuments: [{ code: generateCodeFromPattern(docCodePattern), name: '', version: '1.0', renewalDate: '', file: null }] // Start with one row for new, auto-filled code
        });
        setCreateModal({ isOpen: true, parentId, editingId: null });
    };

    const openEditModal = (e: React.MouseEvent, parentId: string, proc: Procedure) => {
        e.stopPropagation();
        setProcForm({
            title: proc.title,
            description: proc.description,
            reviewer: proc.reviewer,
            responsible: proc.responsible,
            notifyEmail: proc.notifyEmail,
            notifyWhatsapp: proc.notifyWhatsapp,
            newDocuments: [] 
        });
        setCreateModal({ isOpen: true, parentId, editingId: proc.id });
    };

    const handleAddDocRow = () => {
        setProcForm(prev => ({
            ...prev,
            newDocuments: [...prev.newDocuments, { code: generateCodeFromPattern(docCodePattern), name: '', version: '1.0', renewalDate: '', file: null }]
        }));
    };

    const handleRemoveDocRow = (index: number) => {
        setProcForm(prev => ({
            ...prev,
            newDocuments: prev.newDocuments.filter((_, i) => i !== index)
        }));
    };

    const handleDocRowChange = (index: number, field: keyof NewDocInput, value: any) => {
        const updatedDocs = [...procForm.newDocuments];
        updatedDocs[index] = { ...updatedDocs[index], [field]: value };
        setProcForm(prev => ({ ...prev, newDocuments: updatedDocs }));
    };

    const handleDocFileChange = (index: number, files: FileList | null) => {
        if (files && files[0]) {
            handleDocRowChange(index, 'file', files[0]);
        }
    };

    const handleSaveProcedure = (e: React.FormEvent) => {
        e.preventDefault();

        // VALIDATION CHECK
        for (const doc of procForm.newDocuments) {
            if (!validateCode(doc.code, docCodePattern)) {
                alert(`El código "${doc.code}" no coincide con la estructura requerida: ${docCodePattern}`);
                return;
            }
        }

        const newPlants = JSON.parse(JSON.stringify(plants));

        if (createModal.editingId) {
            // EDIT EXISTING
            const updateInTree = (nodes: any[]) => {
                for (let node of nodes) {
                    if (node.id === createModal.parentId && node.procedures) {
                        const idx = node.procedures.findIndex((p: Procedure) => p.id === createModal.editingId);
                        if (idx !== -1) {
                            node.procedures[idx].title = procForm.title;
                            node.procedures[idx].description = procForm.description;
                            node.procedures[idx].reviewer = procForm.reviewer;
                            node.procedures[idx].responsible = procForm.responsible;
                            node.procedures[idx].notifyEmail = procForm.notifyEmail;
                            node.procedures[idx].notifyWhatsapp = procForm.notifyWhatsapp;
                            
                            if (procForm.newDocuments.length > 0) {
                                const newDocs = procForm.newDocuments.map((doc, i) => ({
                                    id: `doc-item-${Date.now()}-${i}`,
                                    code: doc.code,
                                    name: doc.name,
                                    versions: [{
                                        id: `ver-${Date.now()}-${i}`,
                                        version: doc.version,
                                        file: doc.file ? doc.file.name : 'archivo_pendiente.pdf',
                                        uploadDate: new Date().toLocaleDateString(),
                                        renewalDate: doc.renewalDate,
                                        status: 'in_review', // Default new to In Review
                                        updatedBy: procForm.responsible
                                    }]
                                }));
                                node.procedures[idx].documents.push(...newDocs);
                            }
                            return true;
                        }
                    }
                    if (node.processes && updateInTree(node.processes)) return true;
                    if (node.subprocesses && updateInTree(node.subprocesses)) return true;
                }
                return false;
            };
            updateInTree(newPlants);
        } else {
            // CREATE NEW
            const newProcedure: Procedure = {
                id: `proc-${Date.now()}`,
                title: procForm.title,
                description: procForm.description,
                reviewer: procForm.reviewer,
                responsible: procForm.responsible,
                notifyEmail: procForm.notifyEmail,
                notifyWhatsapp: procForm.notifyWhatsapp,
                status: 'active',
                documents: procForm.newDocuments.map((doc, idx) => ({
                    id: `doc-item-${Date.now()}-${idx}`,
                    code: doc.code,
                    name: doc.name,
                    versions: [{
                        id: `ver-${Date.now()}-${idx}`,
                        version: doc.version,
                        file: doc.file ? doc.file.name : 'archivo_pendiente.pdf',
                        uploadDate: new Date().toLocaleDateString(),
                        renewalDate: doc.renewalDate,
                        status: 'in_review', // Default new to In Review
                        updatedBy: procForm.responsible
                    }]
                }))
            };

            const findAndAdd = (nodes: any[]) => {
                for (let node of nodes) {
                    if (node.id === createModal.parentId) {
                        if (!node.procedures) node.procedures = [];
                        node.procedures.push(newProcedure);
                        return true;
                    }
                    if (node.processes && findAndAdd(node.processes)) return true;
                    if (node.subprocesses && findAndAdd(node.subprocesses)) return true;
                }
                return false;
            };
            findAndAdd(newPlants);
        }
        
        setPlants(newPlants);
        setCreateModal({ isOpen: false, parentId: null, editingId: null });
    };

    // --- DELETE & ARCHIVE LOGIC (WITH 2 STEP CONFIRMATION) ---

    const initiateDelete = (parentId: string, procId: string, procTitle: string) => {
        setConfirmModal({
            isOpen: true,
            step: 1,
            type: 'delete',
            parentId,
            procId,
            procTitle
        });
    };

    const initiateArchive = (parentId: string, procId: string, procTitle: string) => {
         setConfirmModal({
            isOpen: true,
            step: 1,
            type: 'archive',
            parentId,
            procId,
            procTitle
        });
    };

    const handleNextStepConfirmation = () => {
        setConfirmModal(prev => ({ ...prev, step: 2 }));
    };

    const handleFinalExecuteAction = () => {
        const { type, parentId, procId } = confirmModal;
        if (!parentId || !procId) return;

        const newPlants = JSON.parse(JSON.stringify(plants));

        if (type === 'delete') {
             const deleteFromTree = (nodes: any[]) => {
                for (let node of nodes) {
                    if (node.id === parentId && node.procedures) {
                        node.procedures = node.procedures.filter((p: Procedure) => p.id !== procId);
                        return true;
                    }
                    if (node.processes && deleteFromTree(node.processes)) return true;
                    if (node.subprocesses && deleteFromTree(node.subprocesses)) return true;
                }
                return false;
            };
            deleteFromTree(newPlants);
        } else if (type === 'archive') {
            const archiveInTree = (nodes: any[]) => {
                for (let node of nodes) {
                    if (node.id === parentId && node.procedures) {
                        const proc = node.procedures.find((p: Procedure) => p.id === procId);
                        if (proc) {
                            proc.status = 'obsolete';
                            proc.obsoleteDate = new Date().toISOString();
                            return true;
                        }
                    }
                    if (node.processes && archiveInTree(node.processes)) return true;
                    if (node.subprocesses && archiveInTree(node.subprocesses)) return true;
                }
                return false;
            };
            archiveInTree(newPlants);
        }
        
        setPlants(newPlants);
        setConfirmModal({ isOpen: false, step: 1, type: null, parentId: null, procId: null, procTitle: '' });
    };


    // --- DOCUMENT DETAIL & RENEWAL LOGIC ---

    const openDetailModal = (procedureId: string, doc: ProcedureDocumentItem) => {
        setDetailModal({ isOpen: true, procedureId, documentItem: doc });
        setIsRenewing(false);
        setRenewForm({ version: '', renewalDate: '', file: null });
    };

    const handleSaveRenewal = (e: React.FormEvent) => {
        e.preventDefault();
        if (!detailModal.documentItem || !detailModal.procedureId) return;

        const newVersion: DocumentVersion = {
            id: `ver-${Date.now()}`,
            version: renewForm.version,
            file: renewForm.file ? renewForm.file.name : 'nuevo_archivo.pdf',
            uploadDate: new Date().toLocaleDateString(),
            renewalDate: renewForm.renewalDate,
            status: 'in_review', // New versions start in Review
            updatedBy: CURRENT_USER.name
        };

        const newPlants = JSON.parse(JSON.stringify(plants));
        
        const findAndUpdate = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.procedures) {
                    const procIndex = node.procedures.findIndex((p: Procedure) => p.id === detailModal.procedureId);
                    if (procIndex !== -1) {
                         const docIndex = node.procedures[procIndex].documents.findIndex((d: ProcedureDocumentItem) => d.id === detailModal.documentItem!.id);
                         if (docIndex !== -1) {
                             const docRef = node.procedures[procIndex].documents[docIndex];
                             // Mark all non-obsolete as obsolete before adding new one (though technically the new one is 'in_review', usually old stays 'current' until new is 'current'. For simplicity of this prompt, we follow standard add logic)
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
        setDetailModal({ isOpen: false, procedureId: null, documentItem: null });
    };

    const handleApproveReview = () => {
        if (!detailModal.documentItem || !detailModal.procedureId) return;
        const newPlants = JSON.parse(JSON.stringify(plants));

        const findAndApprove = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.procedures) {
                    const procIndex = node.procedures.findIndex((p: Procedure) => p.id === detailModal.procedureId);
                    if (procIndex !== -1) {
                        const docIndex = node.procedures[procIndex].documents.findIndex((d: ProcedureDocumentItem) => d.id === detailModal.documentItem!.id);
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
        setDetailModal({ isOpen: false, procedureId: null, documentItem: null });
    };


    // --- RENDER HELPERS ---

    const StatusBadge: React.FC<{ status: DocVersionStatus }> = ({ status }) => {
        switch (status) {
            case 'current':
                return <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded text-xs font-bold">Vigente</span>;
            case 'in_review':
                return <span className="bg-yellow-100 text-yellow-700 px-1.5 py-0.5 rounded text-xs font-bold">En Revisión</span>;
            case 'expired':
                return <span className="bg-red-100 text-red-700 px-1.5 py-0.5 rounded text-xs font-bold">Caducado</span>;
            case 'obsolete':
                return <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-xs font-bold line-through">Obsoleto</span>;
            default:
                return null;
        }
    };

    const ObsoleteView = () => {
        const obsoleteProcs: Array<{ proc: Procedure, location: string }> = [];
        
        const findObsoletes = (nodes: any[], parentLoc: string) => {
            nodes.forEach(node => {
                if (node.procedures) {
                    node.procedures.forEach((p: Procedure) => {
                        if (p.status === 'obsolete') {
                            obsoleteProcs.push({ proc: p, location: `${parentLoc} > ${node.name}` });
                        }
                    });
                }
                if (node.processes) findObsoletes(node.processes, `${parentLoc} > ${node.name}`);
                if (node.subprocesses) findObsoletes(node.subprocesses, `${parentLoc} > ${node.name}`);
            });
        };

        plants.forEach(plant => findObsoletes([plant], ''));
        obsoleteProcs.sort((a, b) => {
            const dateA = a.proc.obsoleteDate ? new Date(a.proc.obsoleteDate).getTime() : 0;
            const dateB = b.proc.obsoleteDate ? new Date(b.proc.obsoleteDate).getTime() : 0;
            return dateB - dateA;
        });

        return (
            <div className="space-y-4 animate-fade-in">
                {obsoleteProcs.length === 0 && (
                    <div className="text-center p-10 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 border-dashed">
                        <ArchiveBoxIcon className="w-12 h-12 mx-auto text-gray-300 mb-3"/>
                        <p>No hay procedimientos obsoletos registrados.</p>
                    </div>
                )}
                {obsoleteProcs.map(({ proc, location }) => (
                    <div key={proc.id} className="bg-gray-50 border border-yellow-200 rounded-lg p-4 shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-[10px] px-2 py-1 rounded-bl-lg font-bold uppercase">
                            Obsoleto
                        </div>
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="text-lg font-bold text-gray-700 line-through decoration-gray-400">{proc.title}</h4>
                                <p className="text-xs text-gray-500 mt-1">{location.replace(' > ', '')}</p>
                            </div>
                            <div className="text-right text-xs text-gray-500">
                                <p>Fecha Obsolescencia:</p>
                                <p className="font-mono font-semibold">{proc.obsoleteDate ? new Date(proc.obsoleteDate).toLocaleDateString() : 'N/A'}</p>
                            </div>
                        </div>
                         <p className="text-sm text-gray-600 italic">{proc.description}</p>
                    </div>
                ))}
            </div>
        );
    };

    const RecursiveNode: React.FC<{ node: any, type: 'plant' | 'process' | 'subprocess', level: number }> = ({ node, type, level }) => {
        const isExpanded = expanded[node.id];
        const activeProcedures = node.procedures ? node.procedures.filter((p: Procedure) => p.status !== 'obsolete') : [];
        
        const docStats = aggregateDocStats(node);

        const bgColors = {
            plant: 'bg-blue-50 border-l-4 border-blue-600',
            process: 'bg-gray-50 border-l-4 border-gray-400 ml-4',
            subprocess: 'bg-white border-l-4 border-gray-200 ml-8'
        };
        
        return (
            <div className="mb-4">
                <div 
                    className={`p-3 rounded-r-lg shadow-sm border-y border-r border-gray-200 flex items-center justify-between cursor-pointer hover:bg-opacity-80 ${bgColors[type]}`}
                    onClick={() => toggleExpand(node.id)}
                >
                    <div className="flex items-center gap-3 flex-1">
                         <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                         <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-gray-800">{node.name}</h3>
                                <span className="text-[10px] uppercase px-1.5 bg-white/60 border rounded text-gray-500">{type}</span>
                            </div>
                            <p className="text-xs text-gray-500">{node.description}</p>
                         </div>
                    </div>
                    <div className="flex items-center gap-6">
                        {/* STATS INDICATORS */}
                        <div className="flex gap-4 mr-4">
                            <div className="flex flex-col items-center" title="Vigentes (Verde)">
                                <div className="w-2 h-2 rounded-full bg-green-500 mb-0.5"></div>
                                <span className="text-xs font-bold text-gray-700">{docStats.current}</span>
                            </div>
                            <div className="flex flex-col items-center" title="En Revisión (Amarillo)">
                                <div className="w-2 h-2 rounded-full bg-yellow-400 mb-0.5"></div>
                                <span className="text-xs font-bold text-gray-700">{docStats.inReview}</span>
                            </div>
                            <div className="flex flex-col items-center" title="Caducados (Rojo)">
                                <div className="w-2 h-2 rounded-full bg-red-500 mb-0.5"></div>
                                <span className="text-xs font-bold text-gray-700">{docStats.expired}</span>
                            </div>
                        </div>

                        <button 
                            onClick={(e) => openCreateModal(e, node.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1.5 rounded shadow-sm flex items-center gap-1"
                        >
                            <PlusCircleIcon className="w-3 h-3" /> Procedimiento
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-2 space-y-3">
                        {/* List Procedures */}
                        {activeProcedures.map((proc: Procedure) => (
                            <div key={proc.id} className={`bg-white border border-gray-200 rounded-lg p-4 shadow-sm group ${level === 0 ? '' : level === 1 ? 'ml-4' : 'ml-8'}`}>
                                <div className="flex justify-between items-start border-b border-gray-100 pb-2 mb-3">
                                    <div>
                                        <div className='flex items-center gap-2'>
                                            <h4 className="text-lg font-bold text-gray-900">{proc.title}</h4>
                                            <button onClick={(e) => openEditModal(e, node.id, proc)} className='text-gray-400 hover:text-blue-600 transition-colors'><PencilIcon className='w-4 h-4'/></button>
                                        </div>
                                        <p className="text-sm text-gray-500">{proc.description}</p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="text-xs text-right space-y-1">
                                            <p><span className="font-semibold text-gray-600">Resp:</span> {proc.responsible}</p>
                                            <p><span className="font-semibold text-gray-600">Rev:</span> {proc.reviewer}</p>
                                            <div className="flex justify-end gap-2 mt-1 text-gray-400">
                                                {proc.notifyEmail && <span title="Email Notif">✉️</span>}
                                                {proc.notifyWhatsapp && <span title="Whatsapp Notif">📱</span>}
                                            </div>
                                        </div>
                                        <div className='flex items-center gap-2'>
                                            <button 
                                                onClick={() => initiateArchive(node.id, proc.id, proc.title)} 
                                                className='text-xs flex items-center gap-1 text-gray-500 hover:text-yellow-600 bg-gray-50 hover:bg-yellow-50 px-2 py-1 rounded border border-gray-200'
                                                title="Marcar como Obsoleto"
                                            >
                                                <ArchiveBoxIcon className='w-3 h-3'/> Obsoleto
                                            </button>
                                            <button 
                                                onClick={() => initiateDelete(node.id, proc.id, proc.title)} 
                                                className='text-xs flex items-center gap-1 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 px-2 py-1 rounded border border-gray-200'
                                                title="Eliminar"
                                            >
                                                <TrashIcon className='w-3 h-3'/>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Documents Table inside Procedure */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm text-left text-gray-600">
                                        <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                            <tr>
                                                <th className="px-3 py-2 w-40">Código <span className="text-gray-400 font-normal">({docCodePattern})</span></th>
                                                <th className="px-3 py-2">Documento</th>
                                                <th className="px-3 py-2">Versión</th>
                                                <th className="px-3 py-2">Estatus</th>
                                                <th className="px-3 py-2">Renovación</th>
                                                <th className="px-3 py-2 text-right">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {proc.documents.map((doc) => {
                                                const latest = doc.versions.find(v => v.status !== 'obsolete');
                                                const effectiveStatus = latest ? getEffectiveStatus(latest) : 'obsolete';
                                                return (
                                                    <tr key={doc.id} className="hover:bg-gray-50">
                                                        <td className="px-3 py-2 font-mono text-xs">{doc.code}</td>
                                                        <td className="px-3 py-2 font-medium text-gray-800">{doc.name}</td>
                                                        <td className="px-3 py-2">
                                                            {latest ? <span className="text-xs font-bold">v{latest.version}</span> : <span className="text-gray-400 text-xs">-</span>}
                                                        </td>
                                                        <td className="px-3 py-2">
                                                            <StatusBadge status={effectiveStatus} />
                                                        </td>
                                                        <td className="px-3 py-2 text-xs">{latest ? latest.renewalDate : '-'}</td>
                                                        <td className="px-3 py-2 text-right">
                                                            <button 
                                                                onClick={() => openDetailModal(proc.id, doc)}
                                                                className="text-blue-600 hover:text-blue-800 text-xs font-semibold underline"
                                                            >
                                                                Gestionar
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                            {proc.documents.length === 0 && (
                                                <tr><td colSpan={6} className="text-center py-2 text-gray-400 italic text-xs">Sin documentos asociados</td></tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ))}

                        {/* Recursive Children */}
                        {node.processes && node.processes.map((p: Process) => (
                            <RecursiveNode key={p.id} node={p} type="process" level={level + 1} />
                        ))}
                        {node.subprocesses && node.subprocesses.map((s: Subprocess) => (
                             <RecursiveNode key={s.id} node={s} type="subprocess" level={level + 1} />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    // --- Detail Modal Content ---
    const renderDetailModalContent = () => {
        if (!detailModal.documentItem || !detailModal.procedureId) return null;

        // Find parent procedure to check reviewer
        let currentProcedure: Procedure | undefined;
        const findProc = (nodes: any[]) => {
            for (let node of nodes) {
                if (node.procedures) {
                    const f = node.procedures.find((p: Procedure) => p.id === detailModal.procedureId);
                    if (f) { currentProcedure = f; return true; }
                }
                if (node.processes) if (findProc(node.processes)) return true;
                if (node.subprocesses) if (findProc(node.subprocesses)) return true;
            }
            return false;
        };
        findProc(plants);

        const activeVersion = detailModal.documentItem.versions.find(v => v.status !== 'obsolete');
        const effectiveStatus = activeVersion ? getEffectiveStatus(activeVersion) : null;
        const isReviewer = currentProcedure?.reviewer === CURRENT_USER.name;

        return (
            <div className="p-6 overflow-y-auto flex-1">
                {/* ACTIVE / REVIEW VERSION */}
                <div className="mb-6">
                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2"><CheckCircleIcon className="w-4 h-4 text-blue-600"/> Versión Actual</h4>
                    {activeVersion ? (
                        <div className={`border rounded-lg p-4 flex items-center justify-between ${effectiveStatus === 'in_review' ? 'bg-yellow-50 border-yellow-200' : effectiveStatus === 'expired' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-lg font-bold text-gray-800">v{activeVersion.version}</p>
                                    <StatusBadge status={effectiveStatus!} />
                                </div>
                                <p className="text-xs text-gray-700 mt-1">Subido: {activeVersion.uploadDate} por {activeVersion.updatedBy}</p>
                                <p className="text-xs text-gray-700">Renovación: {activeVersion.renewalDate}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button 
                                    onClick={() => setPreviewDoc({
                                        name: detailModal.documentItem!.name,
                                        code: detailModal.documentItem!.code,
                                        type: currentProcedure?.title || 'Procedimiento',
                                        version: activeVersion.version,
                                        status: effectiveStatus!,
                                        renewalDate: activeVersion.renewalDate,
                                        responsible: currentProcedure?.responsible || 'N/A',
                                        file: activeVersion.file
                                    })}
                                    className="flex items-center gap-2 bg-white border border-gray-300 text-gray-700 px-3 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium w-full text-left"
                                >
                                    <PaperclipIcon className="w-4 h-4 text-blue-500"/> {activeVersion.file}
                                </button>
                                
                                {/* REVIEW ACTION BUTTON */}
                                {effectiveStatus === 'in_review' && isReviewer && (
                                    <button 
                                        onClick={handleApproveReview}
                                        className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 transition-colors text-sm font-bold shadow-sm justify-center"
                                    >
                                        <CheckCircleIcon className="w-4 h-4"/> Aprobar Revisión
                                    </button>
                                )}
                                {effectiveStatus === 'in_review' && !isReviewer && (
                                    <p className="text-[10px] text-gray-500 italic text-center bg-white/50 p-1 rounded">
                                        Esperando revisión de {currentProcedure?.reviewer}
                                    </p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <p className="text-red-500 text-sm italic">No hay versiones activa.</p>
                    )}
                </div>

                {/* RENEWAL FORM */}
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

                {/* HISTORY */}
                <div>
                    <h4 className="text-sm font-bold text-gray-500 mb-3 flex items-center gap-2"><ClockIcon className="w-4 h-4"/> Historial (Obsoletos)</h4>
                    <div className="space-y-2">
                        {detailModal.documentItem.versions.filter(v => v.status === 'obsolete').map(ver => (
                            <div key={ver.id} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded hover:bg-gray-100">
                                <div>
                                    <p className="text-sm font-bold text-gray-600">v{ver.version} <span className="text-[10px] font-normal text-gray-400 ml-1">(Obsoleto)</span></p>
                                    <p className="text-[10px] text-gray-400">Subido: {ver.uploadDate}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                        <span className="text-xs text-gray-500">{ver.file}</span>
                                        <EyeIcon 
                                            className="w-4 h-4 text-gray-400 cursor-pointer hover:text-gray-600"
                                            onClick={() => setPreviewDoc({
                                                name: detailModal.documentItem!.name,
                                                code: detailModal.documentItem!.code,
                                                type: currentProcedure?.title || 'Procedimiento',
                                                version: ver.version,
                                                status: 'obsolete',
                                                renewalDate: ver.renewalDate,
                                                responsible: ver.updatedBy,
                                                file: ver.file
                                            })}
                                        />
                                </div>
                            </div>
                        ))}
                        {detailModal.documentItem.versions.filter(v => v.status === 'obsolete').length === 0 && (
                            <p className="text-xs text-gray-400 italic ml-6">No hay versiones anteriores.</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
             <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <BookOpenIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Documentos & Procedimientos</h2>
                            <p className="text-sm text-gray-500">Gestión de documentos vigentes y control de versiones organizados por Planta y Proceso.</p>
                             <p className="text-xs text-gray-400 mt-1">Usuario actual: <span className="font-bold">{CURRENT_USER.name}</span> ({CURRENT_USER.role})</p>
                        </div>
                    </div>
                    <div className='flex bg-gray-100 p-1 rounded-lg'>
                        <button 
                            onClick={() => setShowObsolete(false)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${!showObsolete ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            Ver Activos
                        </button>
                        <button 
                            onClick={() => setShowObsolete(true)}
                            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors flex items-center gap-2 ${showObsolete ? 'bg-white text-yellow-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            <ArchiveBoxIcon className='w-4 h-4'/> Ver Obsoletos
                        </button>
                    </div>
                </div>

                {!showObsolete ? (
                    <div>
                        {plants.map(plant => (
                            <RecursiveNode key={plant.id} node={plant} type="plant" level={0} />
                        ))}
                    </div>
                ) : (
                    <ObsoleteView />
                )}
            </div>

            {/* CREATE / EDIT PROCEDURE MODAL */}
            {createModal.isOpen && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl m-4 max-h-[90vh] flex flex-col relative">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <h3 className="text-lg font-bold text-gray-800">{createModal.editingId ? 'Editar Procedimiento' : 'Nuevo Procedimiento'}</h3>
                            <button onClick={() => setCreateModal({ isOpen: false, parentId: null, editingId: null })} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1">
                            <form id="createProcForm" onSubmit={handleSaveProcedure} className="space-y-6">
                                {/* Procedure Metadata */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700">Título del Procedimiento</label>
                                        <input required type="text" value={procForm.title} onChange={e => setProcForm({...procForm, title: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700">Descripción Corta</label>
                                        <textarea required value={procForm.description} onChange={e => setProcForm({...procForm, description: e.target.value})} rows={2} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Revisor</label>
                                        <select required value={procForm.reviewer} onChange={e => setProcForm({...procForm, reviewer: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Seleccionar...</option>
                                            {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700">Responsable</label>
                                        <select required value={procForm.responsible} onChange={e => setProcForm({...procForm, responsible: e.target.value})} className="w-full mt-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                                            <option value="">Seleccionar...</option>
                                            {MOCK_USERS.map(u => <option key={u.id} value={u.name}>{u.name} ({u.role})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2 flex gap-6 mt-2">
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={procForm.notifyEmail} onChange={e => setProcForm({...procForm, notifyEmail: e.target.checked})} className="rounded text-blue-600" />
                                            Enviar Notificación por Correo
                                        </label>
                                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                                            <input type="checkbox" checked={procForm.notifyWhatsapp} onChange={e => setProcForm({...procForm, notifyWhatsapp: e.target.checked})} className="rounded text-green-600" />
                                            Enviar Notificación por WhatsApp
                                        </label>
                                    </div>
                                </div>

                                {/* Documents List (Only for new additions or creation) */}
                                <div className="border-t border-gray-200 pt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-bold text-gray-800">
                                            {createModal.editingId ? 'Agregar Nuevos Documentos (Opcional)' : 'Documentos Asociados'}
                                        </h4>
                                        <button type="button" onClick={handleAddDocRow} className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 px-2 py-1 rounded font-semibold">+ Agregar Documento</button>
                                    </div>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                                                <tr>
                                                    <th className="px-2 py-2 w-40">Código <span className="text-gray-400 font-normal">({docCodePattern})</span></th>
                                                    <th className="px-2 py-2">Nombre Documento</th>
                                                    <th className="px-2 py-2 w-20">Versión</th>
                                                    <th className="px-2 py-2 w-32">F. Renovación</th>
                                                    <th className="px-2 py-2">Archivo</th>
                                                    <th className="px-2 py-2 w-10"></th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {procForm.newDocuments.map((doc, idx) => (
                                                    <tr key={idx} className="border-b border-gray-100">
                                                        <td className="p-1">
                                                            <input required type="text" value={doc.code} onChange={e => handleDocRowChange(idx, 'code', e.target.value)} placeholder={docCodePattern} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"/>
                                                        </td>
                                                        <td className="p-1"><input required type="text" value={doc.name} onChange={e => handleDocRowChange(idx, 'name', e.target.value)} placeholder="Nombre del documento" className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"/></td>
                                                        <td className="p-1"><input required type="text" value={doc.version} onChange={e => handleDocRowChange(idx, 'version', e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs text-center"/></td>
                                                        <td className="p-1"><input required type="date" value={doc.renewalDate} onChange={e => handleDocRowChange(idx, 'renewalDate', e.target.value)} className="w-full px-2 py-1 bg-gray-50 border border-gray-300 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"/></td>
                                                        <td className="p-1">
                                                            <input required type="file" onChange={e => handleDocFileChange(idx, e.target.files)} className="w-full text-xs text-gray-500"/>
                                                        </td>
                                                        <td className="p-1 text-center">
                                                            <button type="button" onClick={() => handleRemoveDocRow(idx)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-4 h-4"/></button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                        {procForm.newDocuments.length === 0 && !createModal.editingId && <p className="text-center text-xs text-gray-400 mt-2">Agrega al menos un documento.</p>}
                                    </div>
                                </div>
                            </form>
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end gap-3">
                            <button onClick={() => setCreateModal({ isOpen: false, parentId: null, editingId: null })} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-sm">Cancelar</button>
                            <button form="createProcForm" type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm">Guardar Todo</button>
                        </div>
                    </div>
                </div>
            )}

            {/* DOCUMENT DETAIL & HISTORY MODAL */}
            {detailModal.isOpen && detailModal.documentItem && (
                <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl m-4 flex flex-col max-h-[90vh] relative">
                        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-lg">
                            <div>
                                <h3 className="text-lg font-bold text-gray-900">{detailModal.documentItem.name}</h3>
                                <p className="text-sm text-gray-500 font-mono">{detailModal.documentItem.code}</p>
                            </div>
                            <button onClick={() => setDetailModal({ isOpen: false, procedureId: null, documentItem: null })} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon /></button>
                        </div>
                        
                        {renderDetailModalContent()}

                    </div>
                </div>
            )}
            
            {/* DOUBLE CONFIRMATION MODAL */}
            <ConfirmationModal 
                state={confirmModal}
                onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                onNextStep={handleNextStepConfirmation}
                onConfirm={handleFinalExecuteAction}
            />

            {/* PREVIEW MODAL */}
            <DocumentPreviewModal 
                doc={previewDoc} 
                onClose={() => setPreviewDoc(null)} 
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

export default TaProcedures;
