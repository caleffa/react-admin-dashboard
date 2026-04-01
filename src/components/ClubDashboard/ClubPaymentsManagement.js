import React, { useState, useEffect } from 'react';
import { clubPaymentService, clubPaymentMethodService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  Target,  Plus,  RefreshCw,  Eye,  Edit,  Trash2,  Search,  Palette,  CheckCircle,  XCircle,  Hash,  AlertCircle,  BarChart3,
  Users,  Trophy,  Sparkles
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubPaymentsManagement = ({ openModal, closeModal }) => {
  const [payments, setPayments] = useState([]);
  const [paymentmethods, setPaymentMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingPayment, setEditingPayment] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadpayments();
  }, []);

  const loadpayments = async () => {
    try {
        setLoading(true);
        setError('');
      
        // Cargar pagos del mismo club
        const paymentsData = await clubPaymentService.getPaymentsByClubId(currentUser.club_id);
        setPayments(paymentsData);
        console.log('Pagos: ' + payments.length);

        // Cargar metodos de pago del mismo club
        const paymentmethodsData = await clubPaymentMethodService.getPaymentMethodsByClubId(currentUser.club_id);
        setPaymentMethods(paymentmethodsData);

    } catch (err) {
        setError('Error al cargar pagos: ' + err.message);
        console.error('Error loading payments:', err);
    } finally {
        setLoading(false);
    }
  };

  const handleCreate = async (paymentData) => {
    try {
      setError('');
      
      const paymentDataWithClub = {
        ...paymentData,
        club_id: currentUser.club_id
      };
      
      await clubPaymentService.createPayment(paymentDataWithClub);
      setSuccessMessage('Pago creado exitosamente');
      setIsCreateModalOpen(false);
      loadpayments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear pago');
    }
  };

  const handleEdit = (payment) => {
    setEditingPayment(payment);
    setIsEditModalOpen(true);
  };

  const handleView = (payment) => {
    setSelectedPayment(payment);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (paymentData) => {
    try {
      setError('');
      
      const paymentDataWithClub = {
        ...paymentData,
        club_id: currentUser.club_id
      };
      
      await clubPaymentService.updatePayment(editingPayment.id, paymentDataWithClub);
      setIsEditModalOpen(false);
      setEditingPayment(null);
      setSuccessMessage('Pago actualizado exitosamente');
      loadpayments();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el pago: ' + err.message);
      console.error('Error updating payment:', err);
    }
  };

  const handleDelete = async (paymentId) => {
    const paymentToDelete = payments.find(d => d.id === paymentId);
    
    // Usar el modal responsive para confirmación
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar este pago?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará permanentemente: <strong>{paymentToDelete?.name}</strong>
            </p>
            <p className="text-xs text-red-500 mt-2">
              Todas las categorías asociadas a este pago quedarán sin pago asignada
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
                await clubPaymentService.deletePayment(paymentId);
                setSuccessMessage('Pago eliminado exitosamente');
                closeModal();
                loadpayments();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar el pago: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Pago
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
          <p className="text-lg text-gray-600">Cargando pagos del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Pagos</h2>
          <p className="text-gray-600 mt-1">Gestiona todos los pagos del club.</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{payments.length}</span> pagos
          </div>
          
          <button
            onClick={loadpayments}
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

      {/* Resumen rápido */}
      {payments.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total pagos</p>
                <p className="text-2xl font-bold text-gray-800">{payments.length}</p>
              </div>
              <Target className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Activas</p>
                <p className="text-2xl font-bold text-green-600">
                  {payments.filter(d => d.status === 'active').length}
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
                  {payments.filter(d => d.status === 'inactive').length}
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
                  {[...new Set(payments.map(d => d.color))].length}
                </p>
              </div>
              <Palette className="text-purple-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {payments.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay pagos registrados</h3>
          <p className="text-gray-600 mb-6">Crea pagos para organizar las actividades de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear primer pago</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={payments}
          columns={[
            { 
              key: 'description', 
              label: 'Pago',
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
              key: 'status', 
              label: 'Descripción',
              render: (value) => (
                <div className="max-w-xs truncate">
                  {value || 'Sin descripción'}
                </div>
              )
            },
            /*{ 
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
            },*/
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

      {/* Modal para crear pago */}
      <CreatePaymentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Modal para editar pago */}
      {editingPayment && (
        <EditPaymentModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingPayment(null);
          }}
          payment={editingPayment}
          onSave={handleUpdate}
        />
      )}

      {/* Modal para ver detalles de pago */}
      {selectedPayment && (
        <ViewPaymentModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
        />
      )}
    </div>
  );
};

// Modal para crear pago
const CreatePaymentModal = ({ isOpen, onClose, onSave }) => {
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
      setError('El nombre de pago es obligatorio');
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
      title="Crear Nuevo pago"
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
            Nombre de pago *
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
            placeholder="Describe el pago, objetivos, características..."
          />
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
                <span>Creando...</span>
              </>
            ) : (
              <>
                <Plus size={18} />
                <span>Crear Pago</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar pago
const EditPaymentModal = ({ isOpen, onClose, payment, onSave }) => {
  const [formData, setFormData] = useState({
    name: payment?.name || '',
    description: payment?.description || '',
    color: payment?.color || '#10B981',
    status: payment?.status || 'active'
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
      setError('El nombre de pago es obligatorio');
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
      title={`Editar Pago: ${payment?.name}`}
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
            Nombre del Pago *
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
                <span>Actualizar pago</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de pago
const ViewPaymentModal = ({ isOpen, onClose, payment }) => {
  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de pago"
      size="md"
    >
      <div className="space-y-6">
        {/* Header con color */}
        <div className="flex items-center space-x-4">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl font-bold"
            style={{ backgroundColor: payment?.color || '#10B981' }}
          >
            {payment?.name?.charAt(0).toUpperCase() || 'D'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{payment?.name}</h3>
            {payment?.description && (
              <p className="text-gray-600 mt-1">{payment.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            payment?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {payment?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <Target size={16} />
              <span>Disponibilidad</span>
            </h4>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-2 rounded-lg text-center flex-1 ${
                payment?.status === 'active' 
                  ? 'bg-green-100 text-green-800 border border-green-200' 
                  : 'bg-red-100 text-red-800 border border-red-200'
              }`}>
                <p className="text-sm font-medium">
                  {payment?.status === 'active' ? 'Disponible para pagos' : 'No disponible temporalmente'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        {payment?.created_at && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2">Información del Sistema</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p className="text-sm text-blue-800">
                <span className="font-medium">Creada:</span> {new Date(payment.created_at).toLocaleDateString('es-ES')}
              </p>
              {payment?.updated_at && (
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Actualizada:</span> {new Date(payment.updated_at).toLocaleDateString('es-ES')}
                </p>
              )}
            </div>
          </div>
        )}

        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-medium text-green-700 mb-2">Uso de pago</h4>
          <p className="text-sm text-green-800">
            Este pago puede ser asignado a pagos realizados por los socios, tales como cuotas, matrículas u otros.
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

export default ClubPaymentsManagement;