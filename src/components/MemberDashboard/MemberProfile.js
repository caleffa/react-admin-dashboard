import React, { useState, useEffect } from 'react';
import { useMemberAuth } from '../../context/MemberAuthContext';
import { clubMemberService } from '../../services/api';
import {
  CircleUser,
  Edit,
  Phone,
  SquareActivity,
  Trash2,
  Upload,
  Image as ImageIcon,
} from 'lucide-react';

const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;
const MEMBER_IMAGES_BASE_PATH = '/members/images';

const getMemberImageSrc = (image) => {
  if (!image) return '';
  if (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('data:')) {
    return image;
  }
  return image.startsWith('/') ? image : `${MEMBER_IMAGES_BASE_PATH}/${image}`;
};

const getMemberInitials = (member) => {
  const firstInitial = member?.first_name?.charAt(0)?.toUpperCase() || '';
  const lastInitial = member?.last_name?.charAt(0)?.toUpperCase() || '';
  return `${firstInitial}${lastInitial}` || 'SM';
};

const MemberProfile = () => {
  const { user, updateUser } = useMemberAuth();
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [member, setMember] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    medical_conditions: ''
  });

  useEffect(() => {
    if (user?.id) {
      loadMemberData();
    } else {
      setLoading(false);
      setError('Usuario no autenticado');
    }
  }, [user?.id]);

  const syncMemberState = (memberData) => {
    setMember(memberData);
    setImagePreview(getMemberImageSrc(memberData.image));

    if (
      user?.first_name !== memberData.first_name ||
      user?.last_name !== memberData.last_name ||
      user?.email !== memberData.email ||
      user?.image !== memberData.image
    ) {
      updateUser({
        first_name: memberData.first_name,
        last_name: memberData.last_name,
        email: memberData.email,
        image: memberData.image,
      });
    }
  };

  const loadMemberData = async () => {
    try {
      setLoading(true);
      setError('');
      const memberData = await clubMemberService.getMemberData(user.id);
      syncMemberState(memberData);

      setFormData({
        first_name: memberData.first_name || '',
        last_name: memberData.last_name || '',
        email: memberData.email || '',
        phone: memberData.phone || '',
        address: memberData.address || '',
        emergency_contact_name: memberData.emergency_contact_name || '',
        emergency_contact_phone: memberData.emergency_contact_phone || '',
        medical_conditions: memberData.medical_conditions || ''
      });
    } catch (err) {
      setError('Error al cargar los datos: ' + err.message);
      console.error('Error loading memberData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const updateData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        address: formData.address,
        emergency_contact_name: formData.emergency_contact_name,
        emergency_contact_phone: formData.emergency_contact_phone,
        medical_conditions: formData.medical_conditions,
        image: member?.image || ''
      };

      await clubMemberService.updateMember(user.id, updateData);
      setSuccessMessage('Datos actualizados correctamente');
      setIsEditModalOpen(false);
      loadMemberData();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar los datos: ' + err.message);
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Solo se permiten archivos de imagen.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError('La imagen no puede superar los 10 MB.');
      return;
    }

    try {
      setIsUploadingImage(true);
      setError('');
      setSuccessMessage('');

      const reader = new FileReader();
      const imageDataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen seleccionada.'));
        reader.readAsDataURL(file);
      });

      const sanitizedFileName = file.name.replace(/\s+/g, '-').toLowerCase();
      const imageReference = `${MEMBER_IMAGES_BASE_PATH}/${Date.now()}-${sanitizedFileName}`;

      await clubMemberService.updateMember(user.id, {
        ...member,
        image: imageDataUrl,
        image_path: imageReference,
      });

      const updatedMember = {
        ...member,
        image: imageDataUrl,
        image_path: imageReference,
      };

      syncMemberState(updatedMember);
      setSuccessMessage('Foto de perfil actualizada correctamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al actualizar la foto de perfil: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRemoveImage = async () => {
    try {
      setIsUploadingImage(true);
      setError('');
      setSuccessMessage('');

      await clubMemberService.updateMember(user.id, {
        ...member,
        image: '',
      });

      const updatedMember = {
        ...member,
        image: '',
      };

      syncMemberState(updatedMember);
      setSuccessMessage('Foto de perfil eliminada correctamente.');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      setError('Error al eliminar la foto de perfil: ' + err.message);
    } finally {
      setIsUploadingImage(false);
    }
  };

  const formatBirthDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  const formatRegistrationDate = (dateString) => {
    if (!dateString) return 'No especificado';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Cargando datos del socio...</div>
      </div>
    );
  }

  const memberImageSrc = imagePreview || getMemberImageSrc(member?.image);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Mi Perfil</h2>

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-green-600 mr-2">✓</span>
            <span className="text-green-800">{successMessage}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-red-600 mr-2">✗</span>
            <span className="text-red-800">{error}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-purple-100 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 inline-flex items-center">
              <CircleUser size={18} className="mr-2" />
              Mi Información Personal
            </h3>

            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200 inline-flex items-center"
            >
              <Edit size={18} className="mr-2" /> Editar
            </button>
          </div>

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              {memberImageSrc ? (
                <img
                  src={memberImageSrc}
                  alt={`Foto de ${member?.first_name || 'socio'}`}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                />
              ) : (
                <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {getMemberInitials(member)}
                </div>
              )}
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {member?.first_name} {member?.last_name}
                </h4>
                <p className="text-gray-600">ID: {member?.id}</p>
              </div>
            </div>

            <div className="rounded-xl border border-purple-200 bg-white/80 p-4 space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 inline-flex items-center gap-2">
                    <ImageIcon size={16} /> Foto de perfil
                  </h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Subí una imagen JPG, PNG, WEBP o GIF de hasta 10 MB.
                  </p>
                </div>
                {memberImageSrc && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    disabled={isUploadingImage}
                    className="inline-flex items-center gap-2 px-3 py-2 text-sm text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-60"
                  >
                    <Trash2 size={16} /> Quitar
                  </button>
                )}
              </div>

              <label className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer disabled:opacity-60">
                <Upload size={16} />
                <span>{isUploadingImage ? 'Guardando...' : 'Seleccionar imagen'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploadingImage}
                />
              </label>

              {member?.image && (
                <div className="text-xs text-gray-600 break-all">
                  URL actual: <span className="font-mono">{member.image}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{member?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{member?.phone || 'No especificado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Documento:</span>
                <span className="font-medium">{member?.document_number}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de Nacimiento:</span>
                <span className="font-medium">{formatBirthDate(member?.birth_date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Género:</span>
                <span className="font-medium capitalize">
                  {member?.gender === 'female' ? 'Femenino' : 'Masculino'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Dirección:</span>
                <span className="font-medium text-right">{member?.address || 'No especificada'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${member?.status === 'active' ? 'text-green-600' : 'text-red-600'}`}>
                  {member?.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de Registro:</span>
                <span className="font-medium">{formatRegistrationDate(member?.registration_date)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-100 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 inline-flex items-center">
              <Phone size={18} className="mr-2" />
              Contacto de Emergencia
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{member?.emergency_contact_name || 'No especificado'}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Teléfono:</span>
                <span className="font-medium">{member?.emergency_contact_phone || 'No especificado'}</span>
              </div>
            </div>
          </div>

          {member?.medical_conditions && (
            <div className="bg-red-100 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 inline-flex items-center">
                <SquareActivity size={18} className="mr-2" />
                Condiciones Médicas
              </h3>
              <div className="space-y-3">
                <p className="text-gray-700">{member.medical_conditions}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">Editar Información Personal</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="first_name"
                      value={formData.first_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="last_name"
                      value={formData.last_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia (Nombre)
                    </label>
                    <input
                      type="text"
                      name="emergency_contact_name"
                      value={formData.emergency_contact_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contacto de Emergencia (Teléfono)
                    </label>
                    <input
                      type="tel"
                      name="emergency_contact_phone"
                      value={formData.emergency_contact_phone}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condiciones Médicas
                    </label>
                    <textarea
                      name="medical_conditions"
                      value={formData.medical_conditions}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-500">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Información importante
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                Solo puedes modificar tu información personal. Para cambios en la información del club o en datos sensibles como documento o fecha de nacimiento, contacta al administrador de tu club.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberProfile;
