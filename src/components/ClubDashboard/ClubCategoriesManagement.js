import React, { useState, useEffect } from 'react';
import { clubCategoryService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Tag,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Users,
  Award,
  Calendar,
  Hash,
  AlertCircle,
  BarChart3,
  Tag as TagIcon
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubCategoriesManagement = ({ openModal, closeModal }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingCategory, setEditingCategory] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [disciplines, setDisciplines] = useState([]);

  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
    
      // Cargar disciplinas
      const disciplineData = await clubCategoryService.getDisciplinesByClubId(currentUser.club_id);
      const activeDisciplines = disciplineData.filter(discipline => discipline.status === 'active');
      setDisciplines(activeDisciplines);

      // Cargar categorías del mismo club
      const categoriesData = await clubCategoryService.getCategoriesByClubId(currentUser.club_id);
      setCategories(categoriesData);

    } catch (err) {
      setError('Error al cargar las categorías: ' + err.message);
      console.error('Error loading categories:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (categoryData) => {
    try {
      setError('');
      
      const categoryDataWithClub = {
        ...categoryData,
        club_id: currentUser.club_id
      };
      
      await clubCategoryService.createCategory(categoryDataWithClub);
      setSuccessMessage('Categoría creada exitosamente');
      setIsCreateModalOpen(false);
      loadCategories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear categoría');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsEditModalOpen(true);
  };

  const handleView = (category) => {
    setSelectedCategory(category);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (categoryData) => {
    try {
      setError('');
      
      const categoryDataWithClub = {
        ...categoryData,
        club_id: currentUser.club_id
      };
      
      await clubCategoryService.updateCategory(editingCategory.id, categoryDataWithClub);
      setIsEditModalOpen(false);
      setEditingCategory(null);
      setSuccessMessage('Categoría actualizada exitosamente');
      loadCategories();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la categoría: ' + err.message);
      console.error('Error updating category:', err);
    }
  };

  const handleDelete = async (categoryId) => {
    const categoryToDelete = categories.find(c => c.id === categoryId);
    
    // Usar el modal responsive para confirmación
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar esta categoría?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará permanentemente: <strong>{categoryToDelete?.name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Los socios asociados a esta categoría quedarán sin categoría asignada
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
                await clubCategoryService.deleteCategory(categoryId);
                setSuccessMessage('Categoría eliminada exitosamente');
                closeModal();
                loadCategories();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar la categoría: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Categoría
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
          <p className="text-lg text-gray-600">Cargando categorías del club...</p>
        </div>
      </div>
    );
  }

  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level) => {
    switch(level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return level;
    }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Categorías</h2>
          <p className="text-gray-600 mt-1">Organiza las categorías por disciplina y nivel</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{categories.length}</span> categorías
          </div>
          
          <button
            onClick={loadCategories}
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

      {/* Resumen rápido */}
      {categories.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Categorías</p>
                <p className="text-2xl font-bold text-gray-800">{categories.length}</p>
              </div>
              <Tag className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Disciplinas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {[...new Set(categories.map(c => c.discipline_name))].length}
                </p>
              </div>
              <Award className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Niveles</p>
                <p className="text-2xl font-bold text-gray-800">
                  {[...new Set(categories.map(c => c.level))].length}
                </p>
              </div>
              <BarChart3 className="text-purple-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="text-2xl font-bold text-gray-800">
                  {categories.filter(c => c.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {categories.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TagIcon size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay categorías registradas</h3>
          <p className="text-gray-600 mb-6">Crea categorías para organizar a tus socios por disciplina y nivel</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primera Categoría</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={categories}
          columns={[
            { 
              key: 'name', 
              label: 'Categoría',
              render: (value, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {value?.charAt(0).toUpperCase() || 'C'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500">{item.description}</div>
                    )}
                  </div>
                </div>
              )
            },
            { 
              key: 'discipline_name', 
              label: 'Disciplina',
              render: (value) => (
                <span className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                  {value || 'Sin disciplina'}
                </span>
              )
            },
            { 
              key: 'age_range', 
              label: 'Rango de Edad',
              render: (_, item) => (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-sm">
                    {item.min_age || '?'} - {item.max_age || '?'} años
                  </span>
                </div>
              )
            },
            { 
              key: 'level', 
              label: 'Nivel',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(value)}`}>
                  {getLevelText(value)}
                </span>
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

      {/* Modal para crear categoría */}
      <CreateCategoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        disciplines={disciplines}
      />

      {/* Modal para editar categoría */}
      {editingCategory && (
        <EditCategoryModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingCategory(null);
          }}
          category={editingCategory}
          onSave={handleUpdate}
          disciplines={disciplines}
        />
      )}

      {/* Modal para ver detalles de la categoría */}
      {selectedCategory && (
        <ViewCategoryModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedCategory(null);
          }}
          category={selectedCategory}
        />
      )}
    </div>
  );
};

// Modal para crear categoría
const CreateCategoryModal = ({ isOpen, onClose, onSave, disciplines }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    discipline_id: '',
    min_age: '',
    max_age: '',
    level: 'beginner',
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación
    if (!formData.name || !formData.discipline_id) {
      setError('Los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        discipline_id: '',
        min_age: '',
        max_age: '',
        level: 'beginner',
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Categoría"
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
            Nombre de la Categoría *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Ej: Infantil, Juvenil, Adultos"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Descripción de la categoría"
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad Mínima
            </label>
            <div className="relative">
              <input
                type="number"
                name="min_age"
                value={formData.min_age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="100"
                placeholder="0"
              />
              <span className="absolute right-3 top-2 text-gray-500">años</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad Máxima
            </label>
            <div className="relative">
              <input
                type="number"
                name="max_age"
                value={formData.max_age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="100"
                placeholder="100"
              />
              <span className="absolute right-3 top-2 text-gray-500">años</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="expert">Experto</option>
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="active">Activo</option>
              <option value="inactive">Inactivo</option>
            </select>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Award size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Consejo:</strong> Las categorías ayudan a organizar a los socios por edades y niveles.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Puedes crear categorías específicas para cada disciplina del club.
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
                <span>Crear Categoría</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar categoría
const EditCategoryModal = ({ isOpen, onClose, category, onSave, disciplines }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    discipline_id: category?.discipline_id || '',
    min_age: category?.min_age || '',
    max_age: category?.max_age || '',
    level: category?.level || 'beginner',
    status: category?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación
    if (!formData.name || !formData.discipline_id) {
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
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Categoría: ${category?.name}`}
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
            Nombre de la Categoría *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descripción
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad Mínima
            </label>
            <div className="relative">
              <input
                type="number"
                name="min_age"
                value={formData.min_age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-2 text-gray-500">años</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Edad Máxima
            </label>
            <div className="relative">
              <input
                type="number"
                name="max_age"
                value={formData.max_age}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                min="0"
                max="100"
              />
              <span className="absolute right-3 top-2 text-gray-500">años</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nivel
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="beginner">Principiante</option>
              <option value="intermediate">Intermedio</option>
              <option value="advanced">Avanzado</option>
              <option value="expert">Experto</option>
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
                <span>Actualizar Categoría</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de la categoría
const ViewCategoryModal = ({ isOpen, onClose, category }) => {
  const getLevelColor = (level) => {
    switch(level) {
      case 'beginner': return 'bg-blue-100 text-blue-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-orange-100 text-orange-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLevelText = (level) => {
    switch(level) {
      case 'beginner': return 'Principiante';
      case 'intermediate': return 'Intermedio';
      case 'advanced': return 'Avanzado';
      case 'expert': return 'Experto';
      default: return level;
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Categoría"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {category?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{category?.name}</h3>
            {category?.description && (
              <p className="text-gray-600 mt-1">{category.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            category?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {category?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Award size={16} />
              <span>Disciplina</span>
            </h4>
            <p className="text-gray-900 font-medium">{category?.discipline_name}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <BarChart3 size={16} />
              <span>Nivel</span>
            </h4>
            <span className={`px-2 py-1 rounded-full text-sm font-medium ${getLevelColor(category?.level)}`}>
              {getLevelText(category?.level)}
            </span>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Calendar size={16} />
              <span>Rango de Edad</span>
            </h4>
            <p className="text-gray-900 font-medium">
              {category?.min_age || '?'} - {category?.max_age || '?'} años
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Hash size={16} />
              <span>ID</span>
            </h4>
            <p className="text-gray-900 font-medium">#{category?.id}</p>
          </div>
        </div>

        {/* Información adicional */}
        {category?.created_at && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Información del Sistema</h4>
            <p className="text-sm text-blue-800">
              Categoría creada el {new Date(category.created_at).toLocaleDateString('es-ES')}
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

export default ClubCategoriesManagement;