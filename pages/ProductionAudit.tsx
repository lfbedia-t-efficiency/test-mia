


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
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-cyan-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-cyan-600 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );

interface ProductionAuditProps {
    setActiveView: (view: View) => void;
}

const ProductionAudit: React.FC<ProductionAuditProps> = ({ setActiveView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Dashboard Auditorias Produccion"
        description="Vista general del estado de cumplimiento, auditorías pendientes y resultados recientes en todas las plantas."
        onClick={() => setActiveView('PA_DASHBOARD')}
      />
      <Card
        title="Mapa de Cumplimiento"
        description="Visualización interactiva del cumplimiento de normativas por planta, línea y máquina."
        onClick={() => setActiveView('PA_COMPLIANCE_MAP')}
      />
      <Card
        title="Reportes & Formatos"
        description="Acceso y gestión de todos los formatos y checklists utilizados en las auditorías de producción."
        onClick={() => setActiveView('PA_FORMS')}
      />
    </div>
  );
};

export default ProductionAudit;
