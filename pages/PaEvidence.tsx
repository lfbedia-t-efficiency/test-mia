import React from 'react';
import { SearchIcon, FilterIcon, ArrowUpOnSquareIcon, DocumentTextIcon, CameraIcon } from '../components/icons/Icons';

type EvidenceType = 'image' | 'document';

interface Evidence {
    id: string;
    title: string;
    type: EvidenceType;
    auditor: string;
    timestamp: string;
    machine: string;
    previewUrl?: string; // for images
}

const mockEvidence: Evidence[] = [
    { id: 'ev1', title: 'Foto de sensor de presión limpio', type: 'image', auditor: 'Ana Lopez', timestamp: 'hace 1 hora', machine: 'CNC-005', previewUrl: 'https://picsum.photos/seed/ev1/400/300' },
    { id: 'ev2', title: 'Lectura de manómetro firmada', type: 'document', auditor: 'Juan Pérez', timestamp: 'hace 3 horas', machine: 'Prensa 01' },
    { id: 'ev3', title: 'Checklist de seguridad LOTO', type: 'document', auditor: 'Ana Lopez', timestamp: 'ayer', machine: 'CNC-005' },
    { id: 'ev4', title: 'Estado de guarda de seguridad', type: 'image', auditor: 'Carlos Ruiz', timestamp: 'ayer', machine: 'Prensa 02', previewUrl: 'https://picsum.photos/seed/ev4/400/300' },
    { id: 'ev5', title: 'Registro de calibración', type: 'document', auditor: 'Juan Pérez', timestamp: 'hace 2 días', machine: 'Molino M-05' },
    { id: 'ev6', title: 'Foto de desgaste de herramienta', type: 'image', auditor: 'Carlos Ruiz', timestamp: 'hace 2 días', machine: 'CNC-003', previewUrl: 'https://picsum.photos/seed/ev6/400/300' },
];

const PaEvidence: React.FC = () => {
    const EvidenceCard: React.FC<{ item: Evidence }> = ({ item }) => {
        return (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden group transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer border border-gray-200">
                <div className="h-40 bg-gray-100 flex items-center justify-center">
                    {item.type === 'image' && item.previewUrl ? (
                        <img src={item.previewUrl} alt={item.title} className="w-full h-full object-cover" />
                    ) : (
                        <DocumentTextIcon className="w-16 h-16 text-gray-300" />
                    )}
                </div>
                <div className="p-4">
                    <p className="text-sm font-semibold text-gray-800 truncate group-hover:text-blue-600">{item.title}</p>
                    <div className="text-xs text-gray-500 mt-2 space-y-1">
                        <p><strong>Máquina:</strong> {item.machine}</p>
                        <p><strong>Auditor:</strong> {item.auditor}</p>
                        <p><strong>Fecha:</strong> {item.timestamp}</p>
                    </div>
                </div>
                 <div className="border-t border-gray-200 p-2 text-center text-xs text-blue-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                    Ver Detalles
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <header className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center justify-between gap-4 border border-gray-200">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Evidencia y Consulta de Auditorías</h2>
                    <p className="text-sm text-gray-500">Busque y gestione las evidencias recolectadas.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Buscar evidencia..." className="w-full bg-gray-100 rounded-md pl-10 pr-4 py-2 text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <SearchIcon />
                        </div>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md">
                       <FilterIcon /> <span>Filtros</span>
                   </button>
                    <button className="flex items-center gap-2 text-sm text-white hover:bg-blue-700 bg-blue-600 px-4 py-2 rounded-md font-semibold">
                       <ArrowUpOnSquareIcon /> <span>Cargar Evidencia</span>
                   </button>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockEvidence.map(item => <EvidenceCard key={item.id} item={item} />)}
            </div>
        </div>
    );
};

export default PaEvidence;