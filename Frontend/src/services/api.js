// API service for communicating with the backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Helper function to get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API request function
const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: getAuthHeaders(),
    ...options,
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.details ? `${errorData.error}: ${errorData.details}` : errorData.error || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// Auth API calls
export const authAPI = {
  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Registration failed');
    }

    return response.json();
  },

  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Login failed');
    }

    return response.json();
  },

  googleAuth: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Google authentication failed');
    }

    return response.json();
  },

  githubAuth: async (payload) => {
    const response = await fetch(`${API_BASE_URL}/auth/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'GitHub authentication failed');
    }

    return response.json();
  },

  getProfile: () => apiRequest('/auth/profile'),

  updateProfile: (userData) => apiRequest('/auth/profile', {
    method: 'PUT',
    body: JSON.stringify(userData),
  }),
};

// Resume API calls
export const resumeAPI = {
  getResumes: () => apiRequest('/resumes'),

  getResume: (id) => apiRequest(`/resumes/${id}`),

  createResume: (resumeData) => apiRequest('/resumes', {
    method: 'POST',
    body: JSON.stringify(resumeData),
  }),

  updateResume: (id, resumeData) => apiRequest(`/resumes/${id}`, {
    method: 'PUT',
    body: JSON.stringify(resumeData),
  }),

  deleteResume: (id) => apiRequest(`/resumes/${id}`, {
    method: 'DELETE',
  }),

  analyzeResume: (id, analysisData = {}) => apiRequest(`/resumes/${id}/analyze`, {
    method: 'POST',
    body: JSON.stringify(analysisData),
  }),

  analyzeDraft: (analysisData) => apiRequest('/resumes/analyze', {
    method: 'POST',
    body: JSON.stringify(analysisData),
  }),

  analyzePdf: async (file, options = {}) => {
    const token = getAuthToken();
    const formData = new FormData();
    formData.append('resume', file);
    if (options.targetRole) formData.append('targetRole', options.targetRole);
    if (options.jobDescription) formData.append('jobDescription', options.jobDescription);

    const response = await fetch(`${API_BASE_URL}/resumes/analyze/pdf`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'PDF analysis failed');
    }

    return response.json();
  },

  buildResumeWithAI: (payload) => apiRequest('/resumes/build-ai', {
    method: 'POST',
    body: JSON.stringify(payload),
  }),
};

// Template API calls
export const templateAPI = {
  getTemplates: (category = '') => {
    const query = category && category !== 'all' ? `?category=${category}` : '';
    return apiRequest(`/templates${query}`);
  },

  getTemplate: (id) => apiRequest(`/templates/${id}`),
};

// Health check
export const healthAPI = {
  check: () => apiRequest('/health'),
};

const api = {
  authAPI,
  resumeAPI,
  templateAPI,
  healthAPI,
};

export default api;

