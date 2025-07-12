const API_BASE_URL = 'http://localhost:3001/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('stackit_token');
};

// Helper function to set auth token
const setAuthToken = (token: string) => {
  localStorage.setItem('stackit_token', token);
};

// Helper function to remove auth token
const removeAuthToken = () => {
  localStorage.removeItem('stackit_token');
};

// Generic API request function
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API
export const authAPI = {
  register: async (userData: { username: string; email: string; password: string }) => {
    const response = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  login: async (credentials: { email: string; password: string }) => {
    const response = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.success && response.token) {
      setAuthToken(response.token);
    }
    
    return response;
  },

  logout: () => {
    removeAuthToken();
  },

  getProfile: async () => {
    return await apiRequest('/users/profile');
  },

  updateProfile: async (profileData: { username?: string; bio?: string; location?: string; website?: string; avatar?: string }) => {
    return await apiRequest('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Questions API
export const questionsAPI = {
  getAll: async (params?: { sort?: string; page?: number; limit?: number }) => {
    const searchParams = new URLSearchParams();
    if (params?.sort) searchParams.append('sort', params.sort);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    
    const queryString = searchParams.toString();
    const endpoint = queryString ? `/questions?${queryString}` : '/questions';
    
    return await apiRequest(endpoint);
  },

  getById: async (id: string) => {
    return await apiRequest(`/questions/${id}`);
  },

  create: async (questionData: { title: string; description: string; tags: string[] }) => {
    return await apiRequest('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  },

  search: async (query: string) => {
    return await apiRequest(`/search?q=${encodeURIComponent(query)}`);
  },
};

// Answers API
export const answersAPI = {
  create: async (questionId: string, content: string) => {
    return await apiRequest(`/questions/${questionId}/answers`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  accept: async (answerId: string) => {
    return await apiRequest(`/answers/${answerId}/accept`, {
      method: 'POST',
    });
  },
};

// Votes API
export const votesAPI = {
  vote: async (targetType: 'question' | 'answer', targetId: string, voteType: 'up' | 'down') => {
    return await apiRequest('/vote', {
      method: 'POST',
      body: JSON.stringify({ targetType, targetId, voteType }),
    });
  },
};

// User API
export const userAPI = {
  getStats: async () => {
    return await apiRequest('/users/stats');
  }
};

// Export the token management functions
export { getAuthToken, setAuthToken, removeAuthToken }; 