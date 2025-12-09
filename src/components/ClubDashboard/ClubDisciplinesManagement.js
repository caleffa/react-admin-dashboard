import React, { useState, useEffect, useMemo } from 'react';
import { clubDisciplineService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubDisciplinesManagement = () => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Estados para DataTable
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const { user: currentDiscipline } = useClubAuth();

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      setError('');
    
      // Cargar disciplinas del mismo club
      const disciplinesData = await clubDisciplineService.getDisciplinesByClubId(currentDiscipline.club_id);
      setDisciplines(disciplinesData);
    
    } catch (err) {
      setError(err.message);
      console.error('Error loading disciplines:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para ordenar los datos
  const sortedAndFilteredDisciplines = useMemo(() => {
    let filtered = disciplines.filter(discipline => 
      discipline.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discipline.desciption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      discipline.color?.includes(searchTerm) 
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
  }, [disciplines, searchTerm, sortField, sortDirection]);

  // Paginación
  const paginatedDisciplines = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredDisciplines.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredDisciplines, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredDisciplines.length / itemsPerPage);

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

  const handleCreate = async (disciplineData) => {
    try {
      setError('');
      
      const disciplineDataWithClub = {
        ...disciplineData,
        club_id: currentDiscipline.club_id
      };
      
      await clubDisciplineService.createDiscipline(disciplineDataWithClub);
      setSuccessMessage('Disciplina creado exitosamente');
      setShowCreateModal(false);
      loadDisciplines();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear disciplina');
    }
  };

  const handleEdit = (discipline) => {
    setEditingDiscipline(discipline);
    setShowEditModal(true);
  };

  const handleUpdate = async (disciplineData) => {
    try {
      setError('');
      
      const disciplineDataWithClub = {
        ...disciplineData,
        club_id: currentDiscipline.club_id
      };
      
      await clubDisciplineService.updateDiscipline(editingDiscipline.id, disciplineDataWithClub);
      setShowEditModal(false);
      setEditingDiscipline(null);
      setSuccessMessage('Disciplina actualizado exitosamente');
      loadDisciplines();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el disciplina: ' + err.message);
      console.error('Error updating discipline:', err);
    }
  };

  const handleDelete = async (disciplineId) => {
    /*if (disciplineId === currentDiscipline.id) {
      setError('No puedes eliminarte a ti mismo');
      return;
    }*/

    if (window.confirm('¿Estás seguro de que quieres eliminar esta disciplina?')) {
      try {
        setError('');
        await clubDisciplineService.deleteDiscipline(disciplineId);
        setSuccessMessage('Disciplina eliminado exitosamente');
        loadDisciplines();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Error al eliminar el disciplina: ' + err.message);
        console.error('Error deleting discipline:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando disciplinas del club...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Disciplinas del Club</h2>
          <p className="text-gray-600">Total: {sortedAndFilteredDisciplines.length} disciplinas</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Crear Disciplina</span>
          </button>
          <button
            onClick={loadDisciplines}
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

      {sortedAndFilteredDisciplines.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron disciplinas que coincidan con la búsqueda' : 'No se encontraron disciplinas en este club'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Primer Disciplina
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
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('name')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Nombre</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('description')}
                  >
                    <div className="flex items-center space-x-1">
                      <span>Descripción</span>
                      {getSortIcon('description')}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('color')}
                  >
                    <div className="flex items-center space-x-1">
                      <span >Color</span>
                      {getSortIcon('color')}
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
                {paginatedDisciplines.map((discipline) => (
                  <tr key={discipline.id} className="hover:bg-gray-50">
                    {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {discipline.id}
                    </td>*/}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {discipline.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {discipline.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {discipline.description}
                    </td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
<span 
  className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full"
  style={{ 
    backgroundColor: `${discipline.color}20`, 
    color: discipline.color,
    border: `1px solid ${discipline.color}`
  }}
>
  {discipline.color}
</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        discipline.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {discipline.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(discipline)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(discipline.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Eliminar
                      </button>
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
                      {Math.min(currentPage * itemsPerPage, sortedAndFilteredDisciplines.length)}
                    </span> de{' '}
                    <span className="font-medium">{sortedAndFilteredDisciplines.length}</span> resultados
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
        <CreateDisciplineModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && (
        <EditDisciplineModal
          discipline={editingDiscipline}
          onSave={handleUpdate}
          onClose={() => {
            setShowEditModal(false);
            setEditingDiscipline(null);
          }}
        />
      )}
    </div>
  );
};

// Los componentes CreateDisciplineModal y EditDisciplineModal se mantienen exactamente igual que antes
const CreateDisciplineModal = ({ onSave, onClose }) => {
  const [formData, setFormData] = useState({
    description: '',
    name: '',
    color: 'other',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if ( !formData.name ) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Crear Disciplina del Club</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
            </label>
            <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            />
        </div>
                
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción 
            </label>
            <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
                </label>
<input
  type="color"
  name="color"
  value={formData.color}
  onChange={handleChange}
  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
  required
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

        <div className="bg-green-50 p-3 rounded-lg">
        <p className="text-xs text-green-700">
            <strong>Nota:</strong> El disciplina se creará automáticamente en este club. 
        </p>
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
              <span>Crear Disciplina</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const EditDisciplineModal = ({ discipline, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    description: discipline.description || '',
    color: discipline.color || 'other',
    name: discipline.name || '',
    status: discipline.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if ( !formData.name ) {
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Editar Disciplina del Club</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

       <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre *
            </label>
            <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            />
        </div>
                
        <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción 
            </label>
            <input
            type="text"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            />
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Color
                </label>
<input
  type="color"
  name="color"
  value={formData.color}
  onChange={handleChange}
  className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 cursor-pointer"
  required
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
              <span>Actualizar Disciplina</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ClubDisciplinesManagement;