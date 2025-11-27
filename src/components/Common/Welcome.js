import React from 'react';

const Welcome = ({ onShowLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-1 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Bienvenido al Sistema de Administración
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Gestiona tu organización de manera eficiente con nuestra plataforma de administración.
              Inicia sesión para acceder al dashboard.
            </p>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-gray-700">Inicia sesión con tus credenciales</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-gray-700">Accede al dashboard administrativo</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-gray-700">Gestiona usuarios y permisos</span>
              </div>
            </div>
            <button
              onClick={onShowLogin}
              className="mt-8 bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
            >
              Iniciar Sesión
            </button>
          </div>
          <div className="md:flex-1 bg-gradient-to-br from-blue-500 to-purple-600 p-8 md:p-12 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">¿Primera vez aquí?</h2>
              <p className="mb-6 opacity-90">
                Contacta al administrador del sistema para obtener tus credenciales de acceso.
              </p>
              <div className="bg-white bg-opacity-20 rounded-lg p-4 inline-block">
                <p className="text-sm">Soporte técnico: soporte@empresa.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;