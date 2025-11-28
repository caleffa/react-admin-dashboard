import React from 'react';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-800">Bitweb | Dashboard</h1>
          <p className="text-gray-600">Panel de administración</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="font-medium text-gray-800">{user?.name}</p>
            <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
          </div>
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;