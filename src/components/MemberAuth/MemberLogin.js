import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMemberAuth } from '../../context/MemberAuthContext';

const MemberLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useMemberAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    const result = await login(email, password);

    if (!result?.success) {
      setError(result?.error || 'Error desconocido al iniciar sesión');
      setLoading(false);
      return;
    }

    // ✅ LOGIN EXITOSO → DASHBOARD DE SOCIO
    navigate('/member/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            🏟️
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso al Panel</h1>
          <p className="text-gray-600">Panel del socio</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="usuario@mail.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white font-medium py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Iniciando sesión...' : 'Acceder al Panel'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-purple-500 hover:text-purple-600 font-medium"
          >
            ← Volver al acceso principal
          </button>
        </div>

        <div className="mt-8 p-4 bg-purple-50 rounded-lg text-center text-sm text-purple-800">
          <strong>Roles permitidos:</strong> Socios
        </div>
      </div>
    </div>
  );
};

export default MemberLogin;
