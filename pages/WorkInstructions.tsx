
import React, { useState, useEffect, useMemo } from 'react';
import { Plant, Process, Subprocess } from '../types';
import { 
    BookOpenIcon, PlusCircleIcon, SearchIcon, FilterIcon, 
    BellIcon, MicrophoneIcon, WrenchScrewdriverIcon, BeakerIcon, 
    UserIcon, XIcon, CheckCircleIcon, ArrowUpOnSquareIcon,
    CameraIcon, DocumentTextIcon, PencilIcon, PlayIcon, 
    ClockIcon, ChevronRightIcon, ChevronLeftIcon, LanguageIcon,
    SpeakerWaveIcon, ChatBubbleLeftIcon, ExclamationTriangleIcon,
    ArrowPathIcon, VideoCameraIcon, GlobeAmericasIcon, EyeIcon,
    TrashIcon, ArrowUpIcon, ArrowDownIcon, QrCodeIcon, PrinterIcon,
    ArchiveBoxIcon, ClipboardDocumentCheckIcon, ChartBarIcon, CalendarIcon
} from '../components/icons/Icons';

interface WorkInstructionsProps {
    plants: Plant[];
}

type InstructionStatus = 'active' | 'review' | 'obsolete' | 'draft';

interface InstructionStep {
    id: number;
    title: string;
    description: string;
    media: { type: 'image' | 'video'; url: string }[]; 
    qualityCheck?: string;
    safetyRisk?: string;
    troubleshooting?: string;
}

interface WorkInstruction {
    id: string;
    code: string;
    title: string;
    objective: string;
    version: string;
    status: InstructionStatus;
    plantId: string;
    processId: string;
    subprocessId: string;
    lastUpdated: string;
    creator: string; 
    estimatedTime: string; 
    tools: string[];
    supplies: string[];
    skills: string[];
    thumbnailUrl?: string;
    steps: InstructionStep[];
    history: { date: string; user: string; action: string }[];
    validationMethod?: 'photo' | 'measurement' | 'check';
    expectedResult?: {
        title: string;
        description: string;
        visualUrls: string[]; 
        requiresValidation: boolean;
        requiresTime: boolean;
    };
    languages?: string[];
    accessibilityLevel?: 'novice' | 'expert';
    assignedRoles?: string[];
}

// New Interface for Assigned Tasks
interface AssignedTask {
    id: string;
    workInstruction: WorkInstruction;
    priority: 'P1' | 'P2' | 'P3';
    urgency: 'U1' | 'U2' | 'U3';
    assignedTo: string;
    assignedAt: string; // ISO Date
    startedAt?: string; // ISO Date (When execution began)
    dueDate: string; // ISO Date
    status: 'pending' | 'in_progress' | 'completed';
    result?: 'pass' | 'fail';
    completionTime?: string;
    machineContext: string;
    timeEst: string; // Added to track assigned time
}

// --- MOCK DATA GENERATOR ---
const generateMockInstructions = (plants: Plant[]): WorkInstruction[] => {
    const instructions: WorkInstruction[] = [];
    const toolsList = ['Llave Allen 5mm', 'Torquímetro Digital', 'Multímetro Fluke', 'Destornillador Phillips', 'Scanner QR'];
    const suppliesList = ['Grasa Litio', 'Trapo Industrial', 'Sensor Proxy M12', 'Etiquetas ID', 'Cinta Aislante'];
    const skillsList = ['Cert. LOTO', 'Trabajo Alturas', 'Seguridad Eléctrica', 'Mecánica Básica', 'Inspector Calidad'];
    const creators = ['Ana Lopez', 'Carlos Ruiz', 'Juan Perez', 'Maria Garcia'];

    plants.forEach(plant => {
        plant.processes.forEach(proc => {
            proc.subprocesses.forEach(sub => {
                const count = Math.floor(Math.random() * 2) + 1;
                for (let i = 0; i < count; i++) {
                    const statusRand = Math.random();
                    const status: InstructionStatus = statusRand > 0.8 ? 'review' : statusRand > 0.9 ? 'obsolete' : 'active';
                    
                    instructions.push({
                        id: `wi-${plant.id}-${proc.id}-${sub.id}-${i}`,
                        code: `INS-${sub.name.substring(0,3).toUpperCase()}-${100+i}`,
                        title: `Operación Estándar: ${sub.name} - Tarea ${i+1}`,
                        objective: `Asegurar el correcto ensamblaje y verificación de los componentes en la estación de ${sub.name} cumpliendo con los estándares de calidad.`,
                        version: `2.${Math.floor(Math.random()*5)}`,
                        status: status,
                        plantId: plant.id,
                        processId: proc.id,
                        subprocessId: sub.id,
                        lastUpdated: new Date().toLocaleDateString(),
                        creator: creators[Math.floor(Math.random() * creators.length)],
                        estimatedTime: `${Math.floor(Math.random() * 45 + 15)} min`,
                        tools: [toolsList[i % toolsList.length], toolsList[(i+1) % toolsList.length]],
                        supplies: [suppliesList[i % suppliesList.length]],
                        skills: [skillsList[i % skillsList.length]],
                        thumbnailUrl: `https://picsum.photos/seed/${plant.id}${proc.id}${sub.id}${i}/400/300`,
                        history: [
                            { date: '2023-10-01', user: 'Ana Lopez', action: 'Creación inicial' },
                            { date: '2023-11-15', user: 'Carlos Ruiz', action: 'Actualización pasos 2-3' }
                        ],
                        steps: [
                            { 
                                id: 1, 
                                title: 'Preparación de Área', 
                                description: 'Verificar que el área esté limpia y libre de obstáculos. Confirmar que todas las herramientas estén calibradas.',
                                safetyRisk: 'Riesgo de tropiezo',
                                media: [{ type: 'image', url: `https://picsum.photos/seed/step1-${i}/800/600` }]
                            },
                            { 
                                id: 2, 
                                title: 'Montaje de Componente', 
                                description: 'Colocar el componente A sobre la base B alineando los pines guía. Aplicar presión suave hasta escuchar un clic.',
                                qualityCheck: 'Verificar holgura < 1mm',
                                media: [{ type: 'image', url: `https://picsum.photos/seed/step2-${i}/800/600` }, { type: 'image', url: `https://picsum.photos/seed/step2b-${i}/800/600` }]
                            },
                            { 
                                id: 3, 
                                title: 'Validación Final', 
                                description: 'Escanear el código QR del ensamble terminado para registrar la producción en el sistema MES.',
                                media: [{ type: 'image', url: `https://picsum.photos/seed/step3-${i}/800/600` }]
                            }
                        ],
                        expectedResult: {
                            title: 'Componente Ensamblado',
                            description: 'El componente debe estar firmemente sujeto, sin holguras visibles y con la etiqueta QR orientada hacia el frente.',
                            visualUrls: [`https://picsum.photos/seed/result-${i}/800/600`, `https://picsum.photos/seed/resultb-${i}/800/600`],
                            requiresValidation: true,
                            requiresTime: false
                        },
                        validationMethod: 'photo',
                        accessibilityLevel: 'expert',
                        languages: ['ES', 'EN']
                    });
                }
            });
        });
    });
    return instructions;
};

const generateMockAssignedTasks = (instructions: WorkInstruction[]): AssignedTask[] => {
    const users = ['Juan Pérez', 'Carlos Ruiz', 'Maria Garcia', 'Pedro Gomez'];
    const priorities: AssignedTask['priority'][] = ['P1', 'P2', 'P3'];
    const urgencies: AssignedTask['urgency'][] = ['U1', 'U2', 'U3'];
    const tasks: AssignedTask[] = [];

    // Create 15 assigned tasks from random instructions
    for(let i = 0; i < 25; i++) {
        const instr = instructions[Math.floor(Math.random() * instructions.length)];
        const now = new Date();
        const assignedAt = new Date(now.getTime() - Math.floor(Math.random() * 10 * 24 * 60 * 60 * 1000));
        const dueDate = new Date(assignedAt.getTime() + 24 * 60 * 60 * 1000);
        const isCompleted = Math.random() > 0.4;
        
        // Simulating start/end times
        const startedAt = new Date(assignedAt.getTime() + Math.random() * 2 * 3600000); 
        const completionTime = isCompleted ? new Date(startedAt.getTime() + Math.random() * 4 * 3600000).toISOString() : undefined;

        tasks.push({
            id: `task-${i}`,
            workInstruction: instr,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
            assignedTo: users[Math.floor(Math.random() * users.length)],
            assignedAt: assignedAt.toISOString(),
            startedAt: isCompleted || Math.random() > 0.5 ? startedAt.toISOString() : undefined,
            dueDate: dueDate.toISOString(),
            status: isCompleted ? 'completed' : (Math.random() > 0.5 ? 'in_progress' : 'pending'),
            result: isCompleted ? (Math.random() > 0.1 ? 'pass' : 'fail') : undefined,
            completionTime: completionTime,
            machineContext: `Máquina ${['A', 'B', 'C'][Math.floor(Math.random()*3)]}-${Math.floor(Math.random()*10)}`,
            timeEst: instr.estimatedTime
        });
    }
    return tasks.sort((a,b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
}

// --- HELPERS ---

const formatElapsedTime = (ms: number) => {
    if (ms < 0) ms = 0;
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    const padHours = (n: number) => n.toString().padStart(3, '0');

    return `${padHours(hours)}:${pad(minutes)}:${pad(seconds)}`;
};

// --- SUB-COMPONENTS ---

const StatusBadge: React.FC<{ status: InstructionStatus }> = ({ status }) => {
    const styles = {
        active: 'bg-green-100 text-green-700 border-green-200',
        review: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        obsolete: 'bg-red-100 text-red-700 border-red-200 line-through decoration-red-500',
        draft: 'bg-gray-100 text-gray-700 border-gray-200 dashed',
    };
    const labels = {
        active: 'Activa',
        review: 'Revisión',
        obsolete: 'Obsoleta',
        draft: 'Borrador'
    };
    return (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${styles[status]}`}>
            {labels[status]}
        </span>
    );
};

const ResourcePill: React.FC<{ count: number, icon: React.ReactNode, color: string, title: string }> = ({ count, icon, color, title }) => (
    <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full border ${color} bg-opacity-10 text-[10px]`} title={title}>
        {icon}
        <span className="font-bold">{count}</span>
    </div>
);

// --- ASSIGN MODAL ---
interface AssignModalProps {
    isOpen: boolean;
    onClose: () => void;
    instructions: WorkInstruction[];
    onAssign: (data: any) => void;
}

const AssignInstructionModal: React.FC<AssignModalProps> = ({ isOpen, onClose, instructions, onAssign }) => {
    const [selectedId, setSelectedId] = useState('');
    const [priority, setPriority] = useState('P3');
    const [urgency, setUrgency] = useState('U3');
    const [assignTo, setAssignTo] = useState('');
    const [machine, setMachine] = useState('');

    const selectedInstr = instructions.find(i => i.id === selectedId);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAssign({
            instruction: selectedInstr,
            priority,
            urgency,
            assignTo,
            timeEst: selectedInstr?.estimatedTime,
            machine
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-xl shadow-2xl flex flex-col">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 rounded-t-xl">
                    <h3 className="font-bold text-lg text-gray-800">Asignar Instrucción</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500"><XIcon/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la Instrucción</label>
                        <select 
                            required 
                            className="w-full p-2 border border-gray-300 rounded text-sm bg-white"
                            value={selectedId}
                            onChange={(e) => setSelectedId(e.target.value)}
                        >
                            <option value="">Seleccione una instrucción...</option>
                            {instructions.filter(i => i.status === 'active').map(i => (
                                <option key={i.id} value={i.id}>{i.title}</option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Código (Automático)</label>
                        <input disabled value={selectedInstr?.code || ''} className="w-full p-2 border border-gray-200 bg-gray-100 rounded text-sm text-gray-500 font-mono" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Prioridad</label>
                            <select value={priority} onChange={e => setPriority(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                <option value="P1">P1 - Crítica</option>
                                <option value="P2">P2 - Alta</option>
                                <option value="P3">P3 - Normal</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Urgencia</label>
                            <select value={urgency} onChange={e => setUrgency(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                <option value="U1">U1 - Inmediata</option>
                                <option value="U2">U2 - Hoy</option>
                                <option value="U3">U3 - Esta Semana</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Máquina / Contexto</label>
                            <input required value={machine} onChange={e => setMachine(e.target.value)} placeholder="Ej. Prensa 01" className="w-full p-2 border border-gray-300 rounded text-sm bg-white" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Asignar a</label>
                            <select required value={assignTo} onChange={e => setAssignTo(e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                <option value="">Seleccionar Usuario...</option>
                                <option value="Juan Pérez">Juan Pérez</option>
                                <option value="Carlos Ruiz">Carlos Ruiz</option>
                                <option value="Maria Garcia">Maria Garcia</option>
                                <option value="Pedro Gomez">Pedro Gomez</option>
                            </select>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-semibold text-sm shadow-sm">Asignar Instrucción</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

// --- RESULTS DASHBOARD ---
const ResultsDashboard: React.FC<{ tasks: AssignedTask[] }> = ({ tasks }) => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'completed');
    const passed = completed.filter(t => t.result === 'pass');
    const completionRate = total > 0 ? (completed.length / total) * 100 : 0;
    const passRate = completed.length > 0 ? (passed.length / completed.length) * 100 : 0;
    const pending = tasks.filter(t => t.status !== 'completed').length;

    // Data for charts
    const userStatsMap = tasks.reduce((acc, task) => {
        if (!acc[task.assignedTo]) acc[task.assignedTo] = { total: 0, completed: 0, passed: 0 };
        acc[task.assignedTo].total++;
        if (task.status === 'completed') {
            acc[task.assignedTo].completed++;
            if (task.result === 'pass') acc[task.assignedTo].passed++;
        }
        return acc;
    }, {} as Record<string, { total: number, completed: number, passed: number }>);

    const userStats = (Object.entries(userStatsMap) as [string, { total: number, completed: number, passed: number }][])
    .map(([name, stats]) => ({
        name,
        ...stats,
        completionRate: stats.total > 0 ? (stats.completed / stats.total) * 100 : 0
    }))
    .sort((a, b) => b.completed - a.completed)
    .slice(0, 5);

    const instructionStatsMap = tasks.reduce((acc, task) => {
        const code = task.workInstruction.code;
        if (!acc[code]) acc[code] = { title: task.workInstruction.title, count: 0, fail: 0 };
        acc[code].count++;
        if (task.result === 'fail') acc[code].fail++;
        return acc;
    }, {} as Record<string, { title: string, count: number, fail: number }>);

    const instructionStats = (Object.entries(instructionStatsMap) as [string, { title: string, count: number, fail: number }][])
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5);

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Dashboard KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Total Asignadas</p>
                            <h3 className="text-2xl font-bold text-gray-800 mt-1">{total}</h3>
                        </div>
                        <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><ClipboardDocumentCheckIcon className="w-6 h-6"/></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{pending} pendientes actualmente</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Tasa de Cumplimiento</p>
                            <h3 className="text-2xl font-bold text-green-600 mt-1">{completionRate.toFixed(0)}%</h3>
                        </div>
                        <div className="p-2 bg-green-100 text-green-600 rounded-lg"><ChartBarIcon className="w-6 h-6"/></div>
                    </div>
                    <div className="mt-2 w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full" style={{width: `${completionRate}%`}}></div>
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Calidad (Aprobados)</p>
                            <h3 className="text-2xl font-bold text-indigo-600 mt-1">{passRate.toFixed(0)}%</h3>
                        </div>
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CheckCircleIcon className="w-6 h-6"/></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">{passed.length} verificaciones exitosas</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-xs font-bold text-gray-500 uppercase">Tiempo Promedio</p>
                            <h3 className="text-2xl font-bold text-orange-600 mt-1">42m</h3>
                        </div>
                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><ClockIcon className="w-6 h-6"/></div>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">Estimado vs Real: -5%</div>
                </div>
            </div>

            {/* PERFORMANCE CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Performance Chart */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2 border-b pb-2">
                        <UserIcon className="w-4 h-4 text-blue-500"/> Rendimiento por Usuario (Top 5)
                    </h4>
                    <div className="space-y-4">
                        {userStats.length > 0 ? userStats.map((u, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-xs mb-1">
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-600">{u.name.charAt(0)}</div>
                                        <span className="font-semibold text-gray-700">{u.name}</span>
                                    </div>
                                    <div className="text-gray-500">
                                        <span className="font-bold text-gray-800">{u.completed}</span>/{u.total} <span className="text-[10px]">({u.completionRate.toFixed(0)}%)</span>
                                    </div>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 flex overflow-hidden">
                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${u.completionRate}%` }}></div>
                                </div>
                            </div>
                        )) : <p className="text-xs text-gray-400 italic">No hay datos de usuarios disponibles.</p>}
                    </div>
                </div>

                {/* Instruction Stats Chart */}
                <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
                    <h4 className="text-sm font-bold text-gray-700 uppercase mb-4 flex items-center gap-2 border-b pb-2">
                        <DocumentTextIcon className="w-4 h-4 text-purple-500"/> Instrucciones Más Frecuentes
                    </h4>
                    <div className="space-y-4">
                         {instructionStats.length > 0 ? instructionStats.map(([code, stats], i) => {
                             const maxCount = Math.max(...instructionStats.map(([, s]) => s.count));
                             const relativeWidth = (stats.count / maxCount) * 100;

                             return (
                                 <div key={i} className="text-xs">
                                     <div className="flex justify-between mb-1">
                                         <div className="flex flex-col">
                                             <span className="font-bold text-gray-800">{code}</span>
                                             <span className="text-[10px] text-gray-500 truncate w-48">{stats.title}</span>
                                         </div>
                                         <div className="text-right">
                                             <span className="font-bold text-gray-800">{stats.count}</span> <span className="text-[10px] text-gray-500">Asig.</span>
                                         </div>
                                     </div>
                                     <div className="w-full bg-gray-100 rounded-full h-2 relative overflow-hidden">
                                         <div className="absolute top-0 left-0 h-full bg-purple-500 rounded-full" style={{ width: `${relativeWidth}%` }}></div>
                                     </div>
                                     {stats.fail > 0 && (
                                         <div className="mt-0.5 text-[9px] text-red-500 font-bold text-right">
                                             {stats.fail} fallos detectados
                                         </div>
                                     )}
                                 </div>
                             );
                         }) : <p className="text-xs text-gray-400 italic">No hay datos de instrucciones.</p>}
                    </div>
                </div>
            </div>

            {/* Historical Table */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                    <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                        <ArchiveBoxIcon className="w-4 h-4"/> Historial de Resultados
                    </h3>
                    <div className="flex gap-2">
                        <button className="text-xs bg-white border border-gray-300 px-3 py-1 rounded hover:bg-gray-50">Exportar CSV</button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-gray-500 font-bold text-xs uppercase border-b border-gray-200">
                            <tr>
                                <th className="p-3">Fecha</th>
                                <th className="p-3">Instrucción</th>
                                <th className="p-3">Usuario</th>
                                <th className="p-3">Contexto</th>
                                <th className="p-3 text-center">Resultado</th>
                                <th className="p-3 text-center">Duración</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {tasks.filter(t => t.status === 'completed').map(task => {
                                const durationMs = task.startedAt && task.completionTime 
                                    ? new Date(task.completionTime).getTime() - new Date(task.startedAt).getTime()
                                    : 0;
                                const durationStr = formatElapsedTime(durationMs);

                                return (
                                <tr key={task.id} className="hover:bg-gray-50">
                                    <td className="p-3 text-xs text-gray-600">
                                        {task.completionTime ? new Date(task.completionTime).toLocaleDateString() : '-'}
                                        <div className="text-[10px] text-gray-400">{task.completionTime ? new Date(task.completionTime).toLocaleTimeString() : ''}</div>
                                    </td>
                                    <td className="p-3">
                                        <div className="font-bold text-gray-800 text-xs">{task.workInstruction.code}</div>
                                        <div className="text-xs text-gray-500 truncate w-48" title={task.workInstruction.title}>{task.workInstruction.title}</div>
                                    </td>
                                    <td className="p-3 text-xs">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">
                                                {task.assignedTo.charAt(0)}
                                            </div>
                                            {task.assignedTo}
                                        </div>
                                    </td>
                                    <td className="p-3 text-xs text-gray-600">{task.machineContext}</td>
                                    <td className="p-3 text-center">
                                        {task.result === 'pass' ? (
                                            <span className="inline-flex items-center gap-1 bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-green-200">
                                                <CheckCircleIcon className="w-3 h-3"/> Aprobado
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-red-200">
                                                <ExclamationTriangleIcon className="w-3 h-3"/> Fallido
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-3 text-center text-xs font-mono text-gray-600">
                                        {durationStr}
                                    </td>
                                </tr>
                            )})}
                            {tasks.filter(t => t.status === 'completed').length === 0 && (
                                <tr>
                                    <td colSpan={6} className="text-center py-8 text-gray-400">
                                        No hay historial de instrucciones completadas.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- NEW ASSIGNMENTS DASHBOARD ---
const ActiveAssignmentsDashboard: React.FC<{ 
    tasks: AssignedTask[], 
    plants: Plant[],
    onStartTask: (taskId: string) => void,
    onOpenTask: (task: AssignedTask) => void
}> = ({ tasks, plants, onStartTask, onOpenTask }) => {
    // Filters
    const [plantId, setPlantId] = useState('');
    const [processId, setProcessId] = useState('');
    const [subprocessId, setSubprocessId] = useState('');
    const [user, setUser] = useState('');

    // Unique users for filter
    const users = Array.from(new Set(tasks.map(t => t.assignedTo)));

    const availableProcesses = plants.find(p => p.id === plantId)?.processes || [];
    const availableSubprocesses = availableProcesses.find(p => p.id === processId)?.subprocesses || [];

    const filteredTasks = useMemo(() => {
        return tasks.filter(t => {
            if (t.status === 'completed') return false; // Only show active
            
            const matchPlant = !plantId || t.workInstruction.plantId === plantId;
            const matchProcess = !processId || t.workInstruction.processId === processId;
            const matchSubprocess = !subprocessId || t.workInstruction.subprocessId === subprocessId;
            const matchUser = !user || t.assignedTo === user;

            return matchPlant && matchProcess && matchSubprocess && matchUser;
        });
    }, [tasks, plantId, processId, subprocessId, user]);

    return (
        <div className="space-y-6 animate-fade-in flex flex-col h-full">
            {/* Filters Bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-wrap gap-3 items-end">
                <div className="flex items-center gap-2 text-gray-500 mr-2 pb-2">
                    <FilterIcon className="w-5 h-5"/>
                    <span className="text-sm font-bold">Filtros</span>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Planta</label>
                    <select value={plantId} onChange={e => {setPlantId(e.target.value); setProcessId(''); setSubprocessId('');}} className="p-2 border border-gray-300 rounded text-xs bg-white w-40">
                        <option value="">Todas</option>
                        {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Proceso</label>
                    <select value={processId} onChange={e => {setProcessId(e.target.value); setSubprocessId('');}} className="p-2 border border-gray-300 rounded text-xs bg-white w-40" disabled={!plantId}>
                        <option value="">Todos</option>
                        {availableProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Subproceso</label>
                    <select value={subprocessId} onChange={e => setSubprocessId(e.target.value)} className="p-2 border border-gray-300 rounded text-xs bg-white w-40" disabled={!processId}>
                        <option value="">Todos</option>
                        {availableSubprocesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                <div>
                    <label className="text-[10px] font-bold text-gray-400 uppercase block mb-1">Persona</label>
                    <select value={user} onChange={e => setUser(e.target.value)} className="p-2 border border-gray-300 rounded text-xs bg-white w-40">
                        <option value="">Todas</option>
                        {users.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                </div>
                <div className="ml-auto pb-1 text-xs text-gray-500">
                    Mostrando <span className="font-bold text-blue-600">{filteredTasks.length}</span> asignaciones pendientes
                </div>
            </div>

            {/* Tasks Table */}
            <div className="flex-1 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-gray-50">
                    <h3 className="font-bold text-gray-800 text-sm uppercase flex items-center gap-2">
                        <ClipboardDocumentCheckIcon className="w-4 h-4 text-blue-600"/> Tablero de Control de Instrucciones
                    </h3>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-white text-gray-500 font-bold text-xs uppercase border-b border-gray-200 sticky top-0 z-10">
                            <tr>
                                <th className="p-3">Instrucción</th>
                                <th className="p-3">Ubicación (Proceso)</th>
                                <th className="p-3">Contexto Máquina</th>
                                <th className="p-3">Asignado a</th>
                                <th className="p-3">Fecha Límite</th>
                                <th className="p-3 w-32">Avance</th>
                                <th className="p-3 text-center">Estado</th>
                                <th className="p-3 text-center">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredTasks.length > 0 ? filteredTasks.map(task => {
                                const plantName = plants.find(p => p.id === task.workInstruction.plantId)?.name || 'Planta';
                                const procName = plants.find(p => p.id === task.workInstruction.plantId)?.processes.find(pr => pr.id === task.workInstruction.processId)?.name || 'Proceso';
                                
                                // Mock progress based on status
                                const progress = task.status === 'in_progress' ? 60 : 0; 

                                return (
                                    <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                                        <td className="p-3">
                                            <div className="font-bold text-blue-700 text-xs">{task.workInstruction.code}</div>
                                            <div className="text-xs text-gray-700 font-semibold truncate w-48" title={task.workInstruction.title}>{task.workInstruction.title}</div>
                                        </td>
                                        <td className="p-3 text-xs text-gray-500">
                                            <div className="font-medium">{plantName}</div>
                                            <div className="text-[10px]">{procName}</div>
                                        </td>
                                        <td className="p-3 text-xs text-gray-600 font-mono">
                                            {task.machineContext}
                                        </td>
                                        <td className="p-3 text-xs">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-[10px] font-bold border border-blue-200">
                                                    {task.assignedTo.charAt(0)}
                                                </div>
                                                <span className="font-medium text-gray-700">{task.assignedTo}</span>
                                            </div>
                                        </td>
                                        <td className="p-3 text-xs text-gray-600">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3 text-gray-400"/>
                                                {new Date(task.dueDate).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="p-3">
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div className={`h-full rounded-full ${progress > 0 ? 'bg-blue-500' : 'bg-gray-300'}`} style={{width: `${progress}%`}}></div>
                                            </div>
                                            <div className="text-[10px] text-right text-gray-500 mt-0.5">{progress}%</div>
                                        </td>
                                        <td className="p-3 text-center">
                                            {task.status === 'in_progress' ? (
                                                <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold border border-blue-200">
                                                    <ClockIcon className="w-3 h-3"/> En Proceso
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold border border-gray-200">
                                                    <ClockIcon className="w-3 h-3"/> Pendiente
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-3 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {task.status === 'pending' && (
                                                    <button 
                                                        onClick={() => onStartTask(task.id)}
                                                        className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold py-1 px-2 rounded transition-colors shadow-sm"
                                                        title="Iniciar Instrucción"
                                                    >
                                                        <PlayIcon className="w-3 h-3" /> Iniciar
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => onOpenTask(task)}
                                                    className="flex items-center gap-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-[10px] font-bold py-1 px-2 rounded transition-colors shadow-sm"
                                                    title="Abrir Instrucción"
                                                >
                                                    <EyeIcon className="w-3 h-3 text-indigo-600" /> Abrir
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="text-center py-10 text-gray-400">
                                        <div className="flex flex-col items-center">
                                            <ClipboardDocumentCheckIcon className="w-8 h-8 mb-2 opacity-50"/>
                                            <p>No hay asignaciones pendientes con estos filtros.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- IMAGE VIEWER MODAL ---
const ImageViewerModal: React.FC<{ isOpen: boolean; url: string | null; onClose: () => void }> = ({ isOpen, url, onClose }) => {
    const [scale, setScale] = useState(1);
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        setScale(1);
        setRotation(0);
    }, [url]);

    if (!isOpen || !url) return null;

    const handleZoomIn = (e: React.MouseEvent) => { e.stopPropagation(); setScale(prev => Math.min(prev + 0.5, 4)); };
    const handleZoomOut = (e: React.MouseEvent) => { e.stopPropagation(); setScale(prev => Math.max(prev - 0.5, 0.5)); };
    const handleRotate = (e: React.MouseEvent) => { e.stopPropagation(); setRotation(prev => (prev + 90) % 360); };
    const handleReset = (e: React.MouseEvent) => { e.stopPropagation(); setScale(1); setRotation(0); };
    const handleDownload = (e: React.MouseEvent) => {
        e.stopPropagation();
        const link = document.createElement('a');
        link.href = url;
        link.download = 'evidencia-instruccion.jpg';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex flex-col animate-fade-in" onClick={onClose}>
            <div className="flex justify-between items-center p-4 bg-black/50 text-white z-10" onClick={e => e.stopPropagation()}>
                <h3 className="font-bold text-sm flex items-center gap-2">
                    <EyeIcon className="w-4 h-4"/> Visualizador de Evidencia
                </h3>
                <div className="flex items-center gap-2">
                    <div className="bg-gray-800 rounded-lg p-1 flex items-center gap-1 border border-gray-700">
                        <button onClick={handleZoomOut} className="p-2 hover:bg-gray-700 rounded transition-colors"><ArrowDownIcon className="w-4 h-4" /></button>
                        <span className="text-xs font-mono w-12 text-center">{(scale * 100).toFixed(0)}%</span>
                        <button onClick={handleZoomIn} className="p-2 hover:bg-gray-700 rounded transition-colors"><ArrowUpIcon className="w-4 h-4" /></button>
                    </div>
                    <button onClick={handleRotate} className="p-2 hover:bg-gray-800 rounded-full transition-colors"><ArrowPathIcon className="w-5 h-5"/></button>
                    <button onClick={handleReset} className="p-2 hover:bg-gray-800 rounded-full transition-colors text-xs font-bold px-3">Reset</button>
                    <div className="w-px h-6 bg-gray-700 mx-2"></div>
                    <button onClick={handleDownload} className="p-2 hover:bg-blue-600 rounded-full transition-colors"><ArrowUpOnSquareIcon className="w-5 h-5 rotate-180"/></button>
                    <button onClick={onClose} className="p-2 hover:bg-red-600 rounded-full transition-colors ml-2"><XIcon className="w-6 h-6"/></button>
                </div>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 cursor-grab active:cursor-grabbing" onClick={e => e.stopPropagation()}>
                <div className="transition-transform duration-200 ease-out" style={{ transform: `scale(${scale}) rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
                    <img src={url} alt="Evidence Detail" className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-sm" draggable={false}/>
                </div>
            </div>
        </div>
    );
};

// --- WIZARD COMPONENT ---
interface WizardProps {
    isOpen: boolean;
    onClose: () => void;
    plants: Plant[];
    onSave: (data: WorkInstruction) => void;
    nextCode: string; // New prop
    initialData?: WorkInstruction | null;
}

interface WizardFormState {
    code: string;
    title: string;
    description: string;
    creator: string;
    plantId: string;
    processId: string;
    subprocessId: string;
    toolsStr: string;
    suppliesStr: string;
    skillsStr: string;
    steps: InstructionStep[];
    resTitle: string;
    resDescription: string;
    resVisuals: string[];
    resValidation: boolean;
    resTime: boolean;
    estimatedTime: string; // New field
}

const CreateWizardModal: React.FC<WizardProps> = ({ isOpen, onClose, plants, onSave, nextCode, initialData }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const initialFormData: WizardFormState = {
        code: nextCode,
        title: '',
        description: '',
        creator: 'Usuario Actual',
        plantId: '',
        processId: '',
        subprocessId: '',
        toolsStr: '',
        suppliesStr: '',
        skillsStr: '',
        steps: [],
        resTitle: '',
        resDescription: '',
        resVisuals: [],
        resValidation: false,
        resTime: false,
        estimatedTime: '' // Initialize new field
    };

    const [formData, setFormData] = useState<WizardFormState>(initialFormData);

    // Reset form when modal opens or nextCode changes
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Populate from existing
                setFormData({
                    code: initialData.code,
                    title: initialData.title,
                    description: initialData.objective,
                    creator: initialData.creator,
                    plantId: initialData.plantId,
                    processId: initialData.processId,
                    subprocessId: initialData.subprocessId,
                    toolsStr: initialData.tools.join('\n'),
                    suppliesStr: initialData.supplies.join('\n'),
                    skillsStr: initialData.skills.join('\n'),
                    steps: initialData.steps,
                    resTitle: initialData.expectedResult?.title || '',
                    resDescription: initialData.expectedResult?.description || '',
                    resVisuals: initialData.expectedResult?.visualUrls || [],
                    resValidation: initialData.expectedResult?.requiresValidation || false,
                    resTime: initialData.expectedResult?.requiresTime || false,
                    estimatedTime: initialData.estimatedTime.replace(' min', '')
                });
            } else {
                setFormData({
                    ...initialFormData,
                    code: nextCode // Use sequential code
                });
            }
            setCurrentStep(1);
        }
    }, [isOpen, nextCode, initialData]);

    if (!isOpen) return null;

    const selectedPlant = plants.find(p => p.id === formData.plantId);
    const processes = selectedPlant?.processes || [];
    const selectedProcess = processes.find(p => p.id === formData.processId);
    const subprocesses = selectedProcess?.subprocesses || [];

    const updateField = (field: keyof WizardFormState, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const addStep = () => {
        const nextId = formData.steps.length + 1;
        setFormData(prev => ({ ...prev, steps: [...prev.steps, { id: nextId, title: '', description: '', media: [] }] }));
    };

    const updateStep = (index: number, field: keyof InstructionStep, value: any) => {
        const newSteps = [...formData.steps];
        // @ts-ignore
        newSteps[index][field] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const addStepImages = (index: number, files: FileList | null) => {
        if (!files) return;
        const newMedia = Array.from(files).map(f => ({
            url: URL.createObjectURL(f),
            type: f.type.startsWith('video/') ? 'video' : 'image'
        })) as { type: 'image' | 'video'; url: string }[];
        
        const newSteps = [...formData.steps];
        newSteps[index].media = [...newSteps[index].media, ...newMedia];
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const removeStepImage = (stepIndex: number, imgIndex: number) => {
        const newSteps = [...formData.steps];
        newSteps[stepIndex].media = newSteps[stepIndex].media.filter((_, i) => i !== imgIndex);
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const removeStep = (index: number) => {
        const newSteps = [...formData.steps];
        newSteps.splice(index, 1);
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const addResultImages = (files: FileList | null) => {
        if (!files) return;
        const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
        setFormData(prev => ({ ...prev, resVisuals: [...prev.resVisuals, ...newUrls] }));
    };

    const removeResultImage = (index: number) => {
        setFormData(prev => ({ ...prev, resVisuals: prev.resVisuals.filter((_, i) => i !== index) }));
    };

    const handleFinalSave = () => {
        const newInstruction: WorkInstruction = {
            id: initialData ? initialData.id : `wi-new-${Date.now()}`,
            code: formData.code,
            title: formData.title,
            objective: formData.description,
            version: '1.0',
            status: 'active',
            plantId: formData.plantId,
            processId: formData.processId,
            subprocessId: formData.subprocessId,
            lastUpdated: new Date().toLocaleDateString(),
            creator: formData.creator,
            estimatedTime: formData.estimatedTime ? `${formData.estimatedTime} min` : 'N/A',
            tools: formData.toolsStr.split('\n').filter(s => s.trim()),
            supplies: formData.suppliesStr.split('\n').filter(s => s.trim()),
            skills: formData.skillsStr.split('\n').filter(s => s.trim()),
            steps: formData.steps,
            history: [],
            expectedResult: {
                title: formData.resTitle,
                description: formData.resDescription,
                requiresValidation: formData.resValidation,
                requiresTime: formData.resTime,
                visualUrls: formData.resVisuals
            }
        };
        onSave(newInstruction);
    };

    const canProceedToNextStep = () => {
        if (currentStep === 1) {
            // Strict validation: Title, Description, Time, Tools, Supplies, Skills required.
            return formData.title.trim() !== '' && 
                   formData.estimatedTime !== '' && 
                   formData.description.trim() !== '' &&
                   formData.toolsStr.trim() !== '' &&
                   formData.suppliesStr.trim() !== '' &&
                   formData.skillsStr.trim() !== '';
        }
        if (currentStep === 3) {
            // Strict validation: Title, Description, and at least one Visual required.
            return formData.resTitle.trim() !== '' &&
                   formData.resDescription.trim() !== '' &&
                   formData.resVisuals.length > 0;
        }
        return true;
    };

    const renderStepContent = () => {
        switch(currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex justify-between items-center mb-4">
                            <span className="text-sm text-blue-800 font-bold">Código Asignado: {formData.code}</span>
                            <span className="text-xs text-blue-600">Creador: {formData.creator}</span>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la instrucción <span className="text-red-500">*</span></label>
                                <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="Ej. Ensamble de Motor"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Tiempo Estimado (minutos) <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        min="0"
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white pr-8" 
                                        value={formData.estimatedTime} 
                                        onChange={e => updateField('estimatedTime', e.target.value)} 
                                        placeholder="Ej. 45"
                                    />
                                    <span className="absolute right-3 top-2 text-xs text-gray-500 font-bold pointer-events-none">min</span>
                                </div>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción / Objetivo <span className="text-red-500">*</span></label>
                            <textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={2} value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Propósito de la instrucción..."/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Planta <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.plantId} onChange={e => updateField('plantId', e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Proceso <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.processId} onChange={e => updateField('processId', e.target.value)} disabled={!formData.plantId}>
                                    <option value="">Seleccionar...</option>
                                    {processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Subproceso <span className="text-gray-400 font-normal">(Opcional)</span></label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.subprocessId} onChange={e => updateField('subprocessId', e.target.value)} disabled={!formData.processId}>
                                    <option value="">Seleccionar...</option>
                                    {subprocesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Herramientas Necesarias <span className="text-red-500">*</span></label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.toolsStr} onChange={e => updateField('toolsStr', e.target.value)} placeholder="Una por línea..."/></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Insumos Necesarios <span className="text-red-500">*</span></label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.suppliesStr} onChange={e => updateField('suppliesStr', e.target.value)} placeholder="Una por línea..."/></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Habilidades Requeridas <span className="text-red-500">*</span></label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.skillsStr} onChange={e => updateField('skillsStr', e.target.value)} placeholder="Una por línea..."/></div>
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="space-y-4 animate-fade-in h-full flex flex-col">
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4">
                            {formData.steps.length === 0 && <div className="text-center text-gray-400 py-10 border-2 border-dashed border-gray-200 rounded-lg"><p>No hay pasos definidos.</p><p className="text-xs">Haga clic en "Siguiente Instrucción" para comenzar.</p></div>}
                            {formData.steps.map((step, idx) => (
                                <div key={step.id} className="border border-gray-300 rounded-lg p-3 bg-white relative shadow-sm">
                                    <div className="flex justify-between items-center mb-2 border-b pb-2">
                                        <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold">{idx + 1}</span>
                                        <button onClick={() => removeStep(idx)} className="p-1 text-gray-400 hover:text-red-600"><TrashIcon className="w-4 h-4"/></button>
                                    </div>
                                    <div className="space-y-3">
                                        <input type="text" placeholder="Título del Paso" value={step.title} onChange={e => updateStep(idx, 'title', e.target.value)} className="w-full font-bold text-sm border border-gray-300 rounded p-2 focus:border-blue-500 outline-none bg-white" />
                                        <textarea rows={2} placeholder="Descripción detallada del paso..." value={step.description} onChange={e => updateStep(idx, 'description', e.target.value)} className="w-full text-xs p-2 bg-white rounded border border-gray-200 focus:ring-1 focus:ring-blue-500" />
                                        <div>
                                            <div className="flex flex-wrap gap-2 mb-2">
                                                {step.media.map((item, imgIdx) => (
                                                    <div key={imgIdx} className="relative w-20 h-20 border rounded overflow-hidden group bg-gray-100 flex items-center justify-center">
                                                        {item.type === 'video' ? (
                                                            <div className="w-full h-full flex flex-col items-center justify-center text-gray-500">
                                                                <PlayIcon className="w-6 h-6"/>
                                                                <span className="text-[9px] font-bold">VIDEO</span>
                                                            </div>
                                                        ) : (
                                                            <img src={item.url} alt="" className="w-full h-full object-cover" />
                                                        )}
                                                        <button onClick={() => removeStepImage(idx, imgIdx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-3 h-3"/></button>
                                                    </div>
                                                ))}
                                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-xs text-gray-500">
                                                    <PlusCircleIcon className="w-5 h-5 mb-1"/>
                                                    Add
                                                    <input type="file" multiple accept="image/*,video/*" className="hidden" onChange={e => addStepImages(idx, e.target.files)} />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={addStep} className="w-full py-3 bg-blue-50 text-blue-700 font-bold rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">+ Siguiente Instrucción</button>
                    </div>
                );
            case 3:
                return (
                    <div className="space-y-6 animate-fade-in">
                        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Resultado de Referencia Final</h4>
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-700 mb-1">Título del Paso Final <span className="text-red-500">*</span></label><input type="text" value={formData.resTitle} onChange={e => updateField('resTitle', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white"/></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1">Descripción del Resultado <span className="text-red-500">*</span></label><textarea rows={4} value={formData.resDescription} onChange={e => updateField('resDescription', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Describa el estado final aceptable..."/></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Descriptivo Visual (Golden Samples) <span className="text-red-500">*</span></label>
                                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
                                        <div className="flex flex-wrap gap-4">
                                            {formData.resVisuals.map((url, i) => (
                                                <div key={i} className="relative w-32 h-32 border rounded-lg overflow-hidden shadow-sm group">
                                                    <img src={url} alt={`Res ${i}`} className="w-full h-full object-cover"/>
                                                    <button onClick={() => removeResultImage(i)} className="absolute top-1 right-1 bg-red-600 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-3 h-3"/></button>
                                                </div>
                                            ))}
                                            <label className="w-32 h-32 flex flex-col items-center justify-center border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"><PlusCircleIcon className="w-8 h-8 mb-1"/><span className="text-xs font-bold">Agregar Fotos</span><input type="file" multiple className="hidden" onChange={e => addResultImages(e.target.files)} /></label>
                                        </div>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2 bg-blue-50 p-2 rounded border border-blue-100 font-medium">
                                        ℹ️ Nota: Cada fotografía que se sube aquí se establece como el estándar de comparación (Golden Sample). Durante la ejecución, la evidencia del usuario será comparada contra estas imágenes.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4 pt-4">
                                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.resValidation ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>
                                        <input type="checkbox" checked={formData.resValidation} onChange={e => updateField('resValidation', e.target.checked)} className="w-5 h-5 text-blue-600"/>
                                        <div><span className="block text-sm font-bold text-gray-800">Validación de Resultado</span><span className="text-xs text-gray-500">Requiere foto de evidencia</span></div>
                                    </label>
                                    <label className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${formData.resTime ? 'bg-blue-50 border-blue-500' : 'bg-white'}`}>
                                        <input type="checkbox" checked={formData.resTime} onChange={e => updateField('resTime', e.target.checked)} className="w-5 h-5 text-blue-600"/>
                                        <div><span className="block text-sm font-bold text-gray-800">Identificación de Tiempo</span><span className="text-xs text-gray-500">Cronometrar ejecución</span></div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="h-full flex flex-col space-y-4 animate-fade-in pb-4">
                        <div className="text-center space-y-2 mb-4">
                            <h3 className="text-xl font-bold text-gray-800">Resumen de Instrucción</h3>
                            <p className="text-sm text-gray-500">Revise la totalidad de la información antes de guardar.</p>
                        </div>
                        
                        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm space-y-4 text-sm flex-1 overflow-y-auto">
                            {/* Section 1: Info */}
                            <div>
                                <h4 className="font-bold text-gray-700 uppercase text-xs border-b pb-1 mb-2">1. Información General</h4>
                                <div className="grid grid-cols-2 gap-y-2 text-gray-600">
                                    <p><span className="font-bold">Código:</span> {formData.code}</p>
                                    <p><span className="font-bold">Título:</span> {formData.title}</p>
                                    <p><span className="font-bold">Estimado:</span> {formData.estimatedTime} min</p>
                                    <p className="col-span-2"><span className="font-bold">Descripción:</span> {formData.description}</p>
                                </div>
                            </div>

                            {/* Section 2: Resources */}
                            <div>
                                <h4 className="font-bold text-gray-700 uppercase text-xs border-b pb-1 mb-2">2. Recursos</h4>
                                <div className="grid grid-cols-3 gap-2 text-xs">
                                    <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-bold block text-gray-500">Herramientas</span>
                                        <p>{formData.toolsStr.split('\n').length} items</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-bold block text-gray-500">Insumos</span>
                                        <p>{formData.suppliesStr.split('\n').length} items</p>
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded">
                                        <span className="font-bold block text-gray-500">Habilidades</span>
                                        <p>{formData.skillsStr.split('\n').length} items</p>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Steps */}
                            <div>
                                <h4 className="font-bold text-gray-700 uppercase text-xs border-b pb-1 mb-2">3. Instrucciones ({formData.steps.length} Pasos)</h4>
                                <ul className="list-decimal pl-5 space-y-1 text-gray-600 text-xs">
                                    {formData.steps.map(step => (
                                        <li key={step.id}>
                                            <span className="font-bold">{step.title}</span> 
                                            {step.media.length > 0 && <span className="text-gray-400 ml-2">({step.media.length} medios)</span>}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            {/* Section 4: Result */}
                            <div>
                                <h4 className="font-bold text-gray-700 uppercase text-xs border-b pb-1 mb-2">4. Resultado Final</h4>
                                <div className="text-gray-600">
                                    <p><span className="font-bold">Título:</span> {formData.resTitle}</p>
                                    <p className="text-xs mt-1">{formData.resDescription}</p>
                                    <div className="flex gap-2 mt-2">
                                        {formData.resVisuals.map((url, i) => (
                                            <img key={i} src={url} className="w-10 h-10 object-cover rounded border" alt="ref" />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-center pt-2">
                            <button onClick={handleFinalSave} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-transform hover:scale-105 flex items-center gap-2">
                                <ArrowUpOnSquareIcon className="w-5 h-5"/> Confirmar y Guardar
                            </button>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
                    <div><h2 className="text-xl font-bold text-gray-900">{initialData ? 'Editar Instrucción' : 'Crear Nueva Instrucción'}</h2><p className="text-xs text-gray-500">Paso {currentStep} de {totalSteps}</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-center">
                    <div className="flex items-center gap-4">
                        {['Información', 'Instrucciones', 'Resultado', 'Resumen'].map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = stepNum === currentStep;
                            const isCompleted = stepNum < currentStep;
                            return (
                                <div key={idx} className="flex items-center gap-2">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${isActive ? 'bg-blue-600 text-white' : isCompleted ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'}`}>{stepNum}</div>
                                    <span className={`text-xs font-medium hidden sm:block ${isActive ? 'text-blue-700' : 'text-gray-500'}`}>{label}</span>
                                    {stepNum < totalSteps && <div className="w-8 h-0.5 bg-gray-300 hidden sm:block"></div>}
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">{renderStepContent()}</div>
                <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
                    <div>
                        {currentStep === 1 && (
                            <button onClick={onClose} className="px-6 py-2 rounded-lg text-red-600 font-bold hover:bg-red-50 border border-transparent hover:border-red-100">Cancelar</button>
                        )}
                        {currentStep > 1 && currentStep < 4 && (
                            <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} className="px-6 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100">Atrás</button>
                        )}
                    </div>
                    {currentStep < 4 && (
                        <button 
                            onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))} 
                            disabled={!canProceedToNextStep()}
                            className={`px-8 py-2 rounded-lg font-bold shadow-md transition-transform active:scale-95 ${!canProceedToNextStep() ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                        >
                            Siguiente Paso
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const WorkInstructions: React.FC<WorkInstructionsProps> = ({ plants }) => {
    // New View Mode State
    const [viewMode, setViewMode] = useState<'library' | 'assignments' | 'results'>('library');
    const [instructions, setInstructions] = useState<WorkInstruction[]>(() => generateMockInstructions(plants));
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => generateMockAssignedTasks(instructions));
    
    // Filters
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    // Modals
    const [wizardOpen, setWizardOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);
    const [selectedInstr, setSelectedInstr] = useState<WorkInstruction | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    // Derived
    const filteredInstructions = useMemo(() => {
        return instructions.filter(i => 
            (i.title.toLowerCase().includes(search.toLowerCase()) || i.code.toLowerCase().includes(search.toLowerCase())) &&
            (!statusFilter || i.status === statusFilter)
        );
    }, [instructions, search, statusFilter]);

    const handleCreate = (data: WorkInstruction) => {
        setInstructions(prev => {
            const exists = prev.findIndex(i => i.id === data.id);
            if (exists >= 0) {
                const updated = [...prev];
                updated[exists] = data;
                return updated;
            }
            return [data, ...prev];
        });
        setWizardOpen(false);
        setSelectedInstr(null);
    };

    const handleAssign = (data: { instruction: WorkInstruction, priority: any, urgency: any, assignTo: string, timeEst: string, machine: string }) => {
        const newTask: AssignedTask = {
            id: `task-${Date.now()}`,
            workInstruction: data.instruction,
            priority: data.priority,
            urgency: data.urgency,
            assignedTo: data.assignTo,
            assignedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 86400000).toISOString(),
            status: 'pending',
            machineContext: data.machine,
            timeEst: data.timeEst
        };
        setAssignedTasks(prev => [newTask, ...prev]);
    };

    const handleStartTask = (taskId: string) => {
        setAssignedTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                return { 
                    ...task, 
                    status: 'in_progress' as const,
                    startedAt: new Date().toISOString() 
                };
            }
            return task;
        }));
    };

    const handleOpenTask = (task: AssignedTask) => {
        // For now, reuse the wizard modal in view/preview mode if needed
        // or just set selected and open a preview.
        setSelectedInstr(task.workInstruction);
        setWizardOpen(true);
    };

    return (
        <div className="h-full flex flex-col space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><ClipboardDocumentCheckIcon className="w-6 h-6"/></div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Instrucciones de Trabajo</h2>
                        <p className="text-sm text-gray-500">Biblioteca de estándares operativos y asignación de tareas.</p>
                    </div>
                </div>
                <div className="flex bg-gray-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('library')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'library' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                        <BookOpenIcon className="w-4 h-4"/> Biblioteca
                    </button>
                    <button onClick={() => setViewMode('assignments')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'assignments' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                        <ClipboardDocumentCheckIcon className="w-4 h-4"/> Asignaciones
                    </button>
                    <button onClick={() => setViewMode('results')} className={`px-4 py-2 text-sm font-bold rounded-md transition-colors flex items-center gap-2 ${viewMode === 'results' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}>
                        <ChartBarIcon className="w-4 h-4"/> Resultados
                    </button>
                </div>
            </div>

            {viewMode === 'library' && (
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                    <div className="flex justify-between items-center mb-6">
                        <div className="flex gap-4">
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Buscar instrucción..." 
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
                                />
                                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                            </div>
                            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="p-2 border border-gray-300 rounded-lg text-sm bg-white">
                                <option value="">Todos los estados</option>
                                <option value="active">Activa</option>
                                <option value="review">Revisión</option>
                                <option value="obsolete">Obsoleta</option>
                                <option value="draft">Borrador</option>
                            </select>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setAssignOpen(true)} className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2">
                                <UserIcon className="w-4 h-4"/> Asignar Tarea
                            </button>
                            <button onClick={() => { setSelectedInstr(null); setWizardOpen(true); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 shadow-sm">
                                <PlusCircleIcon className="w-4 h-4"/> Nueva Instrucción
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-4 custom-scrollbar">
                        {filteredInstructions.map(instr => (
                            <div key={instr.id} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow bg-white flex flex-col group h-[340px]">
                                <div className="h-32 bg-gray-100 relative shrink-0">
                                    <img src={instr.thumbnailUrl} className="w-full h-full object-cover" alt="thumb"/>
                                    <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                        <StatusBadge status={instr.status} />
                                    </div>
                                    <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded backdrop-blur-sm">
                                        v{instr.version}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 mr-2">
                                            <h4 className="font-bold text-gray-800 line-clamp-1 text-sm" title={instr.title}>{instr.title}</h4>
                                            <span className="text-[10px] font-mono text-gray-500 bg-gray-50 px-1 rounded border border-gray-100">{instr.code}</span>
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-600 line-clamp-3 mb-4 flex-1">{instr.objective}</p>
                                    
                                    <div className="flex flex-wrap gap-2 mb-4">
                                        <ResourcePill count={instr.tools.length} icon={<WrenchScrewdriverIcon className="w-3 h-3"/>} color="border-gray-300 text-gray-600" title="Herramientas"/>
                                        <ResourcePill count={instr.supplies.length} icon={<BeakerIcon className="w-3 h-3"/>} color="border-gray-300 text-gray-600" title="Insumos"/>
                                        <div className="flex items-center gap-1 text-[10px] text-gray-500 ml-auto font-bold bg-gray-50 px-2 py-0.5 rounded">
                                            <ClockIcon className="w-3 h-3"/> {instr.estimatedTime}
                                        </div>
                                    </div>

                                    <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                                        <div className="flex -space-x-2">
                                            {['ES','EN'].map(l => (
                                                <div key={l} className="w-5 h-5 rounded-full bg-gray-200 border border-white flex items-center justify-center text-[8px] font-bold text-gray-600" title="Idioma disponible">{l}</div>
                                            ))}
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => { setSelectedInstr(instr); setWizardOpen(true); }} className="p-1.5 hover:bg-indigo-50 rounded text-gray-400 hover:text-indigo-600 transition-colors border border-transparent hover:border-indigo-100"><PencilIcon className="w-4 h-4"/></button>
                                            <button className="p-1.5 hover:bg-green-50 rounded text-gray-400 hover:text-green-600 transition-colors border border-transparent hover:border-green-100" title="Asignar" onClick={() => {setAssignOpen(true);}}><ArrowUpOnSquareIcon className="w-4 h-4"/></button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {viewMode === 'assignments' && (
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <ActiveAssignmentsDashboard 
                        tasks={assignedTasks} 
                        plants={plants} 
                        onStartTask={handleStartTask}
                        onOpenTask={handleOpenTask}
                    />
                </div>
            )}

            {viewMode === 'results' && (
                <div className="flex-1 bg-white p-6 rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                            <ChartBarIcon className="w-5 h-5 text-indigo-600"/> Tablero de Resultados
                        </h3>
                        <div className="flex gap-3 text-xs font-medium text-gray-500 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Completado</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> En Progreso</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-300"></span> Pendiente</span>
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <ResultsDashboard tasks={assignedTasks} />
                    </div>
                </div>
            )}

            <CreateWizardModal 
                isOpen={wizardOpen} 
                onClose={() => { setWizardOpen(false); setSelectedInstr(null); }}
                plants={plants} 
                onSave={handleCreate} 
                nextCode={`INS-NEW-${Math.floor(Math.random()*1000)}`}
                initialData={selectedInstr}
            />

            <AssignInstructionModal 
                isOpen={assignOpen} 
                onClose={() => setAssignOpen(false)} 
                instructions={instructions}
                onAssign={handleAssign}
            />

            <ImageViewerModal 
                isOpen={!!previewUrl} 
                url={previewUrl} 
                onClose={() => setPreviewUrl(null)} 
            />
        </div>
    );
};

export default WorkInstructions;
