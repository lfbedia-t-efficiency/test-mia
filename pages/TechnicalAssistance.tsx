


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
      className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg hover:border-green-500 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
    >
      <h3 className="text-lg font-semibold text-green-600 mb-2">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
    </div>
  );

interface TechnicalAssistanceProps {
    setActiveView: (view: View) => void;
}

const TechnicalAssistance: React.FC<TechnicalAssistanceProps> = ({ setActiveView }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card
        title="Dashboard Mantenimiento"
        description="Resumen del estado de mantenimiento, órdenes de trabajo abiertas, y KPIs de eficiencia de equipos (OEE)."
        onClick={() => setActiveView('TA_DASHBOARD')}
      />
      <Card
        title="Órdenes de Trabajo"
        description="Gestión completa del ciclo de vida de las órdenes de trabajo: creación, asignación, ejecución y cierre."
        onClick={() => setActiveView('TA_WORK_ORDERS')}
      />
      <Card
        title="Máquinas"
        description="Catálogo de toda la maquinaria, con acceso a su historial de mantenimiento, documentación y estado actual."
        onClick={() => setActiveView('TA_MACHINES')}
      />
      <Card
        title="Procedimientos"
        description="Biblioteca centralizada de todos los procedimientos de mantenimiento, tanto preventivo como correctivo."
        onClick={() => setActiveView('TA_PROCEDURES')}
      />
    </div>
  );
};

export default TechnicalAssistance;
