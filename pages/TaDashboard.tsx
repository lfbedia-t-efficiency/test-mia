
import React, { useState, useMemo } from 'react';
import { Plant } from '../types';
import { 
    FilterIcon, CalendarIcon, UserIcon, WrenchScrewdriverIcon, 
    AIAssistantIcon, ExclamationTriangleIcon, CheckCircleIcon, 
    ClockIcon, DocumentTextIcon, ChartBarIcon 
} from '../components/icons/Icons';

// --- DATA MODELS BASED ON SPEC ---

interface DashboardOT {
    id: string;
    otNumber: string;
    reportDate: string; // Date
    shift: string;
    requestType: string;
    
    // Hierarchy
    plant: string;
    process: string;
    subprocess: string;
    machineCode: string;
    machineName: string;
    
    // Machine State
    machineStatus: 'Paro total' | 'Funciona con falla' | 'Solo alarma en pantalla' | 'Duda de operación';
    isOperating: boolean;
    safetyRisk: 'Ningún riesgo aparente' | 'Riesgo potencial' | 'Riesgo alto';
    
    // Impacts
    impactProduction: 'Paro total' | 'Paros frecuentes' | 'Reducción de velocidad' | 'Sin impacto';
    impactQuality: boolean;
    defectType?: string;

    // AI Data
    aiPriority: 'P1' | 'P2' | 'P3';
    aiRisk: 'Alto' | 'Medio' | 'Bajo';
    aiReviewed: boolean;
    aiActionsTaken: boolean;
    aiMatch: 'Coincide totalmente' | 'Coincide parcialmente' | 'No coincide';
    aiUtilityRating: number; // 1-5

    // Tech Data
    techResponsible: string;
    startDate?: string;
    endDate?: string;
    totalTimeHours: number; // MTTR basis
    testResult: 'Aprobado sin observaciones' | 'Aprobado con observaciones' | 'No aprobado';
    rootCauseConfirmed: string;
    symptoms: string[];

    // Workflow
    status: 'Nueva' | 'Por asignar' | 'Asignada' | 'En ejecución' | 'En pruebas' | 'Pendiente refacciones' | 'Cerrada' | 'Cancelada';
    
    // Preventive
    requiresPmUpdate: boolean;
    docsToUpdate: string[];
    finalMachineStatus: 'Operativa normal' | 'Operativa con restricciones' | 'No operativa';
    preventiveActions: string;
}

interface TaDashboardProps {
    plants: Plant[];
}

// --- MOCK DATA GENERATOR ---

const generateMockData = (count: number): DashboardOT[] => {
    const shifts = ['Turno 1', 'Turno 2', 'Turno 3'];
    const types = ['Mantenimiento correctivo', 'Alarma en equipo', 'Comportamiento anómalo', 'Duda de operación', 'Otro'];
    const machineStatuses = ['Paro total', 'Funciona con falla', 'Solo alarma en pantalla', 'Duda de operación'] as const;
    const priorities = ['P1', 'P2', 'P3'] as const;
    const risks = ['Alto', 'Medio', 'Bajo'] as const;
    const techNames = ['Juan Pérez', 'Carlos Ruiz', 'Maria Garcia', 'Pedro Gomez', 'Luis Hernandez'];
    const rootCauses = ['Desgaste natural', 'Falla eléctrica', 'Error humano', 'Falta de lubricación', 'Sensor dañado', 'Descalibración'];
    const symptomsList = ['Ruidos anormales', 'Vibración excesiva', 'Temp alta', 'Fugas', 'Paros frecuentes'];
    const docTypes = ['Instrucción operación', 'Instrucción MP', 'Plan de lubricación', 'Checklist arranque'];

    const data: DashboardOT[] = [];
    const now = new Date();

    for (let i = 0; i < count; i++) {
        const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
        const date = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
        const isClosed = Math.random() > 0.3;
        const status = isClosed ? 'Cerrada' : (Math.random() > 0.5 ? 'En ejecución' : 'Por asignar');
        
        const startH = Math.floor(Math.random() * 5);
        const durationH = Math.random() * 4 + 0.5; // 0.5 to 4.5 hours
        const endDate = isClosed ? new Date(date.getTime() + (startH + durationH) * 3600000).toISOString() : undefined;

        const machineCode = `M-${['PH01', 'CNC02', 'SOL03', 'INY04', 'ENV05'][Math.floor(Math.random()*5)]}`;
        
        const aiMatchRand = Math.random();
        const aiMatch = aiMatchRand > 0.6 ? 'Coincide totalmente' : aiMatchRand > 0.3 ? 'Coincide parcialmente' : 'No coincide';

        data.push({
            id: `OT-${1000+i}`,
            otNumber: `OT-${5000+i}`,
            reportDate: date.toISOString(),
            shift: shifts[Math.floor(Math.random() * shifts.length)],
            requestType: types[Math.floor(Math.random() * types.length)],
            plant: 'Planta Monterrey',
            process: 'Prensado',
            subprocess: 'Línea 1',
            machineCode: machineCode,
            machineName: `Máquina ${machineCode}`,
            machineStatus: machineStatuses[Math.floor(Math.random() * machineStatuses.length)],
            isOperating: Math.random() > 0.5,
            safetyRisk: Math.random() > 0.8 ? 'Riesgo alto' : Math.random() > 0.5 ? 'Riesgo potencial' : 'Ningún riesgo aparente',
            impactProduction: Math.random() > 0.8 ? 'Paro total' : Math.random() > 0.5 ? 'Reducción de velocidad' : 'Sin impacto',
            impactQuality: Math.random() > 0.7,
            aiPriority: priorities[Math.floor(Math.random() * priorities.length)],
            aiRisk: risks[Math.floor(Math.random() * risks.length)],
            aiReviewed: Math.random() > 0.2, // 80% reviewed
            aiActionsTaken: Math.random() > 0.4,
            aiMatch: aiMatch,
            aiUtilityRating: Math.floor(Math.random() * 3) + 3, // 3 to 5
            techResponsible: techNames[Math.floor(Math.random() * techNames.length)],
            startDate: isClosed ? new Date(date.getTime() + startH * 3600000).toISOString() : undefined,
            endDate: endDate,
            totalTimeHours: isClosed ? durationH : 0,
            testResult: Math.random() > 0.9 ? 'No aprobado' : Math.random() > 0.7 ? 'Aprobado con observaciones' : 'Aprobado sin observaciones',
            rootCauseConfirmed: rootCauses[Math.floor(Math.random() * rootCauses.length)],
            symptoms: [symptomsList[Math.floor(Math.random() * symptomsList.length)]],
            status: status,
            requiresPmUpdate: Math.random() > 0.8,
            docsToUpdate: Math.random() > 0.8 ? [docTypes[Math.floor(Math.random() * docTypes.length)]] : [],
            finalMachineStatus: 'Operativa normal',
            preventiveActions: 'Revisar ajuste de sensores mensualmente.'
        });
    }
    return data;
};

// --- VISUAL COMPONENTS ---

const KPICard: React.FC<{ title: string; value: string | number; subtext?: string; color?: string }> = ({ title, value, subtext, color = 'blue' }) => (
    <div className={`bg-white p-4 rounded-lg shadow-sm border-l-4 border-${color}-500 flex flex-col justify-between`}>
        <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">{title}</p>
        <div className="mt-2">
            <span className={`text-2xl font-bold text-${color}-600`}>{value}</span>
            {subtext && <p className="text-xs text-gray-400 mt-1">{subtext}</p>}
        </div>
    </div>
);

const SectionHeader: React.FC<{ title: string, icon?: React.ReactNode }> = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-2 mt-8">
        {icon}
        <h3 className="text-lg font-bold text-gray-800">{title}</h3>
    </div>
);

// Simple Chart Components (using HTML/CSS for lightweight rendering without heavy chart libs)
const SimpleBarChart: React.FC<{ data: { label: string, value: number }[], color?: string, horizontal?: boolean }> = ({ data, color = 'bg-blue-500', horizontal = false }) => {
    const max = Math.max(...data.map(d => d.value), 1);
    
    if (horizontal) {
        return (
            <div className="space-y-2 w-full">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center text-xs">
                        <span className="w-24 truncate text-gray-600 font-medium mr-2 text-right" title={d.label}>{d.label}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-3 overflow-hidden">
                            <div className={`h-full rounded-full ${color}`} style={{ width: `${(d.value / max) * 100}%` }}></div>
                        </div>
                        <span className="w-8 text-right text-gray-700 font-bold ml-2">{d.value}</span>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="flex items-end justify-around h-32 gap-2 w-full">
            {data.map((d, i) => (
                <div key={i} className="flex flex-col items-center group w-full">
                     <span className="text-[10px] font-bold text-gray-700 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</span>
                    <div className={`w-full max-w-[30px] rounded-t-sm ${color} transition-all hover:opacity-80`} style={{ height: `${(d.value / max) * 100}%` }}></div>
                    <span className="text-[10px] text-gray-500 mt-1 truncate w-16 text-center" title={d.label}>{d.label}</span>
                </div>
            ))}
        </div>
    );
};

const SimpleDonutChart: React.FC<{ data: { label: string, value: number, color: string }[] }> = ({ data }) => {
    const total = data.reduce((acc, cur) => acc + cur.value, 0);
    let cumulative = 0;
    const gradient = data.map(d => {
        const start = (cumulative / total) * 100;
        cumulative += d.value;
        const end = (cumulative / total) * 100;
        return `${d.color} ${start}% ${end}%`;
    }).join(', ');

    return (
        <div className="flex items-center gap-6">
            <div className="relative w-32 h-32 rounded-full shrink-0" style={{ background: `conic-gradient(${gradient})` }}>
                <div className="absolute inset-0 m-auto w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-inner">
                    <span className="text-xs font-bold text-gray-500">Total<br/><span className="text-lg text-gray-800">{total}</span></span>
                </div>
            </div>
            <div className="space-y-1 text-xs">
                {data.map((d, i) => (
                    <div key={i} className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-sm" style={{ background: d.color }}></span>
                        <span className="text-gray-600 font-medium">{d.label}:</span>
                        <span className="font-bold text-gray-800">{d.value} ({total > 0 ? ((d.value/total)*100).toFixed(0) : 0}%)</span>
                    </div>
                ))}
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

const TaDashboard: React.FC<TaDashboardProps> = ({ plants }) => {
    // State
    const [data] = useState<DashboardOT[]>(generateMockData(150)); // 150 mock records
    const [filters, setFilters] = useState({
        dateRange: '30d', // Hoy, 7d, 30d, custom
        plant: '',
        process: '',
        subprocess: '',
        shift: '',
        machine: ''
    });

    // Filtering Logic
    const filteredData = useMemo(() => {
        const now = new Date();
        let result = data;

        // Date Filter
        if (filters.dateRange !== 'custom') {
            let days = 30;
            if (filters.dateRange === 'Hoy') days = 0; // actually need logic for "today"
            if (filters.dateRange === '7d') days = 7;
            
            const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
            // If 'Hoy', match date string, else match range
            if (filters.dateRange === 'Hoy') {
                const todayStr = now.toISOString().split('T')[0];
                result = result.filter(d => d.reportDate.startsWith(todayStr));
            } else {
                result = result.filter(d => new Date(d.reportDate) >= cutoff);
            }
        }

        if (filters.plant) result = result.filter(d => d.plant === filters.plant);
        if (filters.process) result = result.filter(d => d.process === filters.process);
        if (filters.subprocess) result = result.filter(d => d.subprocess === filters.subprocess);
        if (filters.shift) result = result.filter(d => d.shift === filters.shift);
        if (filters.machine) result = result.filter(d => d.machineCode.includes(filters.machine));

        return result;
    }, [data, filters]);

    // --- CALCULATED DATA FOR BLOCKS ---

    // Block 1: Executive
    const kpiExec = {
        totalOpen: filteredData.filter(d => d.status !== 'Cerrada' && d.status !== 'Cancelada').length,
        p1Open: filteredData.filter(d => d.status !== 'Cerrada' && d.status !== 'Cancelada' && d.aiPriority === 'P1').length,
        downMachines: filteredData.filter(d => d.status !== 'Cerrada' && d.status !== 'Cancelada' && d.machineStatus === 'Paro total').length,
        highRisk: filteredData.filter(d => d.safetyRisk === 'Riesgo alto').length,
        avgMttr: (filteredData.filter(d => d.status === 'Cerrada').reduce((acc: number, cur: DashboardOT) => acc + cur.totalTimeHours, 0) / (filteredData.filter(d => d.status === 'Cerrada').length || 1)).toFixed(1),
        impactProd: ((filteredData.filter(d => d.impactProduction !== 'Sin impacto').length / (filteredData.length || 1)) * 100).toFixed(0),
        impactQual: ((filteredData.filter(d => d.impactQuality).length / (filteredData.length || 1)) * 100).toFixed(0),
    };

    // Block 2: Machine Health
    const machineCounts = filteredData.reduce((acc: Record<string, number>, cur: DashboardOT) => {
        acc[cur.machineName] = (acc[cur.machineName] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);
    const topMachinesCount = Object.entries(machineCounts).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5).map(([k,v]) => ({ label: k, value: v }));
    
    const machineTime = filteredData.reduce((acc: Record<string, number>, cur: DashboardOT) => {
        acc[cur.machineName] = (acc[cur.machineName] || 0) + cur.totalTimeHours;
        return acc;
    }, {} as Record<string, number>);
    const topMachinesTime = Object.entries(machineTime).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5).map(([k,v]: [string, number]) => ({ label: k, value: Number(v.toFixed(1)) }));

    const machineStatusDist = [
        { label: 'Paro Total', value: filteredData.filter(d => d.machineStatus === 'Paro total').length, color: '#EF4444' },
        { label: 'Falla', value: filteredData.filter(d => d.machineStatus === 'Funciona con falla').length, color: '#F59E0B' },
        { label: 'Alarma', value: filteredData.filter(d => d.machineStatus === 'Solo alarma en pantalla').length, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    // Block 3: Workflow
    const typeDist = Object.entries(filteredData.reduce((acc: Record<string, number>, cur: DashboardOT) => {
        acc[cur.requestType] = (acc[cur.requestType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).map(([k,v]) => ({ label: k, value: v, color: '#6366F1' })); // colors generated in component but needed structure

    const priorityDist = [
        { label: 'P1 Alta', value: filteredData.filter(d => d.aiPriority === 'P1').length, color: '#EF4444' },
        { label: 'P2 Media', value: filteredData.filter(d => d.aiPriority === 'P2').length, color: '#F59E0B' },
        { label: 'P3 Baja', value: filteredData.filter(d => d.aiPriority === 'P3').length, color: '#10B981' },
    ];

    const criticalOTs = filteredData
        .filter(d => d.status !== 'Cerrada' && (d.aiPriority === 'P1' || d.machineStatus === 'Paro total'))
        .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
        .slice(0, 5);

    // Block 4: AI
    const aiUsage = {
        reviewed: filteredData.filter(d => d.aiReviewed).length,
        actionsTaken: filteredData.filter(d => d.aiActionsTaken).length,
        total: filteredData.length
    };
    const aiMatchDist = [
        { label: 'Total', value: filteredData.filter(d => d.aiMatch === 'Coincide totalmente').length, color: '#10B981' },
        { label: 'Parcial', value: filteredData.filter(d => d.aiMatch === 'Coincide parcialmente').length, color: '#F59E0B' },
        { label: 'No', value: filteredData.filter(d => d.aiMatch === 'No coincide').length, color: '#EF4444' },
    ];
    const aiRating = (filteredData.reduce((acc: number, cur: DashboardOT) => acc + cur.aiUtilityRating, 0) / (filteredData.length || 1)).toFixed(1);

    // Block 5: Techs
    const techStats = Object.entries(filteredData.reduce((acc: Record<string, { closed: number, time: number, count: number }>, cur: DashboardOT) => {
        if (!acc[cur.techResponsible]) acc[cur.techResponsible] = { closed: 0, time: 0, count: 0 };
        if (cur.status === 'Cerrada') {
            acc[cur.techResponsible].closed++;
            acc[cur.techResponsible].time += cur.totalTimeHours;
            acc[cur.techResponsible].count++;
        }
        return acc;
    }, {} as Record<string, { closed: number, time: number, count: number }>))
    .map(([k, v]: [string, { closed: number, time: number, count: number }]) => ({ name: k, closed: v.closed, avgTime: v.count ? (v.time/v.count).toFixed(1) : '0' }));

    // Block 6: Causes
    const topSymptoms = Object.entries(filteredData.reduce((acc: Record<string, number>, cur: DashboardOT) => {
        cur.symptoms.forEach(s => acc[s] = (acc[s] || 0) + 1);
        return acc;
    }, {} as Record<string, number>)).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5).map(([k, v]: [string, number]) => ({ label: k, value: v }));

    const topCauses = Object.entries(filteredData.reduce((acc: Record<string, number>, cur: DashboardOT) => {
        acc[cur.rootCauseConfirmed] = (acc[cur.rootCauseConfirmed] || 0) + 1;
        return acc;
    }, {} as Record<string, number>)).sort((a: [string, number], b: [string, number]) => b[1] - a[1]).slice(0, 5).map(([k, v]: [string, number]) => ({ label: k, value: v }));

    // Block 7: Prevention
    const preventionList = filteredData.filter(d => d.requiresPmUpdate).slice(0, 5);

    return (
        <div className="bg-gray-100 min-h-screen p-2">
            {/* 2. GLOBAL FILTERS */}
            <div className="bg-white p-4 rounded-lg shadow-sm mb-6 border border-gray-200 flex flex-wrap gap-4 items-end sticky top-0 z-30">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Control Center: Monitoreo y Seguimiento OT</h1>
                    <p className="text-xs text-gray-500">Tablero Ejecutivo de Mantenimiento Inteligente</p>
                </div>
                <div className="flex-1"></div>
                
                {/* Filter Controls */}
                <div className="flex gap-2 overflow-x-auto pb-1">
                     <div className='flex flex-col'>
                        <label className='text-[10px] font-bold text-gray-500 uppercase'>Periodo</label>
                        <select value={filters.dateRange} onChange={e => setFilters({...filters, dateRange: e.target.value})} className="text-xs border-gray-300 rounded bg-gray-50 py-1.5">
                            <option value="Hoy">Hoy</option>
                            <option value="7d">Últimos 7 días</option>
                            <option value="30d">Mes en curso</option>
                        </select>
                     </div>
                     <div className='flex flex-col'>
                        <label className='text-[10px] font-bold text-gray-500 uppercase'>Planta</label>
                        <select value={filters.plant} onChange={e => setFilters({...filters, plant: e.target.value})} className="text-xs border-gray-300 rounded bg-gray-50 py-1.5 w-32">
                            <option value="">Todas</option>
                            <option value="Planta Monterrey">Planta Monterrey</option>
                        </select>
                     </div>
                     <div className='flex flex-col'>
                        <label className='text-[10px] font-bold text-gray-500 uppercase'>Turno</label>
                        <select value={filters.shift} onChange={e => setFilters({...filters, shift: e.target.value})} className="text-xs border-gray-300 rounded bg-gray-50 py-1.5 w-24">
                            <option value="">Todos</option>
                            <option value="Turno 1">Turno 1</option>
                            <option value="Turno 2">Turno 2</option>
                            <option value="Turno 3">Turno 3</option>
                        </select>
                     </div>
                     <div className='flex flex-col'>
                        <label className='text-[10px] font-bold text-gray-500 uppercase'>Máquina</label>
                        <input placeholder="Código..." value={filters.machine} onChange={e => setFilters({...filters, machine: e.target.value})} className="text-xs border border-gray-300 rounded bg-gray-50 py-1.5 px-2 w-24"/>
                     </div>
                </div>
                <button className="bg-blue-600 text-white p-2 rounded shadow hover:bg-blue-700 transition-colors" title="Actualizar">
                    <FilterIcon className="w-5 h-5"/>
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">
                
                {/* 3. BLOCK 1: EXECUTIVE SUMMARY */}
                <section>
                    <SectionHeader title="Resumen Ejecutivo" icon={<ChartBarIcon className='w-6 h-6 text-blue-600'/>} />
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-4">
                        <KPICard title="OT Abiertas" value={kpiExec.totalOpen} subtext="Activas" color="blue" />
                        <KPICard title="OT P1 (Alta)" value={kpiExec.p1Open} subtext="Críticas" color="red" />
                        <KPICard title="Máquinas Paro" value={kpiExec.downMachines} subtext="No productivas" color="red" />
                        <KPICard title="Riesgo Alto" value={kpiExec.highRisk} subtext="Seguridad" color="orange" />
                        <KPICard title="MTTR Promedio" value={`${kpiExec.avgMttr} h`} subtext="Tiempo Respuesta" color="green" />
                        <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-purple-500 flex flex-col justify-between">
                             <p className="text-xs text-gray-500 font-bold uppercase tracking-wide">Impacto Prod / Calidad</p>
                             <div className="mt-2 flex justify-between items-end">
                                 <span className="text-lg font-bold text-purple-600">{kpiExec.impactProd}%</span>
                                 <span className="text-lg font-bold text-pink-600">{kpiExec.impactQual}%</span>
                             </div>
                        </div>
                    </div>
                    {/* Trend Chart Placeholder (Simulated with simple bars for now) */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 h-48 flex items-center justify-center">
                         <div className="w-full h-full flex items-end justify-between gap-1 px-4">
                             {/* Pseudo-trend chart */}
                             {Array.from({length: 15}).map((_, i) => {
                                 const h1 = Math.random() * 80 + 10;
                                 const h2 = Math.random() * 70 + 10;
                                 return (
                                     <div key={i} className="flex flex-col items-center gap-1 flex-1">
                                         <div className="w-full flex items-end justify-center gap-0.5 h-32">
                                             <div style={{height: `${h1}%`}} className="w-2 bg-blue-400 rounded-t opacity-80" title="Creadas"></div>
                                             <div style={{height: `${h2}%`}} className="w-2 bg-green-400 rounded-t opacity-80" title="Cerradas"></div>
                                         </div>
                                         <span className="text-[9px] text-gray-400">{i+1}</span>
                                     </div>
                                 )
                             })}
                         </div>
                         <div className="absolute top-4 right-4 flex gap-4 text-xs">
                             <span className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-400 rounded"></span> Creadas</span>
                             <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-400 rounded"></span> Cerradas</span>
                         </div>
                    </div>
                </section>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 4. BLOCK 2: MACHINE HEALTH */}
                    <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader title="Salud de Máquinas" icon={<WrenchScrewdriverIcon className='w-5 h-5 text-gray-500'/>} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Top Máquinas con más Fallas</h4>
                                <SimpleBarChart data={topMachinesCount} horizontal color="bg-red-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Estado Actual (OT Abiertas)</h4>
                                <SimpleDonutChart data={machineStatusDist} />
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Top Máquinas por Tiempo Intervención (Horas)</h4>
                             <SimpleBarChart data={topMachinesTime} color="bg-orange-400" />
                        </div>
                    </section>

                    {/* 5. BLOCK 3: WORKFLOW & TYPES */}
                    <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader title="Flujo y Tipos de OT" icon={<ClockIcon className='w-5 h-5 text-gray-500'/>} />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Prioridad IA</h4>
                                <SimpleDonutChart data={priorityDist} />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Antigüedad Backlog</h4>
                                {/* Simulated Aging Chart */}
                                <div className="flex items-end gap-4 h-32 pl-2 border-l border-gray-300">
                                    <div className="flex-1 bg-green-200 rounded-t text-center text-xs py-1" style={{height: '80%'}}><span className="font-bold">24h</span><br/>45%</div>
                                    <div className="flex-1 bg-yellow-200 rounded-t text-center text-xs py-1" style={{height: '50%'}}><span className="font-bold">3d</span><br/>30%</div>
                                    <div className="flex-1 bg-orange-200 rounded-t text-center text-xs py-1" style={{height: '30%'}}><span className="font-bold">7d</span><br/>15%</div>
                                    <div className="flex-1 bg-red-200 rounded-t text-center text-xs py-1" style={{height: '20%'}}><span className="font-bold">+7d</span><br/>10%</div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Top 5 Órdenes Críticas</h4>
                            <div className="overflow-x-auto">
                                <table className="w-full text-xs text-left">
                                    <thead className="bg-gray-50 font-bold text-gray-500">
                                        <tr>
                                            <th className="p-2">OT</th>
                                            <th className="p-2">Máquina</th>
                                            <th className="p-2">Prioridad</th>
                                            <th className="p-2">Estado</th>
                                            <th className="p-2">Tiempo</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {criticalOTs.map(ot => (
                                            <tr key={ot.id}>
                                                <td className="p-2 font-mono text-blue-600">{ot.otNumber}</td>
                                                <td className="p-2">{ot.machineCode}</td>
                                                <td className="p-2"><span className="bg-red-100 text-red-700 px-1 rounded font-bold">{ot.aiPriority}</span></td>
                                                <td className="p-2">{ot.machineStatus}</td>
                                                <td className="p-2 font-mono">4h 20m</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                     {/* 6. BLOCK 4: AI EFFECTIVENESS */}
                     <section className="bg-gradient-to-br from-indigo-50 to-white p-5 rounded-lg shadow-sm border border-indigo-100 col-span-1">
                        <SectionHeader title="Efectividad IA" icon={<AIAssistantIcon className='w-5 h-5 text-indigo-600'/>} />
                        <div className="flex justify-around text-center mb-6">
                            <div>
                                <p className="text-3xl font-bold text-indigo-700">{Math.round((aiUsage.reviewed / aiUsage.total) * 100)}%</p>
                                <p className="text-[10px] text-gray-500 uppercase">Revisión Prediagnóstico</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-indigo-700">{Math.round((aiUsage.actionsTaken / aiUsage.reviewed) * 100)}%</p>
                                <p className="text-[10px] text-gray-500 uppercase">Adopción Acciones</p>
                            </div>
                             <div>
                                <p className="text-3xl font-bold text-indigo-700">{aiRating}/5</p>
                                <p className="text-[10px] text-gray-500 uppercase">Utilidad Promedio</p>
                            </div>
                        </div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Coincidencia Diagnóstico</h4>
                        <SimpleDonutChart data={aiMatchDist} />
                    </section>

                    {/* 7. BLOCK 5: TECHNICIAN PERFORMANCE */}
                    <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200 col-span-1 lg:col-span-2">
                         <SectionHeader title="Desempeño Técnico" icon={<UserIcon className='w-5 h-5 text-gray-500'/>} />
                         <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50">
                                    <tr>
                                        <th className="p-3">Técnico</th>
                                        <th className="p-3 text-center">OT Cerradas</th>
                                        <th className="p-3 text-center">Tiempo Promedio</th>
                                        <th className="p-3 text-center">Calidad (1ra vez)</th>
                                        <th className="p-3 w-32">Carga</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {techStats.map((t, i) => (
                                        <tr key={i}>
                                            <td className="p-3 font-medium text-gray-700">{t.name}</td>
                                            <td className="p-3 text-center font-bold">{t.closed}</td>
                                            <td className="p-3 text-center">{t.avgTime} h</td>
                                            <td className="p-3 text-center text-green-600 font-bold">92%</td>
                                            <td className="p-3">
                                                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                    <div className="h-full bg-blue-500" style={{width: `${Math.random() * 60 + 20}%`}}></div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    </section>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 8. BLOCK 6: ROOT CAUSES & RISKS */}
                    <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader title="Causas y Síntomas" icon={<ExclamationTriangleIcon className='w-5 h-5 text-gray-500'/>} />
                        <div className="grid grid-cols-2 gap-6">
                             <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Top Síntomas</h4>
                                <SimpleBarChart data={topSymptoms} horizontal color="bg-purple-400" />
                            </div>
                            <div>
                                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">Causas Raíz Confirmadas</h4>
                                <SimpleBarChart data={topCauses} horizontal color="bg-pink-400" />
                            </div>
                        </div>
                    </section>

                     {/* 9. BLOCK 7: PREVENTIVE ACTIONS */}
                     <section className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader title="Mejora Continua" icon={<CheckCircleIcon className='w-5 h-5 text-green-600'/>} />
                        <div className="flex items-center gap-4 mb-4">
                             <div className="bg-green-50 p-3 rounded border border-green-100 flex-1">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Req. Actualizar MP</p>
                                 <p className="text-xl font-bold text-green-700">{preventionList.length} casos</p>
                             </div>
                             <div className="bg-blue-50 p-3 rounded border border-blue-100 flex-1">
                                 <p className="text-xs text-gray-500 uppercase font-bold">Docs a Actualizar</p>
                                 <p className="text-xl font-bold text-blue-700">8 Docs</p>
                             </div>
                        </div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Backlog de Acciones Preventivas</h4>
                        <div className="overflow-y-auto max-h-48">
                             <table className="w-full text-xs text-left">
                                 <thead className="bg-gray-50 text-gray-500 sticky top-0">
                                     <tr>
                                         <th className="p-2">OT</th>
                                         <th className="p-2">Causa Raíz</th>
                                         <th className="p-2">Acción Preventiva</th>
                                     </tr>
                                 </thead>
                                 <tbody className="divide-y divide-gray-100">
                                     {preventionList.map(p => (
                                         <tr key={p.id}>
                                             <td className="p-2 font-mono text-blue-600">{p.otNumber}</td>
                                             <td className="p-2">{p.rootCauseConfirmed}</td>
                                             <td className="p-2 text-gray-600 italic">{p.preventiveActions}</td>
                                         </tr>
                                     ))}
                                 </tbody>
                             </table>
                        </div>
                    </section>
                </div>

            </div>
        </div>
    );
};

export default TaDashboard;
