import React, { useState, useEffect } from 'react';
import { clubDisciplineService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Target,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  Palette,
  CheckCircle,
  XCircle,
  Hash,
  AlertCircle,
  BarChart3,
  Users,
  Trophy,
  Sparkles
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubDisciplinesManagement = ({ openModal, closeModal }) => {
  const [disciplines, setDisciplines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingDiscipline, setEditingDiscipline] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedDiscipline, setSelectedDiscipline] = useState(null);

  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadDisciplines();
  }, []);

  const loadDisciplines = async () => {
    try {
      setLoading(true);
      setError('');
    
      // Cargar disciplinas del mismo club
      const disciplinesData = await clubDisciplineService.getDisciplinesByClubId(currentUser.club_id);
      setDisciplines(disciplinesData);
    
    } catch (err) {
      setError('Error al cargar las disciplinas: ' + err.message);
      console.error('Error loading disciplines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (disciplineData) => {
    try {
      setError('');
      
      const disciplineDataWithClub = {
        ...disciplineData,
        club_id: currentUser.club_id
      };
      
      await clubDisciplineService.createDiscipline(disciplineDataWithClub);
      setSuccessMessage('Disciplina creada exitosamente');
      setIsCreateModalOpen(false);
      loadDisciplines();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear disciplina');
    }
  };

  const handleEdit = (discipline) => {
    setEditingDiscipline(discipline);
    setIsEditModalOpen(true);
  };

  const handleView = (discipline) => {
    setSelectedDiscipline(discipline);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (disciplineData) => {
    try {
      setError('');
      
      const disciplineDataWithClub = {
        ...disciplineData,
        club_id: currentUser.club_id
      };
      
      await clubDisciplineService.updateDiscipline(editingDiscipline.id, disciplineDataWithClub);
      setIsEditModalOpen(false);
      setEditingDiscipline(null);
      setSuccessMessage('Disciplina actualizada exitosamente');
      loadDisciplines();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la disciplina: ' + err.message);
      console.error('Error updating discipline:', err);
    }
  };

  const handleDelete = async (disciplineId) => {
    const disciplineToDelete = disciplines.find(d => d.id === disciplineId);
    
    // Usar el modal responsive para confirmación
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar esta disciplina?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará permanentemente: <strong>{disciplineToDelete?.name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Todas las categorías asociadas a esta disciplina quedarán sin disciplina asignada
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
                await clubDisciplineService.deleteDiscipline(disciplineId);
                setSuccessMessage('Disciplina eliminada exitosamente');
                closeModal();
                loadDisciplines();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar la disciplina: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Disciplina
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
          <p className="text-lg text-gray-600">Cargando disciplinas del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Disciplinas</h2>
          <p className="text-gray-600 mt-1">Gestiona las diferentes actividades y deportes</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{disciplines.length}</span> disciplinas
          </div>
          
          <button
            onClick={loadDisciplines}
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
      {disciplines.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Disciplinas</p>
                <p className="text-2xl font-bold text-gray-800">{disciplines.length}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {disciplines.filter(d => d.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Inactivas</p>
                <p className="text-2xl font-bold text-red-600">
                  {disciplines.filter(d => d.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="text-red-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Colores únicos</p>
                <p className="text-2xl font-bold text-purple-600">
                  {[...new Set(disciplines.map(d => d.color))].length}
                </p>
              </div>
              <Palette className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {disciplines.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay disciplinas registradas</h3>
          <p className="text-gray-600 mb-6">Crea disciplinas para organizar las actividades de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primera Disciplina</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={disciplines}
          columns={[
            { 
              key: 'name', 
              label: 'Disciplina',
              render: (value, item) => (
                <div className="flex items-center">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-3"
                    style={{ backgroundColor: item.color || '#10B981' }}
                  >
                    {value?.charAt(0).toUpperCase() || 'D'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{value}</div>
                    {item.description && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {item.description}
                      </div>
                    )}
                  </div>
                </div>
              )
            },
            { 
              key: 'description', 
              label: 'Descripción',
              render: (value) => (
                <div className="max-w-xs truncate">
                  {value || 'Sin descripción'}
                </div>
              )
            },
            { 
              key: 'color', 
              label: 'Color',
              render: (value) => (
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-gray-300"
                    style={{ backgroundColor: value }}
                  />
                  <span className="text-sm font-mono">{value}</span>
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

      {/* Modal para crear disciplina */}
      <CreateDisciplineModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Modal para editar disciplina */}
      {editingDiscipline && (
        <EditDisciplineModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingDiscipline(null);
          }}
          discipline={editingDiscipline}
          onSave={handleUpdate}
        />
      )}

      {/* Modal para ver detalles de la disciplina */}
      {selectedDiscipline && (
        <ViewDisciplineModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedDiscipline(null);
          }}
          discipline={selectedDiscipline}
        />
      )}
    </div>
  );
};

// Modal para crear disciplina
const CreateDisciplineModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: '#10B981', // Color por defecto verde
    status: 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorOptions = [
    { value: '#10B981', label: 'Verde', name: 'Esmeralda' },
    { value: '#3B82F6', label: 'Azul', name: 'Azul' },
    { value: '#8B5CF6', label: 'Púrpura', name: 'Violeta' },
    { value: '#EF4444', label: 'Rojo', name: 'Rojo' },
    { value: '#F59E0B', label: 'Ámbar', name: 'Ámbar' },
    { value: '#EC4899', label: 'Rosa', name: 'Rosa' },
    { value: '#6366F1', label: 'Índigo', name: 'Índigo' },
    { value: '#14B8A6', label: 'Turquesa', name: 'Turquesa' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación
    if (!formData.name) {
      setError('El nombre de la disciplina es obligatorio');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        name: '',
        description: '',
        color: '#10B981',
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

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Disciplina"
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
            Nombre de la Disciplina *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Ej: Fútbol, Natación, Tenis"
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
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Describe la disciplina, objetivos, características..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color de Identificación
          </label>
          <div className="space-y-4">
            {/* Selector de color personalizado */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: formData.color }}
              />
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-10 cursor-pointer"
              />
              <span className="text-sm font-mono">{formData.color}</span>
            </div>

            {/* Paleta de colores predefinidos */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Colores sugeridos:</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    className={`relative p-1 rounded-lg transition-all ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  >
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Sparkles size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Consejo:</strong> Los colores ayudan a identificar rápidamente cada disciplina en horarios y categorías.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Cada disciplina puede tener múltiples categorías por edad y nivel.
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
                <span>Crear Disciplina</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar disciplina
const EditDisciplineModal = ({ isOpen, onClose, discipline, onSave }) => {
  const [formData, setFormData] = useState({
    name: discipline?.name || '',
    description: discipline?.description || '',
    color: discipline?.color || '#10B981',
    status: discipline?.status || 'active'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const colorOptions = [
    { value: '#10B981', label: 'Verde', name: 'Esmeralda' },
    { value: '#3B82F6', label: 'Azul', name: 'Azul' },
    { value: '#8B5CF6', label: 'Púrpura', name: 'Violeta' },
    { value: '#EF4444', label: 'Rojo', name: 'Rojo' },
    { value: '#F59E0B', label: 'Ámbar', name: 'Ámbar' },
    { value: '#EC4899', label: 'Rosa', name: 'Rosa' },
    { value: '#6366F1', label: 'Índigo', name: 'Índigo' },
    { value: '#14B8A6', label: 'Turquesa', name: 'Turquesa' }
  ];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación
    if (!formData.name) {
      setError('El nombre de la disciplina es obligatorio');
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

  const handleColorChange = (color) => {
    setFormData(prev => ({
      ...prev,
      color
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Disciplina: ${discipline?.name}`}
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
            Nombre de la Disciplina *
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
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Color de Identificación
          </label>
          <div className="space-y-4">
            {/* Selector de color personalizado */}
            <div className="flex items-center space-x-4">
              <div 
                className="w-10 h-10 rounded-lg border-2 border-gray-300"
                style={{ backgroundColor: formData.color }}
              />
              <input
                type="color"
                name="color"
                value={formData.color}
                onChange={handleChange}
                className="w-16 h-10 cursor-pointer"
              />
              <span className="text-sm font-mono">{formData.color}</span>
            </div>

            {/* Paleta de colores predefinidos */}
            <div>
              <p className="text-sm text-gray-600 mb-2">Colores sugeridos:</p>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {colorOptions.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => handleColorChange(color.value)}
                    className={`relative p-1 rounded-lg transition-all ${
                      formData.color === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                    }`}
                    title={color.name}
                  >
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: color.value }}
                    />
                    <span className="sr-only">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <span>Actualizar Disciplina</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de la disciplina
const ViewDisciplineModal = ({ isOpen, onClose, discipline }) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Disciplina"
      size="md"
    >
      <div className="space-y-6">
        {/* Header con color */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: discipline?.color || '#10B981' }}
          >
            {discipline?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{discipline?.name}</h3>
            {discipline?.description && (
              <p className="text-gray-600 mt-1">{discipline.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            discipline?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {discipline?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Palette size={16} />
              <span>Color de Identificación</span>
            </h4>
            <div className="flex items-center space-x-3">
              <div 
                className="w-8 h-8 rounded"
                style={{ backgroundColor: discipline?.color }}
              />
              <div>
                <p className="text-gray-900 font-medium">{discipline?.color}</p>
                <p className="text-xs text-gray-500">Código hexadecimal</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Hash size={16} />
              <span>ID</span>
            </h4>
            <p className="text-gray-900 font-medium">#{discipline?.id}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Target size={16} />
              <span>Disponibilidad</span>
            </h4>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-lg text-center flex-1 ${
                discipline?.status === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm font-medium">
                  {discipline?.status === 'active' ? 'Disponible para inscripciones' : 'No disponible temporalmente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        {discipline?.created_at && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Creada:</span> {new Date(discipline.created_at).toLocaleDateString('es-ES')}
              </p>
              {discipline?.updated_at && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Actualizada:</span> {new Date(discipline.updated_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-700 mb-2">Uso de la Disciplina</h4>
          <p className="text-sm text-green-800">
            Esta disciplina puede ser asignada a categorías, horarios de clase y socios.
            Los colores ayudan a identificar rápidamente cada actividad en el calendario.
          </p>
        </div>

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

export default ClubDisciplinesManagement;