const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://vps-5479958-x.dattaweb.com/api';

const getAuthToken = () => {
  return localStorage.getItem('token');
};

const authFetch = async (url, options = {}) => {
  // Intentar obtener token del club primero, luego el token principal
  const clubToken = localStorage.getItem('club_token');
  const mainToken = localStorage.getItem('token');
  const token = clubToken || mainToken;
  
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
      // Intentar obtener el mensaje de error específico del backend
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = await response.json();
        if (errorData && errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData && errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        const textError = await response.text();
        if (textError && textError.length < 100) {
          errorMessage = textError;
        }
      }
      
      throw new Error(errorMessage);
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

export const clubUserService = {
  // Obtener todos los usuarios
  getAllUsers: async () => {
    const response = await authFetch('/club/users');
    return response.results || [];
  },

  // Obtener usuarios por club ID
  getUsersByClubId: async (clubId) => {
    const response = await authFetch(`/club/users/club/${clubId}`);
    return response.results || [];
  },

  // Obtener usuario por ID
  getUserById: async (id) => {
    return authFetch(`/club/users/${id}`);
  },

  // Crear usuario
  createUser: async (userData) => {
    try {
      const response = await authFetch('/club/users', {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createUser:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear usuario');
    }
  },


  updateUser: async (id, userData) => {
    try {
      const response = await authFetch(`/club/users/${id}`, {
        method: 'PUT',
        body: JSON.stringify(userData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateUser:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar usuario');
    }
  },

  // Actualizar usuario
  updateUser: async (id, userData) => {
    return authFetch(`/club/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  // Eliminar usuario
  deleteUser: async (id) => {
    return authFetch(`/club/users/${id}`, {
      method: 'DELETE',
    });
  },

  // Obtener todos los clubes (para los selects)
  getAllClubs: async () => {
    const response = await authFetch('/club/clubs');
    return response.results || [];
  }
};



export const clubService = {
  // Obtener todos los clubes
  getAllClubs: async () => {
    const response = await authFetch('/club/clubs');
    return response.results || [];
  },

  getAllDisciplinesByClubId: async (id) => {
    const response = await authFetch(`/disciplines/clubs/${id}`);
    return response.results || [];
  },

  // Obtener club por ID
  getClubById: async (id) => {
    return authFetch(`/club/clubs/${id}`);
  },

  // Crear club
  createClub: async (clubData) => {
    return authFetch('/club/clubs', {
      method: 'POST',
      body: JSON.stringify(clubData),
    });
  },

  // Actualizar club
  updateClub: async (id, clubData) => {
    return authFetch(`/club/clubs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(clubData),
    });
  },

  // Eliminar club
  deleteClub: async (id) => {
    return authFetch(`/club/clubs/${id}`, {
      method: 'DELETE',
    });
  }
};

export const clubAuthService = {
  // Login específico para usuarios de club
  login: async (email, password) => {
    //console.log('🔐 Intentando login de club en:', `${API_BASE_URL}/club/users/login`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/club/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      /*console.log('📡 Respuesta del servidor:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });*/

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Credenciales inválidas');
      }

      const result = await response.json();
      //console.log('✅ Login de club exitoso:', result);
      return result;
    } catch (error) {
      console.error('💥 Error en clubAuthService.login:', error);
      throw error;
    }
  },
};


export const clubMemberService = {
  // Obtener todos los socios
  getAllMembers: async () => {
    const response = await authFetch('/club/members');
    return response.results || [];
  },

  // Obtener socios por club ID
  getMembersByClubId: async (clubId) => {
    const response = await authFetch(`/club/members/club/${clubId}`);
    return response.results || [];
  },

  // Obtener socio por ID
  getMemberById: async (id) => {
    return authFetch(`/club/members/${id}`);
  },

  // Crear socio
  createMember: async (memberData) => {
    try {
      const response = await authFetch('/club/members', {
        method: 'POST',
        body: JSON.stringify(memberData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createMember:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear socio');
    }
  },


  updateMember: async (id, memberData) => {
    try {
      const response = await authFetch(`/club/members/${id}`, {
        method: 'PUT',
        body: JSON.stringify(memberData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateMember:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar socio');
    }
  },

  // Actualizar socio
  updateMember: async (id, memberData) => {
    return authFetch(`/club/members/${id}`, {
      method: 'PUT',
      body: JSON.stringify(memberData),
    });
  },

  // Eliminar socio
  deleteMember: async (id) => {
    return authFetch(`/club/members/${id}`, {
      method: 'DELETE',
    });
  },


};


export const clubDisciplineService = {
  // Obtener todas las disciplinas
  getAllDisciplines: async () => {
    const response = await authFetch('/club/disciplines');
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getDisciplinesByClubId: async (clubId) => {
    const response = await authFetch(`/club/disciplines/club/${clubId}`);
    return response.results || [];
  },

  // Obtener disciplina por ID
  getDisciplineById: async (id) => {
    return authFetch(`/club/disciplines/${id}`);
  },

  // Crear disciplina
  createDiscipline: async (disciplineData) => {
    try {
      const response = await authFetch('/club/disciplines', {
        method: 'POST',
        body: JSON.stringify(disciplineData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createMember:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear socio');
    }
  },

  updateDiscipline: async (id, disciplineData) => {
    try {
      const response = await authFetch(`/club/disciplines/${id}`, {
        method: 'PUT',
        body: JSON.stringify(disciplineData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateDiscipline:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar socio');
    }
  },

  // Actualizar disciplina
  updateDiscipline: async (id, disciplineData) => {
    return authFetch(`/club/disciplines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(disciplineData),
    });
  },

  // Eliminar disciplina
  deleteDiscipline: async (id) => {
    return authFetch(`/club/disciplines/${id}`, {
      method: 'DELETE',
    });
  },
};



export const clubCategoryService = {
  // Obtener todas las categories
  getAllCategories: async () => {
    const response = await authFetch('/club/categories');
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getDisciplinesByClubId: async (clubId) => {
    const response = await authFetch(`/club/disciplines/club/${clubId}`);
    return response.results || [];
  },

  // Obtener categories por disciplina ID
  getCategoriesByDisciplineId: async (disciplineId) => {
    const response = await authFetch(`/club/categories/discipline/${disciplineId}`);
    return response.results || [];
  },
  
  // Obtener categories por club ID
  getCategoriesByClubId: async (clubId) => {
    const response = await authFetch(`/club/categories/club/${clubId}`);
    return response.results || [];
  },

  // Obtener categories por ID
  getCategoryById: async (id) => {
    return authFetch(`/club/categories/${id}`);
  },

  // Crear categories
  createCategory: async (disciplineData) => {
    try {
      const response = await authFetch('/club/categories', {
        method: 'POST',
        body: JSON.stringify(disciplineData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createMember:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear socio');
    }
  },

  updateCategory: async (id, disciplineData) => {
    try {
      const response = await authFetch(`/club/categories/${id}`, {
        method: 'PUT',
        body: JSON.stringify(disciplineData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateCategory:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar socio');
    }
  },

  // Actualizar categories
  updateCategory: async (id, disciplineData) => {
    return authFetch(`/club/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(disciplineData),
    });
  },

  // Eliminar categories
  deleteCategory: async (id) => {
    return authFetch(`/club/categories/${id}`, {
      method: 'DELETE',
    });
  },
};

/////////////////////////////////////////////////////////////

export const clubEnrollmentService = {
  // Obtener todas las categories
  getAllEnrollments: async () => {
    const response = await authFetch('/club/enrollments');
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getEnrollmentsByClubId: async (clubId) => {
    const response = await authFetch(`/club/enrollments/club/${clubId}`);
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getEnrollmentsByCategoryId: async (categoryId) => {
    const response = await authFetch(`/club/enrollments/category/${categoryId}`);
    return response.results || [];
  },

  // Obtener categories por disciplina ID
  getEnrollmentsByDisciplineId: async (disciplineId) => {
    const response = await authFetch(`/club/enrollments/discipline/${disciplineId}`);
    return response.results || [];
  },
  

  // Obtener categories por ID
  getEnrollmentById: async (id) => {
    return authFetch(`/club/enrollments/${id}`);
  },

  // Crear categories
  createEnrollment: async (enrollmentData) => {
    try {
      const response = await authFetch('/club/enrollments', {
        method: 'POST',
        body: JSON.stringify(enrollmentData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createMember:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear socio');
    }
  },

  updateEnrollment: async (id, enrollmentData) => {
    try {
      const response = await authFetch(`/club/enrollments/${id}`, {
        method: 'PUT',
        body: JSON.stringify(enrollmentData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateCategory:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar socio');
    }
  },

  // Actualizar categories
  updateEnrollment: async (id, enrollmentData) => {
    return authFetch(`/club/enrollments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(enrollmentData),
    });
  },

  // Eliminar categories
  deleteEnrollment: async (id) => {
    return authFetch(`/club/enrollments/${id}`, {
      method: 'DELETE',
    });
  },
};



/////////////////////////////////////////////////////////////

export const clubScheduleService = {
  // Obtener todas las categories
  getAllSchedules: async () => {
    const response = await authFetch('/club/schedules');
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getSchedulesByClubId: async (clubId) => {
    const response = await authFetch(`/club/schedules/club/${clubId}`);
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getSchedulesByCategoryId: async (categoryId) => {
    const response = await authFetch(`/club/schedules/category/${categoryId}`);
    return response.results || [];
  },

  // Obtener categories por disciplina ID
  getSchedulesByDisciplineId: async (disciplineId) => {
    const response = await authFetch(`/club/schedules/discipline/${disciplineId}`);
    return response.results || [];
  },
  

  // Obtener categories por ID
  getScheduleById: async (id) => {
    return authFetch(`/club/schedules/${id}`);
  },

  // Crear categories
  createSchedule: async (scheduleData) => {
    try {
      const response = await authFetch('/club/schedules', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createMember:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear socio');
    }
  },

  updateSchedule: async (id, scheduleData) => {
    try {
      const response = await authFetch(`/club/schedules/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateCategory:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar socio');
    }
  },

  // Actualizar categories
  updateSchedule: async (id, scheduleData) => {
    return authFetch(`/club/schedules/${id}`, {
      method: 'PUT',
      body: JSON.stringify(scheduleData),
    });
  },

  // Eliminar categories
  deleteSchedule: async (id) => {
    return authFetch(`/club/schedules/${id}`, {
      method: 'DELETE',
    });
  },
};



/////////////////////////////////////////////////////////////

export const clubFeeTypeService = {
  // Obtener todas las categories
  getAllFeeTypes: async () => {
    const response = await authFetch('/club/feetypes');
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getFeeTypesByClubId: async (clubId) => {
    const response = await authFetch(`/club/feetypes/club/${clubId}`);
    return response.results || [];
  },

  // Obtener disciplina por club ID
  getFeeTypesByCategoryId: async (categoryId) => {
    const response = await authFetch(`/club/feetypes/category/${categoryId}`);
    return response.results || [];
  },

  // Obtener categories por disciplina ID
  getFeeTypesByDisciplineId: async (disciplineId) => {
    const response = await authFetch(`/club/feetypes/discipline/${disciplineId}`);
    return response.results || [];
  },
  

  // Obtener categories por ID
  getFeeTypeById: async (id) => {
    return authFetch(`/club/feetypes/${id}`);
  },

  // Crear categories
  createFeeType: async (scheduleData) => {
    try {
      const response = await authFetch('/club/feetypes', {
        method: 'POST',
        body: JSON.stringify(scheduleData),
      });

      return response;
    } catch (error) {
      // Mejorar el manejo de errores para mostrar el mensaje específico
      console.error('Error en createFeetype:', error);
      
      // Si el error ya tiene un mensaje específico, lanzarlo tal cual
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      // Si es un error genérico, intentar obtener más detalles
      throw new Error(error.message || 'Error al crear tipo de tarifa');
    }
  },

  updateFeeType: async (id, scheduleData) => {
    try {
      const response = await authFetch(`/club/feetypes/${id}`, {
        method: 'PUT',
        body: JSON.stringify(scheduleData),
      });

      return response;
    } catch (error) {
      console.error('Error en updateFeeType:', error);
      
      // Preservar el mensaje específico de la API
      if (error.message && !error.message.includes('Error') && !error.message.includes('Bad Request')) {
        throw error;
      }
      
      throw new Error(error.message || 'Error al actualizar tipo tarifa');
    }
  },

  // Actualizar categories
  updateFeeType: async (id, feetypeData) => {
    return authFetch(`/club/feetypes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(feetypeData),
    });
  },

  // Eliminar categories
  deleteFeeType: async (id) => {
    return authFetch(`/club/feetypes/${id}`, {
      method: 'DELETE',
    });
  },
};