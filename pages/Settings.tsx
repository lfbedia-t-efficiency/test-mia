import React from 'react';

const Settings: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Configuración General</h3>
      <p className="text-gray-600">
        Ajustes generales de la aplicación, como la configuración de notificaciones, integraciones con otros sistemas
        (ERP, MES), preferencias de idioma y personalización de la interfaz.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-lg p-10 text-center">
        <p className="text-gray-400">Próximamente: Opciones de configuración de la plataforma.</p>
      </div>
    </div>
  );
};

export default Settings;