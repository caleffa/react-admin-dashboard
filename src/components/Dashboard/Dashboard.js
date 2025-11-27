import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UserManagement from './UserManagement';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;

        // En la sección de perfil, actualiza para mostrar nombre completo
        case 'profile':
          return (
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Perfil de Usuario</h2>
              <div className="bg-white rounded-lg shadow p-6 max-w-md">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{user?.name} {user?.lastname}</h3>
                    <p className="text-gray-600">{user?.email}</p>
                    <p className="text-sm text-gray-500">@{user?.username}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rol:</span>
                    <span className="font-medium capitalize">{user?.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Miembro desde:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          );


      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bienvenido</h3>
                <p className="text-gray-600">
                  Hola {user?.name}, bienvenido al panel de administración.
                </p>
              </div>
              {user?.role === 'admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Usuarios</h3>
                  <p className="text-gray-600 mb-4">
                    Como administrador, puedes gestionar todos los usuarios del sistema.
                  </p>
                  <button
                    onClick={() => setActiveSection('users')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Usuarios
                  </button>
                </div>
              )}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas</h3>
                <p className="text-gray-600">
                  Aquí podrás ver las estadísticas del sistema.
                </p>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;