import React, { useState, useEffect } from 'react';
import MemberSidebar from './MemberSidebar';
import MemberHeader from './MemberHeader';
import MemberProfile from './MemberProfile';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { clubMemberService, clubScheduleService, clubSettingService } from '../../services/api';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  User, UserCheck ,
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
  Trash2,
  Clock,
  Loader2,Newspaper ,
  MapPin,
  Users as UsersIcon
} from 'lucide-react';
import MercadoPagoButton from '../MercadoPagoButton';

// Importa los nuevos componentes
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import { useSidebarAutoClose } from '../../hooks/useSidebarAutoClose';

const MemberDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSize, setModalSize] = useState('md');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [member, setMember] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [enrollmentSchedules, setEnrollmentSchedules] = useState({}); // Objeto para almacenar horarios por enrollment
  const [loadingSchedules, setLoadingSchedules] = useState({}); // Estado de carga por enrollment
  
  const { user } = useMemberAuth();
  
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

  useEffect(() => {
    if (user && user.id) {
      loadMemberData();
    } else {
      setLoading(false);
      setError('Usuario no autenticado');
    }
  }, [user]);

  // Función para cargar horarios de una categoría específica
  const loadSchedulesForCategory = async (categoryId, enrollmentId) => {
    if (!categoryId) return;
    
    try {
      setLoadingSchedules(prev => ({ ...prev, [enrollmentId]: true }));
      
      // console.log(`Cargando horarios para category_id: ${categoryId}`);
      const schedulesData = await clubScheduleService.getSchedulesByCategoryId(categoryId);
      // console.log(`Horarios obtenidos para category_id ${categoryId}:`, schedulesData);
      console.log(schedulesData)
      // Actualizar el estado con los horarios para este enrollment
      setEnrollmentSchedules(prev => ({
        ...prev,
        [enrollmentId]: schedulesData.results || schedulesData.data || []
      }));
    } catch (err) {
      // console.error(`Error al cargar horarios para category_id ${categoryId}:`, err);
      setEnrollmentSchedules(prev => ({
        ...prev,
        [enrollmentId]: []
      }));
    } finally {
      setLoadingSchedules(prev => ({ ...prev, [enrollmentId]: false }));
    }
  };

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError('');
      
      //console.log('Cargando datos para user.id:', user?.id);
      
      // Cargar datos del miembro
      const memberData = await clubMemberService.getMemberData(user.id);
      //console.log('Datos del miembro:', memberData);
      setMember(memberData);

      // Traigo la config del club
      console.log(memberData);
      const clubSettings = await clubSettingService.getActiveSettingByClubId(memberData.club_id);
      console.log('club settings: ',clubSettings);

      // Cargar inscripciones del miembro
      let enrollmentsData = [];
      try {
        enrollmentsData = await clubMemberService.getMemberEnrollments(user.id);
        //console.log('Datos de inscripciones:', enrollmentsData);
        
        // Asegurarse de que enrollmentsData sea un array
        if (!Array.isArray(enrollmentsData)) {
          console.warn('enrollmentsData no es un array:', enrollmentsData);
          if (enrollmentsData && enrollmentsData.enrollments) {
            enrollmentsData = enrollmentsData.enrollments;
          } else if (enrollmentsData && enrollmentsData.data) {
            enrollmentsData = enrollmentsData.data;
          } else {
            enrollmentsData = [];
          }
        }
      } catch (enrollError) {
        console.warn('Error al cargar inscripciones:', enrollError);
        enrollmentsData = [];
      }
      
      setEnrollments(enrollmentsData);
      
      // Cargar horarios para cada inscripción que tenga category_id
      if (Array.isArray(enrollmentsData)) {
        enrollmentsData.forEach(enrollment => {
          const categoryId = enrollment.category_id || enrollment.category?.id;
          const enrollmentId = enrollment.id || enrollment._id;
          
          if (categoryId && enrollmentId) {
            loadSchedulesForCategory(categoryId, enrollmentId);
          }
        });
      }
      
    } catch (err) {
      setError('Error al cargar los datos: ' + (err.message || 'Error desconocido'));
      console.error('Error loading memberData:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener el nombre del día de la semana
  const getDayOfWeekName = (dayNumber) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[dayNumber] || `Día ${dayNumber}`;
  };

  // Función para formatear la hora
  const formatTime = (timeString) => {
    if (!timeString) return '';
    // Asumimos formato HH:MM:SS
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
  };

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

  // Función segura para contar inscripciones activas
  const countActiveEnrollments = () => {
    if (!Array.isArray(enrollments)) return 0;
    return enrollments.filter(e => e && e.status === 'active').length;
  };

  // Función segura para contar inscripciones pendientes
  const countPendingEnrollments = () => {
    if (!Array.isArray(enrollments)) return 0;
    return enrollments.filter(e => e && e.status === 'pending').length;
  };

  // Función para obtener un slice seguro de inscripciones
  const getSafeEnrollmentsSlice = (count) => {
    if (!Array.isArray(enrollments)) return [];
    return enrollments.slice(0, count).filter(e => e);
  };

  // Componente para tarjetas de inscripción
  const EnrollmentCard = ({ enrollment }) => {
    if (!enrollment) return null;
    
    const enrollmentId = enrollment.id || enrollment._id;
    const schedules = enrollmentSchedules[enrollmentId] || [];
    const isLoading = loadingSchedules[enrollmentId];
    
    const getStatusColor = (status) => {
      switch(status) {
        case 'active': return 'bg-green-100 text-green-800';
        case 'pending': return 'bg-yellow-100 text-yellow-800';
        case 'cancelled': return 'bg-red-100 text-red-800';
        case 'inactive': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    const getStatusText = (status) => {
      switch(status) {
        case 'active': return 'Activo';
        case 'pending': return 'Pendiente';
        case 'cancelled': return 'Cancelado';
        case 'inactive': return 'Inactivo';
        default: return 'Desconocido';
      }
    };

    return (
      <div className="bg-white rounded-xl shadow border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-5">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h3 className="font-semibold text-gray-800 text-lg">
                {enrollment.discipline_name || enrollment.discipline?.name || 'Disciplina'}
              </h3>
              <p className="text-gray-500 text-sm">
                {enrollment.category_name || enrollment.category?.name || 'Categoría'}
              </p>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(enrollment.status)}`}>
              {getStatusText(enrollment.status)}
            </span>
          </div>
         
          {/* Sección de Horarios */}
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <Clock className="w-4 h-4 text-gray-500 mr-2" />
              <span className="text-sm font-medium text-gray-700">Horarios de Actividad</span>
            </div>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
                <span className="text-sm text-gray-500 ml-2">Cargando horarios...</span>
              </div>
            ) : schedules.length > 0 ? (
              <div className="space-y-2">
                {schedules.map((schedule, index) => (
                  <div key={schedule.id || index} className="bg-gray-50 rounded-lg p-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2 flex items-center">
                        <Calendar className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs font-medium text-gray-700">
                          {getDayOfWeekName(schedule.day_of_week)} 
                        </span>
                        <span className="text-xs text-gray-500 mx-1">•</span>
                        <span className="text-xs text-gray-600">
                          {formatTime(schedule.start_time)} - {formatTime(schedule.end_time)}
                        </span>
                      </div>
                      
                      <div className="col-span-1 flex items-center mt-1">
                        <User className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-600 truncate" title={schedule.teacher_name}>
                          {schedule.teacher_name || 'Sin profesor'}
                        </span>
                      </div>
                      
                      <div className="col-span-1 flex items-center mt-1">
                        <MapPin className="w-3 h-3 text-gray-500 mr-1" />
                        <span className="text-xs text-gray-600 truncate" title={schedule.room}>
                          {schedule.room || 'Sin sala'}
                        </span>
                      </div>
                      
                      {schedule.max_capacity && (
                        <div className="col-span-1 flex items-center mt-1">
                          <UsersIcon className="w-3 h-3 text-gray-500 mr-1" />
                          <span className="text-xs text-gray-600">
                            {schedule.enrolled_member || 0}/{schedule.max_capacity}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-500 text-center">
                  No hay horarios disponibles para esta categoría
                </p>
              </div>
            )}
          </div>
          
          <div className="space-y-2 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Calendar className="w-4 h-4 mr-2" />
              <span>
                Inicio: {enrollment.start_date ? new Date(enrollment.start_date).toLocaleDateString('es-ES') : 'No definido'}
              </span>
            </div>
            {enrollment.end_date && (
              <div className="flex items-center text-sm text-gray-600">
                <Calendar className="w-4 h-4 mr-2" />
                <span>Fin: {new Date(enrollment.end_date).toLocaleDateString('es-ES')}</span>
              </div>
            )}
          </div>
          
          <div className="pt-3 border-t border-gray-100">
            <div className="flex justify-between items-center">
              <span className="text-gray-500 text-sm">Costo {enrollment.period === 'monthly' ? 'mensual' : 
                                                             enrollment.period === 'yearly'  ? 'anual'   :
                                                             enrollment.period === 'weekly'  ? 'semanal' :
                                                             enrollment.period === 'daily'   ? 'diario'  : 'otros'}</span>
              <span className="font-semibold text-gray-800">
                {enrollment.currency || '$'} {enrollment.amount || enrollment.fee || '0.00'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 px-5 py-3 flex justify-end">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium mr-4">
            Ver detalles
          </button>
          {enrollment.status === 'active' && (
            <button className="text-sm text-red-600 hover:text-red-800 font-medium">
              Cancelar
            </button>
          )}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Loader2 className="animate-spin h-12 w-12 text-blue-600 mx-auto" />
            <p className="mt-4 text-gray-600">Cargando datos del socio...</p>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="p-4 md:p-6">
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-2xl mx-auto">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <X className="w-6 h-6 text-red-600" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-red-800">Error al cargar datos</h3>
                <p className="text-red-600 mt-2">{error}</p>
                <div className="mt-4">
                  <button 
                    onClick={loadMemberData}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Verificar si enrollments es un array
    const isEnrollmentsArray = Array.isArray(enrollments);
    const enrollmentsCount = isEnrollmentsArray ? enrollments.length : 0;
    const activeCount = countActiveEnrollments();
    const pendingCount = countPendingEnrollments();

    switch (activeSection) {
      case 'profile':
        return <MemberProfile member={member} enrollments={enrollments} loadMemberData={loadMemberData} />;

      default:
        return (
          <div className="p-4 md:p-6">

            {/* Tarjeta de bienvenida */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl shadow-lg p-5 text-white mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold mb-2">¡Bienvenid{user?.gender === 'male' ? 'o' : 'a'} {member?.first_name}!</h3>
                  <p className="opacity-90">Tu inscripción a {user?.club_name} se encuentra en estado:</p>
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      member?.status === 'active' 
                        ? 'bg-green-200 text-green-800' 
                        : member?.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {member?.status === 'active' ? 'Activa' : 
                      member?.status === 'inactive' ? 'Inactiva' : 
                      'Pendiente'}
                    </span>
                  </div>
                </div>
                <div className="hidden sm:block">
                  <User size={48} className="opacity-80" />
                </div>
              </div>
            </div>
            
            {/* Información del miembro */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {/* Tarjeta de estado del miembro */}
              <div className={`${member?.club_status === 'active' ? 'bg-green-100' : 'bg-gray-100'}  rounded-xl shadow p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">{member?.club_name}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                    member?.club_status === 'active'   ? 'bg-green-200 text-green-800' : 'bg-gray-100 text-gray-800'  
                  }`}>
                    {member?.club_status === 'active'   ? 'Activo'   :  'Inactivo' }
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium text-gray-800">{member?.club_address || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Teléono</p>
                    <p className="font-medium text-gray-800">
                      {member?.club_phone || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">E-mail</p>
                    <p className="font-medium text-gray-800">
                      {member?.club_email || 'N/A'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen de inscripciones */}
              <div className="bg-white rounded-xl shadow p-5">
                <div className="flex items-center mb-4">
                  <Newspaper className="w-5 h-5 text-gray-600 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-800">Últimas novedades</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total inscrito en:</span>
                    <span className="font-semibold text-gray-800">
                      {enrollmentsCount} disciplinas
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Activas:</span>
                    <span className="font-semibold text-green-600">
                      {activeCount}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pendientes:</span>
                    <span className="font-semibold text-yellow-600">
                      {pendingCount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Próximo pago */}





                <div className="bg-white rounded-xl shadow p-5">
                  <div className="flex items-center mb-4">
                    <DollarSign className="w-5 h-5 text-gray-600 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-800">Próximo Pago </h3>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-500">Vencimiento</p>
                      <p className="font-medium text-gray-800">
                        {member?.next_payment_date 
                          ? new Date(member?.next_payment_date).toLocaleDateString('es-ES')
                          : 'No disponible'}
                      </p>
                    </div>
                    <div>
                      <MercadoPagoButton
                        paymentData={{
                          amount: member?.amount || 10.00,
                          currency: member?.currency || 'ars',
                          clubName: member?.club_name,
                          memberName: member?.first_name,
                          memberLastName: member?.last_name,
                          memberEmail: member?.email,
                          memberDNI: member?.dni
                        }}
                        memberId={member?.id || user?.id}
                        onPaymentSuccess={() => {
                          // Función a ejecutar después de un pago exitoso
                          console.log('Pago exitoso!');
                          // Puedes recargar los datos del miembro
                          loadMemberData();
                          // O mostrar un mensaje
                          alert('¡Pago realizado con éxito!');
                        }}
                      />
                    </div>
                    
                    {/* Información adicional sobre el pago */}
                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">
                        <span className="font-medium">Métodos aceptados:</span> Tarjetas de crédito/débito, MercadoPago
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        El pago se procesa de forma segura a través de MercadoPago
                      </p>
                    </div>
                  </div>
                </div>
                  

            </div>

            {/* Sección de Inscripciones */}
            <div className="mb-6">

              {/* Tarjeta de bienvenida */}
              <div className="bg-gradient-to-r from-purple-600 to-blue-500 rounded-2xl shadow-lg p-5 text-white mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold mb-2">Mis Inscripciones</h3>
                    <p className="opacity-90">Total de actividades inscriptas:</p>
                    <div className="mt-3">
                      <span className="inline-block bg-white/20 px-3 py-1 rounded-full text-sm ml-2">
                        {enrollmentsCount} inscripciones
                      </span>
                    </div>
                  </div>
                  <div className="hidden sm:block">
                    <UserCheck size={48} className="opacity-80" />
                  </div>
                </div>
              </div>

              {isEnrollmentsArray && enrollments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {getSafeEnrollmentsSlice(3).map((enrollment, index) => (
                    <EnrollmentCard key={enrollment?.id || enrollment?._id || index} enrollment={enrollment} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {!isEnrollmentsArray ? 'Error al cargar inscripciones' : 'No hay inscripciones'}
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {!isEnrollmentsArray 
                      ? 'Los datos de inscripciones no están en el formato esperado' 
                      : 'Aún no estás inscrito en ninguna disciplina'}
                  </p>
                </div>
              )}
            </div>

            {/* Grid de tarjetas responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* Más tarjetas si es admin */}
              {(user?.role === 'club_admin' || user?.role === 'super_admin') && (
                <>
                  <DashboardCard
                    title="Gestión de Usuarios"
                    description="Administra los usuarios"
                    icon={<Users className="w-6 h-6" />}
                    color="blue"
                    onClick={() => handleSectionChange('users')}
                  />
                  <DashboardCard
                    title="Gestión de Disciplinas"
                    description="Administra las disciplinas"
                    icon={<BookOpen className="w-6 h-6" />}
                    color="orange"
                    onClick={() => handleSectionChange('disciplines')}
                  />
                </>
              )}
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
            fixed md:sticky md:top-0
            left-0 z-40
            w-64 md:w-64
            transition-transform duration-300 ease-in-out
            h-screen
            overflow-y-auto
          `}
          style={{
    height: '100vh', // Asegura altura completa
    top: '0' // Posiciona desde el top
  }}
        >
          <MemberSidebar 
            activeSection={activeSection} 
            setActiveSection={handleSectionChange}
            mobile={isMobile}
          />
        </div>

        {/* Contenido principal */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header para desktop */}
          <div className="hidden md:block">
            <MemberHeader user={user} />
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

export default MemberDashboard;