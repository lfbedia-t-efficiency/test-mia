
import React, { useState, useMemo, useEffect } from 'react';
import { Plant, Process, Subprocess } from '../types';
import { 
    FilterIcon, ChartBarIcon, ExclamationTriangleIcon, 
    CheckCircleIcon, ClockIcon, UserIcon, ManufacturingIcon, 
    ArrowUpIcon, ArrowDownIcon, SearchIcon, PrinterIcon,
    WrenchScrewdriverIcon, AIAssistantIcon, SignalIcon, CalendarIcon,
    BeakerIcon, TicketIcon
} from '../components/icons/Icons';

interface TaDashboardProps {
    plants: Plant[];
}

type PeriodFilter = '24h' | '48h' | '72h' | '7d' | '14d' | '30d' | 'custom';

// --- ENHANCED MOCK DATA ---
interface DashboardOT {
    id: string;
    otNumber: string;
    plantId: string;
    processId: string;
    subprocessId: string;
    machineId: string;
    machineName: string;
    status: 'Abierta' | 'En Proceso' | 'Cerrada' | 'Cancelada';
    priority: 'P1' | 'P2' | 'P3';
    symptom: string;
    techName: string;
    reportDate: string;
    closedDate?: string;
    durationHours: number;
    isMachineDown: boolean;

    // Expanded Fields for Charts
    shift: string;
    requestType: string;
    safetyRisk: string;
    productModel: string;
    impactProduction: string;
    impactQuality: string;
    failureMoment: string;
}

// Helper to generate consistent mock data based on plant structure
const generateMockData = (plants: Plant[]): DashboardOT[] => {
    const data: DashboardOT[] = [];
    const symptoms = ['Vibración Excesiva', 'Fuga de Aceite', 'Sobrecalentamiento', 'Ruido Anormal', 'Fallo Eléctrico', 'Descalibración', 'Atasco', 'Falla Sensor', 'Desgaste Herramienta'];
    const techs = ['Juan Pérez', 'Carlos Ruiz', 'Maria Garcia', 'Pedro Gomez', 'Luis Hernandez'];
    
    // Form Options
    const shifts = ['Turno 1', 'Turno 2', 'Turno 3', 'Mixto'];
    const requestTypes = ['Manto. Correctivo', 'Seguridad / HSE', 'Mejora Continua', 'Servicios Grales', 'Prev. Emergencia'];
    const safetyRisks = ['Bajo', 'Medio', 'Alto'];
    const models = ['Modelo A-100', 'Modelo X-500', 'Genérico', 'Modelo Z-Pro', 'Prototipo V2'];
    const prodImpacts = ['Sin impacto', 'Reducción velocidad', 'Paros cortos', 'Paro total'];
    const qualImpacts = ['Sin defecto', 'Dimensional', 'Estético', 'Funcional'];
    const moments = ['Operación normal', 'Al arrancar', 'Cambio de modelo', 'En reposo'];

    const now = new Date();

    plants.forEach(plant => {
        plant.processes.forEach(proc => {
            proc.subprocesses.forEach(sub => {
                if (sub.machines) {
                    sub.machines.forEach(mach => {
                        // Generate 5-15 OTs per machine for rich data
                        const count = Math.floor(Math.random() * 8) + 3; 
                        for(let i=0; i<count; i++) {
                            const isClosed = Math.random() > 0.4;
                            const dateOffset = Math.floor(Math.random() * 30); // Last 30 days
                            const reportDate = new Date(now.getTime() - dateOffset * 24 * 60 * 60 * 1000);
                            const duration = Math.random() * 10 + 0.5;
                            const closedDate = isClosed ? new Date(reportDate.getTime() + duration * 60 * 60 * 1000).toISOString() : undefined;
                            
                            const impactP = prodImpacts[Math.floor(Math.random() * prodImpacts.length)];

                            data.push({
                                id: `OT-${mach.id}-${i}`,
                                otNumber: `OT-${Math.floor(Math.random()*9000)+1000}`,
                                plantId: plant.id,
                                processId: proc.id,
                                subprocessId: sub.id,
                                machineId: mach.id,
                                machineName: mach.name,
                                status: isClosed ? 'Cerrada' : (Math.random() > 0.6 ? 'En Proceso' : 'Abierta'),
                                priority: Math.random() > 0.8 ? 'P1' : Math.random() > 0.5 ? 'P2' : 'P3',
                                symptom: symptoms[Math.floor(Math.random() * symptoms.length)],
                                techName: techs[Math.floor(Math.random() * techs.length)],
                                reportDate: reportDate.toISOString(),
                                closedDate,
                                durationHours: duration,
                                isMachineDown: !isClosed && (impactP === 'Paro total' || Math.random() > 0.8),
                                
                                // New Fields
                                shift: shifts[Math.floor(Math.random() * shifts.length)],
                                requestType: requestTypes[Math.floor(Math.random() * requestTypes.length)],
                                safetyRisk: safetyRisks[Math.floor(Math.random() * safetyRisks.length)],
                                productModel: models[Math.floor(Math.random() * models.length)],
                                impactProduction: impactP,
                                impactQuality: qualImpacts[Math.floor(Math.random() * qualImpacts.length)],
                                failureMoment: moments[Math.floor(Math.random() * moments.length)],
                            });
                        }
                    });
                }
            });
        });
    });
    return data;
};

// --- CHART COMPONENTS (SVG Based) ---

const DonutChart: React.FC<{ 
    data: { label: string; value: number; color: string }[]; 
    title?: string;
    totalLabel?: string;
}> = ({ data, title, totalLabel }) => {
    const total = data.reduce((acc, d) => acc + d.value, 0);
    let cumulativePercent = 0;

    const getCoordinatesForPercent = (percent: number) => {
        const x = Math.cos(2 * Math.PI * percent);
        const y = Math.sin(2 * Math.PI * percent);
        return [x, y];
    };

    return (
        <div className="flex flex-col items-center justify-center h-full">
            {title && <h4 className="text-xs font-bold text-gray-500 uppercase mb-2 w-full text-left">{title}</h4>}
            <div className="relative w-32 h-32">
                <svg viewBox="-1 -1 2 2" className="w-full h-full rotate-[-90deg]">
                    {data.map((slice, i) => {
                        if (slice.value === 0) return null;
                        const start = cumulativePercent;
                        const end = cumulativePercent + slice.value / total;
                        cumulativePercent = end;

                        const [startX, startY] = getCoordinatesForPercent(start);
                        const [endX, endY] = getCoordinatesForPercent(end);
                        const largeArcFlag = slice.value / total > 0.5 ? 1 : 0;

                        return (
                            <path
                                key={i}
                                d={`M 0 0 L ${startX} ${startY} A 1 1 0 ${largeArcFlag} 1 ${endX} ${endY} Z`}
                                fill={slice.color}
                                stroke="white"
                                strokeWidth="0.05"
                            />
                        );
                    })}
                    {/* Inner Circle for Donut */}
                    <circle cx="0" cy="0" r="0.6" fill="white" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-xl font-bold text-gray-800">{total}</span>
                    <span className="text-[9px] text-gray-400 uppercase">{totalLabel || 'Total'}</span>
                </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap justify-center gap-2 mt-4 w-full">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }}></span>
                        <span className="text-[10px] text-gray-600 truncate max-w-[80px]" title={d.label}>{d.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const VerticalBarChart: React.FC<{ 
    data: { label: string; value: number; color?: string }[]; 
    title?: string;
    maxVal?: number;
}> = ({ data, title, maxVal }) => {
    const max = maxVal || Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="flex flex-col h-full w-full">
            {title && <h4 className="text-xs font-bold text-gray-500 uppercase mb-4">{title}</h4>}
            <div className="flex items-end justify-between flex-1 gap-2 border-b border-gray-200 pb-1">
                {data.map((d, i) => (
                    <div key={i} className="flex flex-col items-center flex-1 group">
                        <span className="text-[10px] font-bold text-gray-600 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</span>
                        <div 
                            className={`w-full max-w-[30px] rounded-t-sm transition-all duration-500 ${d.color || 'bg-blue-500'}`} 
                            style={{ height: `${(d.value / max) * 100}%` }}
                        ></div>
                    </div>
                ))}
            </div>
            <div className="flex justify-between mt-2 gap-2">
                {data.map((d, i) => (
                    <span key={i} className="text-[9px] text-gray-500 text-center flex-1 truncate" title={d.label}>{d.label}</span>
                ))}
            </div>
        </div>
    );
};

const SimpleBarChart: React.FC<{ 
    data: { label: string; value: number; color?: string }[]; 
    title: string;
    maxVal?: number;
    colorFn?: (label: string) => string;
}> = ({ data, title, maxVal, colorFn }) => {
    const max = maxVal || Math.max(...data.map(d => d.value), 1);
    
    return (
        <div className="flex flex-col h-full">
            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 truncate" title={title}>{title}</h4>
            <div className="space-y-3 flex-1 overflow-y-auto custom-scrollbar pr-2">
                {data.map((d, i) => {
                    const barColor = colorFn ? colorFn(d.label) : (d.color || 'bg-blue-500');
                    return (
                        <div key={i} className="flex items-center gap-2 text-xs">
                            <span className="w-24 truncate text-gray-500 font-medium text-right" title={d.label}>{d.label}</span>
                            <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                                <div 
                                    className={`h-full rounded-full ${barColor}`} 
                                    style={{ width: `${(d.value / max) * 100}%` }}
                                ></div>
                            </div>
                            <span className="w-6 font-bold text-gray-700 text-right">{d.value}</span>
                        </div>
                    );
                })}
                {data.length === 0 && <p className="text-[10px] text-gray-400 italic">Sin datos</p>}
            </div>
        </div>
    );
};

const TechPerformanceRow: React.FC<{ tech: string; otCount: number; avgTime: number; rank: number }> = ({ tech, otCount, avgTime, rank }) => (
    <div className="flex items-center justify-between p-2 border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${rank === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600'}`}>
                {rank}
            </div>
            <div>
                <p className="text-xs font-bold text-gray-800">{tech}</p>
                <p className="text-[9px] text-gray-500">{otCount} OTs</p>
            </div>
        </div>
        <div className="text-right">
            <span className="block text-[10px] font-bold text-blue-600">{avgTime.toFixed(1)}h</span>
        </div>
    </div>
);

const TaDashboard: React.FC<TaDashboardProps> = ({ plants }) => {
    // --- STATE & FILTERS ---
    const [mockData] = useState(() => generateMockData(plants));
    
    // Filters
    const [period, setPeriod] = useState<PeriodFilter>('30d');
    const [customStart, setCustomStart] = useState('');
    const [customEnd, setCustomEnd] = useState('');
    
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedProcess, setSelectedProcess] = useState('');
    const [selectedSubprocess, setSelectedSubprocess] = useState('');

    // --- DERIVED OPTIONS FOR DROPDOWNS ---
    const processOptions = useMemo(() => {
        if (!selectedPlant) return [];
        return plants.find(p => p.id === selectedPlant)?.processes || [];
    }, [selectedPlant, plants]);

    const subprocessOptions = useMemo(() => {
        if (!selectedProcess) return [];
        return processOptions.find(p => p.id === selectedProcess)?.subprocesses || [];
    }, [selectedProcess, processOptions]);

    // --- FILTER LOGIC ---
    const filteredData = useMemo(() => {
        const now = new Date();
        let startDate: Date;

        if (period === 'custom' && customStart) {
            startDate = new Date(customStart);
        } else {
            const hoursMap: Record<string, number> = { '24h': 24, '48h': 48, '72h': 72, '7d': 168, '14d': 336, '30d': 720 };
            const hours = hoursMap[period] || 720;
            startDate = new Date(now.getTime() - hours * 60 * 60 * 1000);
        }

        const endDate = (period === 'custom' && customEnd) ? new Date(customEnd) : now;

        return mockData.filter(ot => {
            const d = new Date(ot.reportDate);
            const dateMatch = d >= startDate && d <= endDate;
            const plantMatch = !selectedPlant || ot.plantId === selectedPlant;
            const procMatch = !selectedProcess || ot.processId === selectedProcess;
            const subMatch = !selectedSubprocess || ot.subprocessId === selectedSubprocess;

            return dateMatch && plantMatch && procMatch && subMatch;
        });
    }, [mockData, period, customStart, customEnd, selectedPlant, selectedProcess, selectedSubprocess]);

    // --- KPI CALCULATIONS ---
    const kpis = useMemo(() => {
        const openOTs = filteredData.filter(d => d.status !== 'Cerrada' && d.status !== 'Cancelada');
        const closedOTs = filteredData.filter(d => d.status === 'Cerrada');
        
        const totalOpen = openOTs.length;
        const criticalOpen = openOTs.filter(d => d.priority === 'P1').length;
        const machinesDown = new Set(openOTs.filter(d => d.isMachineDown).map(d => d.machineId)).size;
        
        const totalDuration = closedOTs.reduce((acc, curr) => acc + curr.durationHours, 0);
        const mttr = closedOTs.length ? (totalDuration / closedOTs.length).toFixed(1) : '0.0';

        const totalMachinesInScope = new Set(filteredData.map(d => d.machineId)).size || 1;
        const availability = (100 - (machinesDown / totalMachinesInScope) * 10).toFixed(1);

        return { totalOpen, criticalOpen, machinesDown, mttr, availability };
    }, [filteredData]);

    // --- AGGREGATION HELPER ---
    const aggregateBy = (field: keyof DashboardOT, topN: number = 5) => {
        const counts: Record<string, number> = {};
        filteredData.forEach(d => { 
            const val = String(d[field]);
            counts[val] = (counts[val] || 0) + 1; 
        });
        return Object.entries(counts)
            .map(([label, value]) => ({ label, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, topN);
    };

    // --- CHART DATA PREPARATION ---
    const dataByShift = useMemo(() => {
        const raw = aggregateBy('shift', 4);
        return raw.map(d => ({ ...d, color: '#3b82f6' })); // Blue
    }, [filteredData]);

    const dataByStatus = useMemo(() => {
        const raw = aggregateBy('status', 5);
        const colors: Record<string, string> = { 'Abierta': '#ef4444', 'En Proceso': '#f59e0b', 'Cerrada': '#10b981', 'Cancelada': '#9ca3af' };
        return raw.map(d => ({ ...d, color: colors[d.label] || '#cbd5e1' }));
    }, [filteredData]);

    const dataByRisk = useMemo(() => {
        const raw = aggregateBy('safetyRisk', 3);
        const colors: Record<string, string> = { 'Alto': '#ef4444', 'Medio': '#f59e0b', 'Bajo': '#10b981' };
        return raw.map(d => ({ ...d, color: colors[d.label] || '#cbd5e1' }));
    }, [filteredData]);

    const dataByType = useMemo(() => aggregateBy('requestType', 5), [filteredData]);
    const dataByImpProd = useMemo(() => aggregateBy('impactProduction', 4), [filteredData]);
    const dataByImpQual = useMemo(() => aggregateBy('impactQuality', 4), [filteredData]);
    const symptomsData = useMemo(() => aggregateBy('symptom', 5), [filteredData]);
    const failureMomentData = useMemo(() => aggregateBy('failureMoment', 4), [filteredData]);

    const techData = useMemo(() => {
        const stats: Record<string, { count: number, time: number }> = {};
        filteredData.filter(d => d.status === 'Cerrada').forEach(d => {
            if (!stats[d.techName]) stats[d.techName] = { count: 0, time: 0 };
            stats[d.techName].count++;
            stats[d.techName].time += d.durationHours;
        });
        return Object.entries(stats)
            .map(([name, s]) => ({ name, count: s.count, avg: s.time / s.count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);
    }, [filteredData]);

    const machineList = useMemo(() => {
        // 1. Build Lookup Map for Machine Locations
        const locMap: Record<string, { plant: string; process: string; subprocess: string }> = {};
        plants.forEach(p => {
            p.processes.forEach(proc => {
                proc.subprocesses.forEach(sub => {
                    if (sub.machines) {
                        sub.machines.forEach(m => {
                            locMap[m.id] = { plant: p.name, process: proc.name, subprocess: sub.name };
                        });
                    }
                });
            });
        });

        // 2. Aggregate Data
        const machines: Record<string, { 
            name: string; 
            open: number; 
            down: boolean; 
            lastFail: string;
            location: { plant: string; process: string; subprocess: string };
        }> = {};

        filteredData.forEach(d => {
            if (!machines[d.machineId]) {
                machines[d.machineId] = { 
                    name: d.machineName, 
                    open: 0, 
                    down: false, 
                    lastFail: d.reportDate,
                    location: locMap[d.machineId] || { plant: 'N/A', process: 'N/A', subprocess: 'N/A' }
                };
            }
            if (d.status !== 'Cerrada' && d.status !== 'Cancelada') {
                machines[d.machineId].open++;
                if (d.isMachineDown) machines[d.machineId].down = true;
            }
            if (new Date(d.reportDate) > new Date(machines[d.machineId].lastFail)) {
                machines[d.machineId].lastFail = d.reportDate;
            }
        });
        return Object.values(machines).sort((a,b) => b.open - a.open);
    }, [filteredData, plants]);

    // Color helpers for SimpleBar
    const getRiskColor = (label: string) => {
        if (label === 'Alto') return 'bg-red-500';
        if (label === 'Medio') return 'bg-yellow-400';
        return 'bg-green-500';
    };

    return (
        <div className="flex flex-col h-full space-y-4 bg-gray-50 p-6 overflow-y-auto">
            
            {/* 1. HEADER & FILTERS */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-3">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <SignalIcon className="w-6 h-6 text-blue-600"/> Dashboard Mantenimiento
                        </h2>
                    </div>
                    
                    {/* Period Selector */}
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                        {['24h', '48h', '7d', '14d', '30d'].map((p) => (
                            <button 
                                key={p}
                                onClick={() => setPeriod(p as PeriodFilter)}
                                className={`px-3 py-1 text-xs font-bold rounded-md transition-colors ${period === p ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                            >
                                {p}
                            </button>
                        ))}
                        <button 
                            onClick={() => setPeriod('custom')}
                            className={`px-3 py-1 text-xs font-bold rounded-md transition-colors flex items-center gap-1 ${period === 'custom' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
                        >
                            <CalendarIcon className="w-3 h-3"/> Custom
                        </button>
                    </div>
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-3 pt-3 border-t border-gray-100">
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Planta</label>
                        <select 
                            value={selectedPlant} 
                            onChange={(e) => { setSelectedPlant(e.target.value); setSelectedProcess(''); setSelectedSubprocess(''); }} 
                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            <option value="">Todas</option>
                            {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Proceso</label>
                        <select 
                            value={selectedProcess} 
                            onChange={(e) => { setSelectedProcess(e.target.value); setSelectedSubprocess(''); }}
                            disabled={!selectedPlant}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                        >
                            <option value="">Todos</option>
                            {processOptions.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="text-[10px] font-bold text-gray-400 uppercase">Subproceso</label>
                        <select 
                            value={selectedSubprocess} 
                            onChange={(e) => setSelectedSubprocess(e.target.value)}
                            disabled={!selectedProcess}
                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                        >
                            <option value="">Todos</option>
                            {subprocessOptions.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    
                    {period === 'custom' && (
                        <>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Desde</label>
                                <input type="date" value={customStart} onChange={e => setCustomStart(e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs bg-white text-gray-900"/>
                            </div>
                            <div className="col-span-1">
                                <label className="text-[10px] font-bold text-gray-400 uppercase">Hasta</label>
                                <input type="date" value={customEnd} onChange={e => setCustomEnd(e.target.value)} className="w-full p-1 border border-gray-300 rounded text-xs bg-white text-gray-900"/>
                            </div>
                        </>
                    )}

                    <div className="col-span-1 flex items-end justify-end ml-auto">
                        <button onClick={() => window.print()} className="bg-gray-100 text-gray-600 hover:bg-gray-200 p-2 rounded-lg transition-colors" title="Imprimir Reporte">
                            <PrinterIcon className="w-4 h-4"/>
                        </button>
                    </div>
                </div>
            </div>

            {/* 2. TOP KPIs */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg text-blue-600"><WrenchScrewdriverIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">OTs Abiertas</p>
                        <p className="text-xl font-black text-gray-800">{kpis.totalOpen}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3 border-l-4 border-l-red-500">
                    <div className="bg-red-100 p-2 rounded-lg text-red-600"><ExclamationTriangleIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Críticas (P1)</p>
                        <p className="text-xl font-black text-red-600">{kpis.criticalOpen}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg text-orange-600"><ManufacturingIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Máq. Paradas</p>
                        <p className="text-xl font-black text-gray-800">{kpis.machinesDown}</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="bg-green-100 p-2 rounded-lg text-green-600"><CheckCircleIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">Disponibilidad</p>
                        <p className="text-xl font-black text-gray-800">{kpis.availability}%</p>
                    </div>
                </div>
                <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-200 flex items-center gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg text-purple-600"><ClockIcon className="w-5 h-5"/></div>
                    <div>
                        <p className="text-[10px] text-gray-500 font-bold uppercase">MTTR Prom.</p>
                        <p className="text-xl font-black text-gray-800">{kpis.mttr} h</p>
                    </div>
                </div>
            </div>

            {/* 3. ROW 1: STATUS DISTRIBUTION (EXECUTIVE SUMMARY) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Donut: Status */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-56">
                    <DonutChart data={dataByStatus} title="Estatus OTs" totalLabel="Ordenes" />
                </div>
                {/* Donut: Risk */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 lg:col-span-1 h-56">
                    <DonutChart data={dataByRisk} title="Nivel Riesgo" totalLabel="Reportes" />
                </div>
                {/* Vertical Bar: Shifts */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 lg:col-span-2 h-56">
                    <VerticalBarChart data={dataByShift} title="Distribución por Turno" />
                </div>
            </div>

            {/* 4. ROW 2: ANALYTICAL DRILL-DOWN (Symptoms + Techs) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Top Symptoms - Takes 2 Columns */}
                <div className="md:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64">
                    <SimpleBarChart data={symptomsData} title="Top Síntomas (Pareto)" colorFn={() => 'bg-purple-500'} />
                </div>
                
                {/* Tech Leaderboard - Takes 1 Column */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-64 flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
                        <UserIcon className="w-4 h-4"/> Rendimiento Técnico
                    </h4>
                    <div className="flex-1 overflow-y-auto custom-scrollbar border border-gray-100 rounded-lg">
                        {techData.map((t, idx) => (
                            <TechPerformanceRow 
                                key={t.name}
                                rank={idx + 1}
                                tech={t.name}
                                otCount={t.count}
                                avgTime={t.avg}
                            />
                        ))}
                    </div>
                </div>
            </div>

            {/* 5. ROW 3: CATEGORICAL & IMPACT ANALYSIS (4 Columns) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-48">
                    <SimpleBarChart data={dataByType} title="Tipo de Solicitud" colorFn={() => 'bg-blue-500'} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-48">
                    <SimpleBarChart data={failureMomentData} title="Momento de Falla" colorFn={() => 'bg-orange-400'} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-48">
                    <SimpleBarChart data={dataByImpProd} title="Impacto en Producción" colorFn={() => 'bg-red-500'} />
                </div>
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 h-48">
                    <SimpleBarChart data={dataByImpQual} title="Impacto en Calidad" colorFn={() => 'bg-teal-500'} />
                </div>
            </div>

            {/* 6. ROW 4: DETAILED MACHINE STATUS (FULL WIDTH) */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        <ManufacturingIcon className="w-5 h-5 text-gray-500"/> Estado Detallado de Maquinaria
                    </h3>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{machineList.length} Máquinas</span>
                </div>
                
                <div className="overflow-x-auto border border-gray-200 rounded-lg max-h-80 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 text-[10px] uppercase font-bold sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3">Máquina</th>
                                <th className="p-3">Ubicación</th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-center">OTs Abiertas</th>
                                <th className="p-3 text-right">Última Falla</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {machineList.map((m, idx) => (
                                <tr key={idx} className="hover:bg-blue-50 transition-colors">
                                    <td className="p-3 font-semibold text-gray-700">{m.name}</td>
                                    <td className="p-3 text-xs text-gray-500">
                                        <div className="font-semibold text-gray-700">{m.location.plant}</div>
                                        <div className="text-[10px]">{m.location.process} - {m.location.subprocess}</div>
                                    </td>
                                    <td className="p-3 text-center">
                                        {m.down ? (
                                            <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-bold border border-red-200">PARO</span>
                                        ) : m.open > 0 ? (
                                            <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-[10px] font-bold border border-yellow-200">FALLA</span>
                                        ) : (
                                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-[10px] font-bold border border-green-200">OK</span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center font-bold text-gray-800">{m.open}</td>
                                    <td className="p-3 text-right text-xs text-gray-500">{new Date(m.lastFail).toLocaleDateString()}</td>
                                    <td className="p-3 text-center">
                                        <button className="text-xs text-blue-600 hover:underline flex items-center justify-center gap-1 w-full">
                                            <TicketIcon className="w-3 h-3"/> Ver OTs
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {machineList.length === 0 && (
                                <tr><td colSpan={6} className="p-4 text-center text-gray-400 text-xs italic">No hay datos en este rango.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TaDashboard;
