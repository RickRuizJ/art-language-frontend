// =====================================================
// AGREGAR A: frontend/src/lib/api.js
// =====================================================

// Assignment API
export const assignmentAPI = {
  // Assign worksheet to group
  assign: (groupId, data) => 
    api.post(`/groups/${groupId}/assignments`, data),
  
  // Get group assignments
  getGroupAssignments: (groupId) => 
    api.get(`/groups/${groupId}/assignments`),
  
  // Remove assignment
  remove: (groupId, assignmentId) => 
    api.delete(`/groups/${groupId}/assignments/${assignmentId}`)
};

// =====================================================
// Uso:
// import { assignmentAPI } from '@/lib/api';
//
// await assignmentAPI.assign(groupId, {
//   worksheetId: 'abc-123',
//   dueDate: '2026-02-20',
//   instructions: 'Complete all questions'
// });
// =====================================================
