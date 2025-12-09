import React, { createContext, useState, useContext, useEffect } from 'react';
import { clubAuthService } from '../services/api';

const ClubAuthContext = createContext();

export const useClubAuth = () => {
  const context = useContext(ClubAuthContext);
  if (!context) {
    throw new Error('useClubAuth debe ser usado dentro de un ClubAuthProvider');
  }
  return context;
};

export const ClubAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('club_token');
    const userData = localStorage.getItem('club_user');
    
    /*console.log('🔍 ClubAuthProvider - Verificando autenticación:', { 
      token: !!token, 
      userData: !!userData 
    });*/

    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        //console.log('✅ ClubAuthProvider - Usuario encontrado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        //console.error('❌ ClubAuthProvider - Error parsing user data:', error);
        localStorage.removeItem('club_token');
        localStorage.removeItem('club_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      //console.log('🔐 ClubAuthProvider - Iniciando login...');
      const result = await clubAuthService.login(email, password);
      
      // Verificar que el usuario tenga un rol válido para club
      const validClubRoles = ['super_admin', 'club_admin', 'teacher', 'cashier'];
      if (!validClubRoles.includes(result.user.role)) {
        throw new Error('Usuario no autorizado para acceder al panel del club');
      }

      if (result.token && result.user) {
        localStorage.setItem('club_token', result.token);
        localStorage.setItem('club_user', JSON.stringify(result.user));
        setUser(result.user);
        //console.log('✅ ClubAuthProvider - Login exitoso');
        return { success: true };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 ClubAuthProvider - Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const logout = () => {
    //console.log('🚪 ClubAuthProvider - Cerrando sesión');
    localStorage.removeItem('club_token');
    localStorage.removeItem('club_user');
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <ClubAuthContext.Provider value={value}>
      {children}
    </ClubAuthContext.Provider>
  );
};