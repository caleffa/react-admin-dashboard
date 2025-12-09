import React from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubHeader = () => {
  const { user } = useClubAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Club Dashboard</h1>
          <p className="text-gray-600">Panel de administración de {user?.club_name}</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium text-gray-800">{user?.first_name} {user?.last_name}</p>
            <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.first_name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default ClubHeader;