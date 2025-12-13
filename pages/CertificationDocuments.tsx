
import React, { useState, useMemo } from 'react';
import { Plant, Procedure, DocVersionStatus } from '../types';
import { SearchIcon, FilterIcon, DocumentTextIcon, EyeIcon, ArrowDownIcon } from '../components/icons/Icons';

interface CertificationDocumentsProps {
    plants: Plant[];
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
}

const CertificationDocuments: React.FC<CertificationDocumentsProps> = ({ plants }) => {
    const [searchText, setSearchText] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [typeFilter, setTypeFilter] = useState<string>('');

    // Flatten data from plants structure
    const documents = useMemo(() => {
        const docs: DerivedDocument[] = [];
        
        const traverse = (nodes: any[]) => {
            nodes.forEach(node => {
                if (node.procedures) {
                    node.procedures.forEach((proc: Procedure) => {
                        // Only include active procedures
                        if (proc.status === 'active') {
                            proc.documents.forEach(doc => {
                                // Find the most relevant version (Current -> In Review -> Expired -> Obsolete)
                                // For certification view, we generally show the active or latest known state
                                const activeVersion = doc.versions.find(v => v.status !== 'obsolete') || doc.versions[0];
                                
                                if (activeVersion) {
                                    docs.push({
                                        id: doc.id,
                                        code: doc.code,
                                        name: doc.name,
                                        type: proc.title, // Using Procedure Title as 'Type' or Context
                                        version: activeVersion.version,
                                        status: activeVersion.status,
                                        nextReview: activeVersion.renewalDate,
                                        owner: proc.responsible,
                                        file: activeVersion.file
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
        // Simple type filter based on Procedure name containing text
        const matchesType = typeFilter ? doc.type.toLowerCase().includes(typeFilter.toLowerCase()) : true;
        return matchesSearch && matchesStatus && matchesType;
    });

    // Unique types for filter
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
                    {/* New Document Button Removed */}
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
                                            <button className="text-blue-600 hover:text-blue-800 font-semibold p-1 hover:bg-blue-50 rounded" title={`Ver Detalles de ${doc.file}`}>
                                                <EyeIcon className="w-5 h-5"/>
                                            </button>
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
                    {/* Pagination Placeholder */}
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Anterior</button>
                        <button className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50" disabled>Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CertificationDocuments;
