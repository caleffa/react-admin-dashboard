import React, { useState, useEffect } from 'react';
import { clubFeeTypeService, clubCategoryService, clubDisciplineService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  CreditCard,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Search,
  DollarSign,
  Calendar,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Clock,
  Tag,
  Target,
  TrendingUp,
  Percent,
  Repeat,
  Layers
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubFeeTypesManagement = ({ openModal, closeModal }) => {
  const [feetypes, setFeeTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingFeeType, setEditingFeeType] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFeeType, setSelectedFeeType] = useState(null);
  
  // Estados para las dependencias
  const [disciplines, setDisciplines] = useState([]);
  const [categories, setCategories] = useState([]);

  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadFeeTypes();
  }, []);

  const loadFeeTypes = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar categorías del club
      const categoryData = await clubCategoryService.getCategoriesByClubId(currentUser.club_id);
      const activeCategories = categoryData.filter(category => category.status === 'active');
      setCategories(activeCategories);
      
      // Cargar disciplinas del club
      const disciplineData = await clubDisciplineService.getDisciplinesByClubId(currentUser.club_id);
      const activeDisciplines = disciplineData.filter(discipline => discipline.status === 'active');
      setDisciplines(activeDisciplines);

      // Cargar tipo de cuotas del mismo club
      const feetypesData = await clubFeeTypeService.getFeeTypesByClubId(currentUser.club_id);
      setFeeTypes(feetypesData);

    } catch (err) {
      setError('Error al cargar los tipos de cuota: ' + err.message);
      console.error('Error loading feetypes:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (feetypeData) => {
    try {
      setError('');
      
      const feetypeDataWithClub = {
        ...feetypeData,
        club_id: currentUser.club_id
      };
      
      await clubFeeTypeService.createFeeType(feetypeDataWithClub);
      setSuccessMessage('Tipo de cuota creado exitosamente');
      setIsCreateModalOpen(false);
      loadFeeTypes();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear tipo de cuota');
    }
  };

  const handleEdit = (feetype) => {
    setEditingFeeType(feetype);
    setIsEditModalOpen(true);
  };

  const handleView = (feetype) => {
    setSelectedFeeType(feetype);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (feetypeData) => {
    try {
      setError('');
      
      const feetypeDataWithClub = {
        ...feetypeData,
        club_id: currentUser.club_id
      };
      
      await clubFeeTypeService.updateFeeType(editingFeeType.id, feetypeDataWithClub);
      setIsEditModalOpen(false);
      setEditingFeeType(null);
      setSuccessMessage('Tipo de cuota actualizado exitosamente');
      loadFeeTypes();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el tipo de cuota: ' + err.message);
      console.error('Error updating feetype:', err);
    }
  };

  const handleDelete = async (feetypeId) => {
    const feeTypeToDelete = feetypes.find(f => f.id === feetypeId);
    
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar este tipo de cuota?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará: <strong>{feeTypeToDelete?.name}</strong> - <strong>${feeTypeToDelete?.amount} {feeTypeToDelete?.currency}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Esta acción no se puede deshacer. Las cuotas existentes de este tipo no serán afectadas.
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
                await clubFeeTypeService.deleteFeeType(feetypeId);
                setSuccessMessage('Tipo de cuota eliminado exitosamente');
                closeModal();
                loadFeeTypes();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar el tipo de cuota: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Tipo de Cuota
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
          <p className="text-lg text-gray-600">Cargando tipos de cuota del club...</p>
        </div>
      </div>
    );
  }

  // Función para calcular estadísticas
  const calculateStats = () => {
    const activeFeeTypes = feetypes.filter(ft => ft.status === 'active');
    const totalAmount = activeFeeTypes.reduce((sum, ft) => sum + parseFloat(ft.amount || 0), 0);
    const monthlyFeeTypes = feetypes.filter(ft => ft.period === 'monthly').length;
    const uniqueCurrencies = [...new Set(feetypes.map(ft => ft.currency))];
    
    return {
      total: feetypes.length,
      active: activeFeeTypes.length,
      totalAmount,
      monthly: monthlyFeeTypes,
      currencies: uniqueCurrencies.length
    };
  };

  const stats = calculateStats();

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tipos de Cuota</h2>
          <p className="text-gray-600 mt-1">Gestiona los diferentes tipos de cuotas del club</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{stats.total}</span> tipos
          </div>
          
          <button
            onClick={loadFeeTypes}
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
      {feetypes.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Tipos</p>
                <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
              </div>
              <CreditCard className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${stats.totalAmount.toLocaleString('es-AR')}
                </p>
              </div>
              <DollarSign className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Mensuales</p>
                <p className="text-2xl font-bold text-purple-600">{stats.monthly}</p>
              </div>
              <Repeat className="text-purple-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Monedas</p>
                <p className="text-2xl font-bold text-orange-600">{stats.currencies}</p>
              </div>
              <Tag className="text-orange-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {feetypes.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay tipos de cuota registrados</h3>
          <p className="text-gray-600 mb-6">Crea tipos de cuota para organizar los pagos de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primer Tipo de Cuota</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={feetypes}
          columns={[
            { 
              key: 'name', 
              label: 'Tipo de Cuota',
              render: (value, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {value?.charAt(0).toUpperCase() || 'C'}
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
              key: 'discipline_category', 
              label: 'Disciplina / Categoría',
              render: (_, item) => (
                <div>
                  <div className="font-medium text-gray-900">{item.discipline_name}</div>
                  <div className="text-xs text-gray-500">{item.category_name}</div>
                </div>
              )
            },
            { 
              key: 'amount', 
              label: 'Monto',
              render: (value, item) => (
                <div className="font-medium text-gray-900">
                  ${parseFloat(value || 0).toLocaleString('es-AR')} {item.currency}
                </div>
              )
            },
            { 
              key: 'period', 
              label: 'Periodo',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === 'monthly' ? 'bg-blue-100 text-blue-800' :
                  value === 'weekly' ? 'bg-green-100 text-green-800' :
                  value === 'yearly' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {value === 'monthly' ? 'Mensual' :
                   value === 'weekly' ? 'Semanal' :
                   value === 'yearly' ? 'Anual' :
                   value === 'quarterly' ? 'Quincenal' : 'Diario'}
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

      {/* Modal para crear tipo de cuota */}
      <CreateFeeTypeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        disciplines={disciplines}
        categories={categories}
      />

      {/* Modal para editar tipo de cuota */}
      {editingFeeType && (
        <EditFeeTypeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFeeType(null);
          }}
          feetype={editingFeeType}
          onSave={handleUpdate}
          disciplines={disciplines}
          categories={categories}
        />
      )}

      {/* Modal para ver detalles del tipo de cuota */}
      {selectedFeeType && (
        <ViewFeeTypeModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedFeeType(null);
          }}
          feetype={selectedFeeType}
        />
      )}
    </div>
  );
};

// Modal para crear tipo de cuota
const CreateFeeTypeModal = ({ isOpen, onClose, onSave, disciplines, categories }) => {
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
  const filteredCategories = disciplines.find(d => d.id === parseInt(formData.discipline_id))
    ? categories.filter(c => c.discipline_id === parseInt(formData.discipline_id))
    : [];

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.name || !formData.discipline_id || !formData.category_id || !formData.amount || !formData.period) {
      setError('Los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
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

  const periodOptions = [
    { value: 'monthly', label: 'Mensual', icon: '📅' },
    { value: 'weekly', label: 'Semanal', icon: '📆' },
    { value: 'quarterly', label: 'Quincenal', icon: '⏰' },
    { value: 'yearly', label: 'Anual', icon: '📊' },
    { value: 'daily', label: 'Diario', icon: '📅' }
  ];

  const appliesToOptions = [
    { value: 'all', label: 'Todos los socios' },
    { value: 'discipline', label: 'Por disciplina' },
    { value: 'category', label: 'Por categoría' }
  ];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nuevo Tipo de Cuota"
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
            Nombre del Tipo de Cuota *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
            placeholder="Ej: Cuota Mensual Fútbol, Matrícula Natación"
          />
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
              Monto *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ARS">ARS (Pesos Argentinos)</option>
              <option value="USD">USD (Dólares Americanos)</option>
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
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Describe este tipo de cuota, qué incluye, beneficios..."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo de Cobro *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {periodOptions.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, period: period.value }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.period === period.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mb-1">{period.icon}</span>
                  <span className="text-xs font-medium">{period.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aplica a
            </label>
            <select
              name="applies_to"
              value={formData.applies_to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {appliesToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              <option value="active">Activo (disponible para uso)</option>
              <option value="inactive">Inactivo (no disponible)</option>
            </select>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CreditCard size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Importante:</strong> Los tipos de cuota definen los montos y periodicidad de los pagos de los socios.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Una vez creado, este tipo de cuota podrá ser asignado a los socios.
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
                <span>Crear Tipo de Cuota</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar tipo de cuota
const EditFeeTypeModal = ({ isOpen, onClose, feetype, onSave, disciplines, categories }) => {
  const [formData, setFormData] = useState({
    name: feetype?.name || '',
    discipline_id: feetype?.discipline_id || '',
    category_id: feetype?.category_id || '',
    description: feetype?.description || '',
    period: feetype?.period || 'monthly',
    amount: feetype?.amount || '',
    currency: feetype?.currency || 'ARS',
    applies_to: feetype?.applies_to || 'all',
    status: feetype?.status || 'active'
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

    if (!formData.name || !formData.discipline_id || !formData.category_id || !formData.amount || !formData.period) {
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

  const periodOptions = [
    { value: 'monthly', label: 'Mensual', icon: '📅' },
    { value: 'weekly', label: 'Semanal', icon: '📆' },
    { value: 'quarterly', label: 'Quincenal', icon: '⏰' },
    { value: 'yearly', label: 'Anual', icon: '📊' },
    { value: 'daily', label: 'Diario', icon: '📅' }
  ];

  const appliesToOptions = [
    { value: 'all', label: 'Todos los socios' },
    { value: 'discipline', label: 'Por disciplina' },
    { value: 'category', label: 'Por categoría' }
  ];

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Tipo de Cuota: ${feetype?.name}`}
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
            Nombre del Tipo de Cuota *
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
              Monto *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                $
              </span>
              <input
                type="number"
                step="0.01"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moneda
            </label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ARS">ARS (Pesos Argentinos)</option>
              <option value="USD">USD (Dólares Americanos)</option>
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
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Periodo de Cobro *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {periodOptions.map((period) => (
                <button
                  key={period.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, period: period.value }))}
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border transition-all ${
                    formData.period === period.value
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-lg mb-1">{period.icon}</span>
                  <span className="text-xs font-medium">{period.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aplica a
            </label>
            <select
              name="applies_to"
              value={formData.applies_to}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              {appliesToOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
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
              <option value="active">Activo (disponible para uso)</option>
              <option value="inactive">Inactivo (no disponible)</option>
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
                <span>Actualizar Tipo de Cuota</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles del tipo de cuota
const ViewFeeTypeModal = ({ isOpen, onClose, feetype }) => {
  const getPeriodText = (period) => {
    switch (period) {
      case 'monthly': return 'Mensual';
      case 'weekly': return 'Semanal';
      case 'quarterly': return 'Quincenal';
      case 'yearly': return 'Anual';
      case 'daily': return 'Diario';
      default: return 'No especificado';
    }
  };

  const getAppliesToText = (appliesTo) => {
    switch (appliesTo) {
      case 'all': return 'Todos los socios';
      case 'discipline': return 'Por disciplina';
      case 'category': return 'Por categoría';
      default: return 'No especificado';
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Tipo de Cuota"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {feetype?.name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{feetype?.name}</h3>
            {feetype?.description && (
              <p className="text-gray-600 mt-1">{feetype.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            feetype?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {feetype?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Información de Pago</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Monto:</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(feetype?.amount || 0).toLocaleString('es-AR')} {feetype?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Periodo:</span>
                <span className="font-medium">{getPeriodText(feetype?.period)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Aplica a:</span>
                <span className="font-medium">{getAppliesToText(feetype?.applies_to)}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Target size={16} />
              <span>Asignación</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Disciplina:</span>
                <span className="font-medium">{feetype?.discipline_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Categoría:</span>
                <span className="font-medium">{feetype?.category_name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {feetype?.description && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
              <FileText size={16} />
              <span>Descripción</span>
            </h4>
            <p className="text-blue-700">{feetype.description}</p>
          </div>
        )}

        {/* Información del sistema */}
        {feetype?.created_at && (
          <div className="border-t pt-4">
            <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
              <Clock size={16} />
              <span>Información del Sistema</span>
            </h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-gray-800">#{feetype?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Creado:</span>
                <span className="text-gray-800">
                  {new Date(feetype.created_at).toLocaleDateString('es-ES')}
                </span>
              </div>
              {feetype?.updated_at && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Actualizado:</span>
                  <span className="text-gray-800">
                    {new Date(feetype.updated_at).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-700 mb-2">Uso del Tipo de Cuota</h4>
          <p className="text-sm text-green-800">
            Este tipo de cuota puede ser asignado a los socios del club para generar cuotas periódicas.
            Los cambios en el monto no afectarán las cuotas ya generadas.
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

export default ClubFeeTypesManagement;