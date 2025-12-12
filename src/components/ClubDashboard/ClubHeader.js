import React, { useState, useEffect } from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';
import { Menu, X, Bell, HelpCircle, LogOut } from 'lucide-react';

const ClubHeader = () => {
  const { user, logout } = useClubAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [clubLogo, setClubLogo] = useState(null);

  // Simular carga de notificaciones (en un caso real, vendría de una API)
  useEffect(() => {
    const mockNotifications = [
      { id: 1, title: 'Nuevo miembro registrado', time: 'Hace 5 minutos', read: false },
      { id: 2, title: 'Pago recibido', time: 'Hace 1 hora', read: false },
      { id: 3, title: 'Evento próximo', time: 'Hace 2 días', read: true },
    ];
    setNotifications(mockNotifications);
  }, []);

  // Simular carga del logo del club (en un caso real, vendría de la API del club)
  useEffect(() => {
    // Aquí iría la lógica para cargar el logo del club desde la API
    // Por ahora, usamos un placeholder
    if (user?.club_logo) {
      setClubLogo(user.club_logo);
    }
  }, [user]);

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const handleLogout = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      logout();
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        {/* Logo y nombre del club - Versión mobile */}
        <div className="flex items-center space-x-3 md:hidden">
          {clubLogo ? (
            <img 
              src={clubLogo} 
              alt={`Logo ${user?.club_name}`}
              className="w-10 h-10 rounded-full object-cover border-2 border-green-500"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
              {user?.club_name?.charAt(0).toUpperCase() || 'C'}
            </div>
          )}
          <div>
            <h1 className="text-lg font-semibold text-gray-800 truncate max-w-[150px]">
              {user?.club_name}
            </h1>
            <p className="text-xs text-gray-600 truncate max-w-[150px]">Dashboard</p>
          </div>
        </div>

        {/* Logo y nombre del club - Versión desktop */}
        <div className="hidden md:flex md:items-center md:space-x-4">
          {clubLogo ? (
            <div className="flex items-center space-x-3">
              <img 
                src={clubLogo} 
                alt={`Logo ${user?.club_name}`}
                className="w-12 h-12 rounded-full object-cover border-2 border-green-500"
              />
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">{user?.club_name}</h1>
                <p className="text-gray-600">Panel de administración</p>
              </div>
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-gray-800">Club Dashboard</h1>
              <p className="text-gray-600">Panel de administración de {user?.club_name}</p>
            </div>
          )}
        </div>

        {/* Panel derecho: Notificaciones y perfil */}
        <div className="flex items-center space-x-3 md:space-x-6">
          {/* Botón menú mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Abrir menú"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Notificaciones */}
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Notificaciones"
            >
              <Bell size={20} />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {unreadNotifications}
                </span>
              )}
            </button>

            {/* Dropdown de notificaciones */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="font-semibold text-gray-800">Notificaciones</h3>
                  <p className="text-sm text-gray-600">{unreadNotifications} sin leer</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${!notification.read ? 'bg-blue-50' : ''}`}
                      >
                        <div className="flex justify-between items-start">
                          <p className="font-medium text-gray-800">{notification.title}</p>
                          {!notification.read && (
                            <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{notification.time}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No hay notificaciones
                    </div>
                  )}
                </div>
                <div className="p-3 border-t border-gray-200">
                  <button className="w-full text-center text-green-600 hover:text-green-700 font-medium">
                    Ver todas las notificaciones
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Perfil del usuario - Versión desktop */}
          <div className="hidden md:flex md:items-center md:space-x-4">
            <div className="text-right">
              <p className="font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
              <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
            </div>
            <div className="relative group">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold cursor-pointer">
                {user?.first_name?.charAt(0).toUpperCase()}
              </div>
              
              {/* Dropdown del perfil */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="p-4 border-b border-gray-200">
                  <p className="font-semibold text-gray-800">{user?.first_name} {user?.last_name}</p>
                  <p className="text-sm text-gray-600">{user?.email}</p>
                </div>
                <div className="py-2">
                  <button className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-50 flex items-center space-x-2">
                    <HelpCircle size={16} />
                    <span>Ayuda y soporte</span>
                  </button>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 flex items-center space-x-2"
                  >
                    <LogOut size={16} />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-4 py-3 space-y-3">
            {/* Perfil en mobile */}
            <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                {user?.first_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
                <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
              </div>
            </div>

            {/* Opciones del menú móvil */}
            <div className="space-y-1">
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                <Bell size={18} />
                <span>Notificaciones ({unreadNotifications})</span>
              </button>
              <button className="w-full text-left px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg flex items-center space-x-3">
                <HelpCircle size={18} />
                <span>Ayuda y soporte</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg flex items-center space-x-3"
              >
                <LogOut size={18} />
                <span>Cerrar sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay para cerrar notificaciones al hacer click fuera */}
      {(isNotificationsOpen || isMobileMenuOpen) && (
        <div 
          className="fixed inset-0 z-40 md:hidden"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsMobileMenuOpen(false);
          }}
        />
      )}
    </header>
  );
};

export default ClubHeader;