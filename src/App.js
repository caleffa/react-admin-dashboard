import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClubAuthProvider, useClubAuth } from './context/ClubAuthContext';
import Welcome from './components/Common/Welcome';
import Login from './components/Auth/Login';
import ClubLogin from './components/ClubAuth/ClubLogin';
import Dashboard from './components/Dashboard/Dashboard';
import ClubDashboard from './components/ClubDashboard/Dashboard';

// Componente seguro para usar useClubAuth
const ClubAppContent = () => {
  try {
    const { user, loading } = useClubAuth();

    if (loading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando...</p>
          </div>
        </div>
      );
    }

    if (user) {
      return <ClubDashboard />;
    }

    return <ClubLogin onToggleView={() => window.location.reload()} />;
  } catch (error) {
    // Fallback si hay error con el contexto
    return <ClubLogin onToggleView={() => window.location.reload()} />;
  }
};

// Wrapper para ClubApp
const ClubApp = () => (
  <ClubAuthProvider>
    <ClubAppContent />
  </ClubAuthProvider>
);

// Componente principal
const MainApp = () => {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const [showClubLogin, setShowClubLogin] = useState(false);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (user) {
    return <Dashboard />;
  }

  if (showClubLogin) {
    return <ClubApp />;
  }

  if (showLogin) {
    return <Login onToggleView={() => setShowLogin(false)} />;
  }

  return <Welcome onShowLogin={() => setShowLogin(true)} onShowClubLogin={() => setShowClubLogin(true)} />;
};

// App principal
const App = () => {
  const clubToken = localStorage.getItem('club_token');

  if (clubToken) {
    return <ClubApp />;
  }

  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
};

export default App;