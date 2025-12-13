






import React from 'react';
import { View } from '../types';

interface CardProps {
  title: string;
  description: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, description, onClick }) => (
    <div
      onClick={onClick}
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-blue-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-blue-600 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );

interface DocumentControlProps {
    setActiveView: (view: View) => void;
}

const DocumentControl: React.FC<DocumentControlProps> = ({ setActiveView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Documentos & Procedimientos"
        description="Gestión de documentos vigentes y control de versiones organizados por Planta y Proceso."
        onClick={() => setActiveView('DOCUMENTS_BY_PROCESS')}
      />
      <Card
        title="Documentos Certificados"
        description="Centralice y controle los documentos de su sistema de gestión de calidad (ISO 9001 / IATF 16949)."
        onClick={() => setActiveView('CERTIFICATION_DOCUMENTS')}
      />
      <Card
        title="Instrucciones de Trabajo"
        description="Guías paso a paso, ayudas visuales y hojas de instrucción para puestos operativos."
        onClick={() => setActiveView('WORK_INSTRUCTIONS')}
      />
    </div>
  );
};

export default DocumentControl;