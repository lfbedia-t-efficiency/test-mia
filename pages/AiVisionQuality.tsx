
import React from 'react';
import { EyeIcon } from '../components/icons/Icons';

const AiVisionQuality: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-purple-100 rounded-lg">
              <EyeIcon className="w-6 h-6 text-purple-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900">AI Vision Quality Check</h3>
      </div>
      <p className="text-gray-600">
        Módulo de visión por computadora para la detección automatizada de defectos de calidad en línea de producción.
        Utiliza cámaras y modelos de aprendizaje profundo para identificar anomalías en tiempo real.
      </p>
      <div className="mt-8 border-2 border-dashed border-purple-200 bg-purple-50 rounded-lg p-10 text-center">
        <EyeIcon className="w-12 h-12 text-purple-300 mx-auto mb-3" />
        <h4 className="text-lg font-bold text-purple-800">Sistema en construcción</h4>
        <p className="text-purple-600">Próximamente: Integración con cámaras de inspección y dashboard de defectos.</p>
      </div>
    </div>
  );
};

export default AiVisionQuality;
