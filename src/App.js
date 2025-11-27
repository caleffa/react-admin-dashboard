import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Welcome from './components/Common/Welcome';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showLogin) {
    return <Login onToggleView={() => setShowLogin(false)} />;
  }

  return <Welcome onShowLogin={() => setShowLogin(true)} />;
};

const App = () => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
};

export default App;