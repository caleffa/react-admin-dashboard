import React, { useState, useEffect } from 'react';
import { clubEnrollmentService, clubCategoryService, clubMemberService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  UserCheck,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Calendar,
  User,
  BookOpen,
  Tag,
  CheckCircle,
  XCircle,
  Users,
  BarChart3,
  AlertCircle,
  FileText,
  Clock
} from 'lucide-react';

// Importar componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubEnrollmentsManagement = ({ openModal, closeModal }) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedEnrollment, setSelectedEnrollment] = useState(null);
  
  // Estados para las dependencias
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  
  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
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

      // Cargar miembros
      const memberData = await clubMemberService.getMembersByClubId(currentUser.club_id);
      const activeMembers = memberData.filter(member => member.status === 'active');
      setMembers(activeMembers);

      // Cargar inscripciones
      const enrollmentsData = await clubEnrollmentService.getEnrollmentsByClubId(currentUser.club_id);
      setEnrollments(enrollmentsData);

    } catch (err) {
      setError('Error al cargar las inscripciones: ' + err.message);
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('es-AR', {
        timeZone: 'America/Argentina/Buenos_Aires',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    } catch (error) {
      return 'Fecha inválida';
    }
  };

  const handleCreate = async (enrollmentData) => {
    try {
      setError('');
      
      const enrollmentDataWithClub = {
        ...enrollmentData,
        club_id: currentUser.club_id
      };
      
      await clubEnrollmentService.createEnrollment(enrollmentDataWithClub);
      setSuccessMessage('Inscripción creada exitosamente');
      setIsCreateModalOpen(false);
      loadEnrollments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear inscripción');
    }
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setIsEditModalOpen(true);
  };

  const handleView = (enrollment) => {
    setSelectedEnrollment(enrollment);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (enrollmentData) => {
    try {
      setError('');
      
      const enrollmentDataWithClub = {
        ...enrollmentData,
        club_id: currentUser.club_id
      };
      
      await clubEnrollmentService.updateEnrollment(editingEnrollment.id, enrollmentDataWithClub);
      setIsEditModalOpen(false);
      setEditingEnrollment(null);
      setSuccessMessage('Inscripción actualizada exitosamente');
      loadEnrollments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la inscripción: ' + err.message);
      console.error('Error updating enrollment:', err);
    }
  };

  const handleDelete = async (enrollmentId) => {
    const enrollmentToDelete = enrollments.find(e => e.id === enrollmentId);
    console.log('enrollmentId ',enrollmentId)
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar esta inscripción?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará: <strong>{enrollmentToDelete?.first_name} {enrollmentToDelete?.last_name}</strong> de <strong>{enrollmentToDelete?.discipline_name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Esta acción no se puede deshacer
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
                await clubEnrollmentService.deleteEnrollment(enrollmentId);
                setSuccessMessage('Inscripción eliminada exitosamente');
                closeModal();
                loadEnrollments();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar la inscripción: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Inscripción
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
          <p className="text-lg text-gray-600">Cargando inscripciones del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inscripciones</h2>
          <p className="text-gray-600 mt-1">Gestiona las inscripciones de socios a actividades</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{enrollments.length}</span> inscripciones
          </div>
          
          <button
            onClick={loadEnrollments}
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
            <span>Nueva</span>
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
      {enrollments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inscripciones Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {enrollments.filter(e => e.status === 'active').length}
                </p>
              </div>
              <UserCheck className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Socios Únicos</p>
                <p className="text-2xl font-bold text-blue-600">
                  {[...new Set(enrollments.map(e => e.member_id))].length}
                </p>
              </div>
              <Users className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disciplinas</p>
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(enrollments.map(e => e.discipline_name))].length}
                </p>
              </div>
              <BookOpen className="text-purple-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Última Inscripción</p>
                <p className="text-2xl font-bold text-orange-600">
                  {enrollments.length > 0 ? 
                    formatDate(enrollments[enrollments.length - 1].enrollment_date).split('/')[0] + 
                    '/' + formatDate(enrollments[enrollments.length - 1].enrollment_date).split('/')[1] 
                    : '-'}
                </p>
              </div>
              <Calendar className="text-orange-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {enrollments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay inscripciones registradas</h3>
          <p className="text-gray-600 mb-6">Inscribe a los socios en las actividades de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primera Inscripción</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={enrollments}
          columns={[
            { 
              key: 'member_name', 
              label: 'Socio',
              render: (_, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {item.first_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.first_name} {item.last_name}
                    </div>
                    {item.document_number && (
                      <div className="text-xs text-gray-500">DNI: {item.document_number}</div>
                    )}
                  </div>
                </div>
              )
            },
            { 
              key: 'discipline', 
              label: 'Actividad',
              render: (_, item) => (
                <div>
                  <div className="font-medium text-gray-900">{item.discipline_name}</div>
                  <div className="text-xs text-gray-500">{item.category_name}</div>
                </div>
              )
            },
            { 
              key: 'enrollment_date', 
              label: 'Fecha',
              render: (value) => (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-sm">{formatDate(value)}</span>
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

      {/* Modal para crear inscripción */}
      <CreateEnrollmentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        members={members}
        disciplines={disciplines}
        categories={categories}
      />

      {/* Modal para editar inscripción */}
      {editingEnrollment && (
        <EditEnrollmentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingEnrollment(null);
          }}
          enrollment={editingEnrollment}
          onSave={handleUpdate}
          members={members}
          disciplines={disciplines}
          categories={categories}
        />
      )}

      {/* Modal para ver detalles de la inscripción */}
      {selectedEnrollment && (
        <ViewEnrollmentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedEnrollment(null);
          }}
          enrollment={selectedEnrollment}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Modal para crear inscripción
const CreateEnrollmentModal = ({ isOpen, onClose, onSave, members, disciplines, categories }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    discipline_id: '',
    category_id: '',
    enrollment_date: new Date().toISOString().split('T')[0],
    notes: '',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtrar categorías basadas en la disciplina seleccionada
  const filteredCategories = disciplines.find(d => d.id === parseInt(formData.discipline_id))
    ? categories.filter(c => c.discipline_id === parseInt(formData.discipline_id))
    : [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id || !formData.discipline_id || !formData.category_id) {
      setError('Los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        member_id: '',
        discipline_id: '',
        category_id: '',
        enrollment_date: new Date().toISOString().split('T')[0],
        notes: '',
        status: 'active'
      });
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
      title="Crear Nueva Inscripción"
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
            Socio *
          </label>
          <select
            name="member_id"
            value={formData.member_id}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          >
            <option value="">Seleccionar socio</option>
            {members.map((member) => (
              <option key={member.id} value={member.id}>
                {member.first_name} {member.last_name} {member.document_number ? `(DNI: ${member.document_number})` : ''}
              </option>
            ))}
          </select>
        </div>

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
            {formData.discipline_id && filteredCategories.length === 0 && (
              <p className="text-yellow-600 text-sm mt-1">
                Esta disciplina no tiene categorías configuradas
              </p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inscripción
            </label>
            <input
              type="date"
              name="enrollment_date"
              value={formData.enrollment_date}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones / Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
            placeholder="Observaciones adicionales sobre esta inscripción..."
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <UserCheck size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Importante:</strong> Verifica que el socio cumple con los requisitos de la categoría seleccionada.
              </p>
              <p className="text-xs text-green-600 mt-1">
                La inscripción puede ser activada o desactivada según sea necesario.
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
                <span>Crear Inscripción</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar inscripción
const EditEnrollmentModal = ({ isOpen, onClose, enrollment, onSave, members, disciplines, categories }) => {
  const [formData, setFormData] = useState({
    member_id: enrollment?.member_id || '',
    discipline_id: enrollment?.discipline_id || '',
    category_id: enrollment?.category_id || '',
    enrollment_date: enrollment?.enrollment_date ? enrollment.enrollment_date.split('T')[0] : new Date().toISOString().split('T')[0],
    notes: enrollment?.notes || '',
    status: enrollment?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Filtrar categorías basadas en la disciplina seleccionada
  const filteredCategories = disciplines.find(d => d.id === parseInt(formData.discipline_id))
    ? categories.filter(c => c.discipline_id === parseInt(formData.discipline_id))
    : [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id || !formData.discipline_id || !formData.category_id) {
      setError('Los campos marcados con * son obligatorios');
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
      title={`Editar Inscripción: ${enrollment?.first_name} ${enrollment?.last_name}`}
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
            Socio *
          </label>
          <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
            {enrollment?.first_name} {enrollment?.last_name}
          </div>
          <p className="text-xs text-gray-500 mt-1">El socio no se puede modificar</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Inscripción
            </label>
            <input
              type="date"
              name="enrollment_date"
              value={formData.enrollment_date}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Observaciones / Notas
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
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
                <span>Actualizar Inscripción</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de la inscripción
const ViewEnrollmentModal = ({ isOpen, onClose, enrollment, formatDate }) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Inscripción"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {enrollment?.first_name?.charAt(0).toUpperCase() || 'S'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {enrollment?.first_name} {enrollment?.last_name}
            </h3>
            <p className="text-gray-600">{enrollment?.discipline_name} - {enrollment?.category_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            enrollment?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {enrollment?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <User size={16} />
              <span>Socio</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{enrollment?.first_name} {enrollment?.last_name}</span>
              </div>
              {enrollment?.document_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Documento:</span>
                  <span className="font-medium">{enrollment.document_number}</span>
                </div>
              )}
              {enrollment?.email && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-medium">{enrollment.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <BookOpen size={16} />
              <span>Actividad</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Disciplina:</span>
                <span className="font-medium">{enrollment?.discipline_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{enrollment?.category_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Inscripción:</span>
                <span className="font-medium">{formatDate(enrollment?.enrollment_date)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Observaciones */}
        {enrollment?.notes && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
              <FileText size={16} />
              <span>Observaciones</span>
            </h4>
                       <p className="text-blue-700">{enrollment.notes}</p>
          </div>
        )}

        {/* Historial/Metadatos */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
            <Clock size={16} />
            <span>Información Adicional</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID de Inscripción:</span>
              <span className="font-mono text-gray-800">{enrollment?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creado:</span>
              <span className="text-gray-800">{enrollment?.created_at ? formatDate(enrollment.created_at) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actualizado:</span>
              <span className="text-gray-800">{enrollment?.updated_at ? formatDate(enrollment.updated_at) : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cerrar
          </button>
          <button
            onClick={() => {
              // Aquí podrías agregar funcionalidad de imprimir o exportar
              onClose();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Imprimir
          </button>
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default ClubEnrollmentsManagement;