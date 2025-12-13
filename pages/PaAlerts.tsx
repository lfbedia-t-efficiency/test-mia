
import React, { useState } from 'react';
import { SearchIcon, FilterIcon, XIcon, PlusCircleIcon, DocumentTextIcon, CodeBracketIcon, ChevronDoubleUpIcon, SpeakerXMarkIcon, RssIcon, BeakerIcon } from '../components/icons/Icons';

type RuleStatus = 'active' | 'inactive';
type RuleSeverity = 'critical' | 'high' | 'medium' | 'low';

interface AlertRule {
    id: string;
    name: string;
    status: RuleStatus;
    severity: RuleSeverity;
    expression: string;
    lastTriggered: string;
    triggers24h: number;
    context: string;
}

const mockRules: AlertRule[] = [
    { id: 'R001', name: 'Presión de Inyección Excesiva', status: 'active', severity: 'critical', expression: 'avg(P_INJECT, 5m) > 1500', lastTriggered: 'hace 15 min', triggers24h: 3, context: 'Planta A / Inyección / INY-05' },
    { id: 'R002', name: 'Temperatura de Horno Fuera de Rango', status: 'active', severity: 'high', expression: 'TEMP_HORN > 220 OR TEMP_HORN < 210', lastTriggered: 'hace 2 horas', triggers24h: 8, context: 'Planta A / Curado / HORNO-02' },
    { id: 'R003', name: 'Vibración de Molino Anormal', status: 'inactive', severity: 'medium', expression: 'fft(VIB_MOL) > 0.8', lastTriggered: 'ayer', triggers24h: 0, context: 'Planta B / Molienda / MOL-01' },
    { id: 'R004', name: 'Nivel de Refrigerante Bajo', status: 'active', severity: 'low', expression: 'LVL_COOL < 10%', lastTriggered: 'hace 8 horas', triggers24h: 1, context: 'Planta A / CNC / CNC-003' },
    { id: 'R005', name: 'Desviación Cpk de Eje Principal', status: 'active', severity: 'high', expression: 'cpk(DIAM_EJE) < 1.33', lastTriggered: 'hace 45 min', triggers24h: 5, context: 'Planta B / Torneado / TORNO-12' },
];

const tabs = [
    { name: 'Parámetros', icon: <DocumentTextIcon /> },
    { name: 'Reglas', icon: <CodeBracketIcon /> },
    { name: 'Escalaciones', icon: <ChevronDoubleUpIcon /> },
    { name: 'Suscripciones', icon: <RssIcon /> },
    { name: 'Silencios', icon: <SpeakerXMarkIcon /> },
    { name: 'Simulador', icon: <BeakerIcon /> },
];

const PaAlerts: React.FC = () => {
    const [activeTab, setActiveTab] = useState('Reglas');
    const [selectedRule, setSelectedRule] = useState<AlertRule | null>(null);

    const getSeverityStyles = (severity: RuleSeverity) => {
        switch (severity) {
            case 'critical': return 'bg-red-100 text-red-700';
            case 'high': return 'bg-orange-100 text-orange-700';
            case 'medium': return 'bg-yellow-100 text-yellow-700';
            case 'low': return 'bg-sky-100 text-sky-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const DetailsPanel: React.FC<{ rule: AlertRule, onClose: () => void }> = ({ rule, onClose }) => {
        return(
            <div className="fixed top-0 right-0 h-full w-full md:w-1/3 bg-black/20 backdrop-blur-sm z-30 animate-slide-in">
                 <div className="bg-white h-full shadow-2xl flex flex-col relative">
                    <header className="p-4 flex justify-between items-center border-b border-gray-200">
                        <div className='flex items-center gap-3'>
                            <CodeBracketIcon className="w-6 h-6 text-gray-500" />
                            <h3 className="text-lg font-bold text-gray-900">Detalle de Regla</h3>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-1"><XIcon/></button>
                    </header>
                    <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-gray-50/50">
                        <div>
                            <p className="text-sm text-gray-500">Nombre</p>
                            <h4 className="font-semibold text-gray-900 text-lg">{rule.name}</h4>
                            <p className="text-sm text-gray-500">{rule.context}</p>
                        </div>
                        <div className='flex items-center gap-4'>
                             <div>
                                <p className="text-sm text-gray-500">Estado</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'}`}>
                                    {rule.status === 'active' ? 'Activa' : 'Inactiva'}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500">Severidad</p>
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityStyles(rule.severity)}`}>
                                    {rule.severity}
                                </span>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Expresión Lógica</p>
                            <pre className="bg-gray-100 border border-gray-200 p-3 rounded-md text-cyan-700 text-sm font-mono mt-1 overflow-x-auto">{rule.expression}</pre>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 mb-2">Historial Reciente</p>
                            <div className="bg-white border border-gray-200 p-4 rounded-lg space-y-3">
                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-gray-600'>Última Activación:</span>
                                    <span className='font-medium text-gray-900'>{rule.lastTriggered}</span>
                                </div>
                                <div className='flex justify-between items-center text-sm'>
                                    <span className='text-gray-600'>Activaciones (24h):</span>
                                    <span className='font-medium text-gray-900'>{rule.triggers24h}</span>
                                </div>
                            </div>
                        </div>
                         <div>
                            <p className="text-sm text-gray-500 mb-2">Gráfico de Tendencia del Parámetro</p>
                            <div className="bg-white border border-gray-200 h-40 rounded-lg flex items-center justify-center">
                                <p className="text-gray-400 text-xs">Simulación de gráfico</p>
                            </div>
                        </div>

                    </div>
                    <footer className="p-4 border-t border-gray-200 flex gap-2 bg-gray-50">
                        <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded-lg transition-colors text-sm">Editar Regla</button>
                        <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-bold py-2 px-4 rounded-lg transition-colors text-sm">Simular</button>
                    </footer>
                 </div>
            </div>
        );
    };

    const TabContent = () => {
        if (activeTab !== 'Reglas') {
            return (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                    Contenido para {activeTab} en construcción.
                </div>
            )
        }
        return (
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-4 py-3">Nombre de la Regla</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3">Severidad</th>
                            <th className="px-4 py-3">Última Activación</th>
                            <th className="px-4 py-3 text-right">Activaciones (24h)</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {mockRules.map(rule => (
                            <tr key={rule.id} onClick={() => setSelectedRule(rule)} className="hover:bg-gray-50 cursor-pointer">
                                <td className="px-4 py-3">
                                    <p className="font-medium text-gray-900">{rule.name}</p>
                                    <p className="text-xs text-gray-400">{rule.context}</p>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${rule.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                        {rule.status === 'active' ? 'Activa' : 'Inactiva'}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${getSeverityStyles(rule.severity)}`}>
                                        {rule.severity}
                                    </span>
                                </td>
                                <td className="px-4 py-3">{rule.lastTriggered}</td>
                                <td className="px-4 py-3 text-right font-mono font-semibold text-gray-800">{rule.triggers24h}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <header className="p-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Parámetros y Alertas</h2>
                    <p className="text-sm text-gray-500">Defina, gestione y monitoree las reglas de negocio de su operación.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <input type="text" placeholder="Buscar regla o parámetro..." className="w-full bg-gray-100 rounded-md pl-10 pr-4 py-2 text-sm border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><SearchIcon /></div>
                    </div>
                    <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 border border-gray-200 px-4 py-2 rounded-md"><FilterIcon /> <span>Filtros</span></button>
                    <button className="flex items-center gap-2 text-sm text-white hover:bg-blue-700 bg-blue-600 px-4 py-2 rounded-md font-semibold"><PlusCircleIcon /> <span>Crear Regla</span></button>
                </div>
            </header>

            {/* Tabs */}
            <nav className="flex border-b border-gray-200">
                {tabs.map(tab => (
                    <button
                        key={tab.name}
                        onClick={() => setActiveTab(tab.name)}
                        className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors ${activeTab === tab.name ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
                    >
                        {tab.icon} {tab.name}
                    </button>
                ))}
            </nav>

            {/* Content */}
            <main className="flex-1 flex flex-col overflow-y-hidden">
                <TabContent />
            </main>

            {selectedRule && <DetailsPanel rule={selectedRule} onClose={() => setSelectedRule(null)} />}

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

export default PaAlerts;
