const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('access_token')
}

async function request<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
    }
    throw new Error('Unauthorized')
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const message = err.detail || err.error ||
      Object.entries(err)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('\n') ||
      'Server xatosi'
    throw new Error(message)
  }

  const json = await res.json()
  return json
}

function get(path: string, params?: Record<string, any>) {
  let url = path
  if (params) {
    const q = Object.entries(params)
      .filter(([, v]) => v !== undefined && v !== '' && v !== null)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')
    if (q) url += `?${q}`
  }
  return request(url)
}

function post(path: string, body: any) {
  return request(path, { method: 'POST', body: JSON.stringify(body) })
}

function patch(path: string, body: any) {
  return request(path, { method: 'PATCH', body: JSON.stringify(body) })
}

function del(path: string) {
  return request(path, { method: 'DELETE' })
}

// Auth
export const authApi = {
  login: (email: string, password: string) =>
    post('/api/auth/login/', { email, password }),
  logout: (refreshToken: string) =>
    post('/api/auth/logout/', { refresh: refreshToken }),
  me: () => get('/api/auth/me/'),
}

// Dashboard
export const dashboardApi = {
  stats: () => get('/api/dashboard/stats/'),
  revenue: (period: 'week' | 'month' = 'week') =>
    get('/api/dashboard/revenue/', { period }),
  recentPayments: () => get('/api/dashboard/recent-payments/'),
}

// Students
export const studentsApi = {
  list: (params?: Record<string, any>) => get('/api/students/', params),
  get: (id: number) => get(`/api/students/${id}/`),
  create: (data: any) => post('/api/students/', data),
  update: (id: number, data: any) => patch(`/api/students/${id}/`, data),
  delete: (id: number) => del(`/api/students/${id}/`),
  payments: (id: number) => get(`/api/students/${id}/payments/`),
  attendance: (id: number) => get(`/api/students/${id}/attendance/`),
}

// Groups
export const groupsApi = {
  list: (params?: Record<string, any>) => get('/api/groups/', params),
  get: (id: number) => get(`/api/groups/${id}/`),
  create: (data: any) => post('/api/groups/', data),
  update: (id: number, data: any) => patch(`/api/groups/${id}/`, data),
  delete: (id: number) => del(`/api/groups/${id}/`),
  students: (id: number) => get(`/api/groups/${id}/students/`),
}

// Courses
export const coursesApi = {
  list: () => get('/api/courses/'),
  create: (data: any) => post('/api/courses/', data),
  update: (id: number, data: any) => patch(`/api/courses/${id}/`, data),
  delete: (id: number) => del(`/api/courses/${id}/`),
}

// Rooms
export const roomsApi = {
  list: () => get('/api/rooms/'),
  create: (data: any) => post('/api/rooms/', data),
  update: (id: number, data: any) => patch(`/api/rooms/${id}/`, data),
  delete: (id: number) => del(`/api/rooms/${id}/`),
}

// Teachers
export const teachersApi = {
  list: () => get('/api/teachers/'),
  create: (data: any) => post('/api/teachers/', data),
  update: (id: number, data: any) => patch(`/api/teachers/${id}/`, data),
  delete: (id: number) => del(`/api/teachers/${id}/`),
}

// Payments
export const paymentsApi = {
  list: (params?: Record<string, any>) => get('/api/payments/', params),
  create: (data: any) => post('/api/payments/', data),
  delete: (id: number) => del(`/api/payments/${id}/`),
  summary: () => get('/api/payments/summary/'),
}

// Attendance
export const attendanceApi = {
  list: (params?: Record<string, any>) => get('/api/attendance/', params),
  bulk: (data: any) => post('/api/attendance/bulk/', data),
  stats: (params?: Record<string, any>) => get('/api/attendance/stats/', params),
}

// Tests
export const testsApi = {
  list: (params?: Record<string, any>) => get('/api/tests/', params),
  create: (data: any) => post('/api/tests/', data),
  delete: (id: number) => del(`/api/tests/${id}/`),
  results: (id: number) => get(`/api/tests/${id}/results/`),
  submit: (id: number, data: any) => post(`/api/tests/${id}/submit/`, data),
  questions: (id: number) => get(`/api/tests/${id}/questions/`),
  addQuestion: (id: number, data: any) => post(`/api/tests/${id}/questions/`, data),
  deleteQuestion: (testId: number, questionId: number) =>
    del(`/api/tests/${testId}/questions/${questionId}/`),
}

// Debtors
export const debtorsApi = {
  list: (params?: Record<string, any>) => get('/api/debtors/', params),
  notify: (studentIds: number[]) =>
    post('/api/debtors/notify/', { student_ids: studentIds }),
}
