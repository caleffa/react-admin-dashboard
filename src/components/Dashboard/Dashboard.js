import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import UserManagement from './UserManagement';
import ClubUsersManagement from './ClubUsersManagement'; // NUEVO IMPORT
import ClubsManagement from './ClubsManagement';
import { useAuth } from '../../context/AuthContext';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      
      // NUEVA SECCIÓN: Gestión de usuarios de clubes
      case 'club-users':
        return <ClubUsersManagement />;

      case 'clubs': // NUEVA SECCIÓN
        return <ClubsManagement />;

      // Sección de perfil
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
                  <span className="text-gray-600">Club:</span>
                  <span className="font-medium">{user?.club_name || 'No asignado'}</span>
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
                <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    <strong>Rol:</strong> {user?.role}
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Club:</strong> {user?.club_name || 'No asignado'}
                  </p>
                </div>
              </div>
              
              {/* Tarjeta para gestión de usuarios (admin normal) */}
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

              {/* Tarjeta para gestión de clubes (admin normal) */}
              {user?.role === 'super_admin' || user?.role === 'admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Clubes</h3>
                  <p className="text-gray-600 mb-4">
                    Administra todos los clubes del sistema.
                  </p>
                  <button
                    onClick={() => setActiveSection('clubs')}
                    className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Clubes
                  </button>
                </div>
              )}

              {/* NUEVA TARJETA: Gestión de usuarios de clubes (solo super_admin) */}
              {user?.role === 'super_admin' || user?.role === 'admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Usuarios de Clubes</h3>
                  <p className="text-gray-600 mb-4">
                    Gestiona todos los usuarios del sistema de diferentes clubes y roles.
                  </p>
                  <button
                    onClick={() => setActiveSection('club-users')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Usuarios Clubes
                  </button>
                </div>
              )}

              {/* Tarjeta de estadísticas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas</h3>
                <p className="text-gray-600 mb-4">
                  Resumen general del sistema.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usuarios activos:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clubes registrados:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sesiones hoy:</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </div>

              {/* Tarjeta de acciones rápidas */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    👤 Ver mi perfil
                  </button>
                  {user?.role === 'super_admin' && (
                    <button
                      onClick={() => setActiveSection('club-users')}
                      className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      🏢 Gestionar usuarios
                    </button>
                  )}
                  {user?.role === 'admin' && (
                    <button
                      onClick={() => setActiveSection('users')}
                      className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      👥 Gestionar usuarios
                    </button>
                  )}
                </div>
              </div>

              {/* Tarjeta de sistema */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Sistema</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versión:</span>
                    <span className="font-medium">1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Última actualización:</span>
                    <span className="font-medium">{new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span className="font-medium text-green-600">● Operativo</span>
                  </div>
                </div>
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