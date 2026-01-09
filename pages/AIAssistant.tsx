
import React, { useState, useEffect, useRef } from 'react';
import { Plant, Process, Subprocess, Machine, Procedure, WorkOrder, WorkOrderPriority, RiskLevel, MachineStatus, HistoryEvent, AiStartContext } from '../types';
import { 
    PaperclipIcon, SendIcon, MicrophoneIcon, UserIcon, TEfficiencyIcon, 
    ArrowPathIcon, PlantIcon, ManufacturingIcon, WrenchScrewdriverIcon, DocumentTextIcon,
    TicketIcon, ClockIcon, ExclamationTriangleIcon, SignalIcon, CameraIcon, BookOpenIcon,
    SearchIcon, CheckCircleIcon
} from '../components/icons/Icons';

interface Source {
    document: string;
    page: number;
    section: string;
}

interface QuickAction {
    label: string;
    value: string;
    // Navigation types + Wizard types
    type: 'plant' | 'process' | 'subprocess' | 'machine' | 'procedure' | 'reset' | 
          'opt_mode' | 
          'opt_shift' | 'opt_req_type' | 'opt_status' | 'opt_moment' | 'opt_safety' | 
          'opt_symptom' | 'opt_since' | 'opt_frequency' | 'opt_adj' | 'opt_impact_prod' | 'opt_impact_qual' | 'opt_evidence' | 'opt_priority' | 'action_confirm';
}

interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    sources?: Source[];
    suggestions?: QuickAction[]; 
    isSystemMsg?: boolean; 
}

// Updated to match CreateWorkOrderModal state
interface WorkOrderDraft {
    machineId?: string;
    machineName?: string;
    shift?: string;
    requestType?: string;
    
    // Header
    machineStatus?: string;
    safetyRisk?: string;
    failureMoment?: string;

    // Details
    description?: string; 
    symptoms?: string[];
    alarmCodes?: string;
    alarmMessages?: string;

    // Context
    operatingHours?: string;
    sinceWhen?: string;
    frequency?: string;
    productModel?: string;
    recentAdjustments?: string; // "yes" | "no"
    adjustmentsDetail?: string;

    // Impact
    impactProduction?: string;
    impactQuality?: string; // "yes" | "no"
    defectType?: string;
    defectDescription?: string;

    evidenceAttached?: boolean;
    priority?: string;
}

interface QueryDraft {
    need?: string;
    reason?: string;
}

// Logic States
type FlowStep = 
    | 'navigation'      
    | 'select_action_mode' 
    | 'view_procedure'  
    
    // Branch A: Information Query
    | 'check_docs_availability'
    | 'no_docs_found'           
    | 'collect_query_need'
    | 'collect_query_reason'
    | 'answering_query'

    // Branch B: Work Order Wizard (Aligned with Form)
    | 'collect_shift'   
    | 'collect_type'    
    | 'collect_status'
    | 'collect_safety' // New
    | 'collect_moment'
    | 'collect_desc'
    | 'collect_symptoms' // New
    | 'collect_alarms'
    | 'collect_hours' // New
    | 'collect_since' // New
    | 'collect_frequency' // New
    | 'collect_product' // New
    | 'collect_adjustments_bool' // New
    | 'collect_adjustments_detail' // New
    | 'collect_impact_prod'
    | 'collect_impact_qual'
    | 'collect_defect_details' // New
    | 'collect_evidence'
    | 'collect_priority'
    
    | 'finished';       

interface ContextState {
    plantId?: string;
    processId?: string;
    subprocessId?: string;
    leafId?: string; 
    leafType?: 'machine' | 'procedure';
    
    // Wizard State
    flowStep: FlowStep;
    woDraft: WorkOrderDraft;
    queryDraft: QueryDraft;
}

export interface AIAssistantProps {
    plants: Plant[];
    onAddWorkOrder: (order: WorkOrder) => void;
    onAddHistoryEvent: (event: HistoryEvent) => void;
    initialContext?: AiStartContext | null;
    onClearContext?: () => void;
}

const COMMON_SYMPTOMS = [
    'Ruidos anormales', 'Vibración excesiva', 'Fugas aceite', 'Fugas agua',
    'Fugas aire', 'Temp alta', 'Pérdida presión', 'Piezas fuera medida',
    'Paros frecuentes', 'Olor quemado', 'Fallo eléctrico', 'Alarmas recurrentes'
];

const AIAssistant = ({ plants, onAddWorkOrder, onAddHistoryEvent, initialContext, onClearContext }: AIAssistantProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Initial Context
    const [context, setContext] = useState<ContextState>({
        flowStep: 'navigation',
        woDraft: { symptoms: [] },
        queryDraft: {}
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting and Context Injection
    useEffect(() => {
        if (initialContext) {
            const newContext: ContextState = {
                plantId: initialContext.plantId,
                processId: initialContext.processId,
                subprocessId: initialContext.subprocessId,
                leafId: initialContext.machineId,
                leafType: 'machine',
                flowStep: initialContext.intent === 'query' ? 'collect_query_need' : 'collect_shift',
                woDraft: { machineName: initialContext.machineName, symptoms: [] },
                queryDraft: {}
            };
            setContext(newContext);
            simulateAIResponse("context_start", newContext);
            if (onClearContext) onClearContext();
        } else if (messages.length === 0) {
            simulateAIResponse("initial");
        }
    }, [initialContext]);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // --- LOGIC ENGINE ---

    const getCurrentNode = (currentContext: ContextState) => {
        let node: any = null;
        let options: QuickAction[] = [];

        // 0. Leaf Selected
        if (currentContext.leafId) {
            if (currentContext.leafType === 'machine') {
                const allMachines: Machine[] = [];
                plants.forEach(p => {
                    if(p.machines) allMachines.push(...p.machines);
                    p.processes?.forEach(proc => {
                        if(proc.machines) allMachines.push(...proc.machines);
                        proc.subprocesses?.forEach(sub => {
                            if(sub.machines) allMachines.push(...sub.machines);
                        })
                    })
                });
                node = allMachines.find(m => m.id === currentContext.leafId);
            }
            if (currentContext.leafType === 'procedure') {
                 let foundProc: Procedure | undefined;
                 const traverse = (n: any) => {
                     if (n.procedures) {
                         const p = n.procedures.find((pr: Procedure) => pr.id === currentContext.leafId);
                         if (p) foundProc = p;
                     }
                     if (!foundProc && n.processes) n.processes.forEach(traverse);
                     if (!foundProc && n.subprocesses) n.subprocesses.forEach(traverse);
                 };
                 plants.forEach(traverse);
                 node = foundProc;
            }
            return { node, options: [], level: 'leaf' };
        }

        // 1. Root Level (Plants)
        if (!currentContext.plantId) {
            options = plants.map(p => ({ label: p.name, value: p.id, type: 'plant' }));
            return { node: null, options, level: 'root' };
        }

        const plant = plants.find(p => p.id === currentContext.plantId);
        node = plant;

        // 2. Plant Level
        if (!currentContext.processId) {
            if (plant?.processes) options.push(...plant.processes.map(p => ({ label: p.name, value: p.id, type: 'process' as const })));
            if (plant?.machines) options.push(...plant.machines.map(m => ({ label: m.name, value: m.id, type: 'machine' as const })));
            if (plant?.procedures) options.push(...plant.procedures.map(p => ({ label: p.title, value: p.id, type: 'procedure' as const })));
            return { node: plant, options, level: 'plant' };
        }

        const process = plant?.processes.find(p => p.id === currentContext.processId);
        node = process;

        // 3. Process Level
        if (!currentContext.subprocessId) {
            if (process?.subprocesses) options.push(...process.subprocesses.map(s => ({ label: s.name, value: s.id, type: 'subprocess' as const })));
            if (process?.machines) options.push(...process.machines.map(m => ({ label: m.name, value: m.id, type: 'machine' as const })));
            if (process?.procedures) options.push(...process.procedures.map(p => ({ label: p.title, value: p.id, type: 'procedure' as const })));
            return { node: process, options, level: 'process' };
        }

        const subprocess = process?.subprocesses.find(s => s.id === currentContext.subprocessId);
        node = subprocess;

        // 4. Subprocess Level
        if (subprocess?.machines) options.push(...subprocess.machines.map(m => ({ label: m.name, value: m.id, type: 'machine' as const })));
        if (subprocess?.procedures) options.push(...subprocess.procedures.map(p => ({ label: p.title, value: p.id, type: 'procedure' as const })));
        return { node: subprocess, options, level: 'subprocess' };
    };

    const getAvailableDocsCount = (ctx: ContextState) => {
        const plant = plants.find(p => p.id === ctx.plantId);
        const process = plant?.processes.find(p => p.id === ctx.processId);
        const subprocess = process?.subprocesses.find(s => s.id === ctx.subprocessId);
        
        let count = 0;
        if (plant?.procedures) count += plant.procedures.length;
        if (process?.procedures) count += process.procedures.length;
        if (subprocess?.procedures) count += subprocess.procedures.length;
        
        return count;
    };

    const mockSearchDocuments = (ctx: ContextState) => {
        return {
            answer: `Basado en tu necesidad "${ctx.queryDraft.need}", sugiero revisar los manuales disponibles.`,
            sources: []
        };
    };

    const simulateAIResponse = async (trigger: string, overrideContext?: ContextState) => {
        setIsTyping(true);
        const ctx = overrideContext || context;
        const { node, options: navOptions, level } = getCurrentNode(ctx);

        const delay = Math.random() * 500 + 400; 
        
        setTimeout(() => {
            let responseText = "";
            let finalOptions: QuickAction[] = navOptions;
            let isSystem = false;
            let sources: Source[] | undefined = undefined;

            // --- STANDARD NAVIGATION FLOW ---
            if (ctx.flowStep === 'navigation') {
                if (trigger === "initial") {
                    responseText = "¡Hola! Soy tu asistente de manufactura. ¿Sobre qué **Planta** deseas realizar tu consulta hoy?";
                } else if (trigger === "reset") {
                    responseText = "Reiniciando. ¿En qué planta nos enfocamos?";
                } else if (navOptions.length === 0 && level !== 'root' && level !== 'leaf') {
                    const locationName = node?.name || 'esta ubicación';
                    responseText = `⚠️ **Sin Información Configurada**\n\n${locationName} no tiene activos registrados.`;
                    finalOptions = [{ label: "Volver al Inicio", value: "reset", type: "reset" }];
                } else if (level === 'plant') {
                    responseText = `Estamos en **${node.name}**. Selecciona un proceso o activo:`;
                } else if (level === 'process') {
                    responseText = `Revisando **${node.name}**. Selecciona el subproceso o equipo:`;
                } else if (level === 'subprocess') {
                    responseText = `En **${node.name}**, selecciona un activo:`;
                }
            } 
            
            // --- MACHINE SELECTED ---
            else if (ctx.leafType === 'machine' && ctx.flowStep === 'select_action_mode') {
                const machineName = node?.name || 'la máquina';
                responseText = `Has seleccionado **${machineName}**. \n\n¿Qué deseas hacer?`;
                finalOptions = [
                    { label: "🚨 Crear Orden de Trabajo", value: "mode_wo", type: "opt_mode" },
                    { label: "🔍 Consultar Información", value: "mode_query", type: "opt_mode" }
                ];
            }

            // --- INFO QUERY FLOW ---
            else if (ctx.flowStep === 'no_docs_found') {
                responseText = `⚠️ **Sin Información**\n\nNo encontré manuales para **${node?.name}**.`;
                finalOptions = [{ label: "Reiniciar", value: "reset", type: "reset" }];
            }
            else if (ctx.flowStep === 'collect_query_need') {
                responseText = "Modo consulta. **¿Qué información necesitas?**";
                finalOptions = []; 
            }
            else if (ctx.flowStep === 'collect_query_reason') {
                responseText = `¿Para qué necesitas esta información? (Auditoría, Duda, etc.)`;
                finalOptions = []; 
            }
            else if (ctx.flowStep === 'answering_query') {
                const result = mockSearchDocuments(ctx);
                responseText = result.answer;
                sources = result.sources;
                finalOptions = [{ label: "Nueva Consulta", value: "reset", type: "reset" }];
            }

            // --- WORK ORDER WIZARD (FORM ALIGNED) ---
            else if (ctx.leafType === 'machine') {
                const machineName = node?.name || ctx.woDraft.machineName || 'la máquina';

                if (ctx.flowStep === 'collect_shift') {
                    responseText = `Iniciando reporte para **${machineName}**. \n\n¿En qué **Turno** ocurrió?`;
                    finalOptions = [
                        { label: "Turno 1", value: "Turno 1", type: "opt_shift" },
                        { label: "Turno 2", value: "Turno 2", type: "opt_shift" },
                        { label: "Turno 3", value: "Turno 3", type: "opt_shift" },
                        { label: "Mixto", value: "Mixto", type: "opt_shift" }
                    ];
                } 
                else if (ctx.flowStep === 'collect_type') {
                    responseText = `¿Qué **Tipo de Solicitud** es?`;
                    finalOptions = [
                        { label: "Manto. Correctivo", value: "Mantenimiento correctivo", type: "opt_req_type" },
                        { label: "Seguridad / HSE", value: "Seguridad / HSE", type: "opt_req_type" },
                        { label: "Mejora Continua", value: "Mejora Continua", type: "opt_req_type" },
                        { label: "Servicios Grales", value: "Servicios Generales", type: "opt_req_type" }
                    ];
                }
                else if (ctx.flowStep === 'collect_status') {
                    responseText = `¿Cuál es el **Estado Actual** de la máquina?`;
                    finalOptions = [
                        { label: "Paro Total", value: "Paro total", type: "opt_status" },
                        { label: "Funciona con Falla", value: "Funciona con falla", type: "opt_status" },
                        { label: "Solo Alarma", value: "Solo alarma en pantalla", type: "opt_status" },
                        { label: "Duda Operativa", value: "Duda de operación", type: "opt_status" }
                    ];
                }
                else if (ctx.flowStep === 'collect_safety') {
                    responseText = `¿Existe algún **Riesgo de Seguridad**?`;
                    finalOptions = [
                        { label: "🟢 Bajo", value: "Bajo", type: "opt_safety" },
                        { label: "🟡 Medio (Precaución)", value: "Medio", type: "opt_safety" },
                        { label: "🔴 Alto (Peligro)", value: "Alto", type: "opt_safety" }
                    ];
                }
                else if (ctx.flowStep === 'collect_moment') {
                    responseText = `¿En qué **Momento** se presentó la falla?`;
                    finalOptions = [
                        { label: "Operación Normal", value: "Operación normal", type: "opt_moment" },
                        { label: "Al Arrancar", value: "Al arrancar", type: "opt_moment" },
                        { label: "Cambio Modelo", value: "Cambio de modelo", type: "opt_moment" },
                        { label: "En Reposo", value: "En reposo", type: "opt_moment" }
                    ];
                }
                else if (ctx.flowStep === 'collect_desc') {
                    responseText = `Por favor, describe detalladamente la falla. (¿Qué sucedió?)`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_symptoms') {
                    const currentSymptoms = ctx.woDraft.symptoms || [];
                    responseText = currentSymptoms.length > 0 
                        ? `Síntomas seleccionados: ${currentSymptoms.join(', ')}. \n\n¿Deseas agregar más o continuar?` 
                        : `Selecciona los **Síntomas Observados**:`;
                    
                    const symptomOptions = COMMON_SYMPTOMS.filter(s => !currentSymptoms.includes(s))
                        .map(s => ({ label: s, value: s, type: 'opt_symptom' as const }));
                    
                    finalOptions = [
                        ...symptomOptions,
                        { label: "✅ Continuar", value: "DONE", type: 'opt_symptom' }
                    ];
                }
                else if (ctx.flowStep === 'collect_alarms') {
                    responseText = `Si hay **Códigos de Alarma** o mensajes en pantalla, escríbelos. Si no, escribe "Ninguno".`;
                    finalOptions = []; 
                }
                else if (ctx.flowStep === 'collect_hours') {
                    responseText = `¿Cuáles son las **Horas de Operación** actuales del equipo?`;
                    finalOptions = []; 
                }
                else if (ctx.flowStep === 'collect_since') {
                    responseText = `¿**Desde cuándo** ocurre este problema?`;
                    finalOptions = [
                        { label: "Hace momentos", value: "Hace unos momentos", type: "opt_since" },
                        { label: "Inicio Turno", value: "Inicio de turno", type: "opt_since" },
                        { label: "Desde Ayer", value: "Desde ayer", type: "opt_since" },
                        { label: "Semana Pasada", value: "Semana pasada", type: "opt_since" }
                    ];
                }
                else if (ctx.flowStep === 'collect_frequency') {
                    responseText = `¿Con qué **Frecuencia** se presenta?`;
                    finalOptions = [
                        { label: "Primera vez", value: "Primera vez", type: "opt_frequency" },
                        { label: "Intermitente", value: "Intermitente", type: "opt_frequency" },
                        { label: "Constante", value: "Constante", type: "opt_frequency" },
                        { label: "Cada ciclo", value: "Cada ciclo", type: "opt_frequency" }
                    ];
                }
                else if (ctx.flowStep === 'collect_product') {
                    responseText = `¿Qué **Modelo o Producto** se está corriendo?`;
                    finalOptions = []; 
                }
                else if (ctx.flowStep === 'collect_adjustments_bool') {
                    responseText = `¿Se realizaron **Ajustes Recientes** a la máquina?`;
                    finalOptions = [
                        { label: "Sí", value: "yes", type: "opt_adj" },
                        { label: "No", value: "no", type: "opt_adj" }
                    ];
                }
                else if (ctx.flowStep === 'collect_adjustments_detail') {
                    responseText = `Por favor, describe qué ajustes se realizaron.`;
                    finalOptions = []; 
                }
                else if (ctx.flowStep === 'collect_impact_prod') {
                    responseText = `¿Cuál es el **Impacto en Producción**?`;
                    finalOptions = [
                        { label: "Sin impacto", value: "Sin impacto", type: "opt_impact_prod" },
                        { label: "Reducción Vel.", value: "Reducción velocidad", type: "opt_impact_prod" },
                        { label: "Paros Cortos", value: "Paros cortos", type: "opt_impact_prod" },
                        { label: "Paro de Línea", value: "Paro total", type: "opt_impact_prod" }
                    ];
                }
                else if (ctx.flowStep === 'collect_impact_qual') {
                    responseText = `¿Existe **Impacto en Calidad** (piezas defectuosas)?`;
                    finalOptions = [
                        { label: "Sí", value: "yes", type: "opt_impact_qual" },
                        { label: "No", value: "no", type: "opt_impact_qual" }
                    ];
                }
                else if (ctx.flowStep === 'collect_defect_details') {
                    responseText = `Describe el **Tipo de Defecto** y detalles.`;
                    finalOptions = []; 
                }
                else if (ctx.flowStep === 'collect_evidence') {
                    responseText = `¿Deseas adjuntar **Fotografías**?`;
                    finalOptions = [
                        { label: "📸 Adjuntar (Simulado)", value: "yes", type: "opt_evidence" },
                        { label: "Omitir", value: "no", type: "opt_evidence" }
                    ];
                }
                else if (ctx.flowStep === 'collect_priority') {
                    responseText = `Finalmente, ¿Qué **Prioridad** sugieres?`;
                    finalOptions = [
                        { label: "P1 - Crítica", value: "P1", type: "opt_priority" },
                        { label: "P2 - Alta", value: "P2", type: "opt_priority" },
                        { label: "P3 - Normal", value: "P3", type: "opt_priority" }
                    ];
                }
                else if (ctx.flowStep === 'finished') {
                    // GENERATE WORK ORDER
                    const otId = `OT-${Math.floor(Math.random() * 9000) + 1000}`;
                    const newWorkOrder: WorkOrder = {
                        id: `wo-${Date.now()}`,
                        otNumber: otId,
                        plantId: ctx.plantId || '',
                        plantName: plants.find(p => p.id === ctx.plantId)?.name || 'Planta',
                        processName: 'Proceso IA',
                        subprocessName: 'Subproceso IA',
                        machineId: ctx.leafId || '',
                        machineCode: 'M-AUTO', 
                        machineName: node?.name || ctx.woDraft.machineName || 'Máquina',
                        
                        // Header
                        reportDate: new Date().toISOString(),
                        detectorName: 'Usuario Chat',
                        shift: ctx.woDraft.shift || 'Turno 1',
                        requestType: ctx.woDraft.requestType || 'Mantenimiento correctivo',
                        machineStatus: (ctx.woDraft.machineStatus as MachineStatus) || 'Funciona con falla',
                        safetyRisk: ctx.woDraft.safetyRisk || 'Bajo',
                        failureMoment: ctx.woDraft.failureMoment || '',

                        // Details
                        description: ctx.woDraft.description || '',
                        symptoms: ctx.woDraft.symptoms || [],
                        alarmCodes: ctx.woDraft.alarmCodes || '', 
                        alarmMessages: '', // Combined in chat usually

                        // Context
                        operatingHours: ctx.woDraft.operatingHours || '0',
                        sinceWhen: ctx.woDraft.sinceWhen || '',
                        frequency: ctx.woDraft.frequency || '',
                        productModel: ctx.woDraft.productModel || '',
                        recentAdjustments: ctx.woDraft.recentAdjustments || 'no',
                        adjustmentsDetail: ctx.woDraft.adjustmentsDetail || '',

                        // Impact
                        impactProduction: ctx.woDraft.impactProduction || 'Sin impacto',
                        impactQuality: ctx.woDraft.impactQuality || 'no',
                        defectType: ctx.woDraft.defectType || '',
                        defectDescription: ctx.woDraft.defectDescription || '',
                        evidenceFiles: ctx.woDraft.evidenceAttached ? ['https://picsum.photos/200/300'] : [],
                        
                        // AI Data
                        aiData: {
                            classification: "Diagnóstico IA Preliminar",
                            priority: ctx.woDraft.priority as WorkOrderPriority,
                            riskLevel: ctx.woDraft.safetyRisk === 'Alto' ? 'Alto' : 'Medio',
                            productionImpact: ctx.woDraft.impactProduction || 'Sin impacto',
                            qualityImpact: ctx.woDraft.impactQuality === 'yes',
                            operatorInstructions: "1. Aislar máquina.\n2. Esperar técnico.",
                            rootCauses: [{ cause: "Análisis pendiente", probability: "50%" }],
                            suggestedActions: ["Revisión general"]
                        },
                        status: 'unassigned',
                        assignedTo: '',
                        slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
                        logs: [{ date: new Date().toISOString(), action: 'Creación vía Chat', user: 'Asistente IA' }],
                        technicalReport: {
                             inspections: '', measurements: '', observations: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: [], preventiveMeasures: ''
                        }
                    };

                    onAddWorkOrder(newWorkOrder);
                    onAddHistoryEvent({
                        id: `hist-${Date.now()}`,
                        type: 'Orden de Trabajo',
                        title: `OT Generada: ${otId}`,
                        user: 'Usuario Actual',
                        timestamp: 'Hace un momento',
                        criticality: 'medium',
                        details: { status: 'Abierta' },
                        hierarchy: `${newWorkOrder.plantName} / ${newWorkOrder.machineName}`
                    });

                    responseText = `✅ **OT Generada: ${otId}**\n\nTodos los datos han sido registrados en el formato oficial.\n\n**Máquina:** ${machineName}\n**Falla:** ${ctx.woDraft.description}`;
                    isSystem = true;
                    finalOptions = [{ label: "Nueva Consulta", value: "reset", type: "reset" }];
                }
            }
            
            else if (ctx.flowStep === 'view_procedure') {
                 responseText = `Procedimiento **${node?.title}** cargado.`;
                 finalOptions = [{ label: "Cerrar", value: "reset", type: "reset" }];
            }

            const aiMsg: ChatMessage = {
                id: Date.now(),
                sender: 'ai',
                text: responseText,
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                suggestions: finalOptions,
                isSystemMsg: isSystem,
                sources: sources
            };

            setMessages(prev => [...prev, aiMsg]);
            setIsTyping(false);
        }, delay);
    };

    const handleSend = (text: string = input) => {
        if (!text.trim()) return;

        const userMsg: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        const currentDraft = { ...context.woDraft };
        const currentQuery = { ...context.queryDraft };
        let nextStep: FlowStep | null = null;

        // --- BRANCH TEXT HANDLERS ---
        
        if (context.flowStep === 'collect_desc') {
            currentDraft.description = text;
            nextStep = 'collect_symptoms';
        }
        else if (context.flowStep === 'collect_alarms') {
            currentDraft.alarmCodes = text; // Simulating combined input
            nextStep = 'collect_hours';
        }
        else if (context.flowStep === 'collect_hours') {
            currentDraft.operatingHours = text;
            nextStep = 'collect_since';
        }
        else if (context.flowStep === 'collect_product') {
            currentDraft.productModel = text;
            nextStep = 'collect_adjustments_bool';
        }
        else if (context.flowStep === 'collect_adjustments_detail') {
            currentDraft.adjustmentsDetail = text;
            nextStep = 'collect_impact_prod';
        }
        else if (context.flowStep === 'collect_defect_details') {
            currentDraft.defectDescription = text;
            currentDraft.defectType = "Reportado en chat";
            nextStep = 'collect_evidence';
        }
        else if (context.flowStep === 'collect_query_need') {
            currentQuery.need = text;
            nextStep = 'collect_query_reason';
        }
        else if (context.flowStep === 'collect_query_reason') {
            currentQuery.reason = text;
            nextStep = 'answering_query';
        }

        if (nextStep) {
            const newContext = { ...context, woDraft: currentDraft, queryDraft: currentQuery, flowStep: nextStep };
            setContext(newContext);
            simulateAIResponse("next_step", newContext);
        } else {
            // Default NLP match attempt
            const { options } = getCurrentNode(context);
            const match = options.find(opt => opt.label.toLowerCase().includes(text.toLowerCase()));
            if (match) {
                handleQuickAction(match);
            } else {
                simulateAIResponse("unknown");
            }
        }
    };

    const handleQuickAction = (action: QuickAction) => {
        if (action.type === 'reset') {
            setContext({ flowStep: 'navigation', woDraft: { symptoms: [] }, queryDraft: {} });
            simulateAIResponse("reset", { flowStep: 'navigation', woDraft: { symptoms: [] }, queryDraft: {} });
            return;
        }

        const newContext = { ...context };

        // Navigation
        if (['plant', 'process', 'subprocess', 'machine', 'procedure'].includes(action.type)) {
            if (action.type === 'plant') newContext.plantId = action.value;
            if (action.type === 'process') newContext.processId = action.value;
            if (action.type === 'subprocess') newContext.subprocessId = action.value;
            if (action.type === 'machine') {
                newContext.leafId = action.value;
                newContext.leafType = 'machine';
                newContext.flowStep = 'select_action_mode'; 
                newContext.woDraft = { machineId: action.value, machineName: action.label, symptoms: [] };
            } else if (action.type === 'procedure') {
                newContext.leafId = action.value;
                newContext.leafType = 'procedure';
                newContext.flowStep = 'view_procedure';
            }
        }

        // Mode
        if (action.type === 'opt_mode') {
            if (action.value === 'mode_wo') newContext.flowStep = 'collect_shift';
            else newContext.flowStep = 'collect_query_need';
        }

        // WO Wizard
        if (action.type === 'opt_shift') {
            newContext.woDraft.shift = action.value;
            newContext.flowStep = 'collect_type';
        }
        else if (action.type === 'opt_req_type') {
            newContext.woDraft.requestType = action.value;
            newContext.flowStep = 'collect_status';
        }
        else if (action.type === 'opt_status') {
            newContext.woDraft.machineStatus = action.value;
            newContext.flowStep = 'collect_safety';
        }
        else if (action.type === 'opt_safety') {
            newContext.woDraft.safetyRisk = action.value;
            newContext.flowStep = 'collect_moment';
        }
        else if (action.type === 'opt_moment') {
            newContext.woDraft.failureMoment = action.value;
            newContext.flowStep = 'collect_desc';
        }
        else if (action.type === 'opt_symptom') {
            if (action.value === 'DONE') {
                newContext.flowStep = 'collect_alarms';
            } else {
                // Add symptom and stay on step
                const current = newContext.woDraft.symptoms || [];
                if (!current.includes(action.value)) {
                    newContext.woDraft.symptoms = [...current, action.value];
                }
            }
        }
        else if (action.type === 'opt_since') {
            newContext.woDraft.sinceWhen = action.value;
            newContext.flowStep = 'collect_frequency';
        }
        else if (action.type === 'opt_frequency') {
            newContext.woDraft.frequency = action.value;
            newContext.flowStep = 'collect_product';
        }
        else if (action.type === 'opt_adj') {
            newContext.woDraft.recentAdjustments = action.value;
            if (action.value === 'yes') newContext.flowStep = 'collect_adjustments_detail';
            else newContext.flowStep = 'collect_impact_prod';
        }
        else if (action.type === 'opt_impact_prod') {
            newContext.woDraft.impactProduction = action.value;
            newContext.flowStep = 'collect_impact_qual';
        }
        else if (action.type === 'opt_impact_qual') {
            newContext.woDraft.impactQuality = action.value;
            if (action.value === 'yes') newContext.flowStep = 'collect_defect_details';
            else newContext.flowStep = 'collect_evidence';
        }
        else if (action.type === 'opt_evidence') {
            newContext.woDraft.evidenceAttached = action.value === 'yes';
            newContext.flowStep = 'collect_priority';
        }
        else if (action.type === 'opt_priority') {
            newContext.woDraft.priority = action.value;
            newContext.flowStep = 'finished';
        }

        setContext(newContext);
        
        // Add visual user message
        const userAck: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: action.value === 'DONE' ? 'Continuar' : action.label,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userAck]);

        // Don't trigger AI response immediately if just selecting a symptom (unless DONE)
        if (action.type !== 'opt_symptom' || action.value === 'DONE') {
            simulateAIResponse("action", newContext);
        } else {
            // Re-trigger symptom prompt to refresh options
            simulateAIResponse("action", newContext);
        }
    };

    const getActionIcon = (type: string) => {
        switch(type) {
            case 'plant': return <PlantIcon className="w-3 h-3" />;
            case 'process': return <ManufacturingIcon className="w-3 h-3" />;
            case 'subprocess': return <ManufacturingIcon className="w-3 h-3" />;
            case 'machine': return <WrenchScrewdriverIcon className="w-3 h-3" />;
            case 'procedure': return <DocumentTextIcon className="w-3 h-3" />;
            case 'reset': return <ArrowPathIcon className="w-3 h-3" />;
            
            case 'opt_mode': return <SignalIcon className="w-3 h-3" />; 
            case 'opt_shift': return <ClockIcon className="w-3 h-3" />;
            case 'opt_req_type': return <TicketIcon className="w-3 h-3" />;
            case 'opt_status': return <SignalIcon className="w-3 h-3" />;
            case 'opt_safety': return <ExclamationTriangleIcon className="w-3 h-3" />;
            case 'opt_moment': return <ClockIcon className="w-3 h-3" />;
            case 'opt_symptom': return <CheckCircleIcon className="w-3 h-3" />;
            case 'opt_since': return <ClockIcon className="w-3 h-3" />;
            case 'opt_frequency': return <SignalIcon className="w-3 h-3" />;
            case 'opt_impact_prod': return <ExclamationTriangleIcon className="w-3 h-3" />;
            case 'opt_evidence': return <CameraIcon className="w-3 h-3" />;
            case 'opt_priority': return <ExclamationTriangleIcon className="w-3 h-3" />;
            default: return null;
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 relative">
            {/* Header / Top Bar context indicator */}
            {context.plantId && (
                <div className="absolute top-0 left-0 right-0 bg-white/90 backdrop-blur border-b border-gray-200 px-4 py-2 z-10 flex justify-between items-center text-xs shadow-sm">
                    <div className="flex items-center gap-2 text-gray-600 truncate max-w-[80%]">
                        <span className="font-bold text-blue-700">Contexto:</span>
                        <span className="truncate">
                            {plants.find(p=>p.id===context.plantId)?.name} 
                            {context.processId && ' > ...'}
                            {context.leafId && context.woDraft.machineName ? ` > ${context.woDraft.machineName}` : ''}
                        </span>
                    </div>
                    <button 
                        onClick={() => handleQuickAction({ label: 'Reiniciar', value: '', type: 'reset' })}
                        className="text-red-500 hover:text-red-700 font-bold hover:underline flex items-center gap-1 whitespace-nowrap"
                    >
                        <ArrowPathIcon className="w-3 h-3"/> Reiniciar
                    </button>
                </div>
            )}

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 pt-12 custom-scrollbar">
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                            {/* Avatar */}
                            <div className="flex-shrink-0">
                                {msg.sender === 'ai' ? (
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                                        <TEfficiencyIcon className="w-5 h-5" />
                                    </div>
                                ) : (
                                    <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 border border-gray-300">
                                        <UserIcon className="w-5 h-5" />
                                    </div>
                                )}
                            </div>

                            {/* Bubble */}
                            <div className={`p-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                                msg.sender === 'user' 
                                    ? 'bg-blue-600 text-white rounded-tr-none' 
                                    : msg.isSystemMsg 
                                        ? 'bg-green-50 text-green-900 border border-green-200 rounded-tl-none' 
                                        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                            }`}>
                                <p className="whitespace-pre-wrap">{msg.text}</p>
                                
                                {/* Sources Citation */}
                                {msg.sources && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <p className="text-xs font-bold text-gray-500 uppercase mb-1">Fuentes Consultadas:</p>
                                        {msg.sources.map((s, i) => (
                                            <div key={i} className="flex items-center gap-2 text-xs text-blue-600 bg-blue-50 p-1.5 rounded cursor-pointer hover:bg-blue-100 transition-colors mb-1">
                                                <BookOpenIcon className="w-3 h-3"/>
                                                <span className="truncate">{s.document} (Sec. {s.section})</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Time label */}
                        <span className={`text-[10px] text-gray-400 mt-1 mx-12 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp}
                        </span>

                        {/* Quick Action Chips (Only for AI messages) */}
                        {msg.sender === 'ai' && msg.suggestions && msg.suggestions.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2 ml-11 max-w-[90%]">
                                {msg.suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleQuickAction(suggestion)}
                                        className={`text-xs px-3 py-1.5 rounded-full shadow-sm transition-all transform hover:scale-105 active:scale-95 animate-fade-in flex items-center gap-2 ${
                                            suggestion.value === 'DONE' 
                                            ? 'bg-green-600 text-white hover:bg-green-700 border-transparent' 
                                            : 'bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700'
                                        }`}
                                        style={{ animationDelay: `${idx * 50}ms` }}
                                    >
                                        {getActionIcon(suggestion.type)}
                                        {suggestion.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md">
                            <TEfficiencyIcon className="w-5 h-5" />
                        </div>
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex items-center gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="bg-white p-4 border-t border-gray-200">
                <div className="max-w-4xl mx-auto flex items-center gap-3 bg-gray-100 rounded-full px-4 py-2 border border-gray-300 focus-within:ring-2 focus-within:ring-blue-500/50 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-sm">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                        <PaperclipIcon className="w-5 h-5" />
                    </button>
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Escribe tu respuesta aquí..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-800 placeholder-gray-400"
                        autoFocus
                    />
                    <button className="text-gray-400 hover:text-gray-600 transition-colors border-r border-gray-300 pr-3">
                        <MicrophoneIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => handleSend()}
                        disabled={!input.trim()}
                        className={`p-2 rounded-full transition-colors ${input.trim() ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-md' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
                    >
                        <SendIcon className="w-4 h-4" />
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-400 mt-2">
                    T-Efficiency AI puede cometer errores. Verifica la información importante en los documentos oficiales.
                </p>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #cbd5e1; border-radius: 20px; }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default AIAssistant;
