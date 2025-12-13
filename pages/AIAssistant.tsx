
import React, { useState, useEffect, useRef } from 'react';
import { Plant, Process, Subprocess, Machine, Procedure, WorkOrder, WorkOrderPriority, RiskLevel, MachineStatus, HistoryEvent } from '../types';
import { 
    PaperclipIcon, SendIcon, MicrophoneIcon, UserIcon, TEfficiencyIcon, 
    ArrowPathIcon, PlantIcon, ManufacturingIcon, WrenchScrewdriverIcon, DocumentTextIcon,
    TicketIcon, ClockIcon, ExclamationTriangleIcon, SignalIcon, CameraIcon, BookOpenIcon,
    SearchIcon
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
          'opt_mode' | // New: Choose between OT and Info
          'opt_shift' | 'opt_req_type' | 'opt_status' | 'opt_moment' | 'opt_impact_prod' | 'opt_impact_qual' | 'opt_evidence' | 'opt_priority' | 'action_confirm';
}

interface ChatMessage {
    id: number;
    sender: 'user' | 'ai';
    text: string;
    timestamp: string;
    sources?: Source[];
    suggestions?: QuickAction[]; 
    isSystemMsg?: boolean; // For WO creation success banners
}

interface WorkOrderDraft {
    machineId?: string;
    machineName?: string;
    shift?: string;
    requestType?: string;
    
    // Detailed Technical Info
    machineStatus?: string;
    failureMoment?: string;
    description?: string; // includes symptoms
    alarms?: string;
    timingFrequency?: string;
    productContext?: string; // includes adjustments
    impactProduction?: string;
    impactQuality?: string;
    evidenceAttached?: boolean;

    priority?: string;
}

interface QueryDraft {
    need?: string;
    reason?: string;
}

// Logic States
type FlowStep = 
    | 'navigation'      // Standard tree navigation
    | 'select_action_mode' // New: OT vs Query decision
    | 'view_procedure'  // New: Viewing a procedure
    
    // Branch A: Information Query
    | 'check_docs_availability' // Internal check state
    | 'no_docs_found'           // Error state: No RAG data
    | 'collect_query_need'
    | 'collect_query_reason'
    | 'answering_query'

    // Branch B: Work Order Wizard
    | 'collect_shift'   // Wizard Step 1
    | 'collect_type'    // Wizard Step 2
    | 'mode_doubt'      // Legacy small doubt inside OT flow (optional, can merge with Query)
    | 'collect_status'
    | 'collect_moment'
    | 'collect_desc'
    | 'collect_alarms'
    | 'collect_timing'
    | 'collect_context'
    | 'collect_impact_prod'
    | 'collect_impact_qual'
    | 'collect_evidence'
    | 'collect_priority'
    
    | 'finished';       // Done

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
}

const AIAssistant = ({ plants, onAddWorkOrder, onAddHistoryEvent }: AIAssistantProps) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    
    // Initial Context
    const [context, setContext] = useState<ContextState>({
        flowStep: 'navigation',
        woDraft: {},
        queryDraft: {}
    });
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Initial Greeting
    useEffect(() => {
        if (messages.length === 0) {
            simulateAIResponse("initial");
        }
    }, []);

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isTyping]);

    // --- LOGIC ENGINE ---

    const getCurrentNode = (currentContext: ContextState) => {
        let node: any = null;
        let options: QuickAction[] = [];

        // 0. Leaf Selected (Navigation Done -> Handled by Wizard Logic mostly)
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
            // For procedures, we might want to find the node too
            if (currentContext.leafType === 'procedure') {
                 // Simplified lookup: iterate all to find procedure
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

    // Helper: Check if context has any documents
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

    // Mock Search Function
    const mockSearchDocuments = (ctx: ContextState) => {
        // In a real app, this would search a vector database
        const plant = plants.find(p => p.id === ctx.plantId);
        const process = plant?.processes.find(p => p.id === ctx.processId);
        const subprocess = process?.subprocesses.find(s => s.id === ctx.subprocessId);
        
        // Collect relevant documents names for flavor
        let relevantDocs: string[] = [];
        if (subprocess?.procedures) relevantDocs.push(...subprocess.procedures.map(p => p.title));
        if (process?.procedures) relevantDocs.push(...process.procedures.map(p => p.title));
        if (plant?.procedures) relevantDocs.push(...plant.procedures.map(p => p.title));

        const docName = relevantDocs.length > 0 ? relevantDocs[0] : "Manual de Operación General";
        
        return {
            answer: `He analizado la documentación disponible en **${subprocess?.name || process?.name || plant?.name}**.\n\nBasado en tu necesidad ("${ctx.queryDraft.need}") para ("${ctx.queryDraft.reason}"):\n\nEl documento indica que para este procedimiento se debe verificar primero la alimentación neumática a 6 bar. Posteriormente, consulte la sección 4.2 donde se especifican los torques de ajuste.`,
            sources: [
                { document: docName, page: Math.floor(Math.random() * 50) + 1, section: '4.2 Ajustes' },
                { document: 'Normativa ISO 9001:2015', page: 12, section: 'Control Operacional' }
            ]
        };
    };

    const simulateAIResponse = async (trigger: string, overrideContext?: ContextState) => {
        setIsTyping(true);
        const ctx = overrideContext || context;
        const { node, options: navOptions, level } = getCurrentNode(ctx);

        const delay = Math.random() * 500 + 600; 
        
        setTimeout(() => {
            let responseText = "";
            let finalOptions: QuickAction[] = navOptions;
            let isSystem = false;
            let sources: Source[] | undefined = undefined;

            // --- STANDARD NAVIGATION FLOW ---
            if (ctx.flowStep === 'navigation') {
                if (trigger === "initial") {
                    responseText = "¡Hola! Soy tu asistente de manufactura inteligente. \n\nPara darte la información más precisa, necesito ubicar el contexto. ¿Sobre qué **Planta** deseas realizar tu consulta hoy?";
                } else if (trigger === "reset") {
                    responseText = "Entendido, reiniciemos. ¿En qué planta nos enfocamos?";
                } else if (navOptions.length === 0 && level !== 'root' && level !== 'leaf') {
                    // NEW: Empty Context Handling
                    const locationName = node?.name || 'esta ubicación';
                    responseText = `⚠️ **Sin Información Configurada**\n\nLa ubicación **${locationName}** no tiene procesos, máquinas ni documentos registrados actualmente.\n\nPor favor selecciona otra ubicación o contacta al administrador.`;
                    finalOptions = [{ label: "Volver al Inicio", value: "reset", type: "reset" }];
                } else if (level === 'plant') {
                    responseText = `Excelente. Estamos en **${node.name}**. \n\nSelecciona un área o un activo directo:`;
                } else if (level === 'process') {
                    responseText = `Bien, revisando **${node.name}**. \n\nSelecciona el subproceso o equipo:`;
                } else if (level === 'subprocess') {
                    responseText = `En **${node.name}** tengo estos activos. Selecciona uno para comenzar asistencia:`;
                }
            } 
            
            // --- MACHINE SELECTED: DECISION POINT ---
            else if (ctx.leafType === 'machine' && ctx.flowStep === 'select_action_mode') {
                const machineName = node?.name || 'la máquina';
                responseText = `Has seleccionado **${machineName}**. \n\n¿Cómo puedo asistirte con este equipo?\n\n1. **Reportar Falla/OT**: Si el equipo está detenido, con alarma o falla.\n2. **Consultar Información**: Si tienes una duda técnica, buscas un manual o procedimiento.`;
                finalOptions = [
                    { label: "🚨 Reportar Falla / Crear OT", value: "mode_wo", type: "opt_mode" },
                    { label: "🔍 Consultar Información / Duda", value: "mode_query", type: "opt_mode" }
                ];
            }

            // --- BRANCH A: INFORMATION QUERY FLOW (LOGIC UPDATED) ---
            else if (ctx.flowStep === 'no_docs_found') {
                // New State: Handled when no documents exist for the context
                responseText = `⚠️ **Sin Información Disponible**\n\nNo he encontrado manuales, procedimientos o guías técnicas vinculadas a **${node?.name || 'este equipo'}** o su proceso padre.\n\nSin documentación base, no puedo responder consultas técnicas específicas. ¿Qué deseas hacer?`;
                finalOptions = [
                    { label: "🚨 Reportar Falla / Crear OT", value: "mode_wo", type: "opt_mode" },
                    { label: "Reiniciar búsqueda", value: "reset", type: "reset" }
                ];
            }
            else if (ctx.flowStep === 'collect_query_need') {
                responseText = "Entendido, modo de consulta activado. 🧠\n\nPor favor dime, **¿Cuál es tu necesidad específica o qué estás buscando?**";
                finalOptions = []; // Free text input
            }
            else if (ctx.flowStep === 'collect_query_reason') {
                responseText = `Comprendido: "${ctx.queryDraft.need}".\n\nPara filtrar mejor los resultados, **¿Para qué necesitas esta información o cuál es el motivo de la consulta?**\n(Ej. Auditoría, Entrenamiento, Ajuste, Duda puntual)`;
                finalOptions = []; // Free text input
            }
            else if (ctx.flowStep === 'answering_query') {
                const result = mockSearchDocuments(ctx);
                responseText = result.answer;
                sources = result.sources;
                
                // Log to history
                const hierarchy = plants.find(p => p.id === ctx.plantId)?.name || 'Planta';
                onAddHistoryEvent({
                    id: `hist-${Date.now()}`,
                    type: 'Consulta IA',
                    title: `Consulta: ${ctx.queryDraft.need?.substring(0, 30)}...`,
                    user: 'Usuario Actual',
                    timestamp: 'Hace un momento',
                    criticality: 'info',
                    details: { 
                        need: ctx.queryDraft.need,
                        reason: ctx.queryDraft.reason,
                        answer: result.answer 
                    },
                    hierarchy: hierarchy
                });

                finalOptions = [
                    { label: "Nueva Consulta", value: "reset", type: "reset" }
                ];
            }

            // --- BRANCH B: WORK ORDER WIZARD FLOW ---
            else if (ctx.leafType === 'machine') {
                const machineName = node?.name || 'la máquina';

                if (ctx.flowStep === 'collect_shift') {
                    responseText = `Iniciando reporte para **${machineName}**. \n\n¿En qué **Turno** te encuentras?`;
                    finalOptions = [
                        { label: "Turno 1", value: "Turno 1", type: "opt_shift" },
                        { label: "Turno 2", value: "Turno 2", type: "opt_shift" },
                        { label: "Turno 3", value: "Turno 3", type: "opt_shift" },
                        { label: "Mixto", value: "Mixto", type: "opt_shift" }
                    ];
                } 
                else if (ctx.flowStep === 'collect_type') {
                    responseText = `Registrado: ${ctx.woDraft.shift}. \n\n¿Qué **Tipo de Solicitud** deseas realizar?`;
                    finalOptions = [
                        { label: "Falla / Mto. Correctivo", value: "Mantenimiento correctivo", type: "opt_req_type" },
                        { label: "Alarma en Equipo", value: "Alarma en equipo", type: "opt_req_type" },
                        { label: "Comportamiento Anómalo", value: "Comportamiento anómalo", type: "opt_req_type" },
                        { label: "Duda de Operación (Escalar)", value: "Duda de operación", type: "opt_req_type" }
                    ];
                }
                // --- DETAILED WO FLOW START ---
                else if (ctx.flowStep === 'collect_status') {
                    responseText = `¿Cuál es el **Estado Actual** de la máquina?`;
                    finalOptions = [
                        { label: "Paro Total", value: "Paro total", type: "opt_status" },
                        { label: "Funciona con Falla", value: "Funciona con falla", type: "opt_status" },
                        { label: "Solo Alarma", value: "Solo alarma en pantalla", type: "opt_status" },
                        { label: "Duda Operativa", value: "Duda de operación", type: "opt_status" }
                    ];
                }
                else if (ctx.flowStep === 'collect_moment') {
                    responseText = `¿En qué **Momento** se presenta la falla?`;
                    finalOptions = [
                        { label: "Continua", value: "Continua", type: "opt_moment" },
                        { label: "Intermitente", value: "Intermitente", type: "opt_moment" },
                        { label: "Al Arrancar", value: "Al arrancar", type: "opt_moment" },
                        { label: "Operación Normal", value: "Operación normal", type: "opt_moment" }
                    ];
                }
                else if (ctx.flowStep === 'collect_desc') {
                    responseText = `Por favor, describe detalladamente la falla e indica los **Síntomas Observados** (ruidos, fugas, etc.).`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_alarms') {
                    responseText = `¿Existen **Códigos o Mensajes de Alarma**? \n\nEscríbelos a continuación (o escribe "Ninguno").`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_timing') {
                    responseText = `¿**Desde cuándo** ocurre el problema y con qué **Frecuencia**?`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_context') {
                    responseText = `Para el contexto operativo: \n\n1. ¿Qué **Modelo/Producto** está corriendo? \n2. ¿Se realizaron **Ajustes Recientes**? (Si sí, ¿cuáles?)`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_impact_prod') {
                    responseText = `¿Cuál es el **Impacto en Producción**?`;
                    finalOptions = [
                        { label: "Paro Total", value: "Paro total", type: "opt_impact_prod" },
                        { label: "Paros Frecuentes", value: "Paros frecuentes", type: "opt_impact_prod" },
                        { label: "Reducción Velocidad", value: "Reducción velocidad", type: "opt_impact_prod" },
                        { label: "Sin Impacto", value: "Sin impacto", type: "opt_impact_prod" }
                    ];
                }
                else if (ctx.flowStep === 'collect_impact_qual') {
                    responseText = `¿Existe **Impacto en Calidad**? \n\nSi es afirmativo, describe el defecto. Si no, escribe "No".`;
                    finalOptions = []; // Text input
                }
                else if (ctx.flowStep === 'collect_evidence') {
                    responseText = `¿Deseas adjuntar **Fotografías de Evidencia** para agilizar el diagnóstico?`;
                    finalOptions = [
                        { label: "📸 Adjuntar Foto (Simulado)", value: "yes", type: "opt_evidence" },
                        { label: "Omitir", value: "no", type: "opt_evidence" }
                    ];
                }
                else if (ctx.flowStep === 'collect_priority') {
                    responseText = `Gracias por la información detallada. \n\nPor último, según tu criterio, ¿Qué **Prioridad** asignarías a este evento?`;
                    finalOptions = [
                        { label: "P1 - Crítica (Paro)", value: "P1", type: "opt_priority" },
                        { label: "P2 - Alta (Falla)", value: "P2", type: "opt_priority" },
                        { label: "P3 - Normal", value: "P3", type: "opt_priority" }
                    ];
                }
                else if (ctx.flowStep === 'finished') {
                    // 1. GENERATE PRE-DIAGNOSIS (SIMULATED)
                    const operatorInstructions = "⚠️ PRECAUCIÓN: No intente reiniciar el equipo si hay ruidos anormales.\n\n1. Verificar suministro eléctrico.\n2. Revisar nivel de fluidos.\n3. Aislar la zona.";
                    const aiRisk = ctx.woDraft.priority === 'P1' || ctx.woDraft.machineStatus === 'Paro total' ? 'Alto' : 'Medio';
                    
                    const aiData = {
                        classification: "Falla Mecánica General (Auto-Generado)",
                        priority: ctx.woDraft.priority as WorkOrderPriority,
                        riskLevel: aiRisk as RiskLevel,
                        productionImpact: ctx.woDraft.impactProduction || 'Sin impacto',
                        qualityImpact: ctx.woDraft.impactQuality !== 'No',
                        operatorInstructions: operatorInstructions,
                        rootCauses: [{ cause: "Desgaste de componentes", probability: "75%" }],
                        suggestedActions: ["Inspección visual", "Revisión de bitácora"]
                    };

                    // 2. CREATE WORK ORDER OBJECT
                    const otId = `OT-${Math.floor(Math.random() * 9000) + 1000}`;
                    const newWorkOrder: WorkOrder = {
                        id: `wo-${Date.now()}`,
                        otNumber: otId,
                        plantId: ctx.plantId || '',
                        plantName: plants.find(p => p.id === ctx.plantId)?.name || 'Planta',
                        processName: 'Proceso Auto',
                        subprocessName: 'Subproceso Auto',
                        machineId: ctx.leafId || '',
                        machineCode: 'M-AUTO', // In real app would look up code from node
                        machineName: node?.name || 'Máquina',
                        reportDate: new Date().toISOString(),
                        detectorName: 'Usuario IA',
                        shift: ctx.woDraft.shift || 'Turno 1',
                        requestType: ctx.woDraft.requestType || 'Falla',
                        machineStatus: (ctx.woDraft.machineStatus as MachineStatus) || 'Funciona con falla',
                        description: ctx.woDraft.description || 'Reporte generado vía IA',
                        symptoms: [],
                        aiData: aiData,
                        status: 'unassigned',
                        assignedTo: '',
                        slaTarget: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
                        logs: [{ date: new Date().toISOString(), action: 'Creación vía IA', user: 'Asistente IA' }],
                        technicalReport: {
                             inspections: '', measurements: '', diagnosis: '', aiMatch: null, rootCause: '', actions: [], otherActionDetail: '', supplies: '', preventiveMeasures: ''
                        }
                    };

                    // 3. EXECUTE CALLBACK TO ADD TO DASHBOARD
                    onAddWorkOrder(newWorkOrder);

                    // 4. ADD TO HISTORY
                    onAddHistoryEvent({
                        id: `hist-${Date.now()}`,
                        type: 'Orden de Trabajo',
                        title: `OT Generada: ${otId}`,
                        user: 'Usuario Actual',
                        timestamp: 'Hace un momento',
                        criticality: aiRisk === 'Alto' ? 'high' : 'medium',
                        details: { 
                            status: 'Abierta', 
                            priority: ctx.woDraft.priority, 
                            assignedTo: 'Por Asignar' 
                        },
                        hierarchy: `${newWorkOrder.plantName} / ${newWorkOrder.machineName}`
                    });

                    // 5. RESPONSE TO USER
                    responseText = `✅ **Solicitud Generada Exitosamente**\n\n**Folio:** ${otId}\n**Máquina:** ${machineName}\n\n🤖 **PRE-DIAGNÓSTICO IA:**\n\n**Instrucciones al Operador:**\n${operatorInstructions}\n\n**Riesgo:** ${aiRisk}\n**Acción:** He notificado al equipo técnico. Puedes ver la orden en el Tablero.`;
                    isSystem = true;
                    finalOptions = [
                        { label: "Nueva Consulta", value: "reset", type: "reset" }
                    ];
                }
            }
            
            // --- PROCEDURE FLOW (Simple) ---
            else if (ctx.flowStep === 'view_procedure') {
                 const procTitle = node?.title || 'Procedimiento';
                 responseText = `He cargado el procedimiento **${procTitle}**. Puedes hacerme preguntas sobre su contenido.`;
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

        // 1. Add User Message
        const userMsg: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: text,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // 2. Process Logic based on State
        const currentDraft = { ...context.woDraft };
        const currentQuery = { ...context.queryDraft };
        let nextStep: FlowStep | null = null;

        // --- QUERY BRANCH TEXT INPUTS ---
        if (context.flowStep === 'collect_query_need') {
            currentQuery.need = text;
            nextStep = 'collect_query_reason';
        }
        else if (context.flowStep === 'collect_query_reason') {
            currentQuery.reason = text;
            nextStep = 'answering_query';
        }
        
        // --- WO BRANCH TEXT INPUTS ---
        else if (context.flowStep === 'collect_desc') {
            currentDraft.description = text;
            nextStep = 'collect_alarms';
        }
        else if (context.flowStep === 'collect_alarms') {
            currentDraft.alarms = text;
            nextStep = 'collect_timing';
        }
        else if (context.flowStep === 'collect_timing') {
            currentDraft.timingFrequency = text;
            nextStep = 'collect_context';
        }
        else if (context.flowStep === 'collect_context') {
            currentDraft.productContext = text;
            nextStep = 'collect_impact_prod';
        }
        else if (context.flowStep === 'collect_impact_qual') {
            currentDraft.impactQuality = text;
            nextStep = 'collect_evidence';
        }

        if (nextStep) {
            const newContext = { ...context, woDraft: currentDraft, queryDraft: currentQuery, flowStep: nextStep };
            setContext(newContext);
            simulateAIResponse("next_step", newContext);
        } else {
            // Default NLP Match for navigation if not in wizard flow
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
            setContext({ flowStep: 'navigation', woDraft: {}, queryDraft: {} });
            simulateAIResponse("reset", { flowStep: 'navigation', woDraft: {}, queryDraft: {} });
            return;
        }

        const newContext = { ...context };

        // NAVIGATION LOGIC
        if (['plant', 'process', 'subprocess', 'machine', 'procedure'].includes(action.type)) {
            if (action.type === 'plant') newContext.plantId = action.value;
            if (action.type === 'process') newContext.processId = action.value;
            if (action.type === 'subprocess') newContext.subprocessId = action.value;
            
            if (action.type === 'machine') {
                newContext.leafId = action.value;
                newContext.leafType = 'machine';
                // CHANGE: Instead of going straight to shift, we go to Mode Selection
                newContext.flowStep = 'select_action_mode'; 
                newContext.woDraft = { machineId: action.value, machineName: action.label };
            } else if (action.type === 'procedure') {
                newContext.leafId = action.value;
                newContext.leafType = 'procedure';
                newContext.flowStep = 'view_procedure';
            }
        }

        // --- MODE SELECTION ---
        if (action.type === 'opt_mode') {
            if (action.value === 'mode_wo') {
                newContext.flowStep = 'collect_shift';
            } else if (action.value === 'mode_query') {
                // UPDATE: Check availability before collecting need
                const docCount = getAvailableDocsCount(newContext);
                if (docCount > 0) {
                    newContext.flowStep = 'collect_query_need';
                } else {
                    newContext.flowStep = 'no_docs_found';
                }
            }
        }

        // --- WO WIZARD LOGIC ---
        if (action.type === 'opt_shift') {
            newContext.woDraft.shift = action.value;
            newContext.flowStep = 'collect_type';
        }
        else if (action.type === 'opt_req_type') {
            newContext.woDraft.requestType = action.value;
            // Go to full flow starting with Status for everything
            newContext.flowStep = 'collect_status';
        }
        else if (action.type === 'opt_status') {
            newContext.woDraft.machineStatus = action.value;
            newContext.flowStep = 'collect_moment';
        }
        else if (action.type === 'opt_moment') {
            newContext.woDraft.failureMoment = action.value;
            newContext.flowStep = 'collect_desc';
        }
        else if (action.type === 'opt_impact_prod') {
            newContext.woDraft.impactProduction = action.value;
            newContext.flowStep = 'collect_impact_qual';
        }
        else if (action.type === 'opt_evidence') {
            newContext.woDraft.evidenceAttached = action.value === 'yes';
            // If user clicked simulate upload, maybe show a little toast?
            newContext.flowStep = 'collect_priority';
        }
        else if (action.type === 'opt_priority') {
            newContext.woDraft.priority = action.value;
            newContext.flowStep = 'finished';
        }

        setContext(newContext);
        
        // Visual Ack
        const userAck: ChatMessage = {
            id: Date.now(),
            sender: 'user',
            text: action.label,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages(prev => [...prev, userAck]);

        simulateAIResponse("action", newContext);
    };

    const getActionIcon = (type: string) => {
        switch(type) {
            case 'plant': return <PlantIcon className="w-3 h-3" />;
            case 'process': return <ManufacturingIcon className="w-3 h-3" />;
            case 'subprocess': return <ManufacturingIcon className="w-3 h-3" />;
            case 'machine': return <WrenchScrewdriverIcon className="w-3 h-3" />;
            case 'procedure': return <DocumentTextIcon className="w-3 h-3" />;
            case 'reset': return <ArrowPathIcon className="w-3 h-3" />;
            
            case 'opt_mode': return <SignalIcon className="w-3 h-3" />; // Icon for Mode Selection

            case 'opt_shift': return <ClockIcon className="w-3 h-3" />;
            case 'opt_req_type': return <TicketIcon className="w-3 h-3" />;
            case 'opt_status': return <SignalIcon className="w-3 h-3" />;
            case 'opt_moment': return <ClockIcon className="w-3 h-3" />;
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
                                        className="bg-white border border-blue-200 hover:border-blue-400 hover:bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full shadow-sm transition-all transform hover:scale-105 active:scale-95 animate-fade-in flex items-center gap-2"
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
                        placeholder={
                            ['collect_desc', 'collect_alarms', 'collect_timing', 'collect_context', 'collect_impact_qual', 'collect_query_need', 'collect_query_reason'].includes(context.flowStep) ? "Escribe tu respuesta aquí..." :
                            context.flowStep === 'mode_doubt' ? "Escribe tu pregunta técnica..." : 
                            "Escribe o selecciona una opción..."
                        }
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
