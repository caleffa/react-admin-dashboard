import React, { useState } from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Home, 
  Users, 
  User, 
  BookOpen, 
  Tag, 
  Calendar, 
  CreditCard,
  DollarSign,
  FileText,
  BarChart3,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Settings,
  UserCircle,
  Shield
} from 'lucide-react';

const ClubSidebar = ({ activeSection, setActiveSection, mobile = false }) => {
  const { user, logout } = useClubAuth();
  const [expandedSections, setExpandedSections] = useState({});

  // Menu base para todos los usuarios del club
  const baseMenu = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: <Home size={20} />,
      color: 'text-blue-400'
    },
    { 
      id: 'profile', 
      label: 'Mi Perfil', 
      icon: <UserCircle size={20} />,
      color: 'text-green-400'
    }
  ];

  // Grupos de menú para administradores
  const adminGroups = {
    gestion: {
      title: 'Gestión',
      icon: <Settings size={18} />,
      items: [
        { id: 'users', label: 'Usuarios', icon: <Users size={18} /> },
        { id: 'members', label: 'Socios', icon: <User size={18} /> },
      ]
    },
    actividades: {
      title: 'Actividades',
      icon: <BookOpen size={18} />,
      items: [
        { id: 'disciplines', label: 'Disciplinas', icon: <BookOpen size={18} /> },
        { id: 'categories', label: 'Categorías', icon: <Tag size={18} /> },
        { id: 'schedules', label: 'Horarios', icon: <Calendar size={18} /> },
        { id: 'enrollments', label: 'Inscripciones', icon: <FileText size={18} /> },
      ]
    },
    finanzas: {
      title: 'Finanzas',
      icon: <DollarSign size={18} />,
      items: [
        { id: 'feetypes', label: 'Tipos de Cuotas', icon: <CreditCard size={18} /> },
        { id: 'fees', label: 'Cuotas', icon: <DollarSign size={18} /> },
      ]
    }
  };

  const isAdmin = user?.role === 'club_admin' || user?.role === 'super_admin';

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleMenuItemClick = (itemId) => {
    setActiveSection(itemId);
  };

  const getRoleBadge = () => {
    if (!user?.role) return null;
    
    const roleConfig = {
      club_admin: { label: 'Administrador', color: 'bg-purple-600', icon: <Shield size={12} /> },
      super_admin: { label: 'Super Admin', color: 'bg-red-600', icon: <Shield size={12} /> },
      teacher: { label: 'Profesor', color: 'bg-blue-600', icon: <User size={12} /> },
      cashier: { label: 'Cajero', color: 'bg-green-600', icon: <DollarSign size={12} /> },
      default: { label: user.role, color: 'bg-gray-600', icon: <User size={12} /> }
    };

    const config = roleConfig[user.role] || roleConfig.default;
    
    return (
      <div className={`flex items-center ${config.color} text-white px-2 py-1 rounded-full text-xs font-medium mt-1`}>
        {config.icon}
        <span className="ml-1">{config.label}</span>
      </div>
    );
  };

  return (
    <div className={`
      ${mobile ? 'w-full' : 'w-64'}
      bg-gradient-to-b from-green-800 to-green-900
      text-white
      h-screen
      flex flex-col
      overflow-y-auto
      ${mobile ? 'pb-20' : ''}
    `}>
      {/* Header del Sidebar */}
      <div className="p-4 border-b border-green-700/50">
        <div className="flex items-center space-x-3">
          {/* Logo del Club */}
          {user?.club_logo ? (
            <img 
              src={user.club_logo} 
              alt={`Logo ${user?.club_name}`}
              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
              <UserCircle size={24} className="text-white/80" />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-bold truncate">
              {mobile ? user?.club_name : 'Club Panel'}
            </h1>
            <p className="text-green-200 text-sm truncate">
              {user?.first_name} {user?.last_name}
            </p>
            {getRoleBadge()}
          </div>
        </div>

        {/* Badge de estado en móvil */}
        {mobile && (
          <div className="mt-3 flex items-center space-x-2">
            <div className="flex-1 bg-green-700/30 rounded-lg p-2">
              <p className="text-xs text-green-200">
                <span className="font-medium">Club:</span> {user?.club_name}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Menú de Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {/* Menú base */}
        {baseMenu.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuItemClick(item.id)}
            className={`
              w-full text-left
              px-4 py-3
              rounded-xl
              flex items-center space-x-3
              transition-all duration-200
              ${activeSection === item.id
                ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg'
                : 'text-green-100 hover:bg-white/10'
              }
              active:scale-[0.98]
              focus:outline-none focus:ring-2 focus:ring-white/50
            `}
          >
            <div className={`${item.color}`}>
              {item.icon}
            </div>
            <span className="font-medium">{item.label}</span>
            {activeSection === item.id && (
              <ChevronRight size={16} className="ml-auto" />
            )}
          </button>
        ))}

        {/* Menú de administrador con grupos colapsables */}
        {isAdmin && Object.entries(adminGroups).map(([key, group]) => (
          <div key={key} className="mt-6">
            <button
              onClick={() => toggleSection(key)}
              className="w-full flex items-center justify-between px-4 py-2 text-green-200 hover:text-white transition-colors"
            >
              <div className="flex items-center space-x-2">
                {group.icon}
                <span className="font-medium text-sm">{group.title}</span>
              </div>
              <ChevronRight 
                size={16} 
                className={`transition-transform duration-200 ${expandedSections[key] ? 'rotate-90' : ''}`}
              />
            </button>

            {expandedSections[key] && (
              <div className="mt-1 ml-2 pl-6 border-l border-green-700/50 space-y-1">
                {group.items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`
                      w-full text-left
                      px-4 py-2
                      rounded-lg
                      flex items-center space-x-3
                      transition-all duration-200
                      ${activeSection === item.id
                        ? 'bg-white/15 text-white'
                        : 'text-green-200 hover:bg-white/5'
                      }
                      active:scale-[0.98]
                    `}
                  >
                    {item.icon}
                    <span className="text-sm">{item.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Versión simplificada para móvil */}
        {isAdmin && mobile && (
          <div className="mt-6">
            <h3 className="text-xs uppercase text-green-300 font-semibold px-4 mb-2">
              Administración
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(adminGroups).flatMap(group => 
                group.items.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleMenuItemClick(item.id)}
                    className={`
                      bg-white/5 hover:bg-white/10
                      rounded-lg p-3
                      flex flex-col items-center justify-center
                      transition-all duration-200
                      ${activeSection === item.id ? 'bg-white/20 ring-2 ring-white/30' : ''}
                      active:scale-[0.95]
                    `}
                  >
                    {item.icon}
                    <span className="text-xs mt-1 text-center">{item.label}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Botón de Cerrar Sesión */}
      <div className="p-4 border-t border-green-700/50">
        <button
          onClick={logout}
          className={`
            w-full
            bg-gradient-to-r from-red-600 to-red-700
            hover:from-red-700 hover:to-red-800
            text-white
            py-3 px-4
            rounded-xl
            transition-all duration-200
            flex items-center justify-center space-x-2
            shadow-lg hover:shadow-xl
            active:scale-[0.98]
            focus:outline-none focus:ring-2 focus:ring-red-500/50
          `}
        >
          <LogOut size={18} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>

        {/* Información de versión/sesión */}
        <div className="mt-4 text-center">
          <p className="text-green-300 text-xs">
            {user?.email && (
              <span className="block truncate">{user.email}</span>
            )}
            <span className="block mt-1">Sesión activa</span>
          </p>
        </div>
      </div>

      {/* Indicador de navegación actual (solo móvil) */}
      {mobile && (
        <div className="fixed bottom-0 left-0 right-0 bg-green-800 border-t border-green-700 p-2">
          <div className="text-center">
            <p className="text-xs text-green-200">
              Navegando: <span className="font-bold capitalize">{activeSection.replace('-', ' ')}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubSidebar;