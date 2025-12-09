import React from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubProfile = () => {
  const { user } = useClubAuth();

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Información del Club</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del usuario */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Mi Información</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {user?.first_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h4 className="text-lg font-medium text-gray-900">
                  {user?.first_name} {user?.last_name}
                </h4>
                <p className="text-gray-600">@{user?.username}</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium">{user?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rol:</span>
                <span className="font-medium capitalize">
                  {user?.role === 'club_admin' ? 'Administrador del Club' : 
                   user?.role === 'super_admin' ? 'Administrador general' :
                   user?.role === 'teacher' ? 'Profesor' : 'Cajero'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <span className={`font-medium ${
                  user?.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {user?.status === 'active' ? 'Activo' : 'Inactivo'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Información del club */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Club</h3>
          <div className="space-y-4">
            {user?.club_logo && (
              <div className="flex justify-center">
                <img 
                  src={user.club_logo} 
                  alt={user.club_name}
                  className="w-20 h-20 object-cover rounded-lg"
                />
              </div>
            )}
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Nombre del Club:</label>
                <p className="text-lg font-semibold text-gray-900">{user?.club_name}</p>
              </div>
              
              {user?.club_description && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Descripción:</label>
                  <p className="text-gray-700 mt-1">{user?.club_description}</p>
                </div>
              )}
              
              {user?.club_address && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Dirección:</label>
                  <p className="text-gray-700 mt-1">{user?.club_address}</p>
                </div>
              )}
              
              {user?.club_phone && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Teléfono:</label>
                  <p className="text-gray-700 mt-1">{user?.club_phone}</p>
                </div>
              )}
              
              {user?.club_email && (
                <div>
                  <label className="text-sm font-medium text-gray-600">Email del Club:</label>
                  <p className="text-gray-700 mt-1">{user?.club_email}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Nota informativa */}
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
                Para modificar la información del club, contacta al administrador general del sistema.
                Como usuario del club, solo puedes gestionar los usuarios de este club específico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubProfile;