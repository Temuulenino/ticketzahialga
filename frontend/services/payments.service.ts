import api from './api'

export const paymentsService = {
  uploadPayment: (data: FormData) =>
    api.post('/payments/upload/', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  getUserPayments: () =>
    api.get('/payments/my/'),

  // Admin
  adminGetPayments: (params?: Record<string, unknown>) =>
    api.get('/payments/admin/list/', { params }),

  adminReviewPayment: (paymentId: string, data: { action: 'approve' | 'reject'; admin_notes?: string }) =>
    api.post(`/payments/admin/${paymentId}/review/`, data),
}
