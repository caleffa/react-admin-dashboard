import React, { useState, useEffect } from 'react';
import { clubMemberService } from '../../services/api';
import { useClubAuth } from '../../context/ClubAuthContext';
import { 
  UserPlus, 
  RefreshCw,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Heart,
  Shield,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2,
  Search,
  Filter,
  UserCheck,
  AlertCircle
} from 'lucide-react';

// Importar los componentes responsive
import ResponsiveModal from '../ClubDashboard/ResponsiveModal';
import ResponsiveDataTable from '../ClubDashboard/ResponsiveDataTable';

const ClubMembersManagement = ({ openModal, closeModal }) => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editingMember, setEditingMember] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);

  const { user: currentMember } = useClubAuth();

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Cargar socios del mismo club
      const membersData = await clubMemberService.getMembersByClubId(currentMember.club_id);
      setMembers(membersData);

    } catch (err) {
      setError('Error al cargar los socios: ' + err.message);
      console.error('Error loading members:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (memberData) => {
    try {
      setError('');
      
      const memberDataWithClub = {
        ...memberData,
        club_id: currentMember.club_id
      };
      
      await clubMemberService.createMember(memberDataWithClub);
      setSuccessMessage('Socio creado exitosamente');
      setIsCreateModalOpen(false);
      loadMembers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      throw new Error(err.message || 'Error al crear socio');
    }
  };

  const handleEdit = (member) => {
    setEditingMember(member);
    setIsEditModalOpen(true);
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setIsViewModalOpen(true);
  };

  const handleUpdate = async (memberData) => {
    try {
      setError('');
      
      const memberDataWithClub = {
        ...memberData,
        club_id: currentMember.club_id
      };
      
      await clubMemberService.updateMember(editingMember.id, memberDataWithClub);
      setIsEditModalOpen(false);
      setEditingMember(null);
      setSuccessMessage('Socio actualizado exitosamente');
      loadMembers();
      
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar el socio: ' + err.message);
      console.error('Error updating member:', err);
    }
  };

  const handleDelete = async (memberId) => {
    // Prevenir que el usuario actual se elimine a sí mismo
    if (memberId === currentMember.id) {
      setError('No puedes eliminarte a ti mismo');
      return;
    }

    const memberToDelete = members.find(m => m.id === memberId);
    
    // Usar el modal responsive para confirmación
    openModal(
      'Confirmar Eliminación',
      <div className="space-y-4">
        <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
          <Trash2 className="text-red-500" size={24} />
          <div>
            <p className="font-semibold text-red-800">¿Estás seguro de eliminar este socio?</p>
            <p className="text-sm text-red-600 mt-1">
              Se eliminará permanentemente: <strong>{memberToDelete?.first_name} {memberToDelete?.last_name}</strong>
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
                await clubMemberService.deleteMember(memberId);
                setSuccessMessage('Socio eliminado exitosamente');
                closeModal();
                loadMembers();
                
                setTimeout(() => setSuccessMessage(''), 3000);
              } catch (err) {
                setError('Error al eliminar el socio: ' + err.message);
                closeModal();
              }
            }}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Eliminar Socio
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
          <p className="text-lg text-gray-600">Cargando socios del club...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Socios</h2>
          <p className="text-gray-600 mt-1">Gestiona los socios de {currentMember.club_name}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm text-gray-600">
            Total: <span className="font-bold">{members.length}</span> socios
          </div>
          
          <button
            onClick={loadMembers}
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <RefreshCw size={18} />
            <span>Actualizar</span>
          </button>
          
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <UserPlus size={18} />
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

      {/* DataTable Responsive */}
      {members.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No hay socios registrados</h3>
          <p className="text-gray-600 mb-6">Comienza agregando el primer socio a tu club</p>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors inline-flex items-center space-x-2"
          >
            <UserPlus size={18} />
            <span>Crear Primer Socio</span>
          </button>
        </div>
      ) : (
        <ResponsiveDataTable
          data={members}
          columns={[
            { 
              key: 'name', 
              label: 'Nombre Completo',
              render: (_, item) => (
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                    {item.first_name?.charAt(0).toUpperCase() || 'U'}
                    {item.last_name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {item.first_name} {item.last_name}
                    </div>
                    {item.email && (
                      <div className="text-xs text-gray-500">{item.email}</div>
                    )}
                  </div>
                </div>
              )
            },
            { 
              key: 'document_number', 
              label: 'Documento',
              render: (value) => value || 'No especificado'
            },
            { 
              key: 'gender', 
              label: 'Sexo',
              render: (value) => (
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  value === 'female' ? 'bg-pink-100 text-pink-800' : 
                  value === 'male'   ? 'bg-blue-100 text-blue-800'  : 
                  'bg-gray-100 text-gray-800'
                }`}>
                  {value === 'male' ? 'Masculino' : value === 'female' ? 'Femenino' : 'Otro'}
                </span>
              )
            },
            { 
              key: 'phone', 
              label: 'Teléfono',
              render: (value) => value || 'No especificado'
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

      {/* Modal para crear socio */}
      <CreateMemberModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreate}
      />

      {/* Modal para editar socio */}
      {editingMember && (
        <EditMemberModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setEditingMember(null);
          }}
          member={editingMember}
          onSave={handleUpdate}
        />
      )}

      {/* Modal para ver detalles del socio */}
      {selectedMember && (
        <ViewMemberModal
          isOpen={isViewModalOpen}
          onClose={() => {
            setIsViewModalOpen(false);
            setSelectedMember(null);
          }}
          member={selectedMember}
          currentMemberId={currentMember.id}
        />
      )}
    </div>
  );
};

// Modal para crear socio (usando ResponsiveModal)
const CreateMemberModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    document_number: '',
    email: '',
    first_name: '',
    last_name: '',
    gender: 'other',
    status: 'active',
    phone: '',
    birth_date: '',
    address: '',
    medical_conditions: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación básica
    if (!formData.first_name || !formData.last_name || !formData.document_number || !formData.email) {
      setError('Los campos marcados con * son obligatorios');
      setLoading(false);
      return;
    }

    try {
      await onSave(formData);
      // Reset form on success
      setFormData({
        document_number: '',
        email: '',
        first_name: '',
        last_name: '',
        gender: 'other',
        status: 'active',
        phone: '',
        birth_date: '',
        address: '',
        medical_conditions: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
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
      title="Crear Socio"
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento *
            </label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sexo
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro / No indica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domicilio
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Calle, número, ciudad, provincia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condiciones Médicas
          </label>
          <textarea
            name="medical_conditions"
            value={formData.medical_conditions}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Alergias, enfermedades crónicas, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacto de Emergencia
            </label>
            <input
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de Emergencia
            </label>
            <input
              type="tel"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Teléfono del contacto"
            />
          </div>
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

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <Shield size={18} className="text-green-600 mt-0.5" />
            <div>
              <p className="text-sm text-green-700">
                <strong>Importante:</strong> Los datos marcados con * son obligatorios.
              </p>
              <p className="text-xs text-green-600 mt-1">
                Los datos de contacto de emergencia son cruciales para la seguridad de los socios.
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
                <UserPlus size={18} />
                <span>Crear Socio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para editar socio (usando ResponsiveModal)
const EditMemberModal = ({ isOpen, onClose, member, onSave }) => {
  const [formData, setFormData] = useState({
    document_number: member?.document_number || '',
    email: member?.email || '',
    first_name: member?.first_name || '',
    last_name: member?.last_name || '',
    gender: member?.gender || 'other',
    status: member?.status || 'active',
    phone: member?.phone || '',
    birth_date: member?.birth_date ? member.birth_date.split('T')[0] : '',
    address: member?.address || '',
    medical_conditions: member?.medical_conditions || '',
    emergency_contact_name: member?.emergency_contact_name || '',
    emergency_contact_phone: member?.emergency_contact_phone || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    // Validación básica
    if (!formData.first_name || !formData.last_name || !formData.document_number || !formData.email) {
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
      title={`Editar Socio: ${member?.first_name} ${member?.last_name}`}
      size="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre *
            </label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Apellido *
            </label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Documento *
            </label>
            <input
              type="text"
              name="document_number"
              value={formData.document_number}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Ej: +54 9 11 1234-5678"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha de Nacimiento
            </label>
            <input
              type="date"
              name="birth_date"
              value={formData.birth_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sexo
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="male">Masculino</option>
              <option value="female">Femenino</option>
              <option value="other">Otro / No indica</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Domicilio
          </label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Calle, número, ciudad, provincia"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Condiciones Médicas
          </label>
          <textarea
            name="medical_conditions"
            value={formData.medical_conditions}
            onChange={handleChange}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            placeholder="Alergias, enfermedades crónicas, etc."
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contacto de Emergencia
            </label>
            <input
              type="text"
              name="emergency_contact_name"
              value={formData.emergency_contact_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Nombre completo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Teléfono de Emergencia
            </label>
            <input
              type="tel"
              name="emergency_contact_phone"
              value={formData.emergency_contact_phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Teléfono del contacto"
            />
          </div>
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
                <span>Actualizar Socio</span>
              </>
            )}
          </button>
        </div>
      </form>
    </ResponsiveModal>
  );
};

// Modal para ver detalles del socio
const ViewMemberModal = ({ isOpen, onClose, member, currentMemberId }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return null;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge(member?.birth_date);

  return (
    <ResponsiveModal
      isOpen={isOpen}
      onClose={onClose}
      title="Detalles del Socio"
      size="lg"
    >
      <div className="space-y-6">
        {/* Avatar y nombre */}
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
            {member?.first_name?.charAt(0).toUpperCase() || 'U'}
            {member?.last_name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900">
              {member?.first_name} {member?.last_name}
            </h3>
            <p className="text-gray-600">{member?.email}</p>
            {member?.id === currentMemberId && (
              <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                (Tú)
              </span>
            )}
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            member?.status === 'active' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {member?.status === 'active' ? 'Activo' : 'Inactivo'}
          </span>
        </div>

        {/* Información personal */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-3 flex items-center space-x-2">
            <User size={18} />
            <span>Información Personal</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-gray-500">Documento</p>
              <p className="font-medium">{member?.document_number || 'No especificado'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Sexo</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                member?.gender === 'female' ? 'bg-pink-100 text-pink-800' : 
                member?.gender === 'male'   ? 'bg-blue-100 text-blue-800'  : 
                'bg-gray-100 text-gray-800'
              }`}>
                {member?.gender === 'male' ? 'Masculino' : member?.gender === 'female' ? 'Femenino' : 'Otro'}
              </span>
            </div>
            <div>
              <p className="text-xs text-gray-500">Fecha de Nacimiento</p>
              <p className="font-medium">
                {formatDate(member?.birth_date)}
                {age && <span className="text-gray-600 text-sm ml-2">({age} años)</span>}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Teléfono</p>
              <p className="font-medium">{member?.phone || 'No especificado'}</p>
            </div>
          </div>
        </div>

        {/* Contacto y ubicación */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 mb-2 flex items-center space-x-2">
              <MapPin size={16} />
              <span>Domicilio</span>
            </h4>
            <p className="text-sm text-blue-800">
              {member?.address || 'No especificado'}
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-700 mb-2 flex items-center space-x-2">
              <Phone size={16} />
              <span>Contacto de Emergencia</span>
            </h4>
            <div className="space-y-1">
              <p className="text-sm font-medium text-purple-800">
                {member?.emergency_contact_name || 'No especificado'}
              </p>
              {member?.emergency_contact_phone && (
                <p className="text-sm text-purple-700">
                  {member.emergency_contact_phone}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Información médica */}
        {member?.medical_conditions && (
          <div className="bg-yellow-50 rounded-lg p-4">
            <h4 className="font-medium text-yellow-700 mb-2 flex items-center space-x-2">
              <Heart size={16} />
              <span>Condiciones Médicas</span>
            </h4>
            <p className="text-sm text-yellow-800">
              {member.medical_conditions}
            </p>
          </div>
        )}

        {/* Información del club */}
        <div className="bg-green-50 rounded-lg p-4">
          <h4 className="font-medium text-green-700 mb-2">Información del Club</h4>
          <p className="text-sm text-green-800">
            Este socio pertenece a tu club. Para modificar la membresía del club, contacta con un administrador.
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

export default ClubMembersManagement;