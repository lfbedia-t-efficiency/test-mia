
import React, { useState, useEffect } from 'react';
import { Plant, Process, Subprocess, Machine } from '../types';
import { XIcon, ArrowUpOnSquareIcon, CameraIcon, CheckCircleIcon } from '../components/icons/Icons';

export interface CreateWorkOrderState {
    plantId: string;
    machineId: string;
    machineCode: string;
    machineName: string;
    processId: string;
    subprocessId: string;
    otNumber: string;
    detectorName: string;
    userId: string;
    shift: string;
    requestType: string;
    currentStatus: string;
    safetyRisk: string;
    failureMoment: string;
    
    // Details
    failureDescription: string;
    symptoms: string[];
    alarmCodes: string;
    alarmMessages: string;
    
    // Context
    sinceWhen: string;
    frequency: string;
    productModel: string;
    operatingHours: string;
    recentAdjustments: string; // yes/no
    adjustmentsDetail: string;
    
    // Impact
    productionImpact: string;
    qualityImpact: string; // yes/no
    defectType: string;
    defectDescription: string;
    
    // Files
    files: FileList | null;
    
    // Mock AI diagnosis return
    aiDiagnosis?: any;
}

interface CreateWorkOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    plants: Plant[];
    onSave: (data: any) => void;
    nextOtNumber: string;
    initialData?: Partial<CreateWorkOrderState>;
}

const COMMON_SYMPTOMS = [
    'Ruidos anormales', 'Vibración excesiva', 'Fugas aceite', 'Fugas agua',
    'Fugas aire', 'Temp alta', 'Pérdida presión', 'Piezas fuera medida',
    'Paros frecuentes', 'Olor quemado', 'Fallo eléctrico', 'Alarmas recurrentes',
    'Otro'
];

const CreateWorkOrderModal: React.FC<CreateWorkOrderModalProps> = ({ isOpen, onClose, plants, onSave, nextOtNumber, initialData }) => {
    const [formData, setFormData] = useState<CreateWorkOrderState>({
        plantId: '', machineId: '', machineCode: '', machineName: '', processId: '', subprocessId: '',
        otNumber: nextOtNumber, detectorName: '', userId: 'Ana Lopez', shift: '',
        requestType: '', currentStatus: '', safetyRisk: '', failureMoment: '',
        failureDescription: '', symptoms: [], alarmCodes: '', alarmMessages: '',
        sinceWhen: '', frequency: '', productModel: '', operatingHours: '', recentAdjustments: 'no', adjustmentsDetail: '',
        productionImpact: '', qualityImpact: 'no', defectType: '', defectDescription: '',
        files: null
    });

    useEffect(() => {
        if (isOpen) {
            // Reset and load defaults
            const now = new Date();
            setFormData({
                plantId: '', machineId: '', machineCode: '', machineName: '', processId: '', subprocessId: '',
                otNumber: nextOtNumber, 
                detectorName: '', 
                userId: 'Ana Lopez', // Default mock user
                shift: '',
                requestType: '', currentStatus: '', safetyRisk: '', failureMoment: '',
                failureDescription: '', symptoms: [], alarmCodes: '', alarmMessages: '',
                sinceWhen: '', frequency: '', productModel: '', operatingHours: '', recentAdjustments: 'no', adjustmentsDetail: '',
                productionImpact: '', qualityImpact: 'no', defectType: '', defectDescription: '',
                files: null,
                ...(initialData || {}) 
            });
        }
    }, [isOpen, nextOtNumber, initialData]);

    if (!isOpen) return null;

    const handleChange = (field: keyof CreateWorkOrderState, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSymptomToggle = (symptom: string) => {
        setFormData(prev => {
            const newSymptoms = prev.symptoms.includes(symptom)
                ? prev.symptoms.filter(s => s !== symptom)
                : [...prev.symptoms, symptom];
            return { ...prev, symptoms: newSymptoms };
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, files: e.target.files }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Simulate AI Diagnosis generation before saving
        const mockDiagnosis = {
            classification: formData.symptoms.includes('Vibración excesiva') ? "Desalineación de Eje" : "Falla General",
            priority: formData.currentStatus === 'Paro total' ? 'P1' : 'P2',
            riskLevel: formData.safetyRisk === 'Alto' ? 'Alto' : 'Medio',
            productionImpact: formData.productionImpact || 'Sin impacto',
            qualityImpact: formData.qualityImpact === 'yes',
            operatorInstructions: "1. Detener equipo.\n2. Aislar energía.\n3. Esperar a mantenimiento.",
            rootCauses: [{ cause: "Desgaste de componentes", probability: "70%" }],
            suggestedActions: ["Inspección visual", "Revisión de parámetros"]
        };
        
        onSave({ ...formData, aiDiagnosis: mockDiagnosis });
    };

    // Derived Lists
    const availableProcesses = plants.find(p => p.id === formData.plantId)?.processes || [];
    const availableSubprocesses = availableProcesses.find(p => p.id === formData.processId)?.subprocesses || [];
    
    let availableMachines: Machine[] = [];
    if (formData.subprocessId) {
        availableMachines = availableSubprocesses.find(s => s.id === formData.subprocessId)?.machines || [];
    } else if (formData.processId) {
        availableMachines = availableProcesses.find(p => p.id === formData.processId)?.machines || [];
    } else if (formData.plantId) {
        availableMachines = plants.find(p => p.id === formData.plantId)?.machines || [];
    }

    const SectionHeader = ({ num, title }: { num: string, title: string }) => (
        <h3 className="text-blue-600 font-bold text-xs uppercase mb-3 border-b border-blue-100 pb-1 mt-6 first:mt-0">
            {num}. {title}
        </h3>
    );

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-gray-100 w-full max-w-5xl h-[90vh] rounded-lg shadow-2xl flex flex-col overflow-hidden">
                
                {/* Header */}
                <div className="bg-gray-800 p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-white">Solicitud de Orden de Trabajo Técnico</h2>
                        <p className="text-xs text-gray-400">Complete la información para iniciar el diagnóstico IA</p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>

                {/* Form Content */}
                <form id="createOtForm" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-2">
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader num="1" title="Encabezado de la Solicitud" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Número OT</label>
                                <input disabled value={formData.otNumber} className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Fecha Reporte</label>
                                <input disabled value={new Date().toLocaleString()} className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Usuario</label>
                                <input disabled value={formData.userId} className="w-full p-2 bg-gray-100 border border-gray-300 rounded text-sm text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Detectó Falla *</label>
                                <input required value={formData.detectorName} onChange={e => handleChange('detectorName', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Nombre de quien reporta"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Turno *</label>
                                <select required value={formData.shift} onChange={e => handleChange('shift', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Turno 1">Turno 1</option>
                                    <option value="Turno 2">Turno 2</option>
                                    <option value="Turno 3">Turno 3</option>
                                    <option value="Mixto">Mixto</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Tipo Solicitud *</label>
                                <select required value={formData.requestType} onChange={e => handleChange('requestType', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Mantenimiento correctivo">Mantenimiento correctivo</option>
                                    <option value="Seguridad / HSE">Seguridad / HSE</option>
                                    <option value="Mejora Continua">Mejora Continua</option>
                                    <option value="Servicios Generales">Servicios Generales</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader num="2" title="Identificación de Máquina y Proceso" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Planta *</label>
                                <select required value={formData.plantId} onChange={e => handleChange('plantId', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar Planta...</option>
                                    {plants.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Proceso *</label>
                                <select required disabled={!formData.plantId} value={formData.processId} onChange={e => handleChange('processId', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100">
                                    <option value="">Seleccionar Proceso...</option>
                                    {availableProcesses.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Subproceso *</label>
                                <select disabled={!formData.processId} value={formData.subprocessId} onChange={e => handleChange('subprocessId', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white disabled:bg-gray-100">
                                    <option value="">Seleccionar Subproceso...</option>
                                    {availableSubprocesses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Máquina (Código) *</label>
                                {availableMachines.length > 0 ? (
                                    <select required value={formData.machineId} onChange={e => {
                                        const m = availableMachines.find(x => x.id === e.target.value);
                                        if (m) {
                                            setFormData(prev => ({ ...prev, machineId: m.id, machineCode: m.code, machineName: m.name }));
                                        }
                                    }} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                        <option value="">Buscar Máquina...</option>
                                        {availableMachines.map(m => <option key={m.id} value={m.id}>{m.code} - {m.name}</option>)}
                                    </select>
                                ) : (
                                    <input required value={formData.machineCode} onChange={e => handleChange('machineCode', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Código Manual"/>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Descriptivo</label>
                                <input readOnly={availableMachines.length > 0} value={formData.machineName} onChange={e => handleChange('machineName', e.target.value)} className="w-full p-2 bg-gray-50 border border-gray-300 rounded text-sm text-gray-700" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Horas Operación</label>
                                <input type="number" value={formData.operatingHours} onChange={e => handleChange('operatingHours', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Ej. 12500" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader num="3" title="Estado Actual de la Máquina" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Estado *</label>
                                <select required value={formData.currentStatus} onChange={e => handleChange('currentStatus', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Funciona con falla">Funciona con falla</option>
                                    <option value="Paro total">Paro total</option>
                                    <option value="Solo alarma en pantalla">Solo alarma en pantalla</option>
                                    <option value="Duda de operación">Duda de operación</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Riesgo Seguridad *</label>
                                <select required value={formData.safetyRisk} onChange={e => handleChange('safetyRisk', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio">Medio (Precaución)</option>
                                    <option value="Alto">Alto (Peligro Inminente)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Momento Falla *</label>
                                <select required value={formData.failureMoment} onChange={e => handleChange('failureMoment', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Operación normal">Operación normal</option>
                                    <option value="Al arrancar">Al arrancar</option>
                                    <option value="Cambio de modelo">Cambio de modelo</option>
                                    <option value="En reposo">En reposo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader num="4" title="Descripción de la Falla" />
                        
                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-700 mb-1">Descripción Detallada *</label>
                            <textarea required rows={3} value={formData.failureDescription} onChange={e => handleChange('failureDescription', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white focus:ring-1 focus:ring-blue-500" placeholder="Describa qué sucede..." />
                        </div>

                        <div className="mb-4">
                            <label className="block text-xs font-bold text-gray-700 mb-2">Síntomas Observados *</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-gray-50 p-3 rounded border border-gray-200">
                                {COMMON_SYMPTOMS.map(sym => (
                                    <label key={sym} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-1 rounded">
                                        <input type="checkbox" checked={formData.symptoms.includes(sym)} onChange={() => handleSymptomToggle(sym)} className="rounded text-blue-600 focus:ring-blue-500"/>
                                        <span className="text-xs text-gray-700">{sym}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Códigos Alarma</label>
                                <input value={formData.alarmCodes} onChange={e => handleChange('alarmCodes', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Ej. E-101, F-45"/>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Mensaje Alarma</label>
                                <input value={formData.alarmMessages} onChange={e => handleChange('alarmMessages', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white"/>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">¿Desde cuándo?</label>
                                <select value={formData.sinceWhen} onChange={e => handleChange('sinceWhen', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Hace unos momentos">Hace unos momentos</option>
                                    <option value="Inicio de turno">Inicio de turno</option>
                                    <option value="Desde ayer">Desde ayer</option>
                                    <option value="Semana pasada">Semana pasada</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-700 mb-1">Frecuencia</label>
                                <select value={formData.frequency} onChange={e => handleChange('frequency', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                    <option value="">Seleccionar...</option>
                                    <option value="Primera vez">Primera vez</option>
                                    <option value="Intermitente">Intermitente (Va y viene)</option>
                                    <option value="Constante">Constante</option>
                                    <option value="Cada ciclo">Cada ciclo</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <SectionHeader num="5" title="Condiciones Operación" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Modelo/Producto</label>
                                    <input value={formData.productModel} onChange={e => handleChange('productModel', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white"/>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">¿Se realizaron ajustes recientes a la maquina?</label>
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="adj" checked={formData.recentAdjustments === 'yes'} onChange={() => handleChange('recentAdjustments', 'yes')} /> <span className="text-sm">Sí</span></label>
                                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="adj" checked={formData.recentAdjustments === 'no'} onChange={() => handleChange('recentAdjustments', 'no')} /> <span className="text-sm">No</span></label>
                                    </div>
                                    {formData.recentAdjustments === 'yes' && (
                                        <textarea value={formData.adjustmentsDetail} onChange={e => handleChange('adjustmentsDetail', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Describa los ajustes..." rows={2}/>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                            <SectionHeader num="6" title="Impacto" />
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Impacto Producción *</label>
                                    <select required value={formData.productionImpact} onChange={e => handleChange('productionImpact', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                        <option value="">Seleccionar...</option>
                                        <option value="Sin impacto">Sin impacto (Máquina corre)</option>
                                        <option value="Reducción velocidad">Reducción velocidad</option>
                                        <option value="Paros cortos">Paros cortos / frecuentes</option>
                                        <option value="Paro total">Paro total de línea</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Impacto Calidad *</label>
                                    <div className="flex gap-4 mb-2">
                                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="qual" checked={formData.qualityImpact === 'yes'} onChange={() => handleChange('qualityImpact', 'yes')} /> <span className="text-sm">Sí</span></label>
                                        <label className="flex items-center gap-1 cursor-pointer"><input type="radio" name="qual" checked={formData.qualityImpact === 'no'} onChange={() => handleChange('qualityImpact', 'no')} /> <span className="text-sm">No</span></label>
                                    </div>
                                    {formData.qualityImpact === 'yes' && (
                                        <div className="space-y-2">
                                            <select value={formData.defectType} onChange={e => handleChange('defectType', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white">
                                                <option value="">Tipo Defecto...</option>
                                                <option value="Dimensional">Dimensional</option>
                                                <option value="Estético">Estético</option>
                                                <option value="Funcional">Funcional</option>
                                            </select>
                                            <textarea value={formData.defectDescription} onChange={e => handleChange('defectDescription', e.target.value)} className="w-full p-2 border border-gray-300 rounded text-sm bg-white" placeholder="Descripción del defecto..." rows={2}/>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                        <SectionHeader num="7" title="Evidencia Adjunta" />
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors relative group">
                            <input type="file" multiple accept="image/*,video/*,.pdf" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileChange} />
                            <CameraIcon className="w-10 h-10 text-gray-400 mb-3 group-hover:text-blue-500 transition-colors"/>
                            <p className="text-sm font-bold text-gray-600">Haga clic para cargar fotos o videos</p>
                            <p className="text-xs text-gray-400 mt-1">(JPG, PNG, PDF permitidos)</p>
                        </div>
                        {formData.files && formData.files.length > 0 && (
                            <div className="mt-4 space-y-1">
                                {Array.from(formData.files).map((file: File, idx) => (
                                    <div key={idx} className="flex items-center gap-2 text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-100">
                                        <ArrowUpOnSquareIcon className="w-4 h-4"/> {file.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </form>

                {/* Footer Actions */}
                <div className="bg-gray-50 p-4 border-t border-gray-200 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-6 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-100 transition-colors">
                        Cancelar
                    </button>
                    <button form="createOtForm" type="submit" className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-transform active:scale-95 flex items-center gap-2">
                        <CheckCircleIcon className="w-5 h-5"/> Generar Orden
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateWorkOrderModal;
