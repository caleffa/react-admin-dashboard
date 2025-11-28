const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vps-5479958-x.dattaweb.com/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const authFetch = async (url, options = {}) => {
  const token = getAuthToken();
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${url}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Si es error 401 (Unauthorized), hacer logout
      if (response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.reload();
      }
      throw new Error(`Error ${response.status}: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error('Error en authFetch:', error);
    throw error;
  }
};

export const userService = {
  // Login de usuario
login: async (email, password) => {
  //console.log('🔐 Intentando login con:', { email, password });
  
  try {
    const response = await fetch(`${API_BASE_URL}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    /*console.log('📡 Respuesta HTTP:', {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });*/

    if (!response.ok) {
      // Si es error 401, 404, etc.
      const errorText = await response.text();
      //console.log('❌ Error response body:', errorText);
      
      let errorMessage = 'Credenciales inválidas';
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorMessage;
      } catch (e) {
        // Si no es JSON, usar el texto plano
        errorMessage = errorText || `Error ${response.status}: ${response.statusText}`;
      }
      
      throw new Error(errorMessage);
    }

    const result = await response.json();
    /*console.log('✅ Login exitoso - Datos recibidos:', {
      hasToken: !!result.token,
      hasUser: !!result.user,
      userData: result.user
    });*/
    
    return result;

  } catch (error) {
    //console.error('💥 Error en fetch:', error);
    throw error;
  }
},

  // Obtener todos los usuarios
  getAllUsers: async () => {
    const response = await authFetch('/users');
    // Tu API devuelve { total: number, results: array }
    return response.results || [];
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    return authFetch(`/users/${id}`);
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    // Mapear los nombres de campos según tu base de datos
    const mappedData = {
      name: userData.name,
      lastname: userData.lastname,
      email: userData.email,
      role: userData.role
      // Agrega otros campos según necesites
    };
    
    return authFetch(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(mappedData),
    });
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    return authFetch(`/users/${id}`, {
      method: 'DELETE',
    });
  },


  // Crear usuario con parámetros fijos
  createUser: async (userData) => {
    const token = getAuthToken();
    
    // Agregar parámetros fijos al userData
    const userDataWithFixedParams = {
      ...userData,
      first_name: userData.name,
      last_name: userData.lastname
      
    };

    const response = await fetch(`${API_BASE_URL}/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userDataWithFixedParams),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Error al crear usuario');
    }

    return response.json();
  },

};