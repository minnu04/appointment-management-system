import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('camp-token')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

export const authApi = {
  register: (payload) => api.post('/auth/register', payload),
  login: (payload) => api.post('/auth/login', payload),
  verifyOtp: (payload) => api.post('/auth/verify-otp', payload),
  resendOtp: (payload) => api.post('/auth/resend-otp', payload),
  me: () => api.get('/auth/me'),
}

export const dashboardApi = {
  get: () => api.get('/dashboard'),
}

export const slotsApi = {
  available: (params) => api.get('/slots/available', { params }),
  faculty: () => api.get('/slots/faculty'),
  create: (payload) => api.post('/slots', payload),
}

export const appointmentsApi = {
  book: (payload) => api.post('/appointments/book', payload),
  student: () => api.get('/appointments/student'),
  faculty: () => api.get('/appointments/faculty'),
  approve: (id) => api.put(`/appointments/${id}/approve`),
  reject: (id, payload) => api.put(`/appointments/${id}/reject`, payload),
  cancel: (id, payload) => api.put(`/appointments/${id}/cancel`, payload),
  complete: (id) => api.put(`/appointments/${id}/complete`),
}

export const adminApi = {
  overview: () => api.get('/admin/overview'),
  users: () => api.get('/admin/users'),
  faculty: () => api.get('/admin/faculty'),
  approveFaculty: (id) => api.put(`/admin/faculty/${id}/approve`),
  rejectFaculty: (id, payload) => api.put(`/admin/faculty/${id}/reject`, payload),
}

export default api