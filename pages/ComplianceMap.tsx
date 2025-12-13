
import React, { useState, useEffect } from 'react';
import { Plant, Process, Subprocess, ProductionReport, ReportField } from '../types';
import { PlantIcon, ManufacturingIcon, DocumentTextIcon, CheckCircleIcon, ExclamationTriangleIcon, ClockIcon, UserIcon, ArrowUpOnSquareIcon, CameraIcon, XIcon, BeakerIcon } from '../components/icons/Icons';

interface ComplianceMapProps {
    plants: Plant[];
}

// --- MOCK STATUS GENERATOR ---
const getMockStatus = (reportCode: string) => {
    const seed = reportCode.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const scenario = seed % 5;

    const baseData = {
        lastLoad: { time: '08:00 AM', status: 'early', responsible: 'Juan Perez', supervisor: 'Ing. Martinez' },
        result: { value: '98%', status: 'optimal' },
        nextLoad: { time: '12:00 PM', responsible: 'Maria Garcia', supervisor: 'Ing. Martinez', status: 'pending' }
    };

    switch (scenario) {
        case 0: // Perfect
            return { 
                ...baseData, 
                lastLoad: { time: '07:55 AM', status: 'early', responsible: 'Ana Lopez', supervisor: 'Sup. Rivas' },
                result: { value: '100%', status: 'optimal' }
            };
        case 1: // Late Load
            return { 
                ...baseData, 
                lastLoad: { time: '08:45 AM', status: 'late', responsible: 'Carlos Ruiz', supervisor: 'Sup. Rivas' },
                result: { value: '99%', status: 'optimal' }
            };
        case 2: // Warning Result
            return { 
                ...baseData, 
                lastLoad: { time: '08:10 AM', status: 'early', responsible: 'Pedro Gomez', supervisor: 'Ing. Cantu' },
                result: { value: 'Warn', status: 'warning' }
            };
        case 3: // Critical Result
            return { 
                ...baseData, 
                lastLoad: { time: '08:05 AM', status: 'early', responsible: 'Luis Hernandez', supervisor: 'Ing. Cantu' },
                result: { value: 'Crit', status: 'critical' }
            };
        case 4: // Missing Load
            return { 
                ...baseData, 
                lastLoad: { time: '--:--', status: 'missing', responsible: 'Pendiente', supervisor: 'Pendiente' },
                result: { value: '-', status: 'none' },
                nextLoad: { time: '09:00 AM', responsible: 'Ana Lopez', supervisor: 'Sup. Rivas', status: 'pending' } // Overdue?
            };
        default:
            return baseData;
    }
};

// --- UPLOAD MODAL COMPONENT ---

interface UploadLoadModalProps {
    isOpen: boolean;
    onClose: () => void;
    report: ProductionReport | null;
}

const UploadLoadModal: React.FC<UploadLoadModalProps> = ({ isOpen, onClose, report }) => {
    const [step, setStep] = useState<1 | 2>(1); // 1: Capture, 2: Extract/Verify
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [extractedData, setExtractedData] = useState<Record<string, string>>({});

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setImagePreview(null);
            setExtractedData({});
            setIsProcessing(false);
        }
    }, [isOpen]);

    if (!isOpen || !report) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const url = URL.createObjectURL(e.target.files[0]);
            setImagePreview(url);
        }
    };

    const handleProcessImage = () => {
        setIsProcessing(true);
        // Simulate AI OCR Delay
        setTimeout(() => {
            // Generate mock extracted values based on field types
            const mockValues: Record<string, string> = {};
            report.fields.forEach(field => {
                if (field.format === 'Entero') {
                    mockValues[field.id] = Math.floor(Math.random() * 100).toString();
                } else if (field.format === 'Decimal') {
                    mockValues[field.id] = (Math.random() * 100).toFixed(2);
                } else if (field.format === 'Porcentaje') {
                    mockValues[field.id] = Math.floor(Math.random() * 100) + '%';
                } else {
                    mockValues[field.id] = "OK";
                }
            });
            setExtractedData(mockValues);
            setIsProcessing(false);
            setStep(2);
        }, 2000);
    };

    const handleDataChange = (fieldId: string, value: string) => {
        setExtractedData(prev => ({ ...prev, [fieldId]: value }));
    };

    const handleSubmit = () => {
        // Logic to save data to backend would go here
        alert("Información cargada exitosamente a la base de datos.");
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-gray-800 text-white p-4 flex justify-between items-center shrink-0">
                    <div>
                        <h3 className="font-bold text-lg">Nueva Carga: {report.name}</h3>
                        <p className="text-gray-400 text-xs mt-1">
                            {step === 1 ? 'Paso 1: Captura de Evidencia' : 'Paso 2: Validación de Datos Extraídos'}
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors"><XIcon className="w-6 h-6"/></button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                    {step === 1 && (
                        <div className="flex flex-col items-center justify-center h-full space-y-6 py-8">
                            <div className="w-full max-w-lg p-10 border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl flex flex-col items-center text-center relative hover:bg-blue-100 transition-colors cursor-pointer group">
                                <input 
                                    type="file" 
                                    accept="image/*" 
                                    capture="environment" 
                                    className="absolute inset-0 opacity-0 cursor-pointer" 
                                    onChange={handleFileChange}
                                />
                                {imagePreview ? (
                                    <div className="relative w-full h-64">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-contain rounded-lg shadow-sm"/>
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                            <span className="text-white font-bold flex items-center gap-2"><CameraIcon className="w-5 h-5"/> Cambiar Foto</span>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <CameraIcon className="w-16 h-16 text-blue-400 mb-4 group-hover:scale-110 transition-transform"/>
                                        <h4 className="text-lg font-bold text-blue-800">Tomar Fotografía</h4>
                                        <p className="text-sm text-blue-600 mt-2">Toque aquí para abrir la cámara o subir archivo</p>
                                    </>
                                )}
                            </div>

                            {imagePreview && (
                                <button 
                                    onClick={handleProcessImage}
                                    disabled={isProcessing}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg flex items-center gap-3 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {isProcessing ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                            Analizando con IA...
                                        </>
                                    ) : (
                                        <>
                                            <BeakerIcon className="w-5 h-5"/>
                                            Procesar y Extraer Datos
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col lg:flex-row gap-6 h-full">
                            {/* Left: Image Reference */}
                            <div className="lg:w-1/3 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden border border-gray-300 relative min-h-[300px]">
                                {imagePreview && <img src={imagePreview} alt="Ref" className="max-w-full max-h-full object-contain" />}
                                <div className="absolute top-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">Evidencia Original</div>
                            </div>

                            {/* Right: Digital Form */}
                            <div className="flex-1 bg-white rounded-lg border border-gray-200 shadow-sm flex flex-col">
                                <div className="p-4 border-b border-gray-100 bg-blue-50/50">
                                    <h4 className="font-bold text-gray-800 flex items-center gap-2">
                                        <DocumentTextIcon className="w-5 h-5 text-blue-600"/>
                                        Datos del Reporte
                                    </h4>
                                    <p className="text-xs text-gray-500 mt-1">Verifique los valores extraídos y edite si es necesario.</p>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                    {report.fields.map((field) => (
                                        <div key={field.id} className="grid grid-cols-12 gap-4 items-center hover:bg-gray-50 p-2 rounded transition-colors">
                                            <div className="col-span-12 sm:col-span-5">
                                                <label className="text-xs font-bold text-gray-700 block">{field.ocrId}</label>
                                                <span className="text-[10px] text-gray-400 font-mono">{field.code}</span>
                                            </div>
                                            <div className="col-span-12 sm:col-span-7 relative">
                                                <input 
                                                    type={field.format === 'Texto' ? 'text' : 'number'}
                                                    value={extractedData[field.id] || ''}
                                                    onChange={(e) => handleDataChange(field.id, e.target.value)}
                                                    className={`w-full border rounded px-3 py-2 text-sm font-semibold focus:ring-2 focus:ring-blue-500 outline-none ${
                                                        // Simple mock validation visual
                                                        field.minParam && extractedData[field.id] < field.minParam ? 'border-red-300 bg-red-50 text-red-700' : 'border-gray-300 text-gray-800'
                                                    }`}
                                                />
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-bold pointer-events-none">
                                                    {field.uom}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-lg flex justify-between items-center">
                                    <button onClick={() => setStep(1)} className="text-gray-500 hover:text-gray-800 text-sm font-semibold px-4">
                                        Volver a Captura
                                    </button>
                                    <button 
                                        onClick={handleSubmit}
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold shadow-md flex items-center gap-2 transition-transform hover:scale-105"
                                    >
                                        <ArrowUpOnSquareIcon className="w-4 h-4"/>
                                        Confirmar y Subir
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const ReportStatusCard: React.FC<{ report: ProductionReport, onUpload: (r: ProductionReport) => void }> = ({ report, onUpload }) => {
    const status = getMockStatus(report.code);

    // Color Logic - Time
    let timeClass = '';
    if (status.lastLoad.status === 'early') {
        timeClass = 'bg-green-500 text-white'; // Verde: Antes de la hora
    } else if (status.lastLoad.status === 'late') {
        timeClass = 'bg-yellow-400 text-yellow-900'; // Amarillo: Después de la hora
    } else if (status.lastLoad.status === 'missing') {
        timeClass = 'bg-gray-900 text-white'; // Negro: No cargado
    }

    // Color Logic - Result
    let resultClass = 'bg-gray-100 text-gray-400';
    if (status.lastLoad.status !== 'missing') {
        if (status.result.status === 'optimal') {
            resultClass = 'bg-green-500 text-white'; // Verde: Óptimo
        } else if (status.result.status === 'warning') {
            resultClass = 'bg-yellow-400 text-yellow-900'; // Amarillo: Fuera de óptimo
        } else if (status.result.status === 'critical') {
            resultClass = 'bg-red-600 text-white'; // Rojo: Fuera de rango
        }
    }

    // Next Load Logic
    const nextLoadClass = status.nextLoad.status === 'done' ? 'text-green-600 font-bold' : 'text-gray-500';

    return (
        <div className="bg-white border border-gray-200 rounded shadow-sm hover:shadow-md transition-shadow flex flex-col w-72 shrink-0 overflow-hidden">
            {/* Header */}
            <div className="bg-gray-50 px-3 py-2 border-b border-gray-100 flex justify-between items-center">
                <span className="font-bold text-gray-800 text-xs truncate w-48" title={report.name}>{report.name}</span>
                <span className="text-[9px] text-gray-400 font-mono bg-white px-1 rounded border border-gray-200">{report.code}</span>
            </div>

            {/* Content Grid */}
            <div className="p-3 text-[10px] space-y-3">
                
                {/* Section: Last Load */}
                <div>
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-400 font-bold uppercase">Carga Anterior</span>
                        <div className="text-right">
                            <div className="text-gray-700 font-semibold truncate max-w-[100px]">{status.lastLoad.responsible}</div>
                            <div className="text-gray-400 text-[9px]">Sup: {status.lastLoad.supervisor}</div>
                        </div>
                    </div>
                    <div className="flex gap-1 h-6">
                        <div className={`flex-1 flex items-center justify-center rounded font-bold ${timeClass}`}>
                            {status.lastLoad.time}
                        </div>
                        <div className={`w-12 flex items-center justify-center rounded font-bold ${resultClass}`}>
                            {status.result.value}
                        </div>
                    </div>
                </div>

                {/* Section: Next Load */}
                <div className="pt-2 border-t border-gray-100">
                    <div className="flex justify-between items-start mb-1">
                        <span className="text-gray-400 font-bold uppercase">Próxima Carga</span>
                        <div className="text-right">
                            <div className="text-gray-700 font-semibold truncate max-w-[100px]">{status.nextLoad.responsible}</div>
                            <div className="text-gray-400 text-[9px]">Sup: {status.nextLoad.supervisor}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ClockIcon className="w-3 h-3 text-gray-400" />
                        <span className={`font-mono text-xs ${nextLoadClass}`}>
                            {status.nextLoad.time}
                        </span>
                    </div>
                </div>
            </div>

            {/* Action Footer */}
            <button 
                onClick={(e) => { e.stopPropagation(); onUpload(report); }}
                className="bg-blue-50 hover:bg-blue-100 border-t border-blue-100 py-2 flex items-center justify-center gap-2 transition-colors group"
            >
                <ArrowUpOnSquareIcon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform"/>
                <span className="text-xs font-bold text-blue-700">Cargar Información</span>
            </button>
        </div>
    );
};

const ComplianceNode: React.FC<{ node: any, type: 'plant' | 'process' | 'subprocess', onUpload: (r: ProductionReport) => void }> = ({ node, type, onUpload }) => {
    // Styles for Hierarchy
    const headerStyles = {
        plant: 'bg-blue-800 text-white text-base py-2 px-4 rounded-t-lg mt-6',
        process: 'bg-gray-200 text-gray-800 py-1.5 px-3 border-l-4 border-gray-400 text-sm mt-4 font-bold',
        subprocess: 'text-gray-600 text-xs font-bold mt-3 mb-1 ml-2 uppercase tracking-wide',
    };

    const hasReports = (n: any): boolean => {
        if (n.reports && n.reports.length > 0) return true;
        if (n.processes && n.processes.some(hasReports)) return true;
        if (n.subprocesses && n.subprocesses.some(hasReports)) return true;
        return false;
    };

    if (!hasReports(node)) return null;

    return (
        <div className="w-full">
            {/* Header */}
            {type === 'plant' && (
                <div className={`${headerStyles.plant} flex items-center gap-2 shadow-sm`}>
                    <PlantIcon className="w-5 h-5"/>
                    <h3>{node.name}</h3>
                </div>
            )}
            
            {type === 'process' && (
                <div className={`${headerStyles.process} flex items-center gap-2`}>
                    <ManufacturingIcon className="w-4 h-4"/>
                    <h3>{node.name}</h3>
                </div>
            )}

            {type === 'subprocess' && (
                <div className={`${headerStyles.subprocess} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    <h3>{node.name}</h3>
                </div>
            )}

            <div className={`${type === 'plant' ? 'p-4 bg-white border-x border-b border-gray-200 rounded-b-lg shadow-sm' : type === 'process' ? 'pl-4 border-l-2 border-gray-200 ml-4 mb-2' : 'pl-2 mb-2'}`}>
                
                {/* Reports Container */}
                {node.reports && node.reports.length > 0 && (
                    <div className="flex flex-wrap gap-3 py-2">
                        {node.reports.map((report: ProductionReport) => (
                            <ReportStatusCard key={report.id} report={report} onUpload={onUpload} />
                        ))}
                    </div>
                )}

                {/* Recursive Children */}
                {node.processes && node.processes.map((p: any) => (
                    <ComplianceNode key={p.id} node={p} type="process" onUpload={onUpload} />
                ))}
                {node.subprocesses && node.subprocesses.map((s: any) => (
                    <ComplianceNode key={s.id} node={s} type="subprocess" onUpload={onUpload} />
                ))}
            </div>
        </div>
    );
};

const ComplianceMap: React.FC<ComplianceMapProps> = ({ plants }) => {
    const [uploadModal, setUploadModal] = useState<{ isOpen: boolean; report: ProductionReport | null }>({
        isOpen: false, report: null
    });

    const handleOpenUpload = (report: ProductionReport) => {
        setUploadModal({ isOpen: true, report });
    };

    return (
        <div className="bg-gray-50 min-h-full p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mapa de Cumplimiento</h2>
                    <p className="text-sm text-gray-500">Visor de cumplimiento de reportes operativos en tiempo real.</p>
                </div>
                
                {/* Legend */}
                <div className="flex flex-wrap gap-3 text-[10px] bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-green-500"></span>
                        <span className="text-gray-600">En Tiempo / Óptimo</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-yellow-400"></span>
                        <span className="text-gray-600">Tarde / Alerta</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-red-600"></span>
                        <span className="text-gray-600">Crítico</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 rounded bg-gray-900"></span>
                        <span className="text-gray-600">No Cargado</span>
                    </div>
                </div>
            </div>

            <div className="space-y-2">
                {plants.map(plant => (
                    <ComplianceNode key={plant.id} node={plant} type="plant" onUpload={handleOpenUpload} />
                ))}
            </div>

            <UploadLoadModal 
                isOpen={uploadModal.isOpen} 
                onClose={() => setUploadModal({ isOpen: false, report: null })} 
                report={uploadModal.report} 
            />
            
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in { animation: fade-in 0.2s ease-out forwards; }
            `}</style>
        </div>
    );
};

export default ComplianceMap;
