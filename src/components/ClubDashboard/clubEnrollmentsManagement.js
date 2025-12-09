import React, { useState, useEffect, useMemo } from 'react';
import { clubEnrollmentService,clubCategoryService, clubMemberService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';

function formatDateOnlyAR(dateString) {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

const ClubEnrollmentsManagement = () => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingEnrollment, setEditingEnrollment] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Estados para DataTable
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [members, setMembers] = useState([]);
  
  const { user: currentEnrollment } = useClubAuth();
  const [selectedEnrollment, setselectedEnrollment] = useState('');

  useEffect(() => {
    loadEnrollments();
  }, []);

  const loadEnrollments = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar categorías del club
      const cateogoryData = await clubCategoryService.getCategoriesByClubId(currentEnrollment.club_id);
      const activeCategories = cateogoryData.filter(category => category.status === 'active' );
      setCategories(activeCategories);
      
      // Cargar disciplinas del club
      const enrollmentData = await clubCategoryService.getDisciplinesByClubId(currentEnrollment.club_id);
      const activeDisciplines = enrollmentData.filter(enrollment => enrollment.status === 'active' );
      setDisciplines(activeDisciplines);

      // Cargar miembros del club
      const memberData = await clubMemberService.getMembersByClubId(currentEnrollment.club_id);
      const activeMembers = memberData.filter(member => member.status === 'active' );
      setMembers(activeMembers);

      // Cargar inscripcións del mismo club
      const enrollmentsData = await clubEnrollmentService.getEnrollmentsByClubId(currentEnrollment.club_id);
      setEnrollments(enrollmentsData);

    } catch (err) {
      setError(err.message);
      console.error('Error loading enrollments:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para ordenar los datos
  const sortedAndFilteredEnrollments = useMemo(() => {
    let filtered = enrollments.filter(enrollment => 
      enrollment.member_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      enrollment.discipline_name?.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    // Ordenar
    filtered.sort((a, b) => {
      let aValue = a[sortField];
      let bValue = b[sortField];
      
      // Manejar valores nulos o undefined
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [enrollments, searchTerm, sortField, sortDirection]);

  // Paginación
  const paginatedEnrollments = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredEnrollments.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredEnrollments, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredEnrollments.length / itemsPerPage);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const getSortIcon = (field) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === 'asc' ? 
      <span className="text-blue-500">↑</span> : 
      <span className="text-blue-500">↓</span>;
  };

  const handleCreate = async (enrollmentData) => {
    try {
      setError('');
      
      const enrollmentDataWithClub = {
        ...enrollmentData,
        club_id: currentEnrollment.club_id
      };
      
      await clubEnrollmentService.createEnrollment(enrollmentDataWithClub);
      setSuccessMessage('Inscripción creado exitosamente');
      setShowCreateModal(false);
      loadEnrollments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear inscripción');
    }
  };

  const handleEdit = (enrollment) => {
    setEditingEnrollment(enrollment);
    setShowEditModal(true);
  };

  /*const handleDisciplineChange = (e) => {
    const enrollmentId = e.target.value;
    setSelectedClub(enrollmentId);
    loadUsersByClub(enrollmentId);
  };*/

  const handleUpdate = async (enrollmentData) => {
    try {
      setError('');
      
      const enrollmentDataWithClub = {
        ...enrollmentData,
        club_id: currentEnrollment.club_id
      };
      
      await clubEnrollmentService.updateEnrollment(editingEnrollment.id, enrollmentDataWithClub);
      setShowEditModal(false);
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
    /*if (enrollmentId === currentEnrollment.id) {
      setError('No puedes eliminarte a ti mismo');
      return;
    }*/
   console.log('Enrollment ID: ',enrollmentId);

    if (window.confirm('¿Estás seguro de que quieres eliminar esta inscripción?')) {
      try {
        setError('');
        await clubEnrollmentService.deleteEnrollment(enrollmentId);
        setSuccessMessage('Inscripción eliminada exitosamente');
        loadEnrollments();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Error al eliminar la inscripción: ' + err.message);
        console.error('Error deleting enrollment:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando inscripciones del club...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Inscripciones</h2>
          <p className="text-gray-600">Total: {sortedAndFilteredEnrollments.length} inscripcións</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Crear Inscripción</span>
          </button>
          <button
            onClick={loadEnrollments}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Actualizar
          </button>
        </div>
      </div>

      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Barra de búsqueda y controles */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400">🔍</span>
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">📊</span>
              <span className="text-sm text-gray-600">Mostrar:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {sortedAndFilteredEnrollments.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron inscripciones que coincidan con la búsqueda' : 'No se encontraron inscripciones en este club'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Primer Inscripción
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {/*<th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('id')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>ID</span>
                      {getSortIcon('id')}
                    </div>
                  </th>*/}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('first_name')} >
                    <div className="flex items-center space-x-1">
                      <span>Nombre</span>
                      {getSortIcon('first_name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('discipline_name')} >
                    <div className="flex items-center space-x-1">
                      <span>Disciplina</span>
                      {getSortIcon('discipline_name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category_name')} >
                    <div className="flex items-center space-x-1">
                      <span >Categoría</span>
                      {getSortIcon('category_name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('category_name')} >
                    <div className="flex items-center space-x-1">
                      <span >Inscipción</span>
                      {getSortIcon('category_name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-gray-50">
                    {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.id}
                    </td>*/}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {enrollment.first_name?.charAt(0).toUpperCase() || 'U'}
                          {enrollment.last_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.first_name} {enrollment.last_name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.discipline_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {enrollment.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDateOnlyAR(enrollment.enrollment_date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        enrollment.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {enrollment.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(enrollment)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      
                        <button
                          onClick={() => handleDelete(enrollment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      
                      {/*{enrollment.id === currentEnrollment.id && (
                        <span className="text-gray-400 text-xs">(Tú)</span>
                      )}*/}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-700">
                    Mostrando <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> a{' '}
                    <span className="font-medium">
                      {Math.min(currentPage * itemsPerPage, sortedAndFilteredEnrollments.length)}
                    </span> de{' '}
                    <span className="font-medium">{sortedAndFilteredEnrollments.length}</span> resultados
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modales (se mantienen igual) */}
      {showCreateModal && (
        <CreateEnrollmentModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
          enrollments={enrollments}
          categories={categories}
          disciplines={disciplines}
          members={members}
        />
      )}

        {showEditModal && (
        <EditEnrollmentModal
            enrollment={editingEnrollment}
            onSave={handleUpdate}
            onClose={() => {
                setShowEditModal(false);
                setEditingEnrollment(null);
            }}
            enrollments={enrollments}
            categories={categories}
            disciplines={disciplines}
            members={members}
        />
        )}
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Los componentes CreateEnrollmentModal y EditEnrollmentModal se mantienen exactamente igual que antes                 ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CreateEnrollmentModal = ({ 
  onSave, 
  onClose, 
  members,
  disciplines,
  categories
}) => {
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
  const filteredCategories = useMemo(() => {
    if (!formData.discipline_id) {
      return categories;
    }
    return categories.filter(category => 
      category.discipline_id === parseInt(formData.discipline_id)
    );
  }, [formData.discipline_id, categories]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id || !formData.discipline_id || !formData.category_id) {
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
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      
      // Si cambia la disciplina, limpiar la categoría seleccionada
      if (name === 'discipline_id') {
        newData.category_id = '';
      }
      
      return newData;
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crear Inscripción</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Campo Socio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Socio *
            </label>
            <select
              name="member_id"
              value={formData.member_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar socio</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.first_name} {member.last_name}
                </option>
              ))}
            </select>
          </div>
<div className="grid grid-cols-2 gap-4">
          {/* Campo Disciplina */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Disciplina *
            </label>
            <select
              name="discipline_id"
              value={formData.discipline_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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

          {/* Campo Categoría (dependiente de la disciplina) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría *
            </label>
            <select
              name="category_id"
              value={formData.category_id}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
              disabled={!formData.discipline_id || filteredCategories.length === 0}
            >
              <option value="">
                {!formData.discipline_id 
                  ? 'Primero seleccione una disciplina' 
                  : filteredCategories.length === 0 
                    ? 'No hay categorías para esta disciplina'
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
<div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de inscripción
            </label>
            <input
              type="date"
              name="enrollment_date"
              value={formData.enrollment_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
</div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observaciones
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Inscripción</span>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const EditEnrollmentModal = ({ 
  enrollment, 
  onSave, 
  onClose, 
  members,
  disciplines,
  categories
}) => {
  const [formData, setFormData] = useState({
    member_id: enrollment?.member_id || '',
    discipline_id: enrollment?.discipline_id || '',
    category_id: enrollment?.category_id || '',
    enrollment_date: enrollment?.enrollment_date || new Date().toISOString().split('T')[0],
    notes: enrollment?.notes || '',
    status: enrollment?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // Filtrar categorías
  const filteredCategories = useMemo(() => {
    if (!formData.discipline_id) {
      return categories;
    }
    return categories.filter(category => 
      category.discipline_id === parseInt(formData.discipline_id)
    );
  }, [formData.discipline_id, categories]);

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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id, !formData.category_id) {
      setError('Todos los campos obligatorios deben ser completados');
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

  return (
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Actualizar Inscripción</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
            </div>
            )}

            {/* Campo Socio */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Socio *
                </label>
                <select
                name="member_id"
                value={formData.member_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                >
                <option value="">Seleccionar socio</option>
                {members.map((member) => (
                    <option key={member.id} value={member.id}>
                    {member.first_name} {member.last_name}
                    </option>
                ))}
                </select>
            </div>
            {/* Campo Disciplina */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Disciplina *
                    </label>
                    <select
                    name="discipline_id"
                    value={formData.discipline_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                {/* Campo Categoría (dependiente de la disciplina) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría *
                    </label>
                    <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                    disabled={!formData.discipline_id || filteredCategories.length === 0}
                    >
                    <option value="">
                        {!formData.discipline_id 
                        ? 'Primero seleccione una disciplina' 
                        : filteredCategories.length === 0 
                            ? 'No hay categorías para esta disciplina'
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
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inscripción
                    </label>
                    <input
                        type="date"
                        name="enrollment_date"
                        value={formData.enrollment_date}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                        <option value="active">Activo</option>
                        <option value="inactive">Inactivo</option>
                    </select>
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Observaciones
                </label>
                <textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    rows="3"
                />
            </div>
        </form>
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50"
            >
                Cancelar
            </button>
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white text-sm font-medium rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 flex items-center space-x-2"
                >
                {loading ? (
                <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Actualizando...</span>
                </>
                ) : (
                <span>Actualizar Inscripción</span>
                )}
            </button>
        </div>
    </div>
</div>// JSX similar al CreateEnrollmentModal
  );
};

/*
const EditEnrollmentModal2 = ({ enrollment, onSave, onClose, enrollments, members, disciplines, categories }) => { // <-- Añadir enrollments como prop
  const [formData, setFormData] = useState({
    member_id: enrollment?.member_id || '',
    category_id: enrollment?.category_id || '',
    notes: enrollment?.notes || '',
    status: enrollment?.status || 'active',
    enrollment_id: enrollment?.enrollment_id || '' // <-- Añadir enrollment_id
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id, !formData.category_id) {
      setError('Todos los campos obligatorios deben ser completados');
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

  );
};*/

export default ClubEnrollmentsManagement;