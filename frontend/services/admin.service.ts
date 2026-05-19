import api from './api'

export const adminService = {
  getDashboard: () =>
    api.get('/admin-panel/dashboard/'),

  getUsers: (params?: Record<string, unknown>) =>
    api.get('/users/admin/list/', { params }),

  updateUser: (id: string, data: Record<string, unknown>) =>
    api.patch(`/users/admin/${id}/`, data),
}
