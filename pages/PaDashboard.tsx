import React, { useState, useMemo } from 'react';
import { Plant } from '../types';
import { 
    FilterIcon, ChartBarIcon, ExclamationTriangleIcon, 
    CheckCircleIcon, DocumentTextIcon, PrinterIcon, 
    ArrowUpIcon, ArrowDownIcon, ClockIcon, CalendarIcon,
    SearchIcon, EyeIcon, UserIcon, ManufacturingIcon
} from '../components/icons/Icons';

interface PaDashboardProps {
    plants: Plant[];
}

// --- MOCK DATA TYPES ---
interface KPIMetric {
    title: string;
    value: string;
    trend: number;
    trendLabel: string;
    status: 'success' | 'warning' | 'danger' | 'info';
    icon: React.ReactElement;
}

interface AuditRecord {
    id: string;
    status: 'compliant' | 'non_compliant' | 'pending_action';
    date: string;
    plant: string;
    process: string;
    line: string;
    auditor: string;
    findings: number;
    score: number;
}

// --- MOCK DATA GENERATORS ---
const generateAuditRecords = (count: number): AuditRecord[] => {
    const records: AuditRecord[] = [];
    const statuses: AuditRecord['status'][] = ['compliant', 'compliant', 'non_compliant', 'pending_action'];
    const auditors = ['Ana Lopez', 'Carlos Ruiz', 'Juan Perez', 'Maria Garcia'];
    
    for (let i = 0; i < count; i++) {
        records.push({
            id: `AUD-${202400 + i}`,
            status: statuses[Math.floor(Math.random() * statuses.length)],
            date: new Date(Date.now() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000)).toLocaleDateString(),
            plant: 'Planta Monterrey',
            process: i % 2 === 0 ? 'Prensado' : 'Ensamblaje',
            line: i % 2 === 0 ? `Prensa 0${(i % 5) + 1}` : `Línea A${(i % 3) + 1}`,
            auditor: auditors[Math.floor(Math.random() * auditors.length)],
            findings: Math.floor(Math.random() * 5),
            score: Math.floor(Math.random() * (100 - 80) + 80)
        });
    }
    return records;
};

// --- COMPONENTES UI ---

const FilterPill: React.FC<{ label: string; icon?: React.ReactNode; value: string; onChange: (v: string) => void; options: string[] }> = ({ label, icon, value, onChange, options }) => (
    <div className="flex flex-col">
        <label className="text-[10px] uppercase font-bold text-gray-500 mb-1 ml-1">{label}</label>
        <div className="relative group">
            <select 
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="appearance-none w-full bg-white border border-gray-300 text-gray-700 py-1.5 pl-3 pr-8 rounded-md text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow shadow-sm hover:border-gray-400"
            >
                <option value="">Todos</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <ArrowDownIcon className="h-3 w-3" />
            </div>
        </div>
    </div>
);

const KPICard: React.FC<KPIMetric> = ({ title, value, trend, trendLabel, status, icon }) => {
    const statusColors = {
        success: 'border-green-500 text-green-600 bg-green-50',
        warning: 'border-yellow-500 text-yellow-600 bg-yellow-50',
        danger: 'border-red-500 text-red-600 bg-red-50',
        info: 'border-blue-500 text-blue-600 bg-blue-50'
    };
    
    const trendColor = trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-500';
    const TrendIcon = trend > 0 ? ArrowUpIcon : ArrowDownIcon;

    return (
        <div className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${statusColors[status].split(' ')[0]} flex flex-col justify-between h-32 hover:shadow-md transition-shadow relative overflow-hidden`}>
            <div className="absolute top-0 right-0 p-2 opacity-10">
                {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: `w-12 h-12 ${statusColors[status].split(' ')[1]}` })}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{title}</p>
                <h3 className="text-3xl font-extrabold text-gray-800 mt-1">{value}</h3>
            </div>
            <div className="flex items-center gap-1 mt-2">
                <span className={`flex items-center text-xs font-bold ${trendColor}`}>
                    <TrendIcon className="w-3 h-3 mr-0.5" />
                    {Math.abs(trend)}%
                </span>
                <span className="text-[10px] text-gray-400 font-medium">{trendLabel}</span>
            </div>
        </div>
    );
};

const StatusBadge: React.FC<{ status: AuditRecord['status'] }> = ({ status }) => {
    const styles = {
        compliant: 'bg-green-100 text-green-800 border-green-200',
        non_compliant: 'bg-red-100 text-red-800 border-red-200',
        pending_action: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    const labels = {
        compliant: 'Conforme',
        non_compliant: 'No Conforme',
        pending_action: 'Acción Pendiente'
    };

    return (
        <span className={`px-2 py-1 rounded-full text-[10px] font-bold border uppercase flex items-center justify-center w-fit gap-1 ${styles[status]}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status === 'compliant' ? 'bg-green-500' : status === 'non_compliant' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
            {labels[status]}
        </span>
    );
};

const ComplianceHeatmap: React.FC = () => {
    // Mock hierarchical status
    const lines = Array.from({ length: 8 }, (_, i) => ({
        id: i,
        name: `Línea ${i + 1}`,
        score: Math.floor(Math.random() * (100 - 60) + 60)
    }));

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h4 className="font-bold text-gray-800 flex items-center gap-2">
                    <ManufacturingIcon className="w-5 h-5 text-gray-500"/>
                    Mapa de Cumplimiento Operativo
                </h4>
                <div className="flex gap-2 text-[10px] font-medium text-gray-500">
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-green-500"></span> &gt;90%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-yellow-400"></span> 80-90%</span>
                    <span className="flex items-center gap-1"><span className="w-2 h-2 rounded bg-red-500"></span> &lt;80%</span>
                </div>
            </div>
            <div className="p-4 flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                {lines.map(line => {
                    let color = 'bg-green-500';
                    let text = 'text-green-700';
                    let bg = 'bg-green-50';
                    if (line.score < 90) { color = 'bg-yellow-400'; text = 'text-yellow-700'; bg = 'bg-yellow-50'; }
                    if (line.score < 80) { color = 'bg-red-500'; text = 'text-red-700'; bg = 'bg-red-50'; }

                    return (
                        <div key={line.id} className={`rounded-lg border border-gray-200 p-3 flex flex-col items-center justify-center gap-2 transition-all hover:shadow-md cursor-pointer ${bg}`}>
                            <div className="text-xs font-bold text-gray-600">{line.name}</div>
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${color}`}>
                                {line.score}%
                            </div>
                            <div className={`text-[10px] font-bold uppercase ${text}`}>
                                {line.score >= 90 ? 'Óptimo' : line.score >= 80 ? 'Riesgo' : 'Crítico'}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    );
};

// --- CHART COMPONENTS (Simplified CSS) ---
const ParetoChart: React.FC = () => {
    const data = [
        { label: 'EPP Incompleto', value: 45 },
        { label: 'Orden y Limpieza', value: 30 },
        { label: 'Doc. No Vigente', value: 15 },
        { label: 'Herramienta Dañada', value: 10 },
    ];
    const total = 100;

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-full flex flex-col">
            <div className="p-4 border-b border-gray-100">
                <h4 className="font-bold text-gray-800 text-sm">Pareto de No Conformidades</h4>
            </div>
            <div className="p-4 flex-1 flex flex-col justify-center space-y-3">
                {data.map((d, i) => (
                    <div key={i} className="w-full">
                        <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-600">{d.label}</span>
                            <span className="font-bold text-gray-800">{d.value}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${d.value}%`, opacity: 1 - (i * 0.15) }}
                            ></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// --- MAIN DASHBOARD COMPONENT ---

const PaDashboard: React.FC<PaDashboardProps> = ({ plants }) => {
    const [filters, setFilters] = useState({
        plant: '',
        process: '',
        shift: '',
        date: '',
        auditor: ''
    });

    const records = useMemo(() => generateAuditRecords(25), []);

    // KPIs
    const kpis: KPIMetric[] = [
        { title: 'Cumplimiento General', value: '94.2%', trend: 2.1, trendLabel: 'vs mes anterior', status: 'success', icon: <CheckCircleIcon /> },
        { title: 'Auditorías Ejecutadas', value: '145', trend: 12, trendLabel: 'vs plan (130)', status: 'info', icon: <DocumentTextIcon /> },
        { title: 'No Conformidades', value: '23', trend: -5, trendLabel: 'vs mes anterior', status: 'warning', icon: <ExclamationTriangleIcon /> },
        { title: '% Cierre Acciones', value: '88%', trend: 1.5, trendLabel: 'Eficiencia', status: 'success', icon: <ClockIcon /> },
    ];

    return (
        <div className="space-y-6">
            
            {/* 1. TOP RIBBON: FILTERS */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 sticky top-0 z-20">
                <div className="flex flex-col md:flex-row gap-4 justify-between items-end md:items-center">
                    <div className="flex items-center gap-2">
                        <div className="bg-blue-100 p-2 rounded-md">
                            <FilterIcon className="w-5 h-5 text-blue-600"/>
                        </div>
                        <div>
                            <h2 className="text-sm font-bold text-gray-800">Filtros Globales</h2>
                            <p className="text-[10px] text-gray-500">Filtrando 145 auditorías</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 flex-1 justify-end">
                        <div className="w-32">
                            <FilterPill label="Planta" value={filters.plant} onChange={(v) => setFilters({...filters, plant: v})} options={plants.map(p => p.name)} />
                        </div>
                        <div className="w-32">
                            <FilterPill label="Proceso" value={filters.process} onChange={(v) => setFilters({...filters, process: v})} options={['Prensado', 'Ensamble', 'Pintura']} />
                        </div>
                        <div className="w-24">
                            <FilterPill label="Turno" value={filters.shift} onChange={(v) => setFilters({...filters, shift: v})} options={['T1', 'T2', 'T3']} />
                        </div>
                        <div className="w-32">
                            <FilterPill label="Auditor" value={filters.auditor} onChange={(v) => setFilters({...filters, auditor: v})} options={['Ana Lopez', 'Carlos Ruiz']} />
                        </div>
                        <div className="flex items-end">
                            <button className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-md transition-colors" title="Exportar Vista">
                                <PrinterIcon className="w-4 h-4"/>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 2. EXECUTIVE BAR: KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, idx) => <KPICard key={idx} {...kpi} />)}
            </div>

            {/* 3. VISUAL ANALYTICS */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                <div className="lg:col-span-2 h-full">
                    <ComplianceHeatmap />
                </div>
                <div className="h-full">
                    <ParetoChart />
                </div>
            </div>

            {/* 4. DRILL-DOWN TABLE */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Bitácora de Auditorías (Detalle)</h3>
                    <div className="relative">
                        <input type="text" placeholder="Buscar ID..." className="pl-8 pr-3 py-1 text-xs border border-gray-300 rounded-full focus:outline-none focus:ring-1 focus:ring-blue-500" />
                        <SearchIcon className="w-3 h-3 text-gray-400 absolute left-2.5 top-1.5"/>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-white text-xs font-bold text-gray-500 uppercase border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-3">Estatus</th>
                                <th className="px-6 py-3">ID Auditoría</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Ubicación (Línea)</th>
                                <th className="px-6 py-3">Auditor</th>
                                <th className="px-6 py-3 text-center">Score</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {records.map((record) => (
                                <tr key={record.id} className="hover:bg-blue-50 transition-colors group cursor-default">
                                    <td className="px-6 py-3">
                                        <StatusBadge status={record.status} />
                                    </td>
                                    <td className="px-6 py-3 font-mono text-xs font-semibold text-gray-700">{record.id}</td>
                                    <td className="px-6 py-3 text-xs">{record.date}</td>
                                    <td className="px-6 py-3">
                                        <div className="text-xs font-bold text-gray-800">{record.plant}</div>
                                        <div className="text-[10px] text-gray-500">{record.process} &bull; {record.line}</div>
                                    </td>
                                    <td className="px-6 py-3 text-xs flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-600">
                                            {record.auditor.charAt(0)}
                                        </div>
                                        {record.auditor}
                                    </td>
                                    <td className="px-6 py-3 text-center font-bold text-gray-800">
                                        {record.score}%
                                    </td>
                                    <td className="px-6 py-3 text-right">
                                        <button className="text-blue-600 hover:text-blue-800 font-semibold text-xs flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                                            <EyeIcon className="w-4 h-4"/> Ver Detalle
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs text-gray-500">
                    <span>Mostrando {records.length} registros recientes</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100">Anterior</button>
                        <button className="px-3 py-1 border rounded bg-white hover:bg-gray-100">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaDashboard;