import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './context/AuthContext';
import { ClubAuthProvider, useClubAuth } from './context/ClubAuthContext';
import { MemberAuthProvider, useMemberAuth } from './context/MemberAuthContext';

import Welcome from './components/Common/Welcome';
import Login from './components/Auth/Login';
import ClubLogin from './components/ClubAuth/ClubLogin';
import MemberLogin from './components/MemberAuth/MemberLogin';

import Dashboard from './components/Dashboard/Dashboard';
import ClubDashboard from './components/ClubDashboard/Dashboard';
import MemberDashboard from './components/MemberDashboard/Dashboard';

import PaymentSuccess from './components/pages/PaymentSuccess';
import PaymentFailure from './components/pages/PaymentFailure';
import PaymentPending from './components/pages/PaymentPending';

/* 🔐 Loader reutilizable */
const Loader = ({ text }) => (
  <div className="min-h-screen flex items-center justify-center">
    <p>{text}</p>
  </div>
);

/* 🔐 Rutas protegidas – Usuario */
const ProtectedUserRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <Loader text="Cargando..." />;
  return user ? children : <Navigate to="/" replace />;
};

/* 🔐 Rutas protegidas – Club */
const ProtectedClubRoute = ({ children }) => {
  const { user, loading } = useClubAuth();
  if (loading) return <Loader text="Cargando club..." />;
  return user ? children : <Navigate to="/club/login" replace />;
};

/* 🔐 Rutas protegidas – Miembro */
const ProtectedMemberRoute = ({ children }) => {
  const { user, loading } = useMemberAuth();
  if (loading) return <Loader text="Cargando miembro..." />;
  return user ? children : <Navigate to="/member/login" replace />;
};

/* 🌍 App */
const App = () => {
  return (
    <AuthProvider>
      <ClubAuthProvider>
        <MemberAuthProvider>
          <Router>
            <Routes>

              {/* Públicas */}
              <Route path="/" element={<Welcome />} />
              <Route path="/login" element={<Login />} />
              <Route path="/club/login" element={<ClubLogin />} />
              <Route path="/member/login" element={<MemberLogin />} />

              {/* Usuario */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedUserRoute>
                    <Dashboard />
                  </ProtectedUserRoute>
                }
              />

              {/* Club */}
              <Route
                path="/club/dashboard"
                element={
                  <ProtectedClubRoute>
                    <ClubDashboard />
                  </ProtectedClubRoute>
                }
              />

              {/* Miembro */}
              <Route
                path="/member/dashboard"
                element={
                  <ProtectedMemberRoute>
                    <MemberDashboard />
                  </ProtectedMemberRoute>
                }
              />

              {/* Pagos (públicos) */}
              <Route path="/payment/success" element={<PaymentSuccess />} />
              <Route path="/payment/failure" element={<PaymentFailure />} />
              <Route path="/payment/pending" element={<PaymentPending />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Router>
        </MemberAuthProvider>
      </ClubAuthProvider>
    </AuthProvider>
  );
};

export default App;
