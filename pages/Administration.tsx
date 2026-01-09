
import React, { useState, useEffect } from 'react';
import { User, Role, AccessScope, Plant, UserAccessAssignment } from '../types';
import { 
    UserPlusIcon, UsersIcon, ShieldCheckIcon, SearchIcon, 
    PencilIcon, WhatsAppIcon, EmailIcon, UserIcon, 
    LockClosedIcon, BanIcon, CheckCircleIcon, XIcon,
    PlantIcon, ManufacturingIcon, ArrowDownIcon, TrashIcon, PlusIcon, EyeIcon,
    CodeBracketIcon, DocumentTextIcon
} from '../components/icons/Icons';

// --- Constants ---

interface ModuleDef {
    id: string;
    name: string;
    type: 'header' | 'item';
}

const SYSTEM_MODULES: ModuleDef[] = [
    // Auditoria Produccion Inteligente
    { id: 'h_audit', name: 'Auditoria Produccion Inteligente', type: 'header' },
    { id: 'pa_dashboard', name: 'Dashboard Auditorias Produccion', type: 'item' },
    { id: 'pa_compliance', name: 'Mapa de Cumplimiento', type: 'item' },
    { id: 'pa_forms', name: 'Reportes & Formatos', type: 'item' },

    // Monitoreo Técnico Avanzado
    { id: 'h_tech', name: 'Monitoreo Técnico Avanzado', type: 'header' },
    { id: 'ta_dashboard', name: 'Dashboard Mantenimiento', type: 'item' },
    { id: 'ta_orders', name: 'Órdenes de Trabajo', type: 'item' },
    { id: 'ta_machines', name: 'Maquinas', type: 'item' },

    // Control de Documentos
    { id: 'h_docs', name: 'Control de Documentos', type: 'header' },
    { id: 'doc_procedures', name: 'Documentos & Procedimientos', type: 'item' },
    { id: 'doc_certified', name: 'Documentos Certificados', type: 'item' },
    { id: 'doc_instructions', name: 'Instrucciones de Trabajo', type: 'item' },

    // AI Modules (Grouped visually or standalone)
    { id: 'h_ai', name: 'Módulos IA', type: 'header' }, 
    { id: 'ai_vision', name: 'AI Vision Quality Check', type: 'item' },
    { id: 'ai_crm', name: 'AI Customer Service', type: 'item' },
    { id: 'ai_rh', name: 'AI Employee Service', type: 'item' },

    // Sistema
    { id: 'h_system', name: 'Sistema', type: 'header' },
    { id: 'plants_process', name: 'Plants & Processes', type: 'item' },
    { id: 'admin', name: 'Admin', type: 'item' },
    { id: 'config', name: 'Config', type: 'item' },
];

const CAPABILITIES = [
    { id: 'view', label: 'Visualizar' },
    { id: 'create', label: 'Crear' },
    { id: 'modify', label: 'Modificar' },
    { id: 'update', label: 'Actualizar' },
    { id: 'review', label: 'Revisar' },
    { id: 'approve', label: 'Aprobar' },
    { id: 'cancel', label: 'Cancelar' },
    { id: 'delete', label: 'Borrar' },
    { id: 'obsolete', label: 'Obsoletizar' },
    { id: 'print', label: 'Imprimir' },
    { id: 'download', label: 'Descargar' },
];

// --- Mock Data Helpers ---
const genPerms = (modules: string[], caps: string[]) => {
    const perms: string[] = [];
    modules.forEach(m => caps.forEach(c => perms.push(`${m}:${c}`)));
    return perms;
};

const MOCK_ROLES: Role[] = [
    { 
        id: 'role-1', 
        name: 'Administrador', 
        description: 'Acceso total a la plataforma', 
        permissions: genPerms(SYSTEM_MODULES.filter(m => m.type === 'item').map(m=>m.id), CAPABILITIES.map(c=>c.id)) 
    },
    { 
        id: 'role-2', 
        name: 'Gerente Planta', 
        description: 'Gestión completa de su planta asignada', 
        permissions: [
            ...genPerms(['pa_dashboard', 'pa_compliance', 'ta_dashboard', 'doc_procedures', 'plants_process'], ['view', 'create', 'modify', 'update', 'print', 'download', 'review', 'approve', 'cancel']),
            ...genPerms(['admin'], ['view'])
        ] 
    },
    { 
        id: 'role-3', 
        name: 'Supervisor', 
        description: 'Supervisión operativa y validación', 
        permissions: genPerms(['pa_dashboard', 'ta_orders', 'ta_machines'], ['view', 'create', 'update', 'print', 'review', 'cancel']) 
    },
    { 
        id: 'role-4', 
        name: 'Técnico', 
        description: 'Ejecución de órdenes y mantenimiento', 
        permissions: genPerms(['ta_orders', 'ta_machines'], ['view', 'update']) 
    },
    { 
        id: 'role-5', 
        name: 'Operador', 
        description: 'Reporte de fallas y consulta básica', 
        permissions: genPerms(['ta_orders', 'doc_instructions'], ['view']) 
    },
];

const INITIAL_USERS: User[] = [
    { id: 'U-1001', employeeId: 'EMP-001', name: 'Ana Lopez', position: 'Supervisor de Producción', role: 'Supervisor', whatsapp: '5512345678', email: 'ana.lopez@company.com', status: 'active', password: 'password123', accessAssignments: [{ id: 'a1', scope: 'Proceso', plant: 'Planta Monterrey', process: 'Ensamble' }] },
    { id: 'U-1002', employeeId: 'EMP-045', name: 'Carlos Ruiz', position: 'Gerente de Planta', role: 'Gerente Planta', whatsapp: '5587654321', email: 'carlos.ruiz@company.com', status: 'active', password: 'password123', accessAssignments: [{ id: 'a2', scope: 'Planta', plant: 'Planta Monterrey' }] },
    { id: 'U-1003', employeeId: 'EMP-102', name: 'Juan Pérez', position: 'Técnico Mantenimiento', role: 'Técnico', whatsapp: '5511223344', email: 'juan.perez@company.com', status: 'active', password: 'password123', accessAssignments: [{ id: 'a3', scope: 'Planta', plant: 'Planta Monterrey' }] },
    { id: 'U-1004', employeeId: 'EMP-200', name: 'Maria Garcia', position: 'Auditor Calidad', role: 'Operador', whatsapp: '5599887766', email: 'maria.garcia@company.com', status: 'inactive', password: 'password123', accessAssignments: [{ id: 'a4', scope: 'Proceso', plant: 'Planta Guadalajara', process: 'Calidad' }] },
    { id: 'U-1005', employeeId: 'EMP-099', name: 'Pedro Gomez', position: 'Operador Línea', role: 'Operador', whatsapp: '5544332211', email: 'pedro.gomez@company.com', status: 'inactive', password: 'password123', accessAssignments: [{ id: 'a5', scope: 'Subproceso', plant: 'Planta Monterrey', process: 'Ensamble', subprocess: 'Línea 1' }] },
    { id: 'U-1006', employeeId: 'EMP-000', name: 'Admin System', position: 'IT Manager', role: 'Administrador', whatsapp: '5500000000', email: 'admin@company.com', status: 'active', password: 'admin', accessAssignments: [{ id: 'a6', scope: 'Total' }] },
];

// --- Sub-components (Extracted) ---

// --- Code Structure Modal ---
interface CodeStructureModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentPattern: string;
    onSave: (pattern: string) => void;
}

const CodeStructureModal: React.FC<CodeStructureModalProps> = ({ isOpen, onClose, currentPattern, onSave }) => {
    const [pattern, setPattern] = useState(currentPattern);
    const [preview, setPreview] = useState('');

    const generatePreview = (ptn: string) => {
        return ptn.split('').map(char => {
            if (char === 'A') return String.fromCharCode(65 + Math.floor(Math.random() * 26)); // Random Letter A-Z
            if (char === '1') return Math.floor(Math.random() * 10).toString(); // Random Number 0-9
            return char; // Separators or other chars
        }).join('');
    };

    useEffect(() => {
        if (isOpen) setPattern(currentPattern);
    }, [isOpen, currentPattern]);

    useEffect(() => {
        setPreview(generatePreview(pattern));
    }, [pattern]);

    if (!isOpen) return null;

    const handleSave = () => {
        onSave(pattern);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-700 to-blue-600 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-white flex items-center gap-2">
                        <CodeBracketIcon className="w-6 h-6 text-blue-200"/> 
                        Estructura Código de Documentos
                    </h3>
                    <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 space-y-6">
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 text-sm text-blue-800">
                        <p className="font-bold mb-2">Reglas de Definición:</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li>Usa <span className="font-bold bg-white px-1 rounded border border-blue-200">A</span> para representar una Letra.</li>
                            <li>Usa <span className="font-bold bg-white px-1 rounded border border-blue-200">1</span> para representar un Número.</li>
                            <li>Usa <span className="font-bold bg-white px-1 rounded border border-blue-200">-</span>, <span className="font-bold bg-white px-1 rounded border border-blue-200">/</span>, o <span className="font-bold bg-white px-1 rounded border border-blue-200">.</span> como separadores.</li>
                        </ul>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Definir Estructura</label>
                        <input 
                            type="text" 
                            value={pattern}
                            onChange={(e) => setPattern(e.target.value.toUpperCase())}
                            className="w-full p-3 border-2 border-blue-200 rounded-lg text-lg font-mono tracking-widest text-center uppercase focus:border-blue-500 outline-none transition-colors bg-white text-gray-900"
                            placeholder="Ej. AAA-1111-A"
                        />
                    </div>

                    <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase font-bold mb-2">Vista Previa (Ejemplo)</p>
                        <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
                            <span className="text-2xl font-mono font-bold text-gray-800 tracking-widest">{preview}</span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2">Este formato se aplicará a todos los documentos de Maquinaria y Procedimientos.</p>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-sm">Cancelar</button>
                    <button 
                        onClick={handleSave} 
                        disabled={!pattern}
                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm shadow-md transition-colors disabled:opacity-50"
                    >
                        Guardar Estructura
                    </button>
                </div>
            </div>
        </div>
    );
};

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onSave: (data: Partial<User> & { password?: string }) => void;
    plants: Plant[];
    roles: Role[];
}

const UserModal: React.FC<UserModalProps> = ({ isOpen, onClose, user, onSave, plants, roles }) => {
    const [formData, setFormData] = useState<Partial<User> & { password?: string }>({
        employeeId: '', name: '', position: '', role: '', 
        whatsapp: '', email: '', password: '', accessAssignments: []
    });
    const [showPassword, setShowPassword] = useState(false);

    // Assignment Builder state
    const [builder, setBuilder] = useState<Partial<UserAccessAssignment>>({
        scope: 'Total', plant: '', process: '', subprocess: ''
    });

    useEffect(() => {
        if (isOpen) {
            setFormData(user ? { ...user } : {
                employeeId: '', name: '', position: '', role: '', 
                whatsapp: '', email: '', password: '', accessAssignments: []
            });
            setShowPassword(false);
            setBuilder({ scope: 'Total', plant: '', process: '', subprocess: '' });
        }
    }, [isOpen, user]);

    if (!isOpen) return null;

    const availableProcesses = plants.find(p => p.name === builder.plant)?.processes || [];
    const availableSubprocesses = availableProcesses.find(p => p.name === builder.process)?.subprocesses || [];

    const handleBaseChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBuilderChange = (field: string, value: any) => {
        setBuilder(prev => {
            const updated = { ...prev, [field]: value };
            if (field === 'scope') {
                updated.plant = ''; updated.process = ''; updated.subprocess = '';
            } else if (field === 'plant') {
                updated.process = ''; updated.subprocess = '';
            } else if (field === 'process') {
                updated.subprocess = '';
            }
            return updated;
        });
    };

    const addAssignment = () => {
        if (builder.scope === 'Total' && formData.accessAssignments?.some(a => a.scope === 'Total')) return;
        
        const newAssignment: UserAccessAssignment = {
            id: `acc-${Date.now()}`,
            scope: builder.scope as AccessScope,
            plant: builder.plant,
            process: builder.process,
            subprocess: builder.subprocess
        };

        // If "Total" is added, it should ideally be the only one for logic clarity
        if (newAssignment.scope === 'Total') {
            setFormData(prev => ({ ...prev, accessAssignments: [newAssignment] }));
        } else {
            // Remove Total if we add specific ones
            setFormData(prev => ({ 
                ...prev, 
                accessAssignments: [...(prev.accessAssignments || []).filter(a => a.scope !== 'Total'), newAssignment] 
            }));
        }
    };

    const removeAssignment = (id: string) => {
        setFormData(prev => ({ ...prev, accessAssignments: prev.accessAssignments?.filter(a => a.id !== id) }));
    };

    const isBuilderValid = () => {
        if (builder.scope === 'Total') return true;
        if (builder.scope === 'Planta' && !builder.plant) return false;
        if (builder.scope === 'Proceso' && (!builder.plant || !builder.process)) return false;
        if (builder.scope === 'Subproceso' && (!builder.plant || !builder.process || !builder.subprocess)) return false;
        return true;
    };

    const isValid = () => {
        return (
            formData.name?.trim() && 
            formData.employeeId?.trim() && 
            formData.email?.trim() && 
            formData.role &&
            formData.whatsapp?.trim() &&
            formData.password?.trim() &&
            formData.accessAssignments && formData.accessAssignments.length > 0
        );
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[95vh]">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">{user ? 'Modificar Usuario' : 'Nuevo Usuario'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-5 h-5"/></button>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1 space-y-6">
                    {/* Personal Info */}
                    <div>
                        <h4 className="text-xs font-bold text-blue-600 uppercase mb-3 flex items-center gap-2 border-b border-blue-100 pb-1">
                            <UserIcon className="w-4 h-4"/> Información Personal
                        </h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Nombre Completo <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.name} onChange={e => handleBaseChange('name', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Nombre Apellido"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1"># Interno (Empleado) <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.employeeId} onChange={e => handleBaseChange('employeeId', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="EMP-000"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                                <input type="email" value={formData.email} onChange={e => handleBaseChange('email', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="correo@empresa.com"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">WhatsApp <span className="text-red-500">*</span></label>
                                <input type="tel" value={formData.whatsapp} onChange={e => handleBaseChange('whatsapp', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none" placeholder="5512345678"/>
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center gap-1">
                                    <LockClosedIcon className="w-3 h-3 text-gray-500"/> 
                                    Contraseña <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        value={formData.password} 
                                        onChange={e => handleBaseChange('password', e.target.value)} 
                                        className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-blue-500 outline-none pr-10" 
                                        placeholder="Asignar contraseña..."
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 focus:outline-none"
                                        tabIndex={-1}
                                    >
                                        <EyeIcon className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Role & Permissions */}
                    <div>
                        <h4 className="text-xs font-bold text-purple-600 uppercase mb-3 flex items-center gap-2 border-b border-purple-100 pb-1">
                            <ShieldCheckIcon className="w-4 h-4"/> Roles y Permisos
                        </h4>
                        
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Puesto <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.position} onChange={e => handleBaseChange('position', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none" placeholder="Ej. Supervisor"/>
                            </div>
                            <div>
                                <label className="text-xs font-bold text-gray-700 block mb-1">Rol de Sistema <span className="text-red-500">*</span></label>
                                <select value={formData.role} onChange={e => handleBaseChange('role', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-2 focus:ring-purple-500 outline-none">
                                    <option value="">Seleccionar...</option>
                                    {roles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                                </select>
                            </div>
                        </div>

                        {/* ACCESS BUILDER */}
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <h5 className="text-[10px] font-bold text-gray-400 uppercase mb-3">Definir Niveles de Acceso</h5>
                            
                            <div className="flex flex-wrap gap-2 items-end">
                                <div className="flex-1 min-w-[120px]">
                                    <label className="text-[10px] font-bold text-gray-600 block mb-1">Alcance</label>
                                    <select 
                                        value={builder.scope} 
                                        onChange={e => handleBuilderChange('scope', e.target.value)}
                                        className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white focus:ring-1 focus:ring-blue-500"
                                    >
                                        <option value="Total">Total</option>
                                        <option value="Planta">Planta</option>
                                        <option value="Proceso">Proceso</option>
                                        <option value="Subproceso">Subproceso</option>
                                    </select>
                                </div>

                                {builder.scope !== 'Total' && (
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Planta</label>
                                        <select 
                                            value={builder.plant} 
                                            onChange={e => handleBuilderChange('plant', e.target.value)}
                                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                                        >
                                            <option value="">Elegir...</option>
                                            {plants.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {(builder.scope === 'Proceso' || builder.scope === 'Subproceso') && (
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Proceso</label>
                                        <select 
                                            value={builder.process} 
                                            onChange={e => handleBuilderChange('process', e.target.value)}
                                            disabled={!builder.plant}
                                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                                        >
                                            <option value="">Elegir...</option>
                                            {availableProcesses.map(p => <option key={p.id} value={p.name}>{p.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                {builder.scope === 'Subproceso' && (
                                    <div className="flex-1 min-w-[120px]">
                                        <label className="text-[10px] font-bold text-gray-600 block mb-1">Subproceso</label>
                                        <select 
                                            value={builder.subprocess} 
                                            onChange={e => handleBuilderChange('subprocess', e.target.value)}
                                            disabled={!builder.process}
                                            className="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                                        >
                                            <option value="">Elegir...</option>
                                            {availableSubprocesses.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                                        </select>
                                    </div>
                                )}

                                <button 
                                    onClick={addAssignment}
                                    disabled={!isBuilderValid()}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-xs font-bold shadow-sm disabled:opacity-50 transition-colors"
                                >
                                    Agregar
                                </button>
                            </div>

                            {/* ASSIGNED LEVELS LIST */}
                            <div className="mt-4 space-y-2">
                                <p className="text-[10px] font-bold text-gray-500 uppercase">Niveles Asignados:</p>
                                <div className="flex flex-wrap gap-2">
                                    {formData.accessAssignments?.map(acc => (
                                        <div key={acc.id} className="bg-white border border-blue-200 rounded-lg p-2 pr-1 shadow-sm flex items-center gap-3 animate-fade-in">
                                            <div className="flex flex-col">
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-[9px] font-black uppercase px-1 rounded ${acc.scope === 'Total' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>{acc.scope}</span>
                                                    <span className="text-xs font-bold text-gray-700">{acc.plant || (acc.scope === 'Total' ? 'Acceso Global' : '')}</span>
                                                </div>
                                                {acc.process && <p className="text-[10px] text-gray-500">{acc.process} {acc.subprocess ? `> ${acc.subprocess}` : ''}</p>}
                                            </div>
                                            <button onClick={() => removeAssignment(acc.id)} className="text-gray-300 hover:text-red-500 p-1 transition-colors"><TrashIcon className="w-4 h-4"/></button>
                                        </div>
                                    ))}
                                    {(!formData.accessAssignments || formData.accessAssignments.length === 0) && (
                                        <p className="text-xs text-gray-400 italic py-2">Sin accesos configurados. Agregue al menos uno.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded font-semibold text-sm">Cancelar</button>
                    <button 
                        onClick={() => onSave(formData)} 
                        disabled={!isValid()}
                        className={`px-6 py-2 text-white rounded font-bold text-sm shadow-md transition-colors ${isValid() ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'}`}
                    >
                        Guardar Usuario
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Role Definition Modal ---
interface RoleModalProps {
    isOpen: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    initialData?: { name: string; description: string };
    onSave: (name: string, description: string) => void;
}

const RoleModal: React.FC<RoleModalProps> = ({ isOpen, onClose, mode, initialData, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    useEffect(() => {
        if (isOpen) {
            setName(initialData?.name || '');
            setDescription(initialData?.description || '');
        }
    }, [isOpen, initialData]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(name, description);
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 p-4 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-800">{mode === 'create' ? 'Crear Nuevo Rol' : 'Editar Rol'}</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors"><XIcon className="w-5 h-5"/></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Nombre del Rol <span className="text-red-500">*</span></label>
                        <input 
                            required 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                            placeholder="Ej. Auditor de Calidad"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">Descripción</label>
                        <textarea 
                            value={description} 
                            onChange={(e) => setDescription(e.target.value)} 
                            rows={3}
                            className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" 
                            placeholder="Describe el alcance de este rol..."
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded font-semibold text-sm">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-bold text-sm shadow-sm">
                            Guardar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface RolesViewProps {
    roles: Role[];
    setRoles: React.Dispatch<React.SetStateAction<Role[]>>;
    users: User[];
}

const RolesView: React.FC<RolesViewProps> = ({ roles, setRoles, users }) => {
    // Local State
    const [selectedRoleId, setSelectedRoleId] = useState<string>(roles.length > 0 ? roles[0].id : '');
    const [localPermissions, setLocalPermissions] = useState<string[]>([]);
    
    // Modal State
    const [roleModal, setRoleModal] = useState<{isOpen: boolean, mode: 'create' | 'edit', roleId?: string}>({ isOpen: false, mode: 'create' });

    // Find the full role object based on ID
    const selectedRole = roles.find(r => r.id === selectedRoleId) || roles[0];

    // Initial load when ID changes
    useEffect(() => {
        if (selectedRole) {
            setLocalPermissions(selectedRole.permissions);
        }
    }, [selectedRoleId, roles]); 

    // Helper to toggle a specific permission locally
    const togglePermission = (moduleId: string, capId: string) => {
        const permString = `${moduleId}:${capId}`;
        setLocalPermissions(prev => {
            if (prev.includes(permString)) {
                return prev.filter(p => p !== permString);
            } else {
                return [...prev, permString];
            }
        });
    };

    const hasPermission = (moduleId: string, capId: string) => {
        return localPermissions.includes(`${moduleId}:${capId}`);
    };

    const handleSavePermissions = () => {
        // Persist changes to the parent state
        setRoles(prev => prev.map(r => r.id === selectedRoleId ? { ...r, permissions: localPermissions } : r));
        // You might want to show a toast here in a real app
        alert(`Permisos guardados para el rol ${selectedRole.name}`);
    };

    // Role Management Handlers
    const handleCreateRole = () => {
        setRoleModal({ isOpen: true, mode: 'create' });
    };

    const handleEditRole = (roleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setRoleModal({ isOpen: true, mode: 'edit', roleId });
    };

    const handleDeleteRole = (roleId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        const roleToDelete = roles.find(r => r.id === roleId);
        if (!roleToDelete) return;

        // Validation: Check for active users
        const activeUsersCount = users.filter(u => u.role === roleToDelete.name && u.status === 'active').length;
        
        if (activeUsersCount > 0) {
            alert(`No se puede eliminar el rol "${roleToDelete.name}" porque tiene ${activeUsersCount} usuarios activos asignados.`);
            return;
        }

        if (confirm(`¿Está seguro que desea eliminar el rol "${roleToDelete.name}"? Esta acción no se puede deshacer.`)) {
            const newRoles = roles.filter(r => r.id !== roleId);
            setRoles(newRoles);
            // If we deleted the selected role, switch selection
            if (selectedRoleId === roleId && newRoles.length > 0) {
                setSelectedRoleId(newRoles[0].id);
            }
        }
    };

    const handleSaveRoleData = (name: string, description: string) => {
        if (roleModal.mode === 'create') {
            const newRole: Role = {
                id: `role-${Date.now()}`,
                name,
                description,
                permissions: [] // Start empty
            };
            setRoles(prev => [...prev, newRole]);
            setSelectedRoleId(newRole.id); // Auto-select new role
        } else if (roleModal.mode === 'edit' && roleModal.roleId) {
            setRoles(prev => prev.map(r => r.id === roleModal.roleId ? { ...r, name, description } : r));
        }
        setRoleModal({ isOpen: false, mode: 'create' });
    };

    return (
        <div className="flex flex-col lg:flex-row h-full gap-6 animate-fade-in overflow-hidden relative">
            {/* Roles List (Left) */}
            <div className="w-full lg:w-1/4 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col shrink-0">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h4 className="font-bold text-gray-700">Roles Definidos</h4>
                    <button 
                        onClick={handleCreateRole}
                        className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded border border-blue-200 font-bold hover:bg-blue-100 flex items-center gap-1"
                    >
                        <PlusIcon className="w-3 h-3"/> Nuevo
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {roles.map(role => (
                        <button 
                            key={role.id}
                            onClick={() => setSelectedRoleId(role.id)}
                            className={`w-full text-left p-3 rounded-lg text-sm flex justify-between items-center transition-all group ${selectedRoleId === role.id ? 'bg-blue-600 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <ShieldCheckIcon className={`w-4 h-4 shrink-0 ${selectedRoleId === role.id ? 'text-blue-200' : 'text-gray-400'}`}/>
                                <span className="font-semibold truncate">{role.name}</span>
                            </div>
                            
                            {/* Action Buttons (Visible on Hover or Selected) */}
                            <div className={`flex items-center gap-1 ${selectedRoleId === role.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity`}>
                                <div 
                                    onClick={(e) => handleEditRole(role.id, e)}
                                    className={`p-1 rounded cursor-pointer ${selectedRoleId === role.id ? 'hover:bg-blue-500 text-blue-200 hover:text-white' : 'hover:bg-gray-200 text-gray-400 hover:text-blue-600'}`}
                                    title="Editar nombre"
                                >
                                    <PencilIcon className="w-3 h-3"/>
                                </div>
                                <div 
                                    onClick={(e) => handleDeleteRole(role.id, e)}
                                    className={`p-1 rounded cursor-pointer ${selectedRoleId === role.id ? 'hover:bg-blue-500 text-blue-200 hover:text-red-300' : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'}`}
                                    title="Eliminar rol"
                                >
                                    <TrashIcon className="w-3 h-3"/>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Permissions Matrix (Right) */}
            <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className="bg-purple-100 p-2 rounded-lg"><LockClosedIcon className="w-6 h-6 text-purple-600"/></div>
                        <div>
                            <h3 className="text-xl font-bold text-gray-900">{selectedRole.name}</h3>
                            <p className="text-sm text-gray-500">{selectedRole.description || 'Sin descripción'}</p>
                        </div>
                    </div>
                </div>
                
                <div className="flex-1 overflow-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="p-3 text-left border-b border-gray-200 min-w-[200px]">Módulo / Página</th>
                                {CAPABILITIES.map(cap => (
                                    <th key={cap.id} className="p-3 text-center border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider min-w-[60px]">
                                        <div className="flex flex-col items-center gap-1">
                                            <span>{cap.label}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {SYSTEM_MODULES.map(module => (
                                <tr key={module.id} className={`hover:bg-gray-50 transition-colors ${module.type === 'header' ? 'bg-gray-100' : ''}`}>
                                    {module.type === 'header' ? (
                                        <td colSpan={CAPABILITIES.length + 1} className="p-3 font-bold text-gray-800 text-xs uppercase tracking-wide border-t border-b border-gray-200">
                                            {module.name} <span className='font-normal text-gray-500 lowercase ml-1'>(Informativo)</span>
                                        </td>
                                    ) : (
                                        <>
                                            <td className="p-3 pl-6 font-semibold text-gray-700 border-r border-gray-100 text-xs">
                                                {module.name}
                                            </td>
                                            {CAPABILITIES.map(cap => (
                                                <td key={cap.id} className="p-3 text-center border-r border-gray-100 last:border-r-0">
                                                    <label className="inline-flex items-center justify-center cursor-pointer p-2 rounded-full hover:bg-blue-50 transition-colors">
                                                        <input 
                                                            type="checkbox" 
                                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                                            checked={hasPermission(module.id, cap.id)}
                                                            onChange={() => togglePermission(module.id, cap.id)}
                                                        />
                                                    </label>
                                                </td>
                                            ))}
                                        </>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end bg-gray-50">
                    <button 
                        onClick={handleSavePermissions}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-sm transition-colors"
                    >
                        Guardar Cambios
                    </button>
                </div>
            </div>

            {/* Role Definition Modal */}
            <RoleModal 
                isOpen={roleModal.isOpen}
                mode={roleModal.mode}
                onClose={() => setRoleModal({...roleModal, isOpen: false})}
                onSave={handleSaveRoleData}
                initialData={roleModal.mode === 'edit' ? { name: roles.find(r => r.id === roleModal.roleId)?.name || '', description: roles.find(r => r.id === roleModal.roleId)?.description || '' } : undefined}
            />
        </div>
    );
};

// --- Main Administration Page ---

type AdminTab = 'active_users' | 'inactive_users' | 'roles';

interface AdministrationProps {
    plants: Plant[];
    docCodePattern: string;
    setDocCodePattern: (pattern: string) => void;
}

const Administration: React.FC<AdministrationProps> = ({ plants, docCodePattern, setDocCodePattern }) => {
    const [currentTab, setCurrentTab] = useState<AdminTab>('active_users');
    const [users, setUsers] = useState<User[]>(INITIAL_USERS);
    const [roles, setRoles] = useState<Role[]>(MOCK_ROLES);
    const [searchTerm, setSearchTerm] = useState('');
    
    // Modal State
    const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Derived Data
    const activeUsers = users.filter(u => u.status === 'active' && u.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const inactiveUsers = users.filter(u => u.status === 'inactive' && u.name.toLowerCase().includes(searchTerm.toLowerCase()));

    // Handlers
    const handleOpenUserModal = (user: User | null = null) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleSaveUser = (userData: Partial<User> & { password?: string }) => {
        if (editingUser) {
            // Edit
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...userData } as User : u));
        } else {
            // Create
            const newUser: User = {
                id: `U-${1000 + users.length + 1}`,
                status: 'active',
                ...userData as any // Type assertion for brevity in mock
            };
            setUsers(prev => [...prev, newUser]);
        }
        setIsUserModalOpen(false);
    };

    const handleToggleStatus = (userId: string) => {
        setUsers(prev => prev.map(u => {
            if (u.id === userId) {
                return { ...u, status: u.status === 'active' ? 'inactive' : 'active' };
            }
            return u;
        }));
    };

    const getAccessLevelBadge = (level: AccessScope) => {
        switch (level) {
            case 'Total': return <span className="bg-purple-100 text-purple-800 px-2 py-0.5 rounded text-[10px] font-bold border border-purple-200">Global</span>;
            case 'Planta': return <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200">Planta</span>;
            case 'Proceso': return <span className="bg-cyan-100 text-cyan-800 px-2 py-0.5 rounded text-[10px] font-bold border border-cyan-200">Proceso</span>;
            case 'Subproceso': return <span className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded text-[10px] font-bold border border-gray-200">Subproceso</span>;
            default: return null;
        }
    };

    const renderAccessColumn = (user: User) => {
        if (!user.accessAssignments || user.accessAssignments.length === 0) return '-';
        if (user.accessAssignments.some(a => a.scope === 'Total')) return <div className="flex gap-1">{getAccessLevelBadge('Total')} <span className="text-gray-400 italic">Acceso Total</span></div>;

        return (
            <div className="flex flex-wrap gap-1 max-w-[300px]">
                {user.accessAssignments.map(acc => (
                    <div key={acc.id} className="flex flex-col bg-gray-50 border border-gray-200 rounded px-1.5 py-0.5 mb-0.5">
                        <div className="flex items-center gap-1">
                            {getAccessLevelBadge(acc.scope)}
                            <span className="text-[10px] font-bold text-gray-700">{acc.plant}</span>
                        </div>
                        {acc.process && <span className="text-[9px] text-gray-500">{acc.process} {acc.subprocess ? `> ${acc.subprocess}` : ''}</span>}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col p-6 bg-gray-100 space-y-6">
            
            {/* Header / Top Bar */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Administración</h2>
                    <p className="text-sm text-gray-500">Gestión de usuarios, roles y permisos de la plataforma.</p>
                </div>
                <div className="flex flex-wrap gap-3">
                    <button 
                        onClick={() => setIsCodeModalOpen(true)}
                        className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-colors"
                    >
                        <CodeBracketIcon className="w-5 h-5 text-gray-500"/> Estructura Código Doc
                    </button>
                    <div className="w-px h-8 bg-gray-300 mx-1"></div>
                    <button 
                        onClick={() => handleOpenUserModal()}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-transform active:scale-95"
                    >
                        <UserPlusIcon className="w-5 h-5"/> Nuevo Usuario
                    </button>
                    <button 
                        onClick={() => setCurrentTab(currentTab === 'roles' ? 'active_users' : 'roles')}
                        className={`px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-colors border ${currentTab === 'roles' ? 'bg-purple-100 text-purple-700 border-purple-200' : 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200'}`}
                    >
                        {currentTab === 'roles' ? <UsersIcon className="w-5 h-5"/> : <ShieldCheckIcon className="w-5 h-5"/>}
                        {currentTab === 'roles' ? 'Usuarios Activos' : 'Roles'}
                    </button>
                    <button 
                        onClick={() => setCurrentTab(currentTab === 'inactive_users' ? 'active_users' : 'inactive_users')}
                        className={`px-4 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm font-bold transition-colors border ${currentTab === 'inactive_users' ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-500 hover:bg-gray-50 border-gray-200'}`}
                    >
                        {currentTab === 'inactive_users' ? <CheckCircleIcon className="w-5 h-5"/> : <BanIcon className="w-5 h-5"/>}
                        {currentTab === 'inactive_users' ? 'Ver Activos' : 'Usuarios Inactivos'}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden">
                {currentTab === 'roles' ? (
                    <RolesView roles={roles} setRoles={setRoles} users={users} />
                ) : (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col animate-fade-in">
                        {/* Table Header / Filters */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-xl">
                            <h3 className="font-bold text-gray-700 flex items-center gap-2">
                                {currentTab === 'active_users' ? <UsersIcon className="w-5 h-5 text-blue-500"/> : <BanIcon className="w-5 h-5 text-gray-500"/>}
                                {currentTab === 'active_users' ? 'Usuarios Activos' : 'Usuarios Inactivos'}
                                <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs ml-2">
                                    {currentTab === 'active_users' ? activeUsers.length : inactiveUsers.length}
                                </span>
                            </h3>
                            <div className="relative">
                                <input 
                                    type="text" 
                                    placeholder="Buscar usuario..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                />
                                <SearchIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"/>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="flex-1 overflow-auto">
                            <table className="w-full text-left text-sm text-gray-600 whitespace-nowrap">
                                <thead className="bg-white text-gray-500 font-bold text-xs uppercase border-b border-gray-200 sticky top-0 z-10">
                                    <tr>
                                        {currentTab === 'active_users' ? (
                                            <>
                                                <th className="px-6 py-3"># Usuario</th>
                                                <th className="px-6 py-3"># Interno</th>
                                                <th className="px-6 py-3">Nombre</th>
                                                <th className="px-6 py-3">Puesto</th>
                                                <th className="px-6 py-3">Rol</th>
                                                <th className="px-6 py-3">Contexto Operativo</th>
                                                <th className="px-6 py-3 text-center">Contacto</th>
                                            </>
                                        ) : (
                                            <>
                                                <th className="px-6 py-3"># Interno</th>
                                                <th className="px-6 py-3">Nombre</th>
                                                <th className="px-6 py-3">Puesto</th>
                                                <th className="px-6 py-3">Rol</th>
                                                <th className="px-6 py-3">Contexto Operativo</th>
                                                <th className="px-6 py-3 text-center">Contacto</th>
                                            </>
                                        )}
                                        <th className="px-6 py-3 text-center">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className={`divide-y divide-gray-100 ${currentTab === 'inactive_users' ? 'bg-gray-50' : 'bg-white'}`}>
                                    {(currentTab === 'active_users' ? activeUsers : inactiveUsers).map(user => (
                                        <tr key={user.id} className="hover:bg-blue-50 transition-colors group">
                                            {currentTab === 'active_users' ? (
                                                <>
                                                    <td className="px-6 py-3 font-mono text-xs font-bold text-blue-600">{user.id}</td>
                                                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{user.employeeId}</td>
                                                    <td className="px-6 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600 text-xs">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <span className="font-semibold text-gray-800">{user.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-3">{user.position}</td>
                                                    <td className="px-6 py-3">
                                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold border border-purple-100">{user.role}</span>
                                                    </td>
                                                    <td className="px-6 py-3">
                                                        {renderAccessColumn(user)}
                                                    </td>
                                                </>
                                            ) : (
                                                <>
                                                    <td className="px-6 py-3 font-mono text-xs text-gray-500">{user.employeeId}</td>
                                                    <td className="px-6 py-3 font-semibold text-gray-700">{user.name}</td>
                                                    <td className="px-6 py-3">{user.position}</td>
                                                    <td className="px-6 py-3">{user.role}</td>
                                                    <td className="px-6 py-3">
                                                        {renderAccessColumn(user)}
                                                    </td>
                                                </>
                                            )}
                                            
                                            {/* Contact Info (Shared) */}
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    {user.whatsapp && (
                                                        <div title={user.whatsapp} className="cursor-pointer hover:scale-110 transition-transform">
                                                            <WhatsAppIcon className="w-4 h-4 text-green-500"/>
                                                        </div>
                                                    )}
                                                    {user.email && (
                                                        <div title={user.email} className="cursor-pointer hover:scale-110 transition-transform">
                                                            <EmailIcon className="w-4 h-4 text-blue-500"/>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>

                                            {/* Actions */}
                                            <td className="px-6 py-3 text-center">
                                                <div className="flex justify-center gap-2">
                                                    <button 
                                                        onClick={() => handleOpenUserModal(user)}
                                                        className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors" 
                                                        title="Ver / Modificar"
                                                    >
                                                        <PencilIcon className="w-4 h-4"/>
                                                    </button>
                                                    <button 
                                                        onClick={() => handleToggleStatus(user.id)}
                                                        className={`p-1.5 rounded transition-colors ${user.status === 'active' ? 'text-red-500 hover:bg-red-100' : 'text-green-500 hover:bg-green-100'}`}
                                                        title={user.status === 'active' ? 'Desactivar' : 'Reactivar'}
                                                    >
                                                        {user.status === 'active' ? <BanIcon className="w-4 h-4"/> : <CheckCircleIcon className="w-4 h-4"/>}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                    {(currentTab === 'active_users' ? activeUsers : inactiveUsers).length === 0 && (
                                        <tr>
                                            <td colSpan={10} className="text-center py-10 text-gray-400 italic">
                                                No se encontraron usuarios {currentTab === 'active_users' ? 'activos' : 'inactivos'}.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            <UserModal 
                isOpen={isUserModalOpen} 
                onClose={() => setIsUserModalOpen(false)} 
                user={editingUser}
                onSave={handleSaveUser}
                plants={plants}
                roles={roles}
            />

            <CodeStructureModal 
                isOpen={isCodeModalOpen}
                onClose={() => setIsCodeModalOpen(false)}
                currentPattern={docCodePattern}
                onSave={setDocCodePattern}
            />

            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default Administration;
