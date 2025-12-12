import React, { useState, useEffect } from 'react';
import { clubFeeService, clubMemberService, clubFeeTypeService } from '../../services/api';
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
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  FileText,
  Clock,
  TrendingUp,
  Receipt,
  Shield
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubFeesManagement = ({ openModal, closeModal }) => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingFee, setEditingFee] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState(null);
  
  // Estados para las dependencias
  const [members, setMembers] = useState([]);
  const [feetypes, setFeeTypes] = useState([]);
  
  const { user: currentUser } = useClubAuth();

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      setLoading(true);
      setError('');

      // Cargar miembros del club
      const memberData = await clubMemberService.getMembersByClubId(currentUser.club_id);
      const activeMembers = memberData.filter(member => member.status === 'active');
      setMembers(activeMembers);
      
      // Cargar tipo de cuotas del mismo club
      const feetypesData = await clubFeeTypeService.getFeeTypesByClubId(currentUser.club_id);
      const activeFeeTypes = feetypesData.filter(feetype => feetype.status === 'active');
      setFeeTypes(activeFeeTypes);

      // Cargar cuotas del mismo club
      const feesData = await clubFeeService.getFeesByClubId(currentUser.club_id);
      setFees(feesData);

    } catch (err) {
      setError('Error al cargar las cuotas: ' + err.message);
      console.error('Error loading fees:', err);
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

  const handleCreate = async (feeData) => {
    try {
      setError('');
      
      const feeDataWithClub = {
        ...feeData,
        club_id: currentUser.club_id
      };
      
      await clubFeeService.createFee(feeDataWithClub);
      setSuccessMessage('Cuota creada exitosamente');
      setIsCreateModalOpen(false);
      loadFees();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear cuota');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setIsEditModalOpen(true);
  };

  const handleView = (fee) => {
    setSelectedFee(fee);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (feeData) => {
    console.log('DATA: ' + editingFee.id);
    try {
      setError('');
      
      const feeDataWithClub = {
        ...feeData,
        club_id: currentUser.club_id
      };
      
      await clubFeeService.updateFee(editingFee.id, feeDataWithClub);
      setIsEditModalOpen(false);
      setEditingFee(null);
      setSuccessMessage('Cuota actualizada exitosamente');
      loadFees();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la cuota: ' + err.message);
      console.error('Error updating fee:', err);
    }
  };

  const handleDelete = async (feeId) => {
    const feeToDelete = fees.find(f => f.id === feeId);
    
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar esta cuota?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará: <strong>Cuota de {feeToDelete?.member_name}</strong> - <strong>${feeToDelete?.amount} {feeToDelete?.currency}</strong>
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
                await clubFeeService.deleteFee(feeId);
                setSuccessMessage('Cuota eliminada exitosamente');
                closeModal();
                loadFees();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar la cuota: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Cuota
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
          <p className="text-lg text-gray-600">Cargando cuotas del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Cuotas</h2>
          <p className="text-gray-600 mt-1">Administra las cuotas de los socios del club</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{fees.length}</span> cuotas
          </div>
          
          <button
            onClick={loadFees}
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
      {fees.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Recaudado</p>
                <p className="text-2xl font-bold text-green-600">
                  ${fees
                    .filter(f => f.status === 'paid')
                    .reduce((sum, fee) => sum + parseFloat(fee.amount || 0), 0)
                    .toLocaleString('es-AR')}
                </p>
              </div>
              <DollarSign className="text-green-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cuotas Pagadas</p>
                <p className="text-2xl font-bold text-blue-600">
                  {fees.filter(f => f.status === 'paid').length}
                </p>
              </div>
              <CheckCircle className="text-blue-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cuotas Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">
                  {fees.filter(f => f.status === 'pending').length}
                </p>
              </div>
              <Clock className="text-orange-500" size={24} />
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cuotas Vencidas</p>
                <p className="text-2xl font-bold text-red-600">
                  {fees.filter(f => f.status === 'overdue').length}
                </p>
              </div>
              <AlertCircle className="text-red-500" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* DataTable Responsive */}
      {fees.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CreditCard size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay cuotas registradas</h3>
          <p className="text-gray-600 mb-6">Gestiona las cuotas de los socios de tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <Plus size={18} />
            <span>Crear Primera Cuota</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={fees}
          columns={[
            { 
              key: 'member', 
              label: 'Socio',
              render: (_, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {item.member_name?.charAt(0).toUpperCase() || 'S'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.member_name}
                    </div>
                    {item.fee_type_name && (
                      <div className="text-xs text-gray-500">{item.fee_type_name}</div>
                    )}
                  </div>
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
              key: 'due_date', 
              label: 'Vencimiento',
              render: (value) => (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-sm">{formatDate(value)}</span>
                </div>
              )
            },
            { 
              key: 'payment_date', 
              label: 'Fecha Pago',
              render: (value) => (
                <div className="flex items-center space-x-1">
                  <Calendar size={12} className="text-gray-400" />
                  <span className="text-sm">{value ? formatDate(value) : 'Sin pagar'}</span>
                </div>
              )
            },
            { 
              key: 'status', 
              label: 'Estado',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : value === 'pending'
                    ? 'bg-yellow-100 text-yellow-800'
                    : value === 'overdue'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {value === 'paid' ? 'Pagado' : 
                   value === 'pending' ? 'Pendiente' : 
                   value === 'overdue' ? 'Vencido' : 
                   value === 'cancelled' ? 'Cancelado' : 'Desconocido'}
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

      {/* Modal para crear cuota */}
      <CreateFeeModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
        members={members}
        feetypes={feetypes}
      />

      {/* Modal para editar cuota */}
      {editingFee && (
        <EditFeeModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingFee(null);
          }}
          fee={editingFee}
          onSave={handleUpdate}
          members={members}
          feetypes={feetypes}
        />
      )}

      {/* Modal para ver detalles de la cuota */}
      {selectedFee && (
        <ViewFeeModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedFee(null);
          }}
          fee={selectedFee}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};

// Modal para crear cuota
const CreateFeeModal = ({ isOpen, onClose, onSave, members, feetypes }) => {
  const [formData, setFormData] = useState({
    member_id: '',
    fee_type_id: '',
    amount: '',
    currency: 'ARS',
    due_date: new Date().toISOString().split('T')[0],
    payment_date: '',
    transaction_id: '',
    notes: '',
    status: 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id || !formData.fee_type_id || !formData.amount || !formData.due_date) {
      setError('Los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        member_id: '',
        fee_type_id: '',
        amount: '',
        currency: 'ARS',
        due_date: new Date().toISOString().split('T')[0],
        payment_date: '',
        transaction_id: '',
        notes: '',
        status: 'pending'
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

  // Auto-fill amount based on selected fee type
  const handleFeeTypeChange = (e) => {
    const feeTypeId = e.target.value;
    const selectedFeeType = feetypes.find(ft => ft.id === parseInt(feeTypeId));
    
    setFormData(prev => ({
      ...prev,
      fee_type_id: feeTypeId,
      amount: selectedFeeType?.amount || '',
      currency: selectedFeeType?.currency || 'ARS'
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Crear Nueva Cuota"
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
              Tipo de Cuota *
            </label>
            <select
              name="fee_type_id"
              value={formData.fee_type_id}
              onChange={handleFeeTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              {feetypes.map((feetype) => (
                <option key={feetype.id} value={feetype.id}>
                  {feetype.name} - ${feetype.amount} {feetype.currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                {formData.currency}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {formData.status === 'paid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Transacción
              </label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: TRANS-123456"
              />
            </div>
          </div>
        )}

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
            placeholder="Observaciones adicionales sobre esta cuota..."
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <CreditCard size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Importante:</strong> Las cuotas marcadas como "Pagado" se consideran como ingresos recibidos.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Los estados se pueden actualizar en cualquier momento según el pago real.
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
                <span>Crear Cuota</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar cuota
const EditFeeModal = ({ isOpen, onClose, fee, onSave, members, feetypes }) => {
  const [formData, setFormData] = useState({
    member_id: fee?.member_id || '',
    fee_type_id: fee?.fee_type_id || '',
    amount: fee?.amount || '',
    currency: fee?.currency || 'ARS',
    due_date: fee?.due_date ? fee.due_date.split('T')[0] : new Date().toISOString().split('T')[0],
    payment_date: fee?.payment_date ? fee.payment_date.split('T')[0] : '',
    transaction_id: fee?.transaction_id || '',
    notes: fee?.notes || '',
    status: fee?.status || 'pending'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.member_id || !formData.fee_type_id || !formData.amount || !formData.due_date) {
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

  // Auto-fill amount based on selected fee type
  const handleFeeTypeChange = (e) => {
    const feeTypeId = e.target.value;
    const selectedFeeType = feetypes.find(ft => ft.id === parseInt(feeTypeId));
    
    setFormData(prev => ({
      ...prev,
      fee_type_id: feeTypeId,
      amount: selectedFeeType?.amount || prev.amount,
      currency: selectedFeeType?.currency || prev.currency
    }));
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Editar Cuota: ${fee?.member_name}`}
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
            {fee?.member_name}
          </div>
          <p className="text-xs text-gray-500 mt-1">El socio no se puede modificar</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cuota *
            </label>
            <select
              name="fee_type_id"
              value={formData.fee_type_id}
              onChange={handleFeeTypeChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Seleccionar tipo</option>
              {feetypes.map((feetype) => (
                <option key={feetype.id} value={feetype.id}>
                  {feetype.name} - ${feetype.amount} {feetype.currency}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Monto *
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                {formData.currency}
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
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Vencimiento *
            </label>
            <input
              type="date"
              name="due_date"
              value={formData.due_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
              <option value="overdue">Vencido</option>
              <option value="cancelled">Cancelado</option>
            </select>
          </div>
        </div>

        {formData.status === 'paid' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Pago
              </label>
              <input
                type="date"
                name="payment_date"
                value={formData.payment_date}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ID de Transacción
              </label>
              <input
                type="text"
                name="transaction_id"
                value={formData.transaction_id}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Ej: TRANS-123456"
              />
            </div>
          </div>
        )}

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
                <span>Actualizar Cuota</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles de la cuota
const ViewFeeModal = ({ isOpen, onClose, fee, formatDate }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'paid': return 'Pagado';
      case 'pending': return 'Pendiente';
      case 'overdue': return 'Vencido';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconocido';
    }
  };

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles de la Cuota"
      size="md"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {fee?.member_name?.charAt(0).toUpperCase() || 'C'}
          </div>
          <div>
            <h3 className="text-xl font-semibold text-gray-900">{fee?.member_name}</h3>
            <p className="text-gray-600">{fee?.fee_type_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fee?.status)}`}>
            {getStatusText(fee?.status)}
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
                <span className="font-medium">{fee?.member_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo de Cuota:</span>
                <span className="font-medium">{fee?.fee_type_name}</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-700 mb-2 flex items-center space-x-2">
              <DollarSign size={16} />
              <span>Monto</span>
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Importe:</span>
                <span className="font-medium text-green-600">
                  ${parseFloat(fee?.amount || 0).toLocaleString('es-AR')} {fee?.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Vencimiento:</span>
                <span className="font-medium">{formatDate(fee?.due_date)}</span>
              </div>
              {fee?.payment_date && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Fecha Pago:</span>
                  <span className="font-medium">{formatDate(fee.payment_date)}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Información adicional */}
        {(fee?.transaction_id || fee?.notes) && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
              <FileText size={16} />
              <span>Información Adicional</span>
            </h4>
            {fee?.transaction_id && (
              <div className="mb-2">
                <span className="text-blue-700 text-sm">ID de Transacción:</span>
                <p className="font-medium text-blue-800">{fee.transaction_id}</p>
              </div>
            )}
            {fee?.notes && (
              <div>
                <span className="text-blue-700 text-sm">Notas:</span>
                <p className="text-blue-700 mt-1">{fee.notes}</p>
              </div>
            )}
          </div>
        )}

        {/* Historial/Metadatos */}
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
            <Clock size={16} />
            <span>Información del Sistema</span>
          </h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">ID de Cuota:</span>
              <span className="font-mono text-gray-800">#{fee?.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Creada:</span>
              <span className="text-gray-800">{fee?.created_at ? formatDate(fee.created_at) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actualizada:</span>
              <span className="text-gray-800">{fee?.updated_at ? formatDate(fee.updated_at) : 'N/A'}</span>
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
        </div>
      </div>
    </ResponsiveModal>
  );
};

export default ClubFeesManagement;