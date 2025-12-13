import React from 'react';

const Administration: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold mb-4 text-gray-900">Administración del Sistema</h3>
      <p className="text-gray-600">
        Módulo de administración para la gestión de usuarios, roles y permisos. Configure quién tiene acceso a qué 
        funcionalidades dentro de la plataforma para garantizar la seguridad y la correcta asignación de responsabilidades.
      </p>
      <div className="mt-8 border border-dashed border-gray-300 rounded-lg p-10 text-center">
        <p className="text-gray-400">Próximamente: Interfaz para la gestión de usuarios, roles y permisos.</p>
      </div>
    </div>
  );
};

export default Administration;