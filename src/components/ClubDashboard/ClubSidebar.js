import React from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubSidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useClubAuth();

  // Menu base para todos los usuarios del club
  const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'Mi Perfil', icon: '👤' }
  ];

  // Menu adicional para administradores de club
  const adminMenu = user?.role === 'club_admin' || user?.role === 'super_admin' ? 
  [
    { id: 'users', label: 'Usuarios', icon: '👨‍🔧' },
    { id: 'members', label: 'Socios', icon: '🧑' },
    { id: 'disciplines', label: 'Disciplinas', icon: '🏄🏻​' },
    { id: 'categories', label: 'Categorías', icon: '🥇​' },
    { id: 'enrollments', label: 'Inscripciones', icon: '🤾​' },
    { id: 'schedules', label: 'Cronogramas', icon: '📅​' },
    { id: 'feetypes', label: 'Tipos de cuotas', icon: '🗃️​' },
    { id: 'fees', label: 'Cuotas', icon: '🤝🏻​​' }
  ] : [];

  const menuItems = [...baseMenu, ...adminMenu];

  return (
    <div className="w-64 bg-green-800 text-white min-h-screen flex flex-col">
      {/* Header con Logo y Título */}
      <div className="p-6 border-b border-green-700">
        <div className="flex items-center space-x-3">
          {/* Logo del Club */}
          {user?.club_logo && (
            <img 
              src={user.club_logo} 
              alt={`Logo ${user?.club_name}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-white"
            />
          )}
          <div>
            <h1 className="text-xl font-bold flex items-center">
              Club Panel
            </h1>
            <p className="text-green-200 text-sm mt-1">{user?.club_name}</p>
          </div>
        </div>
        <p className="text-green-300 text-sm capitalize mt-3">
          Bienvenido, {user?.first_name}
        </p>
      </div>

      {/* Menú de Navegación */}
      <nav className="mt-8 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors ${
              activeSection === item.id
                ? 'bg-green-600 text-white'
                : 'text-green-200 hover:bg-green-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="p-6">
        <button
          onClick={logout}
          className="w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <span>🚪</span>
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default ClubSidebar;