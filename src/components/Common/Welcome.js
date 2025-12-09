import React from 'react';

const Welcome = ({ onShowLogin, onShowClubLogin }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-1 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Sistema de Administración
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Bienvenido al sistema de gestión de clubes deportivos.
            </p>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">1</span>
                </div>
                <span className="text-gray-700">Selecciona tu tipo de acceso</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">2</span>
                </div>
                <span className="text-gray-700">Inicia sesión con tus credenciales</span>
              </div>
              <div className="flex items-center">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">3</span>
                </div>
                <span className="text-gray-700">Accede al panel correspondiente</span>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={onShowLogin}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                🏢 Acceso Administrativo General
              </button>
              
              <button
                onClick={onShowClubLogin}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors text-center"
              >
                🏟️ Acceso al Club
              </button>
            </div>
          </div>
          
          <div className="md:flex-1 bg-gradient-to-br from-blue-500 to-green-600 p-8 md:p-12 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">¿Qué panel necesitas?</h2>
              <div className="space-y-4">
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🏢 Administración General</h3>
                  <p className="text-sm opacity-90">
                    Para super administradores que gestionan múltiples clubes
                  </p>
                </div>
                <div className="bg-white bg-opacity-20 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">🏟️ Panel del Club</h3>
                  <p className="text-sm opacity-90">
                    Para administradores, profesores y cajeros de un club específico
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Welcome;