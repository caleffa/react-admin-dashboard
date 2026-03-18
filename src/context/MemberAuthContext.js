import React, { createContext, useState, useContext, useEffect } from 'react';
import { memberAuthService } from '../services/api';

const MemberAuthContext = createContext();

export const useMemberAuth = () => {
  const context = useContext(MemberAuthContext);
  if (!context) {
    throw new Error('useMemberAuth debe ser usado dentro de un MemberAuthProvider');
  }
  return context;
};

export const MemberAuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const member_token = localStorage.getItem('member_token');
    const userData = localStorage.getItem('member_user');

    if (member_token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        //console.log('✅ MemberAuthProvider - Usuario encontrado:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        //console.error('❌ MemberAuthProvider - Error parsing user data:', error);
        localStorage.removeItem('member_token');
        localStorage.removeItem('member_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      //console.log('🔐 MemberAuthProvider - Iniciando login...');
      const result = await memberAuthService.login(email, password);
      
      // Verificar que el usuario tenga un rol válido para member
      const validMemberRoles = ['member','admin'];
      if (!validMemberRoles.includes(result.user.role)) {
        throw new Error('Usuario no autorizado para acceder al panel');
      }

      if (result.token && result.user) {
        localStorage.setItem('member_token', result.token);
        localStorage.setItem('member_user', JSON.stringify(result.user));
        setUser(result.user);
        //console.log('✅ MemberAuthProvider - Login exitoso');
        return { success: true };
      } else {
        throw new Error('Respuesta inválida del servidor');
      }
    } catch (error) {
      console.error('💥 MemberAuthProvider - Error en login:', error);
      return { 
        success: false, 
        error: error.message || 'Error al iniciar sesión' 
      };
    }
  };

  const updateUser = (userData) => {
    setUser((currentUser) => {
      const nextUser = { ...(currentUser || {}), ...(userData || {}) };
      localStorage.setItem('member_user', JSON.stringify(nextUser));
      return nextUser;
    });
  };

  const logout = () => {
    //console.log('🚪 MemberAuthProvider - Cerrando sesión');
    localStorage.removeItem('member_token');
    localStorage.removeItem('member_user');
    setUser(null);
  };
  
  const value = {
    user,
    login,
    logout,
    updateUser,
    loading
  };

  return (
    <MemberAuthContext.Provider value={value}>
      {children}
    </MemberAuthContext.Provider>
  );
};