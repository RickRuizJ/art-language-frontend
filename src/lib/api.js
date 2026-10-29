import axios from 'axios';

const API_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api').replace(/\/+$/,'');

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 20000,
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
      const publicPaths = ['/login', '/register', '/', '/forgot-password', '/reset-password', '/change-password'];
      if (!publicPaths.includes(window.location.pathname)) {
        window.location.href = '/login';
      }
    }
    if(error.response?.status===403 && error.response?.data?.code==='PASSWORD_CHANGE_REQUIRED' && typeof window!=='undefined') window.location.href='/change-password';
    return Promise.reject(error);
  }
);

// ─── Auth API ─────────────────────────────────────────────────────────────────
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getMe: (config) => api.get('/auth/me', config),
  refreshToken: () => api.post('/auth/refresh'),
  changePassword: (currentPassword,password) => api.post('/auth/change-password',{currentPassword,password}),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.post('/auth/reset-password', { token, password }),
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
  saveExternalLink: (data) => api.post('/worksheets/external-link', data),
  saveGoogleLink: (data) => api.post('/worksheets/google-link', data),
};

// ─── Submission API ───────────────────────────────────────────────────────────
export const submissionAPI = {
  submit: (data) => api.post('/submissions', data),
  getOne: (id) => api.get(`/submissions/${id}`),
  getByStudent: (studentId, params) => api.get(`/submissions/student/${studentId}`, { params }),
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
  rotateRegistrationCode: groupId => api.post(`/groups/${groupId}/registration-code/rotate`),
};

// ─── Assignment API ───────────────────────────────────────────────────────────
// SPRINT 0 FIX: `getStudentAssignments` and `submit` pointed at backend routes
// that never existed in app.js (they lived only in the now-deleted, never-
// mounted routes/assignmentRoutes.js) and were not called from any page —
// dead code. `getStudentAssignments` is fixed here to hit the real endpoint
// (GET /api/students/assignments, self-scoped via the auth token). `submit`
// is removed until the Student Player (Sprint 4) needs a real submit-
// assignment endpoint — worksheet answers are already submitted via
// submissionAPI, not assignmentAPI.
export const assignmentAPI = {
  assign: (groupId, data) =>
    api.post(`/groups/${groupId}/assignments`, data),
  getGroupAssignments: (groupId) =>
    api.get(`/groups/${groupId}/assignments`),
  getMyAssignments: () =>
    api.get('/students/assignments'),
  remove: (groupId, assignmentId) =>
    api.delete(`/groups/${groupId}/assignments/${assignmentId}`),
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
export const managementAPI = {
  profile: id => api.get(`/teachers/students/${id}/profile`),
  getStudents: () => api.get('/manage-students'),
  createStudent: data => api.post('/manage-students', data),
  updateStudent: (id, data) => api.patch(`/manage-students/${id}`, data),
  requestReset: id => api.post(`/manage-students/${id}/password-reset`),
  setPassword: (id, password) => api.post(`/manage-students/${id}/set-password`, { password }),
  addToGroup: (id, groupId) => api.post(`/manage-students/${id}/groups/${groupId}`),
  removeFromGroup: (id, groupId) => api.delete(`/manage-students/${id}/groups/${groupId}`),
};
export const manualGradeAPI = {
  list: params => api.get('/manual-grades', { params }),
  create: data => api.post('/manual-grades', data),
  update: (id, data) => api.patch(`/manual-grades/${id}`, data),
  archive: (id,data) => api.delete(`/manual-grades/${id}`,{data}),
  options: groupId => api.get('/manual-grades/options',{params:{groupId}}),
  export: params => api.get('/manual-grades/export',{params,responseType:'blob'}),
  history: id => api.get(`/manual-grades/${id}/history`),
};


// ─── Teacher API ──────────────────────────────────────────────────────────────
export const teacherAPI = {
  getDashboardStats: () => api.get('/teachers/dashboard-stats'),
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


// ─── Messaging API ────────────────────────────────────────────────────────────
export const messageAPI = {
  getInbox: (params, config = {}) => api.get('/messages/inbox', { ...config, params: { ...params, ...config.params } }),
  getSent: (params) => api.get('/messages/sent', { params }),
  send: (data) => api.post('/messages', data),
  markRead: (id) => api.patch(`/messages/${id}/read`),
};

export default api;
