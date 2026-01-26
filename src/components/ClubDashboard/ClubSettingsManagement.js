import React, { useState, useEffect } from 'react';
import { clubSettingService } from '../../services/api';
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
import ResponsiveModal from './ResponsiveModal';
import ResponsiveDataTable from './ResponsiveDataTable';

const ClubSettingsManagement = ({ openModal, closeModal }) => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingSetting, setEditingSetting] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState(null);

  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      setError('');
    
      // Cargar configuraciones del mismo club
      const settingsData = await clubSettingService.getSettingsByClubId(currentUser.club_id);
      setSettings(settingsData);
    
    } catch (err) {
      setError('Error al cargar las configuraciones: ' + err.message);
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (settingData) => {
    try {
      setError('');
      
      const settingDataWithClub = {
        ...settingData,
        club_id: currentUser.club_id
      };
      
      await clubSettingService.createSetting(settingDataWithClub);
      setSuccessMessage('Configuración creada exitosamente');
      setIsCreateModalOpen(false);
      loadSettings();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear configuración');
    }
  };

  const handleEdit = (setting) => {
    setEditingSetting(setting);
    setIsEditModalOpen(true);
  };

  const handleView = (setting) => {
    setSelectedSetting(setting);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (settingData) => {
    try {
      setError('');
      
      const settingDataWithClub = {
        ...settingData,
        club_id: currentUser.club_id
      };
      
      await clubSettingService.updateSetting(editingSetting.id, settingDataWithClub);
      setIsEditModalOpen(false);
      setEditingSetting(null);
      setSuccessMessage('Configuración actualizada exitosamente');
      loadSettings();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la configuración: ' + err.message);
      console.error('Error updating setting:', err);
    }
  };

  const handleDelete = async (settingId) => {
    const settingToDelete = settings.find(d => d.id === settingId);
    
    // Usar el modal responsive para confirmación
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar esta configuración?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará permanentemente: <strong>{settingToDelete?.name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Este paso no tiene vuelta atrás.
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
                await clubSettingService.deleteSetting(settingId);
                setSuccessMessage('Configuración eliminada exitosamente');
                closeModal();
                loadSettings();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar la configuración: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Configuración
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
          <p className="text-lg text-gray-600">Cargando configuraciones del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Configuraciones</h2>
          <p className="text-gray-600 mt-1">Gestiona las diferentes billeteras virtuales</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{settings.length}</span> configuraciones
          </div>
          
          <button
            onClick={loadSettings}
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
      {settings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Configuraciones</p>
                <p className="text-2xl font-bold text-gray-800">{settings.length}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {settings.filter(d => d.status === 'active').length}
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
                  {settings.filter(d => d.status === 'inactive').length}
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
                  {[...new Set(settings.map(d => d.color))].length}
                </p>
              </div>
              <Palette className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {settings.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay configuraciones registradas</h3>
          <p className="text-gray-600 mb-6">Crea configuraciones para organizar las actividades de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primera Configuración</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={settings}
          columns={[
            { 
              key: 'notes', 
              label: 'Clave',
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
                    {item.environment && (
                      <div className="text-xs text-gray-500 truncate max-w-xs">
                        {item.environment}
                      </div>
                    )}
                  </div>
                </div>
              )
            },
            { 
              key: 'environment', 
              label: 'Ambiente',
              render: (value) => (
                <div className="max-w-xs truncate">
                  {value || 'Sin ambiente'}
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

      {/* Modal para crear configuración */}
      <CreateSettingModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Modal para editar configuración */}
      {editingSetting && (
        <EditSettingModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingSetting(null);
          }}
          setting={editingSetting}
          onSave={handleUpdate}
        />
      )}

      {/* Modal para ver detalles de la configuración */}
      {selectedSetting && (
        <ViewSettingModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedSetting(null);
          }}
          setting={selectedSetting}
        />
      )}
    </div>
  );
};

// Modal para crear configuración
const CreateSettingModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    notes: '',
    access_token: '',
    public_key: '',
    environment: '',
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
    if (!formData.notes) {
      setError('El nombre de la configuración es obligatorio');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
          notes: '',
          access_token: '',
          public_key: '',
          environment: '',
          color: '#10B981', // Color por defecto verde
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
      title="Crear Nueva Configuración"
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
            Nombre de la Configuración *
          </label>
          <input
            type="text"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Ej: MERCADO_PAGO, PIX, otros..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <input
            name="access_token"
            value={formData.access_token}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Pega aquí el ACCESS TOKEN provisto por tu billetera virtual."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public Key
          </label>
          <input
            name="public_key"
            value={formData.public_key}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Pega aquí el PUBLIC KEY provisto por tu billetera virtual."
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambiente
            </label>
            <select
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">sandbox</option>
              <option value="paid">production</option>
            </select>
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
                <strong>Consejo:</strong> Asegúrate de completar la información correcta para poder recibir pagos.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Cada configuración puede tener múltiples ambientes.
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
                <span>Crear Configuración</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar configuración
const EditSettingModal = ({ isOpen, onClose, setting, onSave }) => {
  const [formData, setFormData] = useState({
    notes: setting?.notes || '',
    access_token: setting?.access_token || '',
    public_key: setting?.public_key || '',
    environment: setting?.environment || '',
    color: setting?.color || '#10B981',
    status: setting?.status || 'active'
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
    if (!formData.notes) {
      setError('El nombre de la configuración es obligatorio');
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
      title={`Editar Configuración: ${setting?.notes}`}
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
            Nombre de la Configuración *
          </label>
          <input
            type="text"
            name="name"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Access Token
          </label>
          <textarea
            name="access_token"
            value={formData.access_token}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Public Key
          </label>
          <textarea
            name="public_key"
            value={formData.public_key}
            onChange={handleChange}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ambiente
            </label>
            <select
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">sandbox</option>
              <option value="paid">production</option>
            </select>
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
                <span>Actualizar Configuración</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de la configuración
const ViewSettingModal = ({ isOpen, onClose, setting }) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Configuración"
      size="md"
    >
      <div className="space-y-6">
        {/* Header con color */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: setting?.color || '#10B981' }}
          >
            {setting?.notes?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{setting?.notes}</h3>
            {setting?.environment && (
              <p className="text-gray-600 mt-1">{setting.environment}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            setting?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {setting?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>Access Token</span>
            </h4>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-lg text-center flex-1 bg-gray-100 text-gray-800 border border-gray-200'}`}>
                <p className="text-sm font-medium">{setting?.access_token}</p>
              </div>
            </div>
          
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <span>Public Key</span>
            </h4>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-lg text-center flex-1 bg-gray-100 text-gray-800 border border-gray-200'}`}>
                <p className="text-sm font-medium">
                  {setting?.public_key}
                </p>
              </div>
            </div>
          </div>


          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
            </h4>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-lg text-center flex-1 ${
                setting?.status === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm font-medium">
                  {setting?.status === 'active' ? 'Disponible para transacciones' : 'No disponible temporalmente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        {setting?.created_at && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Creada:</span> {new Date(setting.created_at).toLocaleDateString('es-ES')}
              </p>
              {setting?.updated_at && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Actualizada:</span> {new Date(setting.updated_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
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

export default ClubSettingsManagement;