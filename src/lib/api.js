import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// Worksheet API
export const worksheetAPI = {
  getAll: (params) => api.get('/worksheets', { params }),
  getOne: (id) => api.get(`/worksheets/${id}`),
  getFile: (id) => api.get(`/worksheets/${id}/file`),
  create: (data) => api.post('/worksheets', data),
  update: (id, data) => api.put(`/worksheets/${id}`, data),
  delete: (id) => api.delete(`/worksheets/${id}`),
  togglePublish: (id) => api.post(`/worksheets/${id}/publish`),
  upload: (formData) => api.post('/worksheets/upload', formData),
  saveGoogleLink: (data) => api.post('/worksheets/google-link', data),
};

// Submission API
export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getOne: (id) => api.get(`/submissions/${id}`),
  getByStudent: (studentId) => api.get(`/submissions/student/${studentId}`),
  getByWorksheet: (worksheetId) => api.get(`/submissions/worksheet/${worksheetId}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
};

// Group API
export const groupAPI = {
  getAll: () => api.get('/groups'),
  getOne: (id) => api.get('/groups/${id}`),
  create: (data) => api.post('/groups', data),
  addStudents: (groupId, studentIds) => api.post(`/groups/${groupId}/students`, { studentIds }),
  removeStudent: (groupId, studentId) => api.delete(`/groups/${groupId}/students/${studentId}`),
  delete: (id) => api.delete(`/groups/${id}`),
  // NUEVO: Obtener estudiantes disponibles para agregar
  getAvailableStudents: () => api.get('/groups/available-students'),
  // NUEVO: Unirse a grupo con código
  joinWithCode: (joinCode) => api.post('/groups/join', { joinCode }),
};

// User API
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
};

// Material API
export const materialAPI = {
  getAll: () => api.get('/materials'),
};

// Workbook API
export const workbookAPI = {
  getAll: (params) => api.get('/workbooks', { params }),
  getOne: (id) => api.get(`/workbooks/${id}`),
  create: (data) => api.post('/workbooks', data),
  update: (id, data) => api.put(`/workbooks/${id}`, data),
  delete: (id) => api.delete(`/workbooks/${id}`),
  addWorksheet: (id, worksheetId) => api.post(`/workbooks/${id}/worksheets`, { worksheetId }),
  removeWorksheet: (id, worksheetId) => api.delete(`/workbooks/${id}/worksheets/${worksheetId}`),
  reorderWorksheets: (id, worksheetIds) => api.put(`/workbooks/${id}/reorder`, { worksheetIds }),
};

export default api;
