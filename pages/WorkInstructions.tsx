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
    mediaUrls: string[]; 
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
                                mediaUrls: [`https://picsum.photos/seed/step1-${i}/800/600`]
                            },
                            { 
                                id: 2, 
                                title: 'Montaje de Componente', 
                                description: 'Colocar el componente A sobre la base B alineando los pines guía. Aplicar presión suave hasta escuchar un clic.',
                                qualityCheck: 'Verificar holgura < 1mm',
                                mediaUrls: [`https://picsum.photos/seed/step2-${i}/800/600`, `https://picsum.photos/seed/step2b-${i}/800/600`]
                            },
                            { 
                                id: 3, 
                                title: 'Validación Final', 
                                description: 'Escanear el código QR del ensamble terminado para registrar la producción en el sistema MES.',
                                mediaUrls: [`https://picsum.photos/seed/step3-${i}/800/600`]
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

        tasks.push({
            id: `task-${i}`,
            workInstruction: instr,
            priority: priorities[Math.floor(Math.random() * priorities.length)],
            urgency: urgencies[Math.floor(Math.random() * urgencies.length)],
            assignedTo: users[Math.floor(Math.random() * users.length)],
            assignedAt: assignedAt.toISOString(),
            dueDate: dueDate.toISOString(),
            status: isCompleted ? 'completed' : (Math.random() > 0.5 ? 'in_progress' : 'pending'),
            result: isCompleted ? (Math.random() > 0.1 ? 'pass' : 'fail') : undefined,
            completionTime: isCompleted ? new Date(assignedAt.getTime() + Math.random() * 4 * 3600000).toISOString() : undefined,
            machineContext: `Máquina ${['A', 'B', 'C'][Math.floor(Math.random()*3)]}-${Math.floor(Math.random()*10)}`,
            timeEst: instr.estimatedTime
        });
    }
    return tasks.sort((a,b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
}

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
    const [hours, setHours] = useState(0);
    const [minutes, setMinutes] = useState(30);
    const [machine, setMachine] = useState('');

    const selectedInstr = instructions.find(i => i.id === selectedId);

    useEffect(() => {
        if(selectedInstr) {
            // Parsing existing estimated time like "45 min"
            const timeStr = selectedInstr.estimatedTime || "";
            const match = timeStr.match(/(\d+)/);
            if (match) {
                const total = parseInt(match[0], 10);
                if (total >= 60) {
                    setHours(Math.floor(total / 60));
                    setMinutes(total % 60);
                } else {
                    setHours(0);
                    setMinutes(total);
                }
            } else {
                setHours(0);
                setMinutes(30);
            }
        } else {
            setHours(0);
            setMinutes(0);
        }
    }, [selectedInstr]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const timeEst = `${hours > 0 ? `${hours}h ` : ''}${minutes}m`;
        onAssign({
            instruction: selectedInstr,
            priority,
            urgency,
            assignTo,
            timeEst,
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
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Código (Automático)</label>
                            <input disabled value={selectedInstr?.code || ''} className="w-full p-2 border border-gray-200 bg-gray-100 rounded text-sm text-gray-500 font-mono" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Tiempo Estimado</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <select 
                                        value={hours} 
                                        onChange={e => setHours(Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white appearance-none"
                                    >
                                        {Array.from({length: 13}, (_, i) => <option key={i} value={i}>{i}</option>)}
                                    </select>
                                    <span className="absolute right-3 top-2 text-xs text-gray-500 pointer-events-none font-bold">h</span>
                                </div>
                                <div className="relative flex-1">
                                    <select 
                                        value={minutes} 
                                        onChange={e => setMinutes(Number(e.target.value))}
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white appearance-none"
                                    >
                                        {Array.from({length: 12}, (_, i) => i * 5).map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>
                                    <span className="absolute right-3 top-2 text-xs text-gray-500 pointer-events-none font-bold">m</span>
                                </div>
                            </div>
                        </div>
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
                            {tasks.filter(t => t.status === 'completed').map(task => (
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
                                        {Math.floor(Math.random() * 45 + 15)}m
                                    </td>
                                </tr>
                            ))}
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
}

const CreateWizardModal: React.FC<WizardProps> = ({ isOpen, onClose, plants, onSave }) => {
    const [currentStep, setCurrentStep] = useState(1);
    const totalSteps = 4;

    const [formData, setFormData] = useState<WizardFormState>({
        code: `INS-${Math.floor(Math.random() * 10000)}`,
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
        resTime: false
    });

    if (!isOpen) return null;

    const selectedPlant = plants.find(p => p.id === formData.plantId);
    const processes = selectedPlant?.processes || [];
    const selectedProcess = processes.find(p => p.id === formData.processId);
    const subprocesses = selectedProcess?.subprocesses || [];

    const updateField = (field: keyof WizardFormState, value: any) => setFormData(prev => ({ ...prev, [field]: value }));

    const addStep = () => {
        const nextId = formData.steps.length + 1;
        setFormData(prev => ({ ...prev, steps: [...prev.steps, { id: nextId, title: '', description: '', mediaUrls: [] }] }));
    };

    const updateStep = (index: number, field: keyof InstructionStep, value: any) => {
        const newSteps = [...formData.steps];
        // @ts-ignore
        newSteps[index][field] = value;
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const addStepImages = (index: number, files: FileList | null) => {
        if (!files) return;
        const newUrls = Array.from(files).map(f => URL.createObjectURL(f));
        const newSteps = [...formData.steps];
        newSteps[index].mediaUrls = [...newSteps[index].mediaUrls, ...newUrls];
        setFormData(prev => ({ ...prev, steps: newSteps }));
    };

    const removeStepImage = (stepIndex: number, imgIndex: number) => {
        const newSteps = [...formData.steps];
        newSteps[stepIndex].mediaUrls = newSteps[stepIndex].mediaUrls.filter((_, i) => i !== imgIndex);
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
            id: `wi-new-${Date.now()}`,
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
            estimatedTime: 'N/A',
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

    const renderStepContent = () => {
        switch(currentStep) {
            case 1:
                return (
                    <div className="space-y-4 animate-fade-in">
                        <div className="bg-blue-50 border border-blue-200 rounded p-3 flex justify-between items-center mb-4">
                            <span className="text-sm text-blue-800 font-bold">Código Asignado: {formData.code}</span>
                            <span className="text-xs text-blue-600">Creador: {formData.creator}</span>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre de la instrucción</label>
                            <input type="text" className="w-full p-2 border border-gray-300 rounded text-sm bg-white" value={formData.title} onChange={e => updateField('title', e.target.value)} placeholder="Ej. Ensamble de Motor"/>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                            <textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={2} value={formData.description} onChange={e => updateField('description', e.target.value)} placeholder="Propósito de la instrucción..."/>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Planta</label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.plantId} onChange={e => updateField('plantId', e.target.value)}>
                                    <option value="">Seleccionar...</option>
                                    {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Proceso</label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.processId} onChange={e => updateField('processId', e.target.value)} disabled={!formData.plantId}>
                                    <option value="">Seleccionar...</option>
                                    {processes.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Subproceso</label>
                                <select className="w-full p-2 border rounded text-sm bg-white" value={formData.subprocessId} onChange={e => updateField('subprocessId', e.target.value)} disabled={!formData.processId}>
                                    <option value="">Seleccionar...</option>
                                    {subprocesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Herramientas Necesarias</label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.toolsStr} onChange={e => updateField('toolsStr', e.target.value)} placeholder="Una por línea..."/></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Insumos Necesarios</label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.suppliesStr} onChange={e => updateField('suppliesStr', e.target.value)} placeholder="Una por línea..."/></div>
                            <div><label className="block text-xs font-bold text-gray-700 mb-1">Habilidades Requeridas</label><textarea className="w-full p-2 border border-gray-300 rounded text-sm bg-white" rows={3} value={formData.skillsStr} onChange={e => updateField('skillsStr', e.target.value)} placeholder="Una por línea..."/></div>
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
                                                {step.mediaUrls.map((url, imgIdx) => (
                                                    <div key={imgIdx} className="relative w-20 h-20 border rounded overflow-hidden group">
                                                        <img src={url} alt="" className="w-full h-full object-cover" />
                                                        <button onClick={() => removeStepImage(idx, imgIdx)} className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl opacity-0 group-hover:opacity-100 transition-opacity"><XIcon className="w-3 h-3"/></button>
                                                    </div>
                                                ))}
                                                <label className="w-20 h-20 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 text-xs text-gray-500"><PlusCircleIcon className="w-5 h-5 mb-1"/>Add<input type="file" multiple className="hidden" onChange={e => addStepImages(idx, e.target.files)} /></label>
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
                            <h4 className="font-bold text-gray-800 mb-4 border-b pb-2">Documento de Referencia Final</h4>
                            <div className="space-y-4">
                                <div><label className="block text-xs font-bold text-gray-700 mb-1">Título del Paso Final</label><input type="text" value={formData.resTitle} onChange={e => updateField('resTitle', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white"/></div>
                                <div><label className="block text-xs font-bold text-gray-700 mb-1">Descripción del Resultado</label><textarea rows={4} value={formData.resDescription} onChange={e => updateField('resDescription', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Describa el estado final aceptable..."/></div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-2">Descriptivo Visual (Golden Samples)</label>
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
                    <div className="h-full flex flex-col items-center justify-center space-y-6 animate-fade-in text-center">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center"><CheckCircleIcon className="w-10 h-10 text-green-600"/></div>
                        <div><h3 className="text-2xl font-bold text-gray-800">¡Instrucción Lista!</h3><p className="text-gray-500 mt-2">Se han configurado {formData.steps.length} pasos y un resultado esperado.</p></div>
                        <div className="bg-gray-50 p-4 rounded-lg text-left max-w-md w-full border border-gray-200">
                            <p className="text-sm"><strong>Título:</strong> {formData.title}</p>
                            <p className="text-sm"><strong>Código:</strong> {formData.code}</p>
                            <p className="text-sm"><strong>Planta:</strong> {selectedPlant?.name || 'N/A'}</p>
                        </div>
                        <button onClick={handleFinalSave} className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold shadow-lg hover:bg-green-700 transition-transform hover:scale-105 flex items-center gap-2"><ArrowUpOnSquareIcon className="w-5 h-5"/>Guardar Instrucción</button>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
                <div className="bg-white border-b border-gray-200 p-4 flex justify-between items-center shrink-0">
                    <div><h2 className="text-xl font-bold text-gray-900">Crear Nueva Instrucción</h2><p className="text-xs text-gray-500">Paso {currentStep} de {totalSteps}</p></div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-500"><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-center">
                    <div className="flex items-center gap-4">
                        {['Información', 'Instrucciones', 'Resultado', 'Guardar'].map((label, idx) => {
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
                {currentStep < 4 && (
                    <div className="p-4 bg-white border-t border-gray-200 flex justify-between items-center shrink-0">
                        <button onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))} disabled={currentStep === 1} className="px-6 py-2 rounded-lg text-gray-600 font-bold hover:bg-gray-100 disabled:opacity-50">Atrás</button>
                        <button onClick={() => setCurrentStep(prev => Math.min(totalSteps, prev + 1))} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-transform active:scale-95">Siguiente Paso</button>
                    </div>
                )}
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---

const WorkInstructions: React.FC<WorkInstructionsProps> = ({ plants }) => {
    // State initialization
    const [allInstructions, setAllInstructions] = useState<WorkInstruction[]>(() => generateMockInstructions(plants));
    const [assignedTasks, setAssignedTasks] = useState<AssignedTask[]>(() => generateMockAssignedTasks(allInstructions));
    
    const [viewMode, setViewMode] = useState<'assigned_dashboard' | 'repository' | 'results'>('assigned_dashboard');
    const [selectedItem, setSelectedItem] = useState<WorkInstruction | null>(null);
    const [isWizardOpen, setIsWizardOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [viewerState, setViewerState] = useState<{ isOpen: boolean; url: string | null }>({ isOpen: false, url: null });
    
    // Confirmation / AI State
    const [confirmState, setConfirmState] = useState({
        isOpen: false,
        file: null as File | null,
        previewUrl: null as string | null,
        status: 'idle' as 'idle' | 'analyzing' | 'success' | 'error',
        message: ''
    });

    useEffect(() => {
        setConfirmState({ isOpen: false, file: null, previewUrl: null, status: 'idle', message: '' });
    }, [selectedItem]);

    // Table Filters for Repository
    const [tableFilters, setTableFilters] = useState({
        code: '', title: '', plant: '', process: '', subprocess: '', creator: '', resource: ''
    });

    const getNames = (inst: WorkInstruction) => {
        const plant = plants.find(p => p.id === inst.plantId);
        const process = plant?.processes.find(p => p.id === inst.processId);
        const subprocess = process?.subprocesses.find(s => s.id === inst.subprocessId);
        return {
            plantName: plant?.name || 'N/A',
            processName: process?.name || 'N/A',
            subprocessName: subprocess?.name || 'N/A'
        };
    };

    const filteredData = useMemo(() => {
        return allInstructions.filter(item => {
            const names = getNames(item);
            const resources = [...item.tools, ...item.supplies, ...item.skills].join(' ').toLowerCase();
            return (
                item.code.toLowerCase().includes(tableFilters.code.toLowerCase()) &&
                item.title.toLowerCase().includes(tableFilters.title.toLowerCase()) &&
                names.plantName.toLowerCase().includes(tableFilters.plant.toLowerCase()) &&
                names.processName.toLowerCase().includes(tableFilters.process.toLowerCase()) &&
                names.subprocessName.toLowerCase().includes(tableFilters.subprocess.toLowerCase()) &&
                item.creator.toLowerCase().includes(tableFilters.creator.toLowerCase()) &&
                resources.includes(tableFilters.resource.toLowerCase())
            );
        });
    }, [allInstructions, tableFilters, plants]);

    // Handlers
    const handleSaveNewInstruction = (newInstruction: WorkInstruction) => {
        setAllInstructions(prev => [newInstruction, ...prev]);
        setIsWizardOpen(false);
    };

    const handleAssignInstruction = (data: any) => {
        const newTask: AssignedTask = {
            id: `task-${Date.now()}`,
            workInstruction: data.instruction,
            priority: data.priority,
            urgency: data.urgency,
            assignedTo: data.assignTo,
            assignedAt: new Date().toISOString(),
            dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Default 24h
            status: 'pending',
            machineContext: data.machine,
            timeEst: data.timeEst
        };
        setAssignedTasks(prev => [newTask, ...prev]);
        setIsAssignModalOpen(false);
    };

    const handleConfirmClick = () => setConfirmState(prev => ({ ...prev, isOpen: true }));

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const url = URL.createObjectURL(file);
            setConfirmState({ ...confirmState, file: file, previewUrl: url, status: 'idle', message: '' });
        }
    };

    const handleViewImage = (url: string) => setViewerState({ isOpen: true, url });

    const runAIAnalysis = () => {
        setConfirmState(prev => ({ ...prev, status: 'analyzing' }));
        setTimeout(() => {
            const isSuccess = Math.random() > 0.2; 
            setConfirmState(prev => ({
                ...prev,
                status: isSuccess ? 'success' : 'error',
                message: isSuccess ? 'Validación Exitosa: La evidencia coincide 98% con el estándar visual.' : 'Validación Fallida: No se detecta el componente clave en la imagen.'
            }));
        }, 2000);
    };

    // New Helpers for Badges
    const getPriorityBadge = (p: 'P1' | 'P2' | 'P3') => {
        const colors = { P1: 'bg-red-100 text-red-700 border-red-200', P2: 'bg-yellow-100 text-yellow-700 border-yellow-200', P3: 'bg-blue-100 text-blue-700 border-blue-200' };
        return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[p]}`}>{p}</span>;
    };

    const getUrgencyBadge = (u: 'U1' | 'U2' | 'U3') => {
        const colors = { U1: 'bg-purple-100 text-purple-700 border-purple-200', U2: 'bg-orange-100 text-orange-700 border-orange-200', U3: 'bg-gray-100 text-gray-700 border-gray-200' };
        return <span className={`px-2 py-0.5 rounded text-xs font-bold border ${colors[u]}`}>{u}</span>;
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] relative bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-30 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg">
                        <BookOpenIcon className="w-6 h-6 text-blue-600"/>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-800 leading-none">
                            {viewMode === 'assigned_dashboard' ? 'Tablero de Asignaciones' : viewMode === 'results' ? 'Resultados Operativos' : 'Acervo de Instrucciones'}
                        </h1>
                        <p className="text-xs text-gray-500 mt-1">
                            {viewMode === 'assigned_dashboard' ? 'Monitoreo de ejecución operativa' : viewMode === 'results' ? 'Análisis de cumplimiento y efectividad' : 'Biblioteca de procedimientos estándar (SOPs)'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => setViewMode('assigned_dashboard')}
                        className={`font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm border transition-colors ${viewMode === 'assigned_dashboard' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        <ClipboardDocumentCheckIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Tablero</span>
                    </button>

                    <button 
                        onClick={() => setViewMode('repository')}
                        className={`font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm border transition-colors ${viewMode === 'repository' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        <ArchiveBoxIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Acervo</span>
                    </button>

                    <button 
                        onClick={() => setIsAssignModalOpen(true)}
                        className="font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm border bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
                    >
                        <UserIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Asignar Instrucción</span>
                    </button>

                    <button 
                        onClick={() => setViewMode('results')}
                        className={`font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 text-sm border transition-colors ${viewMode === 'results' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-300'}`}
                    >
                        <ChartBarIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Resultados</span>
                    </button>

                    <div className="w-px h-6 bg-gray-300 mx-1"></div>

                    <button 
                        onClick={() => setIsWizardOpen(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-transform active:scale-95 text-sm"
                    >
                        <PlusCircleIcon className="w-4 h-4"/>
                        <span className="hidden sm:inline">Nueva</span>
                    </button>
                </div>
            </header>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-auto p-4">
                
                {/* VIEW 1: ASSIGNED DASHBOARD (MAIN) */}
                {viewMode === 'assigned_dashboard' && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 font-bold text-xs uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-3">IT / Tiempo</th>
                                    <th className="p-3">Instrucción Asignada</th>
                                    <th className="p-3 text-center">Prioridad</th>
                                    <th className="p-3 text-center">Urgencia</th>
                                    <th className="p-3">Asignado</th>
                                    <th className="p-3 text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {assignedTasks.filter(t => t.status !== 'completed').map(task => {
                                    const timeDiff = new Date(task.dueDate).getTime() - new Date().getTime();
                                    const hoursLeft = Math.ceil(timeDiff / (1000 * 3600));
                                    const isOverdue = hoursLeft < 0;

                                    return (
                                        <tr key={task.id} className="hover:bg-blue-50 transition-colors">
                                            <td className="p-3">
                                                <div className="flex flex-col">
                                                    <span className="font-mono font-bold text-blue-600">{task.workInstruction.code}</span>
                                                    <span className={`text-[10px] font-bold mt-1 ${isOverdue ? 'text-red-500' : 'text-gray-500'}`}>
                                                        {isOverdue ? `Vencido hace ${Math.abs(hoursLeft)}h` : `${hoursLeft}h restantes`}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="font-semibold text-gray-800">{task.workInstruction.title}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <WrenchScrewdriverIcon className="w-3 h-3"/> {task.machineContext}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">{getPriorityBadge(task.priority)}</td>
                                            <td className="p-3 text-center">{getUrgencyBadge(task.urgency)}</td>
                                            <td className="p-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-xs font-bold border border-gray-300">
                                                        {task.assignedTo.charAt(0)}
                                                    </div>
                                                    <span className="text-xs font-medium text-gray-700">{task.assignedTo}</span>
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button 
                                                        onClick={() => setSelectedItem(task.workInstruction)}
                                                        className="p-1.5 text-gray-500 hover:text-blue-600 bg-white hover:bg-blue-50 border border-gray-200 rounded transition-colors"
                                                        title="Ver Detalles"
                                                    >
                                                        <EyeIcon className="w-4 h-4"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => alert(`Iniciando instrucción: ${task.workInstruction.code}`)}
                                                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded shadow-sm transition-transform active:scale-95"
                                                    >
                                                        <PlayIcon className="w-3 h-3"/> Iniciar
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                                {assignedTasks.filter(t => t.status !== 'completed').length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center py-8 text-gray-400">
                                            No hay instrucciones asignadas pendientes.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* VIEW 2: REPOSITORY (ORIGINAL VIEW) */}
                {viewMode === 'repository' && (
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden animate-fade-in">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="bg-gray-100 text-gray-600 font-bold text-xs uppercase sticky top-0 z-10 shadow-sm">
                                <tr>
                                    <th className="p-3 w-16 text-center">Ref</th>
                                    <th className="p-3">Código</th>
                                    <th className="p-3">Instrucción</th>
                                    <th className="p-3">Planta</th>
                                    <th className="p-3">Proceso</th>
                                    <th className="p-3">Subproceso</th>
                                    <th className="p-3">Creador</th>
                                    <th className="p-3 text-center">Recursos</th>
                                    <th className="p-3 text-center">Tiempo</th>
                                    <th className="p-3 text-center">Acción</th>
                                </tr>
                                <tr className="bg-gray-50 border-b border-gray-200">
                                    <th className="p-2"></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.code} onChange={e => setTableFilters({...tableFilters, code: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.title} onChange={e => setTableFilters({...tableFilters, title: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.plant} onChange={e => setTableFilters({...tableFilters, plant: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.process} onChange={e => setTableFilters({...tableFilters, process: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.subprocess} onChange={e => setTableFilters({...tableFilters, subprocess: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Filtro..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.creator} onChange={e => setTableFilters({...tableFilters, creator: e.target.value})} /></th>
                                    <th className="p-2"><input placeholder="Herramienta/Insumo..." className="w-full text-xs p-1 border rounded bg-white font-normal" value={tableFilters.resource} onChange={e => setTableFilters({...tableFilters, resource: e.target.value})} /></th>
                                    <th className="p-2"></th>
                                    <th className="p-2"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredData.map(item => {
                                    const names = getNames(item);
                                    return (
                                        <tr key={item.id} className="hover:bg-blue-50 transition-colors cursor-pointer group" onClick={() => setSelectedItem(item)}>
                                            <td className="p-3 text-center">
                                                <div className="w-10 h-10 rounded bg-gray-200 overflow-hidden border border-gray-300 mx-auto">
                                                    {item.thumbnailUrl ? <img src={item.thumbnailUrl} className="w-full h-full object-cover" alt="ref"/> : <CameraIcon className="w-5 h-5 m-2.5 text-gray-400"/>}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{item.code}</span>
                                            </td>
                                            <td className="p-3 font-semibold text-gray-800 max-w-[200px] truncate" title={item.title}>
                                                {item.title}
                                                <div className='mt-1'><StatusBadge status={item.status} /></div>
                                            </td>
                                            <td className="p-3 text-xs text-gray-600">{names.plantName}</td>
                                            <td className="p-3 text-xs text-gray-600">{names.processName}</td>
                                            <td className="p-3 text-xs text-gray-600">{names.subprocessName}</td>
                                            <td className="p-3 text-xs">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center text-[10px] font-bold">{item.creator.charAt(0)}</div>
                                                    {item.creator}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className="flex gap-2 justify-center">
                                                    <ResourcePill count={item.tools.length} icon={<WrenchScrewdriverIcon className="w-3 h-3"/>} color="border-blue-200 bg-blue-50 text-blue-700" title={item.tools.join(', ')} />
                                                    <ResourcePill count={item.supplies.length} icon={<BeakerIcon className="w-3 h-3"/>} color="border-purple-200 bg-purple-50 text-purple-700" title={item.supplies.join(', ')} />
                                                    <ResourcePill count={item.skills.length} icon={<UserIcon className="w-3 h-3"/>} color="border-orange-200 bg-orange-50 text-orange-700" title={item.skills.join(', ')} />
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <div className="inline-flex items-center gap-1 text-xs font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded">
                                                    <ClockIcon className="w-3 h-3"/> {item.estimatedTime}
                                                </div>
                                            </td>
                                            <td className="p-3 text-center">
                                                <button className="text-gray-400 hover:text-blue-600 transition-colors p-1 bg-white hover:bg-blue-50 rounded border border-transparent hover:border-blue-200">
                                                    <ArrowUpOnSquareIcon className="w-4 h-4"/>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })}
                                {filteredData.length === 0 && (
                                    <tr>
                                        <td colSpan={10} className="text-center py-8 text-gray-400">
                                            No se encontraron instrucciones con los filtros actuales.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* VIEW 3: RESULTS DASHBOARD */}
                {viewMode === 'results' && (
                    <ResultsDashboard tasks={assignedTasks} />
                )}
            </div>

            {/* WIZARD MODAL */}
            <CreateWizardModal 
                isOpen={isWizardOpen} 
                onClose={() => setIsWizardOpen(false)} 
                plants={plants} 
                onSave={handleSaveNewInstruction} 
            />

            {/* ASSIGN MODAL */}
            <AssignInstructionModal 
                isOpen={isAssignModalOpen}
                onClose={() => setIsAssignModalOpen(false)}
                instructions={allInstructions}
                onAssign={handleAssignInstruction}
            />

            {/* IMAGE VIEWER */}
            <ImageViewerModal 
                isOpen={viewerState.isOpen}
                url={viewerState.url}
                onClose={() => setViewerState({ isOpen: false, url: null })}
            />

            {/* SIDE PANEL (Detail) */}
            {selectedItem && (() => {
                const { plantName, processName, subprocessName } = getNames(selectedItem);
                return (
                    <div className="fixed inset-0 z-50 flex justify-end">
                        <div className="absolute inset-0 bg-black/30 backdrop-blur-sm transition-opacity" onClick={() => setSelectedItem(null)}></div>
                        <div className={`relative bg-white h-full shadow-2xl flex flex-col animate-slide-in-right transition-all duration-300 w-full md:w-[60%]`}>
                            
                            {/* Panel Header */}
                            <div className="p-4 border-b border-gray-200 flex flex-col bg-white z-20">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs font-bold border border-blue-200">{selectedItem.code}</span>
                                            <StatusBadge status={selectedItem.status} />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900 leading-tight pr-4">{selectedItem.title}</h2>
                                    </div>
                                    <button onClick={() => setSelectedItem(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><XIcon className="w-6 h-6 text-gray-500"/></button>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto bg-gray-50 relative p-6">
                                <div className="space-y-6">
                                    {/* Description & Context */}
                                    <section className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase mb-3 flex items-center gap-2">
                                            <DocumentTextIcon className="w-4 h-4"/> Información General
                                        </h4>
                                        <p className="text-sm text-gray-800 mb-6 leading-relaxed border-l-4 border-blue-500 pl-3 py-1 bg-blue-50/50 rounded-r">
                                            {selectedItem.objective}
                                        </p>

                                        <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Creador</span>
                                                <span className="font-semibold text-gray-700">{selectedItem.creator}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Planta</span>
                                                <span className="font-semibold text-gray-700">{plantName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Proceso</span>
                                                <span className="font-semibold text-gray-700">{processName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[10px] uppercase font-bold text-gray-400">Subproceso</span>
                                                <span className="font-semibold text-gray-700">{subprocessName}</span>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Resources Grid */}
                                    <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <h5 className="font-bold text-blue-700 text-xs mb-3 flex items-center gap-2 uppercase">
                                                <WrenchScrewdriverIcon className="w-4 h-4"/> Herramientas
                                            </h5>
                                            {selectedItem.tools.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {selectedItem.tools.map(t => <li key={t} className="text-xs text-gray-600 font-medium">{t}</li>)}
                                                </ul>
                                            ) : <span className="text-xs text-gray-400 italic">No especificadas</span>}
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <h5 className="font-bold text-purple-700 text-xs mb-3 flex items-center gap-2 uppercase">
                                                <BeakerIcon className="w-4 h-4"/> Insumos
                                            </h5>
                                            {selectedItem.supplies.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {selectedItem.supplies.map(t => <li key={t} className="text-xs text-gray-600 font-medium">{t}</li>)}
                                                </ul>
                                            ) : <span className="text-xs text-gray-400 italic">No especificados</span>}
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                            <h5 className="font-bold text-orange-700 text-xs mb-3 flex items-center gap-2 uppercase">
                                                <UserIcon className="w-4 h-4"/> Habilidades
                                            </h5>
                                            {selectedItem.skills.length > 0 ? (
                                                <ul className="list-disc pl-4 space-y-1">
                                                    {selectedItem.skills.map(t => <li key={t} className="text-xs text-gray-600 font-medium">{t}</li>)}
                                                </ul>
                                            ) : <span className="text-xs text-gray-400 italic">No especificadas</span>}
                                        </div>
                                    </section>

                                    {/* Steps Timeline */}
                                    <section>
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="font-bold text-gray-900 flex items-center gap-2">
                                                <div className="bg-gray-800 text-white p-1 rounded"><ArrowDownIcon className="w-4 h-4"/></div>
                                                Pasos de Ejecución
                                            </h4>
                                            <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-full">{selectedItem.steps.length} Pasos</span>
                                        </div>
                                        
                                        <div className="space-y-6 relative pl-4 border-l-2 border-gray-200 ml-3">
                                            {selectedItem.steps.map((step, idx) => (
                                                <div key={step.id} className="relative pl-6">
                                                    {/* Step Number Bubble */}
                                                    <div className="absolute -left-[27px] top-0 w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm border-4 border-gray-50 shadow-sm z-10">
                                                        {idx + 1}
                                                    </div>
                                                    
                                                    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
                                                        <h5 className="font-bold text-gray-800 mb-2">{step.title}</h5>
                                                        <p className="text-sm text-gray-600 mb-4">{step.description}</p>
                                                        
                                                        {step.mediaUrls && step.mediaUrls.length > 0 && (
                                                            <div className="flex gap-2 overflow-x-auto pb-2">
                                                                {step.mediaUrls.map((url, i) => (
                                                                    <div 
                                                                        key={i} 
                                                                        className="flex-shrink-0 w-32 h-24 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 cursor-zoom-in relative group"
                                                                        onClick={() => handleViewImage(url)}
                                                                    >
                                                                        <img src={url} alt={`Paso ${idx+1} img ${i+1}`} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                                                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                                                            <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md"/>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>

                                    {/* Expected Result & Confirmation */}
                                    {selectedItem.expectedResult && (
                                        <section className="bg-gradient-to-br from-green-50 to-white border border-green-200 rounded-xl p-5 shadow-sm">
                                            <h4 className="font-bold text-green-800 mb-4 flex items-center gap-2 border-b border-green-100 pb-2">
                                                <CheckCircleIcon className="w-5 h-5"/> Resultado Esperado
                                            </h4>
                                            
                                            <div className="flex flex-col gap-6">
                                                <div className="flex-1">
                                                    <h5 className="font-bold text-sm text-gray-800 mb-2">{selectedItem.expectedResult.title}</h5>
                                                    <p className="text-sm text-gray-700 leading-relaxed mb-4">{selectedItem.expectedResult.description}</p>
                                                    
                                                    <div className="flex gap-3 mb-6">
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${selectedItem.expectedResult.requiresValidation ? 'bg-blue-100 text-blue-700 border-blue-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {selectedItem.expectedResult.requiresValidation ? <CheckCircleIcon className="w-3 h-3"/> : <XIcon className="w-3 h-3"/>}
                                                            Validación Req: {selectedItem.expectedResult.requiresValidation ? 'SI' : 'NO'}
                                                        </div>
                                                        <div className={`px-3 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1 ${selectedItem.expectedResult.requiresTime ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-gray-100 text-gray-500 border-gray-200'}`}>
                                                            {selectedItem.expectedResult.requiresTime ? <ClockIcon className="w-3 h-3"/> : <XIcon className="w-3 h-3"/>}
                                                            Tiempo Req: {selectedItem.expectedResult.requiresTime ? 'SI' : 'NO'}
                                                        </div>
                                                    </div>

                                                    {/* CONFIRM RESULT SECTION */}
                                                    <div className="border-t border-green-100 pt-4">
                                                        {!confirmState.isOpen ? (
                                                            <button 
                                                                onClick={handleConfirmClick}
                                                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-lg shadow-md flex items-center justify-center gap-2 transition-transform hover:scale-105"
                                                            >
                                                                <CheckCircleIcon className="w-5 h-5"/>
                                                                Confirmar Resultado
                                                            </button>
                                                        ) : (
                                                            <div className="bg-white border border-gray-200 rounded-lg p-4 animate-fade-in shadow-sm">
                                                                <h5 className="font-bold text-gray-700 mb-3 text-sm">Subir Evidencia para Validación IA</h5>
                                                                
                                                                {!confirmState.file ? (
                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                                                            <CameraIcon className="w-8 h-8 text-gray-400 mb-2"/>
                                                                            <span className="text-xs font-bold text-gray-600">Tomar Foto</span>
                                                                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileSelect} />
                                                                        </label>
                                                                        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors">
                                                                            <ArrowUpOnSquareIcon className="w-8 h-8 text-gray-400 mb-2"/>
                                                                            <span className="text-xs font-bold text-gray-600">Subir Archivo</span>
                                                                            <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileSelect} />
                                                                        </label>
                                                                    </div>
                                                                ) : (
                                                                    <div className="space-y-4">
                                                                        <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100 max-h-48 flex justify-center group">
                                                                            {confirmState.previewUrl && (
                                                                                <img 
                                                                                    src={confirmState.previewUrl} 
                                                                                    alt="Preview" 
                                                                                    className="h-full object-contain cursor-zoom-in" 
                                                                                    onClick={() => handleViewImage(confirmState.previewUrl!)}
                                                                                />
                                                                            )}
                                                                            <button onClick={() => setConfirmState({...confirmState, file: null})} className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-red-500"><XIcon className="w-4 h-4"/></button>
                                                                            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                                                                <EyeIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md"/>
                                                                            </div>
                                                                        </div>
                                                                        
                                                                        {confirmState.status === 'idle' && (
                                                                            <button onClick={runAIAnalysis} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
                                                                                <EyeIcon className="w-4 h-4"/> Analizar con IA
                                                                            </button>
                                                                        )}

                                                                        {confirmState.status === 'analyzing' && (
                                                                            <div className="flex flex-col items-center justify-center py-4 text-blue-600">
                                                                                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-2"></div>
                                                                                <span className="text-sm font-bold animate-pulse">Analizando coincidencia...</span>
                                                                            </div>
                                                                        )}

                                                                        {(confirmState.status === 'success' || confirmState.status === 'error') && (
                                                                            <div className={`p-3 rounded-lg border ${confirmState.status === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-red-50 border-red-200 text-red-800'}`}>
                                                                                <div className="flex items-center gap-2 mb-1 font-bold">
                                                                                    {confirmState.status === 'success' ? <CheckCircleIcon className="w-5 h-5"/> : <ExclamationTriangleIcon className="w-5 h-5"/>}
                                                                                    {confirmState.status === 'success' ? 'Confirmado' : 'Rechazado'}
                                                                                </div>
                                                                                <p className="text-xs">{confirmState.message}</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {selectedItem.expectedResult.visualUrls && selectedItem.expectedResult.visualUrls.length > 0 && (
                                                    <div className="w-full">
                                                        <p className="text-[10px] text-gray-500 font-bold mb-2 uppercase">Golden Samples</p>
                                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                                                            {selectedItem.expectedResult.visualUrls.map((url, i) => (
                                                                <div 
                                                                    key={i} 
                                                                    className="bg-white p-1 border border-gray-200 rounded-lg shadow-sm cursor-zoom-in relative group"
                                                                    onClick={() => handleViewImage(url)}
                                                                >
                                                                    <img src={url} className="w-full h-24 object-cover rounded transition-transform group-hover:scale-105" alt={`Result ${i+1}`} />
                                                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center rounded-lg">
                                                                        <EyeIcon className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 drop-shadow-md"/>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })()}

            <style>{`
                @keyframes slide-in-right {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }
                .animate-slide-in-right { animation: slide-in-right 0.3s ease-out forwards; }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default WorkInstructions;