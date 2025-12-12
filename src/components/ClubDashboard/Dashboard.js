import React, { useState, useEffect } from 'react';
import ClubSidebar from './ClubSidebar';
import ClubHeader from './ClubHeader';
import ClubUsersManagement from './ClubUsersManagement';
import ClubMembersManagement from './ClubMembersManagement';
import ClubDisciplinesManagement from './ClubDisciplinesManagement';
import ClubCategoriesManagement from './ClubCategoriesManagement';
import ClubEnrollmentsManagement from './clubEnrollmentsManagement';
import ClubSchedulesManagement from './ClubSchedulesManagement';
import ClubFeeTypesManagement from './ClubFeeTypesManagement';
import ClubFeesManagement from './ClubFeesManagement';
import ClubProfile from './ClubProfile';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Menu, 
  X, 
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
  ChevronRight,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';

// Importa los nuevos componentes
import ResponsiveModal from './ResponsiveModal';
import ResponsiveDataTable from './ResponsiveDataTable';
import { useSidebarAutoClose } from '../../hooks/useSidebarAutoClose';

const ClubDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSize, setModalSize] = useState('md');
  
  const { user } = useClubAuth();
  
  // Usar el hook para el sidebar
  const sidebarRef = useSidebarAutoClose(setSidebarOpen, isMobile);

  // Detectar tamaño de pantalla
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [sidebarOpen]);

  // Función para abrir modal
  const openModal = (title, content, size = 'md') => {
    setModalTitle(title);
    setModalContent(content);
    setModalSize(size);
    setIsModalOpen(true);
  };

  // Función para cerrar modal
  const closeModal = () => {
    setIsModalOpen(false);
    setTimeout(() => {
      setModalContent(null);
      setModalTitle('');
    }, 300);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <ClubUsersManagement openModal={openModal} closeModal={closeModal} />;
      case 'members':
        return <ClubMembersManagement openModal={openModal} closeModal={closeModal} />;
      case 'disciplines':
        return <ClubDisciplinesManagement openModal={openModal} closeModal={closeModal} />;
      case 'categories':
        return <ClubCategoriesManagement openModal={openModal} closeModal={closeModal} />;
      case 'enrollments':
        return <ClubEnrollmentsManagement openModal={openModal} closeModal={closeModal} />;
      case 'schedules':
        return <ClubSchedulesManagement openModal={openModal} closeModal={closeModal} />;
      case 'feetypes':
        return <ClubFeeTypesManagement openModal={openModal} closeModal={closeModal} />;
      case 'fees':
        return <ClubFeesManagement openModal={openModal} closeModal={closeModal} />;
      case 'profile':
        return <ClubProfile />;

      default:
        return (
          <div className="p-4 md:p-6">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">Dashboard del Club</h2>
              <p className="text-gray-600 mt-1">Hola {user?.first_name}, bienvenido al panel de {user?.club_name}</p>
            </div>
            
            {/* Tarjeta de bienvenida */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">¡Bienvenido!</h3>
                  <p className="opacity-90">Estás gestionando: {user?.club_name}</p>
                  <div className="mt-3">
                    <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm">
                      Rol: {user?.role}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <User size={48} className="opacity-80" />
                </div>
              </div>
            </div>

            {/* Grid de tarjetas responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Gestión de usuarios - Solo para admin */}
              {(user?.role === 'club_admin' || user?.role === 'super_admin') && (
                <DashboardCard
                  title="Gestión de Usuarios"
                  description="Administra los usuarios de tu club"
                  icon={<Users className="w-6 h-6" />}
                  color="blue"
                  onClick={() => handleSectionChange('users')}
                />
              )}

              {/* Información del club */}
              <DashboardCard
                title="Información del Club"
                description="Consulta la información de tu club"
                icon={<Home className="w-6 h-6" />}
                color="green"
                onClick={() => handleSectionChange('profile')}
              />

              {/* Gestión de socios - Solo para admin */}
              {(user?.role === 'club_admin' || user?.role === 'super_admin') && (
                <DashboardCard
                  title="Gestión de Socios"
                  description="Administra los socios de tu club"
                  icon={<User className="w-6 h-6" />}
                  color="purple"
                  onClick={() => handleSectionChange('members')}
                />
              )}

              {/* Gestión de disciplinas - Solo para admin */}
              {(user?.role === 'club_admin' || user?.role === 'super_admin') && (
                <DashboardCard
                  title="Gestión de Disciplinas"
                  description="Administra las disciplinas de tu club"
                  icon={<BookOpen className="w-6 h-6" />}
                  color="orange"
                  onClick={() => handleSectionChange('disciplines')}
                />
              )}

              {/* Estadísticas */}
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-6 h-6 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Estadísticas</h3>
                </div>
                <div className="space-y-3">
                  <StatItem label="Usuarios activos" value="-" />
                  <StatItem label="Clases hoy" value="-" />
                  <StatItem label="Pagos pendientes" value="-" />
                </div>
              </div>

              {/* Más tarjetas... */}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header móvil */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            data-sidebar-toggle
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h1 className="text-lg font-bold text-gray-800">{user?.club_name}</h1>
          <div className="w-10"></div>
        </div>
      </div>

      {/* Overlay para móvil */}
      {sidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex pt-16 md:pt-0">
        {/* Sidebar responsivo */}
        <div 
          ref={sidebarRef}
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            fixed md:relative inset-y-0 left-0 z-40
            w-64 md:w-64
            transition-transform duration-300 ease-in-out
            h-screen
          `}
        >
          <ClubSidebar 
            activeSection={activeSection} 
            setActiveSection={handleSectionChange}
            mobile={isMobile}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header para desktop */}
          <div className="hidden md:block">
            <ClubHeader />
          </div>
          
          <main className="flex-1 overflow-y-auto pt-4 md:pt-0">
            {/* Breadcrumb para móvil */}
            <div className="md:hidden px-4 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-blue-600">Dashboard</span>
                <ChevronRight size={16} className="mx-2" />
                <span className="font-medium capitalize">{activeSection.replace('-', ' ')}</span>
              </div>
            </div>
            
            {renderContent()}
          </main>
        </div>
      </div>

      {/* Modal Responsive */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalTitle}
        size={modalSize}
      >
        {modalContent}
      </ResponsiveModal>
    </div>
  );
};

// Componente de tarjeta reutilizable
const DashboardCard = ({ title, description, icon, color, onClick }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100',
    green: 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100',
  };

  return (
    <button
      onClick={onClick}
      className={`
        ${colorClasses[color]}
        w-full text-left
        rounded-xl shadow border
        p-5
        transition-all duration-200
        active:scale-[0.98]
        focus:outline-none focus:ring-2 focus:ring-opacity-50 focus:ring-current
      `}
    >
      <div className="flex items-start">
        <div className={`p-2 rounded-lg bg-white mr-3 ${colorClasses[color].split(' ')[0]}`}>
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Componente de ítem de estadística
const StatItem = ({ label, value }) => (
  <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

export default ClubDashboard;