import React, { useState, useEffect, useMemo } from 'react';
import { clubFeeTypeService,clubCategoryService, clubDisciplineService } from '../../services/api';
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

const ClubFeeTypesManagement = () => {
  const [feetypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingFeeType, setEditingFeeType] = useState(null);
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
  const { user: currentFeeType } = useClubAuth();  
  const [selectedFeeType, setselectedFeeType] = useState('');

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar categorías del club
      const cateogoryData = await clubCategoryService.getCategoriesByClubId(currentFeeType.club_id);
      const activeCategories = cateogoryData.filter(category => category.status === 'active' );
      setCategories(activeCategories);
      
      // Cargar disciplinas del club
      const disciplineData = await clubDisciplineService.getDisciplinesByClubId(currentFeeType.club_id);
      const activeDisciplines = disciplineData.filter(discipline => discipline.status === 'active' );
      setDisciplines(activeDisciplines);

      // Cargar tipo de cuotas del mismo club
      const feetypesData = await clubFeeTypeService.getFeeTypesByClubId(currentFeeType.club_id);
      {/*const activeFeeTypes = feetypesData.filter(feetype => feetype.status === 'active' );*/}
      setFeeTypes(feetypesData);

    } catch (err) {
      setError(err.message);
      console.error('Error loading feetypes:', err);
    } finally {
      setLoading(false);
    }
  };

  // Función para ordenar los datos
  const sortedAndFilteredFeeTypes = useMemo(() => {
    let filtered = feetypes.filter(feetype => 
      feetype.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feetype.discipline_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feetype.category_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      feetype.amount?.toLowerCase().includes(searchTerm.toLowerCase()) 
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
  }, [feetypes, searchTerm, sortField, sortDirection]);

  // Paginación
  const paginatedFeeTypes = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedAndFilteredFeeTypes.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedAndFilteredFeeTypes, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(sortedAndFilteredFeeTypes.length / itemsPerPage);

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

  const handleCreate = async (feetypeData) => {
    try {
      setError('');
      
      const feetypeDataWithClub = {
        ...feetypeData,
        club_id: currentFeeType.club_id
      };

      await clubFeeTypeService.createFeeType(feetypeDataWithClub);
      setSuccessMessage('Tipo de cuota creado exitosamente');
      setShowCreateModal(false);
      loadFeeTypes();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear tipo de cuota');
    }
  };

  const handleEdit = (feetype) => {
    setEditingFeeType(feetype);
    setShowEditModal(true);
  };

  const handleUpdate = async (feetypeData) => {
    try {
      setError('');
      
      const feetypeDataWithClub = {
        ...feetypeData,
        club_id: currentFeeType.club_id
      };
      
      await clubFeeTypeService.updateFeeType(editingFeeType.id, feetypeDataWithClub);
      setShowEditModal(false);
      setEditingFeeType(null);
      setSuccessMessage('Tipo de cuota actualizada exitosamente');
      loadFeeTypes();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la tipo de cuota: ' + err.message);
      console.error('Error updating feetype:', err);
    }
  };

  const handleDelete = async (feetypeId) => {
    /*if (feetypeId === currentFeeType.id) {
      setError('No puedes eliminarte a ti mismo');
      return;
    }*/
   console.log('FeeType ID: ',feetypeId);

    if (window.confirm('¿Estás seguro de que quieres eliminar esta tipo de cuota?')) {
      try {
        setError('');
        await clubFeeTypeService.deleteFeeType(feetypeId);
        setSuccessMessage('Tipo de cuota eliminada exitosamente');
        loadFeeTypes();
        
        setTimeout(() => setSuccessMessage(''), 3000);
      } catch (err) {
        setError('Error al eliminar la tipo de cuota: ' + err.message);
        console.error('Error deleting feetype:', err);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Cargando tipos de cuotas del club...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tipos de cuotas</h2>
          <p className="text-gray-600">Total: {sortedAndFilteredFeeTypes.length} tipo de cuotas</p>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
          >
            <span>+</span>
            <span>Crear Tipo de cuota</span>
          </button>
          <button
            onClick={loadFeeTypes}
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

      {sortedAndFilteredFeeTypes.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'No se encontraron tipos de cuota que coincidan con la búsqueda' : 'No se encontraron tipos de cuota en este club'}
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Crear Primer Tipo de cuota
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('name')} >
                    <div className="flex items-center space-x-1">
                      <span>Nombre</span>
                      {getSortIcon('name')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('description')} >
                    <div className="flex items-center space-x-1">
                      <span>Disciplina / Categoría</span>
                      {getSortIcon('description')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('amount')} >
                    <div className="flex items-center space-x-1">
                      <span >Monto</span>
                      {getSortIcon('amount')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('currency')} >
                    <div className="flex items-center space-x-1">
                      <span >Moneda</span>
                      {getSortIcon('currency')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('period')} >
                    <div className="flex items-center space-x-1">
                      <span >Periodo</span>
                      {getSortIcon('period')}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                      onClick={() => handleSort('applies_to')} >
                    <div className="flex items-center space-x-1">
                      <span >Aplica</span>
                      {getSortIcon('applies_to')}
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
                {paginatedFeeTypes.map((feetype) => (
                  <tr key={feetype.id} className="hover:bg-gray-50">
                    {/*<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {feetype.id}
                    </td>*/}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                          {feetype.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {feetype.name} 
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {feetype.discipline_name} - {feetype.category_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {feetype.amount}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center">
                      {feetype.currency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      { feetype.period === 'daily' ? 'Diario' : 
                        feetype.period === 'weekly' ? 'Semanal' : 
                        feetype.period === 'monthly' ? 'Mensual' : 
                        feetype.period === 'quarterly' ? 'Quincenal' : 
                        'Anual'
                      } 
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {feetype.applies_to === 'all' ? 'Todos' : feetype.applies_to === 'category' ? 'Categoría': 'Disciplina' }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        feetype.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {feetype.status === 'active' ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(feetype)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Editar
                      </button>
                      
                        <button
                          onClick={() => handleDelete(feetype.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Eliminar
                        </button>
                      
                      {/*{feetype.id === currentFeeType.id && (
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
                      {Math.min(currentPage * itemsPerPage, sortedAndFilteredFeeTypes.length)}
                    </span> de{' '}
                    <span className="font-medium">{sortedAndFilteredFeeTypes.length}</span> resultados
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
        <CreateFeeTypeModal
          onSave={handleCreate}
          onClose={() => setShowCreateModal(false)}
          feetypes={feetypes}
          categories={categories}
          disciplines={disciplines}
        />
      )}

        {showEditModal && (
        <EditFeeTypeModal
            feetype={editingFeeType}
            onSave={handleUpdate}
            onClose={() => {
                setShowEditModal(false);
                setEditingFeeType(null);
            }}
            feetypes={feetypes}
            categories={categories}
            disciplines={disciplines}
        />
        )}
    </div>
  );
};

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/// Los componentes CreateFeeTypeModal y EditFeeTypeModal se mantienen exactamente igual que antes                 ///
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const CreateFeeTypeModal = ({ 
  onSave, 
  onClose, 
  disciplines,
  categories
  
}) => {
  const [formData, setFormData] = useState({
    name: '',
    discipline_id: '',
    category_id: '',
    description: '',
    period: 'monthly',
    amount: '',
    currency: 'ARS',
    applies_to: 'all',
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
    
    if ( !formData.discipline_id || !formData.name || !formData.category_id || !formData.amount || !formData.currency || !formData.applies_to || !formData.period ) {
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
          <h3 className="text-lg font-medium text-gray-900">Crear Tipo de cuota</h3>
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
              <option value="">Seleccionar</option>
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
                    : 'Seleccionar'
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
              Monto *
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-left"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo *
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="monthly">Mensual</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="quarterly">Quincenal</option>
              <option value="yearly">Anual</option>
            </select>
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
                <span>Creando...</span>
              </>
            ) : (
              <span>Crear Tipo de cuota</span>
            )}
          </button>
        </div>
        
      </div>
    </div>
  );
};



/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const EditFeeTypeModal = ({ 
  feetype, 
  onSave, 
  onClose, 
  members,
  disciplines,
  categories
}) => {
  const [formData, setFormData] = useState({
    club_id: feetype?.member_id || '',
    discipline_id: feetype?.discipline_id || '',
    category_id: feetype?.category_id || '',
    amount: feetype?.amount || 0,
    description: feetype?.description || '',
    currency: feetype?.currency || '',
    name: feetype?.name || '',
    period: feetype?.period || '',
    status: feetype?.status || 'active'
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
            <h3 className="text-lg font-medium text-gray-900">Actualizar Tipo de cuota</h3>
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
              <option value="">Seleccionar</option>
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
                    : 'Seleccionar'
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
              Monto *
            </label>
            <input
              type="text"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-left"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda *
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ARS">ARS</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows="3"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo *
            </label>
            <select
              name="period"
              value={formData.period}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="monthly">Mensual</option>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="quarterly">Quincenal</option>
              <option value="yearly">Anual</option>
            </select>
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
                <span>Actualizar Tipo de cuota</span>
                )}
            </button>
        </div>
    </div>
</div>// JSX similar al CreateFeeTypeModal
  );
};

export default ClubFeeTypesManagement;