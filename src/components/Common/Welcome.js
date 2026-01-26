import React from 'react';
import { useNavigate } from 'react-router-dom';

const Welcome = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="md:flex">
          <div className="md:flex-1 p-8 md:p-12">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Sistema de Administración
            </h1>
            <p className="text-gray-600 mb-6 text-lg">
              Bienvenido al sistema de gestión.
            </p>

            <div className="space-y-4 mb-8">
              <Step number="1" text="Selecciona tu tipo de acceso" color="bg-blue-500" />
              <Step number="2" text="Inicia sesión con tus credenciales" color="bg-green-500" />
              <Step number="3" text="Accede al panel correspondiente" color="bg-purple-500" />
            </div>

            <div className="space-y-4">
              <button
                onClick={() => navigate('/login')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🏢 Acceso Administrativo General
              </button>

              <button
                onClick={() => navigate('/club/login')}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                🏟️ Acceso al Panel del Club
              </button>

              <button
                onClick={() => navigate('/member/login')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 px-6 rounded-lg transition-colors"
              >
                👤 Acceso al Panel de Socios
              </button>
            </div>
          </div>

          <div className="md:flex-1 bg-gradient-to-br from-blue-500 to-green-600 p-8 md:p-12 flex items-center justify-center">
            <div className="text-center text-white">
              <h2 className="text-3xl font-bold mb-4">¿Qué panel necesitas?</h2>

              <InfoBox
                title="🏢 Administración General"
                text="Para super administradores que gestionan múltiples entidades"
              />
              <InfoBox
                title="🏟️ Panel del Club"
                text="Para administradores, profesores y cajeros de una entidad específica"
              />
              <InfoBox
                title="👤 Panel del Socio"
                text="Para socios de una entidad específica"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step = ({ number, text, color }) => (
  <div className="flex items-center">
    <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center mr-3`}>
      <span className="text-white text-sm font-bold">{number}</span>
    </div>
    <span className="text-gray-700">{text}</span>
  </div>
);

const InfoBox = ({ title, text }) => (
  <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
    <h3 className="font-semibold mb-2">{title}</h3>
    <p className="text-sm opacity-90">{text}</p>
  </div>
);

export default Welcome;
