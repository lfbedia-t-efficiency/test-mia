
import React, { useState } from 'react';
import { SearchIcon, FilterIcon, CalendarIcon, XIcon, AIAssistantIcon, TechSupportIcon, DocsIcon, StethoscopeIcon, TicketIcon } from '../components/icons/Icons';
import { HistoryEvent, EventType, Criticality } from '../types';

interface RecentHistoryProps {
    extraEvents?: HistoryEvent[];
}

const mockEvents: HistoryEvent[] = [
    { id: 'evt1', type: 'Consulta IA', title: 'Procedimiento de calibración del sensor de presión...', user: 'Juan Pérez', timestamp: 'hace 5 minutos', criticality: 'info', details: { question: '¿Cómo calibro el sensor P-101 en la línea 3?', answerSummary: 'Se requieren 3 pasos, comenzando con el aislamiento de la válvula...', sources: 2 }, hierarchy: 'Planta A / Ensamblaje / Línea 3 / Calibración' },
    { id: 'evt2', type: 'Orden de Trabajo', title: 'Falla en motor de la Prensa 01 - OT #589 Creada', user: 'Sistema', timestamp: 'hace 25 minutos', criticality: 'high', details: { status: 'Abierta', priority: 'Urgente', assignedTo: 'Equipo Manto.' }, hierarchy: 'Planta A / Prensado / Prensa 01' },
    { id: 'evt3', type: 'Documento', title: 'Manual de operación PH-02 actualizado a v2.1', user: 'Ana Lopez', timestamp: 'hace 2 horas', criticality: 'low', details: { documentId: 'MAN-PREN-002', version: '2.1', changeSummary: 'Se añadió sección de seguridad para nuevos guardas.' }, hierarchy: 'Planta A / Prensado / Prensa 02' },
    { id: 'evt4', type: 'Diagnóstico', title: 'Vibración excesiva detectada en Molino M-05', user: 'Pedro Gómez', timestamp: 'hace 3 horas', criticality: 'medium', details: { symptoms: ['Vibración', 'Ruido anormal'], hypothesis: 'Desgaste de rodamientos', otCreated: 'OT #590' }, hierarchy: 'Planta B / Molienda / Molino M-05' },
    { id: 'evt5', type: 'Reclamo', title: 'Reclamo de cliente #C-2024-45 por defecto en Lote L-7891', user: 'Calidad', timestamp: 'ayer', criticality: 'high', details: { client: 'ACME Corp', product: 'SKU-12345', defect: 'Fisuras superficiales' }, hierarchy: 'Planta A / Empaque / Línea 1' },
    { id: 'evt6', type: 'Orden de Trabajo', title: 'OT #588 - Mantenimiento preventivo completado', user: 'Carlos Ruiz', timestamp: 'ayer', criticality: 'info', details: { status: 'Cerrada', priority: 'Programada', duration: '2.5 horas' }, hierarchy: 'Planta B / CNC / CNC-003' },
];

const getEventConfig = (event: HistoryEvent) => {
    switch (event.type) {
        case 'Consulta IA': return { icon: <AIAssistantIcon />, color: 'blue' };
        case 'Orden de Trabajo': return { icon: <TechSupportIcon />, color: event.criticality === 'high' ? 'red' : 'yellow' };
        case 'Documento': return { icon: <DocsIcon />, color: 'purple' };
        case 'Diagnóstico': return { icon: <StethoscopeIcon />, color: 'indigo' };
        case 'Reclamo': return { icon: <TicketIcon />, color: 'rose' };
        default: return { icon: <div />, color: 'gray' };
    }
};

const RecentHistory: React.FC<RecentHistoryProps> = ({ extraEvents = [] }) => {
    const [selectedEvent, setSelectedEvent] = useState<HistoryEvent | null>(null);

    // Combine mock data with real app history
    const allEvents = [...extraEvents, ...mockEvents];

    const EventCard: React.FC<{ event: HistoryEvent }> = ({ event }) => {
        const { icon, color } = getEventConfig(event);
        const colorClasses = {
            border: `border-${color}-500`,
            text: `text-${color}-600`,
            bg: `bg-${color}-100`
        };

        return (
            <div onClick={() => setSelectedEvent(event)} className={`p-4 flex gap-4 items-start bg-white rounded-lg border-l-4 ${colorClasses.border} hover:bg-gray-50 cursor-pointer transition-colors shadow-sm`}>
                <div className={`mt-1 p-2 rounded-full ${colorClasses.bg} ${colorClasses.text}`}>
                    {icon}
                </div>
                <div className="flex-1">
                    <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-gray-800">{event.title}</p>
                        <p className="text-xs text-gray-500">{event.timestamp}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <p className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${colorClasses.bg} ${colorClasses.text}`}>{event.type}</p>
                        <p className="text-xs text-gray-400">{event.user}</p>
                    </div>
                </div>
            </div>
        );
    };
    
    const DetailsPanel: React.FC<{ event: HistoryEvent, onClose: () => void }> = ({ event, onClose }) => {
         const { icon, color } = getEventConfig(event);
         const colorClasses = { text: `text-${color}-600`};
        return(
            <div className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-black/20 backdrop-blur-sm z-30 animate-slide-in">
                 <div className="bg-white h-full shadow-2xl flex flex-col relative">
                    <header className="p-4 flex justify-between items-center border-b border-gray-200">
                        <div className="flex items-center gap-3">
                           <span className={colorClasses.text}>{icon}</span>
                           <h3 className="text-lg font-bold text-gray-900">{event.type}</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon/></button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto">
                        <h4 className="font-semibold text-gray-800 mb-1">{event.title}</h4>
                        <p className="text-sm text-gray-500 mb-4">{event.hierarchy}</p>
                        <div className="space-y-3 text-sm">
                            {Object.entries(event.details).map(([key, value]) =>(
                               <div key={key}>
                                   <p className="text-xs text-gray-400 uppercase tracking-wider">{key.replace(/([A-Z])/g, ' $1')}</p>
                                   <p className="text-gray-700 bg-gray-50 p-2 rounded border border-gray-100 whitespace-pre-wrap">
                                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : value.toString()}
                                   </p>
                               </div>
                            ))}
                        </div>
                    </div>
                    <footer className="p-4 border-t border-gray-200 bg-gray-50">
                        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors">
                            Ver Detalles Completos
                        </button>
                    </footer>
                 </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-4 rounded-lg shadow-sm flex flex-wrap items-center gap-4 border border-gray-200">
                <div className="relative flex-grow">
                    <input type="text" placeholder="Buscar en historial..." className="w-full bg-gray-100 rounded-md pl-10 pr-4 py-2 text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                   <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md">
                       <CalendarIcon /> <span>Últimas 24 horas</span>
                   </button>
                   <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md">
                       <FilterIcon /> <span>Tipo de Evento</span>
                   </button>
                </div>
            </div>

            <div className="space-y-4">
                {allEvents.map(event => <EventCard key={event.id} event={event} />)}
            </div>

            {selectedEvent && <DetailsPanel event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
            
            <style>{`
                @keyframes slide-in {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default RecentHistory;
