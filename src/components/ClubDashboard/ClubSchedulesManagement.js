import React, { useState, useEffect } from 'react';
import { clubScheduleService, clubCategoryService, clubUserService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Calendar,
  Clock,
  Users,
  MapPin,
  User,
  BookOpen,
  Tag,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Grid,
  List,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  CalendarDays,
  Filter,
  Download
} from 'lucide-react';

// Importar componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

// Componente simplificado de calendario para móvil
const MobileCalendarView = ({ schedules, onEdit, onDelete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('day'); // 'day' o 'week'

  // Formatear fecha
  const formatDate = (date) => {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Obtener eventos del día
  const getTodayEvents = () => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, etc.
    
    return schedules.filter(schedule => 
      schedule.status === 'active' && 
      parseInt(schedule.day_of_week) === dayOfWeek
    );
  };

  const todayEvents = getTodayEvents();

  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Header del calendario */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Calendario</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode('day')}
            className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'day' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            Día
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-3 py-1 rounded-lg text-sm ${viewMode === 'week' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}
          >
            Semana
          </button>
        </div>
      </div>

      {/* Fecha actual */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">{formatDate(new Date())}</p>
        <p className="text-xs text-blue-600">Hoy</p>
      </div>

      {/* Clases de hoy */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-700">Clases de hoy:</h4>
        
        {todayEvents.length === 0 ? (
          <div className="text-center py-8">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500">No hay clases programadas para hoy</p>
          </div>
        ) : (
          todayEvents.map((schedule) => (
            <div 
              key={schedule.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold">
                      {schedule.discipline_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <h5 className="font-semibold text-gray-900">{schedule.discipline_name}</h5>
                      <p className="text-sm text-gray-600">{schedule.category_name}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Clock size={14} />
                      <span>{schedule.start_time} - {schedule.end_time}</span>
                    </div>
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <User size={14} />
                      <span>{schedule.teacher_name}</span>
                    </div>
                    {schedule.room && (
                      <div className="flex items-center space-x-1 text-sm text-gray-600">
                        <MapPin size={14} />
                        <span>{schedule.room}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                      <Users size={14} />
                      <span>{schedule.enrolled_member || 0}/{schedule.max_capacity}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-1 ml-2">
                  <button
                    onClick={() => onEdit(schedule)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => onDelete(schedule.id)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 bg-green-50 rounded">
            <p className="text-xl font-bold text-green-700">{todayEvents.length}</p>
            <p className="text-xs text-green-600">Clases hoy</p>
          </div>
          <div className="text-center p-2 bg-blue-50 rounded">
            <p className="text-xl font-bold text-blue-700">
              {schedules.filter(s => s.status === 'active').length}
            </p>
            <p className="text-xs text-blue-600">Activos</p>
          </div>
          <div className="text-center p-2 bg-purple-50 rounded">
            <p className="text-xl font-bold text-purple-700">
              {[...new Set(schedules.map(s => s.discipline_name))].length}
            </p>
            <p className="text-xs text-purple-600">Disciplinas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ClubSchedulesManagement = ({ openModal, closeModal }) => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  
  // Estados para las dependencias
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [teachers, setTeachers] = useState([]);
  
  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadSchedules();
  }, []);

  const loadSchedules = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar categorías
      const categoryData = await clubCategoryService.getCategoriesByClubId(currentUser.club_id);
      const activeCategories = categoryData.filter(category => category.status === 'active');
      setCategories(activeCategories);
      
      // Cargar disciplinas
      const disciplineData = await clubCategoryService.getDisciplinesByClubId(currentUser.club_id);
      const activeDisciplines = disciplineData.filter(discipline => discipline.status === 'active');
      setDisciplines(activeDisciplines);

      // Cargar profesores
      const teacherData = await clubUserService.getUsersByClubId(currentUser.club_id);
      const activeTeachers = teacherData.filter(teacher => 
        teacher.status === 'active' && teacher.role === 'teacher'
      );
      setTeachers(activeTeachers);

      // Cargar horarios
      const schedulesData = await clubScheduleService.getSchedulesByClubId(currentUser.club_id);
      setSchedules(schedulesData);

    } catch (err) {
      setError('Error al cargar los horarios: ' + err.message);
      console.error('Error loading schedules:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para obtener nombre del día
  const getDayName = (dayNumber) => {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayIndex = typeof dayNumber === 'string' ? parseInt(dayNumber, 10) : dayNumber;
    
    if (dayIndex >= 0 && dayIndex < days.length) {
      return days[dayIndex];
    }
    
    return `Día ${dayNumber}`;
  };

  // Función para formatear hora
  const formatTime = (timeString) => {
    if (!timeString) return '--:--';
    try {
      const timeParts = timeString.split(':');
      if (timeParts.length >= 2) {
        const hours = timeParts[0].padStart(2, '0');
        const minutes = timeParts[1].padStart(2, '0');
        return `${hours}:${minutes}`;
      }
      return timeString;
    } catch (error) {
      return '--:--';
    }
  };

  const handleCreate = async (scheduleData) => {
    try {
      setError('');
      
      const processedData = {
        ...scheduleData,
        day_of_week: parseInt(scheduleData.day_of_week, 10),
        club_id: currentUser.club_id
      };
      
      await clubScheduleService.createSchedule(processedData);
      setSuccessMessage('Horario creado exitosamente');
      setIsCreateModalOpen(false);
      loadSchedules();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear horario');
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleView = (schedule) => {
    setSelectedSchedule(schedule);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (scheduleData) => {
    try {
      setError('');
      
      const processedData = {
        ...scheduleData,
        day_of_week: parseInt(scheduleData.day_of_week, 10),
        club_id: currentUser.club_id
      };
      
      await clubScheduleService.updateSchedule(editingSchedule.id, processedData);
      setIsEditModalOpen(false);
      setEditingSchedule(null);
      setSuccessMessage('Horario actualizado exitosamente');
      loadSchedules();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el horario: ' + err.message);
      console.error('Error updating schedule:', err);
    }
  };

  const handleDelete = async (scheduleId) => {
    const scheduleToDelete = schedules.find(s => s.id === scheduleId);
    
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar este horario?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará: <strong>{scheduleToDelete?.discipline_name} - {scheduleToDelete?.category_name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Esta acción eliminará todas las clases recurrentes asociadas
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-3">
          <button
            onClick={closeModal}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={async () => {
              try {
                setError('');
                await clubScheduleService.deleteSchedule(scheduleId);
                setSuccessMessage('Horario eliminado exitosamente');
                closeModal();
                loadSchedules();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar el horario: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Horario
          </button>
        </div>
      </div>,
      'sm'
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg text-gray-600">Cargando horarios del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Horarios del Club</h2>
          <p className="text-gray-600 mt-1">Organiza las clases y horarios de las actividades</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{schedules.length}</span> horarios
          </div>
          
          <button
            onClick={loadSchedules}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={18} />
            <span>Nuevo</span>
          </button>
        </div>
      </div>

      {/* Mensajes de éxito/error */}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <CheckCircle size={20} />
          <span>{successMessage}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center space-x-2">
          <XCircle size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Resumen estadístico */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Horarios Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {schedules.filter(s => s.status === 'active').length}
                </p>
              </div>
              <Calendar className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disciplinas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {[...new Set(schedules.map(s => s.discipline_name))].length}
                </p>
              </div>
              <BookOpen className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Profesores</p>
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(schedules.map(s => s.teacher_name))].length}
                </p>
              </div>
              <Users className="text-purple-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Cupos</p>
                <p className="text-2xl font-bold text-orange-600">
                  {schedules.reduce((sum, s) => sum + (parseInt(s.max_capacity) || 0), 0)}
                </p>
              </div>
              <BarChart3 className="text-orange-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Vista móvil del calendario */}
      <div className="md:hidden mb-6">
        <MobileCalendarView 
          schedules={schedules}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* DataTable para desktop y lista móvil */}
      {schedules.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay horarios registrados</h3>
          <p className="text-gray-600 mb-6">Crea horarios para organizar las clases de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primer Horario</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={schedules}
          columns={[
            { 
              key: 'discipline', 
              label: 'Disciplina',
              render: (_, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {item.discipline_name?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{item.discipline_name}</div>
                    <div className="text-xs text-gray-500">{item.category_name}</div>
                  </div>
                </div>
              )
            },
            { 
              key: 'teacher_name', 
              label: 'Profesor',
              render: (value) => value || 'No asignado'
            },
            { 
              key: 'day_of_week', 
              label: 'Día',
              render: (value) => (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                  {getDayName(value)}
                </span>
              )
            },
            { 
              key: 'time', 
              label: 'Horario',
              render: (_, item) => (
                <div className="flex items-center space-x-1">
                  <Clock size={12} className="text-gray-400" />
                  <span className="text-sm">
                    {formatTime(item.start_time)} - {formatTime(item.end_time)}
                  </span>
                </div>
              )
            },
            { 
              key: 'capacity', 
              label: 'Cupos',
              render: (_, item) => (
                <div className="flex items-center space-x-1">
                  <Users size={12} className="text-gray-400" />
                  <span className="text-sm">
                    {item.enrolled_member || 0}/{item.max_capacity || '∞'}
                  </span>
                </div>
              )
            },
            { 
              key: 'status', 
              label: 'Estado',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {value === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              )
            }
          ]}
          itemsPerPage={10}
          searchable={true}
          downloadable={true}
          actions={[
            {
              label: 'Ver',
              icon: <Eye size={14} />,
              onClick: (item) => handleView(item)
            },
            {
              label: 'Editar',
              icon: <Edit size={14} />,
              onClick: (item) => handleEdit(item)
            },
            {
              label: 'Eliminar',
              icon: <Trash2 size={14} />,
              variant: 'danger',
              onClick: (item) => handleDelete(item.id)
            }
          ]}
          onRowClick={(item) => handleView(item)}
        />
      )}

      {/* Modal para crear horario */}
      <CreateScheduleModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        teachers={teachers}
        disciplines={disciplines}
        categories={categories}
      />

      {/* Modal para editar horario */}
      {editingSchedule && (
        <EditScheduleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSchedule(null);
          }}
          schedule={editingSchedule}
          onSave={handleUpdate}
          teachers={teachers}
          disciplines={disciplines}
          categories={categories}
        />
      )}

      {/* Modal para ver detalles del horario */}
      {selectedSchedule && (
        <ViewScheduleModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSchedule(null);
          }}
          schedule={selectedSchedule}
          formatTime={formatTime}
          getDayName={getDayName}
        />
      )}
    </div>
  );
};

// Modal para crear horario
const CreateScheduleModal = ({ isOpen, onClose, onSave, teachers, disciplines, categories }) => {
  const [formData, setFormData] = useState({
    discipline_id: '',
    teacher_id: '',
    start_time: '',
    end_time: '',
    category_id: '',
    room: '',
    day_of_week: '',
    max_capacity: '20',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const filteredCategories = disciplines.find(d => d.id === parseInt(formData.discipline_id))
    ? categories.filter(c => c.discipline_id === parseInt(formData.discipline_id))
    : [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validaciones
    if (!formData.teacher_id || !formData.day_of_week || !formData.category_id || 
        !formData.start_time || !formData.end_time || !formData.max_capacity) {
      setError('Todos los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    // Validar horas
    if (formData.start_time && formData.end_time) {
      const [startHour, startMinute] = formData.start_time.split(':').map(Number);
      const [endHour, endMinute] = formData.end_time.split(':').map(Number);
      
      if (endHour < startHour || (endHour === startHour && endMinute <= startMinute)) {
        setError('La hora de fin debe ser mayor que la hora de inicio');
        setLoading(false);
        return;
      }
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      if (name === 'discipline_id') {
        newData.category_id = '';
      }
      
      return newData;
    });
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Horario"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina *
            </label>
            <select
              name="discipline_id"
              value={formData.discipline_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar disciplina</option>
              {disciplines.map((discipline) => (
                <option key={discipline.id} value={discipline.id}>
                  {discipline.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.discipline_id || filteredCategories.length === 0}
            >
              <option value="">
                {!formData.discipline_id 
                  ? 'Seleccione disciplina primero' 
                  : filteredCategories.length === 0 
                    ? 'No hay categorías'
                    : 'Seleccionar categoría'
                }
              </option>
              {filteredCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profesor *
          </label>
          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Seleccionar profesor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de la Semana *
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar día</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad Máxima *
            </label>
            <input
              type="number"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Inicio *
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Fin *
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área/Sala
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              placeholder="Ej: Gimnasio principal, Sala A"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Clock size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Importante:</strong> Este horario creará clases recurrentes semanales.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Las clases se generarán automáticamente cada semana en el día y hora especificados.
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Crear Horario</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar horario
const EditScheduleModal = ({ isOpen, onClose, schedule, onSave, teachers, categories }) => {
  const [formData, setFormData] = useState({
    teacher_id: schedule?.teacher_id || '',
    category_id: schedule?.category_id || '',
    start_time: schedule?.start_time || '',
    end_time: schedule?.end_time || '',
    max_capacity: schedule?.max_capacity || '20',
    room: schedule?.room || '',
    day_of_week: schedule?.day_of_week?.toString() || '',
    status: schedule?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.teacher_id || !formData.category_id || !formData.day_of_week || 
        !formData.start_time || !formData.end_time || !formData.max_capacity) {
      setError('Todos los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Horario: ${schedule?.discipline_name}`}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Disciplina
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            {schedule?.discipline_name}
          </div>
          <p className="text-xs text-gray-500 mt-1">La disciplina no se puede modificar</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Categoría *
          </label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Seleccionar categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profesor *
          </label>
          <select
            name="teacher_id"
            value={formData.teacher_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Seleccionar profesor</option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.id}>
                {teacher.first_name} {teacher.last_name}
              </option>
            ))}
          </select>
        </div>

        {/* Resto del formulario similar al CreateScheduleModal */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Día de la Semana *
            </label>
            <select
              name="day_of_week"
              value={formData.day_of_week}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar día</option>
              <option value="1">Lunes</option>
              <option value="2">Martes</option>
              <option value="3">Miércoles</option>
              <option value="4">Jueves</option>
              <option value="5">Viernes</option>
              <option value="6">Sábado</option>
              <option value="0">Domingo</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Capacidad Máxima *
            </label>
            <input
              type="number"
              name="max_capacity"
              value={formData.max_capacity}
              onChange={handleChange}
              min="1"
              max="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Inicio *
            </label>
            <input
              type="time"
              name="start_time"
              value={formData.start_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hora de Fin *
            </label>
            <input
              type="time"
              name="end_time"
              value={formData.end_time}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Área/Sala
            </label>
            <input
              type="text"
              name="room"
              value={formData.room}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Actualizando...</span>
              </>
            ) : (
              <>
                <Edit size={18} />
                <span>Actualizar Horario</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles del horario
const ViewScheduleModal = ({ isOpen, onClose, schedule, formatTime, getDayName }) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Horario"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {schedule?.discipline_name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {schedule?.discipline_name} - {schedule?.category_name}
            </h3>
            <p className="text-gray-600">{schedule?.teacher_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            schedule?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {schedule?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <CalendarDays size={16} />
              <span>Horario</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Día:</span>
                <span className="font-medium">{getDayName(schedule?.day_of_week)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inicio:</span>
                <span className="font-medium">{formatTime(schedule?.start_time)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fin:</span>
                <span className="font-medium">{formatTime(schedule?.end_time)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Users size={16} />
              <span>Capacidad</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Máxima:</span>
                <span className="font-medium">{schedule?.max_capacity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inscriptos:</span>
                <span className="font-medium">{schedule?.enrolled_member || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Disponibles:</span>
                <span className="font-medium text-green-600">
                  {(schedule?.max_capacity || 0) - (schedule?.enrolled_member || 0)}
                </span>
              </div>
            </div>
          </div>

          {schedule?.room && (
            <div className="bg-blue-50 p-4 rounded-lg md:col-span-2">
              <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
                <MapPin size={16} />
                <span>Ubicación</span>
              </h4>
              <p className="text-blue-800">{schedule.room}</p>
            </div>
          )}
        </div>

        {/* Información adicional */}
        {schedule?.created_at && (
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-700 mb-2">Información del Sistema</h4>
            <p className="text-sm text-green-800">
              Horario creado el {new Date(schedule.created_at).toLocaleDateString('es-ES')}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default ClubSchedulesManagement;