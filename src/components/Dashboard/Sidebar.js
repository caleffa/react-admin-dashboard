import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ activeSection, setActiveSection }) => {
  const { user, logout } = useAuth();

  /*const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    ...(user?.role === 'admin' ? [{ id: 'users', label: 'Usuarios', icon: '👥' }] : []),
    // NUEVO: Solo super admins pueden ver la gestión de usuarios de clubes
    ...(user?.role === 'super_admin' || user?.role === 'admin' ? [{ id: 'club-users', label: 'Usuarios de Clubes', icon: '🏢' }] : []),
    { id: 'profile', label: 'Perfil', icon: '👤' },
  ];*/

  // Menu base para todos los usuarios
  const baseMenu = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'profile', label: 'Perfil', icon: '👤' }
  ];

  // Menu base para todos los admin
  const adminMenu = [
    { id: 'users', label: 'Usuarios', icon: '👥' },
    { id: 'clubs', label: 'Clubes', icon: '🏟️' },
    { id: 'club-users', label: 'Usuarios de Clubes', icon: '🏢' },
    { id: 'system-admin', label: 'Admin del Sistema', icon: '⚙️' }
  ];

  // Menu para super administradores
  const superAdminMenu = [
    { id: 'clubs', label: 'Clubes', icon: '🏟️' },
    { id: 'club-users', label: 'Usuarios', icon: '🏢' },
    { id: 'system-admin', label: 'Admin del Sistema', icon: '⚙️' }
  ];

  let menuItems = [...baseMenu];

  if (user?.role === 'super_admin') {
    menuItems = [...baseMenu, ...superAdminMenu];
  } else if (user?.role === 'admin') {
    menuItems = [...baseMenu, ...adminMenu];
  }

  return (
    <div className="w-64 bg-gray-800 text-white min-h-screen flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <p className="text-gray-400 text-sm mt-2">Bienvenido, {user?.name}</p>
      </div>

      <nav className="mt-8 flex-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={`w-full text-left px-6 py-3 flex items-center space-x-3 transition-colors ${
              activeSection === item.id
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

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

export default Sidebar;