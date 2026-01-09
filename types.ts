
export type ProductionAuditView =
  | 'PA_DASHBOARD'
  | 'PA_COMPLIANCE_MAP'
  | 'PA_FORMS';

export type TechnicalAssistanceView =
  | 'TA_DASHBOARD'
  | 'TA_WORK_ORDERS'
  | 'TA_MACHINES'
  | 'TA_PROCEDURES';

export type DocumentControlView =
  | 'DOCUMENTS_BY_PROCESS'
  | 'CERTIFICATION_DOCUMENTS'
  | 'WORK_INSTRUCTIONS';

export type MainView =
  | 'AI_ASSISTANT'
  | 'RECENT_HISTORY'
  | 'DOCUMENT_CONTROL_SYSTEM'
  | 'PRODUCTION_AUDIT'
  | 'TECHNICAL_ASSISTANCE'
  | 'AI_VISION_QUALITY'
  | 'IA_CRM_ASSISTANT'
  | 'IA_RH_ASSISTANT'
  | 'PLANTS_PROCESS'
  | 'ADMINISTRATION'
  | 'SETTINGS';

export type View = MainView | ProductionAuditView | TechnicalAssistanceView | DocumentControlView;

export const ViewTitle: Record<View, string> = {
    AI_ASSISTANT: 'AI Assistant',
    RECENT_HISTORY: 'My Recent History',
    DOCUMENT_CONTROL_SYSTEM: 'Control de Documentos',
    PRODUCTION_AUDIT: 'Auditoria Produccion Inteligente',
    TECHNICAL_ASSISTANCE: 'Monitoreo Técnico Avanzado',
    CERTIFICATION_DOCUMENTS: 'Documentos Certificados',
    DOCUMENTS_BY_PROCESS: 'Documentos & Procedimientos',
    WORK_INSTRUCTIONS: 'Instrucciones de Trabajo',
    AI_VISION_QUALITY: 'AI Vision Quality Check',
    IA_CRM_ASSISTANT: 'AI Customer Service',
    IA_RH_ASSISTANT: 'AI Employee Service',
    PLANTS_PROCESS: 'Plants & Processes',
    ADMINISTRATION: 'Admin',
    SETTINGS: 'Config',

    // Production Audit Titles
    PA_DASHBOARD: 'Dashboard Auditorias Produccion',
    PA_COMPLIANCE_MAP: 'Mapa de Cumplimiento',
    PA_FORMS: 'Reportes & Formatos',

    // Technical Assistance Titles
    TA_DASHBOARD: 'Dashboard Mantenimiento',
    TA_WORK_ORDERS: 'Órdenes de Trabajo',
    TA_MACHINES: 'Máquinas',
    TA_PROCEDURES: 'Procedimientos',
};

// --- Context for AI Transitions ---
export interface AiStartContext {
    plantId?: string;
    processId?: string;
    subprocessId?: string;
    machineId: string;
    machineName: string;
    intent: 'query' | 'report'; // query = Consultar Info, report = Reportar Falla
}

// --- History Types ---
export type EventType = 'Consulta IA' | 'Orden de Trabajo' | 'Documento' | 'Diagnóstico' | 'Reclamo';
export type Criticality = 'low' | 'medium' | 'high' | 'info';

export interface HistoryEvent {
    id: string;
    type: EventType;
    title: string;
    user: string;
    timestamp: string;
    criticality: Criticality;
    details: Record<string, any>;
    hierarchy: string;
}

export interface MachineDocument {
  id: string;
  title: string;
  type: string;
  version: string;
  fileName: string;
  uploadDate: string;
}

export interface Machine {
  id: string;
  code: string;
  name: string;
  manufacturer: string;
  model: string;
  serial: string;
  // KPIs
  availability: number; // percentage 0-100
  mtbf: number; // hours
  mttr: number; // hours
  totalOts: number;
  openOts: number;
  documents?: MachineDocument[];
}

export type DocVersionStatus = 'current' | 'obsolete' | 'in_review' | 'expired';

export interface DocumentVersion {
  id: string;
  version: string;
  file: string; // File name reference
  uploadDate: string;
  renewalDate: string;
  status: DocVersionStatus;
  updatedBy: string;
}

export interface ProcedureDocumentItem {
  id: string;
  code: string;
  name: string;
  versions: DocumentVersion[];
}

export interface Procedure {
  id: string;
  title: string;
  description: string;
  reviewer: string;
  responsible: string;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  status: 'active' | 'obsolete';
  obsoleteDate?: string;
  documents: ProcedureDocumentItem[];
}

// --- Production Audit Report Types ---

export interface ReportField {
    id: string;
    code: string; // ReportCode + Seq
    ocrId: string; // Identifier for AI
    format: 'Entero' | 'Decimal' | 'Porcentaje' | 'Texto';
    uom: string; // Unit of Measure
    minParam: number | string;
    maxParam: number | string;
    optimalResult: 'Igual' | 'Igual o Inferior' | 'Igual o Superior';
    optimalValue: number | string;
    hasObservations: boolean;
    
    // AI Mapping Coordinates (Percentage 0-100 relative to document)
    mapping?: { x: number; y: number; w: number; h: number };
    obsMapping?: { x: number; y: number; w: number; h: number };
}

export interface ReportSchedule {
    id: string;
    time: string; // "08:00"
    loadResponsibles: string[];
    reviewResponsibles: string[];
}

export interface ProductionReport {
    id: string;
    code: string;
    name: string;
    description: string;
    
    // Schedules with Responsibles
    schedules: ReportSchedule[];
    
    // Global Reviewers (Optional fallback or oversight)
    generalReviewers: string[]; 

    // Notification Settings
    notifyOutOfParam: { platform: boolean; email: boolean; whatsapp: boolean };
    notifyLate: { platform: boolean; email: boolean; whatsapp: boolean };
    
    resultIntegration: 'Suma' | 'Promedio' | 'N/A';
    // Integrated Parameters
    integratedMinParam?: number | string;
    integratedMaxParam?: number | string;
    integratedOptimalResult?: 'Igual' | 'Igual o Inferior' | 'Igual o Superior';
    integratedOptimalValue?: number | string;
    
    fields: ReportField[];
    documentImage?: string; // URL/Base64 of the physical report template
    qrCode?: string; // Generated link/code
}

// Data structure for Plants & Process view
export interface Subprocess {
  id: string;
  name: string;
  description: string;
  machines?: Machine[];
  procedures?: Procedure[];
  reports?: ProductionReport[];
}

export interface Process {
  id: string;
  name: string;
  description: string;
  subprocesses: Subprocess[];
  machines?: Machine[];
  procedures?: Procedure[];
  reports?: ProductionReport[];
}

export interface Plant {
  id: string;
  name: string;
  location: string;
  description: string;
  processes: Process[];
  machines?: Machine[];
  procedures?: Procedure[];
  reports?: ProductionReport[];
}

// --- Work Order Types (Moved from TaWorkOrders) ---

export type WorkOrderStatus = 'unassigned' | 'assigned' | 'in_progress' | 'on_hold' | 'testing' | 'closed' | 'cancelled';
export type WorkOrderPriority = 'P1' | 'P2' | 'P3';
export type RiskLevel = 'Bajo' | 'Medio' | 'Alto';
export type MachineStatus = 'Paro total' | 'Funciona con falla' | 'Solo alarma en pantalla' | 'Duda de operación';

export interface WorkOrderLog {
    date: string;
    action: string;
    user: string;
    comment?: string;
}

export interface SupplyItem {
    id: string;
    description: string;
    quantity: string;
}

export interface TechnicalReport {
    inspections: string;
    measurements: string;
    observations: string; // New field
    diagnosis: string;
    aiMatch: 'yes' | 'no' | null;
    rootCause: string;
    actions: string[]; // Selected checkboxes
    otherActionDetail: string;
    supplies: SupplyItem[];
    preventiveMeasures: string;
}

export interface WorkOrder {
    id: string;
    otNumber: string;
    // Location & Machine
    plantId: string;
    plantName: string;
    processName: string;
    subprocessName: string;
    machineId: string;
    machineCode: string;
    machineName: string;
    
    // Request Data
    reportDate: string; // ISO String
    detectorName: string;
    shift: string;
    requestType: string;
    machineStatus: MachineStatus;
    description: string;
    symptoms: string[];
    operatingHours?: string;
    safetyRisk?: string;
    failureMoment?: string;

    // Detailed Report Data
    alarmCodes?: string;
    alarmMessages?: string;
    sinceWhen?: string;
    frequency?: string;
    productModel?: string;
    recentAdjustments?: string; // "yes" | "no"
    adjustmentsDetail?: string;
    impactProduction?: string;
    impactQuality?: string; // "yes" | "no"
    defectType?: string;
    defectDescription?: string;
    evidenceFiles?: string[]; // URLs of attached files
    
    // AI Data (Pre-diagnosis)
    aiData?: {
        classification: string;
        priority: WorkOrderPriority;
        riskLevel: RiskLevel;
        productionImpact: string;
        qualityImpact: boolean;
        operatorInstructions: string;
        rootCauses: { cause: string; probability: string }[];
        suggestedActions: string[];
    };

    // Technical Execution Data
    technicalReport?: TechnicalReport;

    // Management
    status: WorkOrderStatus;
    assignedTo: string; // User ID or Name
    slaTarget: string; // ISO String
    
    // Tracking
    logs: WorkOrderLog[];
    startedAt?: string;
    closedAt?: string;
}

// --- Admin Module Types ---

export type AccessScope = 'Total' | 'Planta' | 'Proceso' | 'Subproceso';

export interface UserAccessAssignment {
    id: string;
    scope: AccessScope;
    plant?: string;
    process?: string;
    subprocess?: string;
}

export interface User {
    id: string; // Consecutivo automatico de la plataforma (e.g., U-1001)
    employeeId: string; // # Interno
    name: string;
    position: string; // Puesto
    role: string;
    whatsapp: string;
    email: string;
    status: 'active' | 'inactive';
    accessAssignments: UserAccessAssignment[];
    avatar?: string;
    password?: string;
}

export interface Permission {
    id: string;
    name: string;
    module: 'Audit' | 'Maintenance' | 'Docs' | 'Admin' | 'AI';
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: string[]; // List of Permission IDs
}
