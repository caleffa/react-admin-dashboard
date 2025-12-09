import React, { useState } from 'react';
import ClubSidebar from './ClubSidebar';
import ClubHeader from './ClubHeader';
import ClubUsersManagement from './ClubUsersManagement';
import ClubMembersManagement from './ClubMembersManagement';
import ClubDisciplinesManagement from './ClubDisciplinesManagement';
import ClubCategoriesManagement from './ClubCategoriesManagement';
import ClubEnrollmentsManagement from './clubEnrollmentsManagement';
import ClubSchedulesManagement from './ClubSchedulesManagement';
import ClubFeeTypesManagement from './ClubFeeTypesManagement';

import ClubProfile from './ClubProfile';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useClubAuth();

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <ClubUsersManagement />;
      case 'members':
        return <ClubMembersManagement />;
      case 'disciplines':
        return <ClubDisciplinesManagement />;
      case 'categories':
        return <ClubCategoriesManagement />;
      case 'enrollments':
        return <ClubEnrollmentsManagement />;
      case 'schedules':
        return <ClubSchedulesManagement />;
      case 'feetypes':
        return <ClubFeeTypesManagement />;

      case 'profile':
        return <ClubProfile />;

      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Dashboard del Club</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Bienvenido</h3>
                <p className="text-gray-600">
                  Hola {user?.first_name}, bienvenido al panel de {user?.club_name}.
                </p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">
                    <strong>Rol:</strong> {user?.role}
                  </p>
                  <p className="text-sm text-green-700">
                    <strong>Club:</strong> {user?.club_name}
                  </p>
                </div>
              </div>
              
              {/* Gestión de usuarios - Solo para club_admin */}
              {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Usuarios</h3>
                  <p className="text-gray-600 mb-4">
                    Administra los usuarios de tu club.
                  </p>
                  <button
                    onClick={() => setActiveSection('users')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Usuarios
                  </button>
                </div>
              )}

              {/* Información del club */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Información del Club</h3>
                <p className="text-gray-600 mb-4">
                  Consulta la información de tu club.
                </p>
                <button
                  onClick={() => setActiveSection('profile')}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Ver Información
                </button>
              </div>

              {/* Estadísticas del club */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Estadísticas</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Usuarios activos:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Clases hoy:</span>
                    <span className="font-medium">-</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Pagos pendientes:</span>
                    <span className="font-medium">-</span>
                  </div>
                </div>
              </div>

              {/* Acciones rápidas según rol */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Acciones Rápidas</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => setActiveSection('profile')}
                    className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    👤 Mi perfil
                  </button>
                  
                  {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                    <button
                      onClick={() => setActiveSection('users')}
                      className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      👨‍🔧 Gestionar usuarios
                    </button>
                  )}
                  
                  {user?.role === 'teacher' && (
                    <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      📅 Mis clases
                    </button>
                  )}
                  
                  {user?.role === 'cashier' || user?.role === 'super_admin' && (
                    <button className="w-full text-left px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                      💰 Gestión de pagos
                    </button>
                  )}
                </div>
              </div>
              {/* Gestión de usuarios - Solo para club_admin */}
              {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Usuarios</h3>
                  <p className="text-gray-600 mb-4">
                    Administra los usuarios de tu club.
                  </p>
                  <button
                    onClick={() => setActiveSection('users')}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Usuarios
                  </button>
                </div>
              )}
              {/* Gestión de usuarios - Solo para club_admin */}
              {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Disciplinas</h3>
                  <p className="text-gray-600 mb-4">
                    Administra las disciplinas de tu club.
                  </p>
                  <button
                    onClick={() => setActiveSection('disciplines')}
                    className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Disciplinas
                  </button>
                </div>
              )}
              {/* Gestión de usuarios - Solo para club_admin */}
              {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Catgorías</h3>
                  <p className="text-gray-600 mb-4">
                    Administra las categorías de las disciplinas.
                  </p>
                  <button
                    onClick={() => setActiveSection('categories')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Categorías
                  </button>
                </div>
              )}
              {/* Gestión de usuarios - Solo para club_admin */}
              {user?.role === 'club_admin' || user?.role === 'super_admin' && (
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Gestión de Socios</h3>
                  <p className="text-gray-600 mb-4">
                    Administra los socios de tu club.
                  </p>
                  <button
                    onClick={() => setActiveSection('members')}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Gestionar Socios
                  </button>
                </div>
              )}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <ClubSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <ClubHeader />
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ClubDashboard;