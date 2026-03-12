import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    // Let axios auto-set Content-Type for FormData (file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      const publicPaths = ['/login', '/register', '/'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  refreshToken: () => api.post('/auth/refresh'),
};

// ─── Worksheet API ────────────────────────────────────────────────────────────
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

// ─── Submission API ───────────────────────────────────────────────────────────
export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getOne: (id) => api.get(`/submissions/${id}`),
  getByStudent: (studentId) => api.get(`/submissions/student/${studentId}`),
  getByWorksheet: (worksheetId) => api.get(`/submissions/worksheet/${worksheetId}`),
  grade: (id, data) => api.put(`/submissions/${id}/grade`, data),
};

// ─── Group API ────────────────────────────────────────────────────────────────
export const groupAPI = {
  getAll: () => api.get('/groups'),
  getOne: (id) => api.get(`/groups/${id}`),
  create: (data) => api.post('/groups', data),
  addStudents: (groupId, studentIds) => api.post(`/groups/${groupId}/students`, { studentIds }),
  removeStudent: (groupId, studentId) => api.delete(`/groups/${groupId}/students/${studentId}`),
  delete: (id) => api.delete(`/groups/${id}`),
  getAvailableStudents: () => api.get('/groups/available-students'),
  joinWithCode: (joinCode) => api.post('/groups/join', { joinCode }),
};

// ─── Assignment API ───────────────────────────────────────────────────────────
export const assignmentAPI = {
  assign: (groupId, data) =>
    api.post(`/groups/${groupId}/assignments`, data),
  getGroupAssignments: (groupId) =>
    api.get(`/groups/${groupId}/assignments`),
  getStudentAssignments: (studentId) =>
    api.get(`/students/${studentId}/assignments`),
  remove: (groupId, assignmentId) =>
    api.delete(`/groups/${groupId}/assignments/${assignmentId}`),
  submit: (assignmentId, data) =>
    api.put(`/assignments/${assignmentId}/submit`, data),
};

// ─── Progress API ─────────────────────────────────────────────────────────────
export const progressAPI = {
  getStudentProgress: (studentId) =>
    api.get(`/students/${studentId}/progress`),
};

// ─── User API ─────────────────────────────────────────────────────────────────
export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
};

// ─── Material API ─────────────────────────────────────────────────────────────
export const materialAPI = {
  getAll: () => api.get('/materials'),
};

// ─── Workbook API ─────────────────────────────────────────────────────────────
export const workbookAPI = {
  getAll: (params) => api.get('/workbooks', { params }),
  getOne: (id) => api.get(`/workbooks/${id}`),
  create: (data) => api.post('/workbooks', data),
  update: (id, data) => api.put(`/workbooks/${id}`, data),
  delete: (id) => api.delete(`/workbooks/${id}`),
  addWorksheet: (workbookId, worksheetId, displayOrder) =>
    api.post(`/workbooks/${workbookId}/worksheets/${worksheetId}`, { displayOrder }),
  removeWorksheet: (workbookId, worksheetId) =>
    api.delete(`/workbooks/${workbookId}/worksheets/${worksheetId}`),
  reorder: (workbookId, worksheetOrders) =>
    api.put(`/workbooks/${workbookId}/reorder`, { worksheetOrders }),
  togglePublish: (id) => api.post(`/workbooks/${id}/publish`),
};

export default api;
