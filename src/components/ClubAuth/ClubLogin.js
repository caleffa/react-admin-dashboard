import React, { useState } from 'react';
import { useClubAuth } from '../../context/ClubAuthContext';

const ClubLogin = ({ onToggleView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login } = useClubAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!email || !password) {
      setError('Por favor completa todos los campos');
      setLoading(false);
      return;
    }

    console.log('🔄 Iniciando proceso de login de club...');
    const result = await login(email, password);
    
    if (!result.success) {
      setError(result.error || 'Error desconocido al iniciar sesión');
      console.log('❌ Resultado del login:', result);
    } else {
      console.log('✅ Login de club exitoso, redirigiendo...');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
            🏟️
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Acceso al Club</h1>
          <p className="text-gray-600">Panel de administración del club</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Correo Electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="usuario@club.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Acceder al Club'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={onToggleView}
            className="text-green-500 hover:text-green-600 font-medium"
          >
            ← Volver al acceso principal
          </button>
        </div>

        <div className="mt-8 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800 text-center">
            <strong>Roles permitidos:</strong> Administrador de Club, Profesor, Cajero
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClubLogin;