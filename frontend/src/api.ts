export type Transaction = {
  id: string
  description: string
  category: string
  amount: number
  date: string
  type: 'expense' | 'income'
}

export type AdminUser = {
  id: string
  email: string
  fullName: string
  role: string
  isActive: boolean
  createdAt: string
}

export type Report = {
  id: string
  title: string
  message: string | null
  createdAt: string
  userEmail?: string
  userFullName?: string
}

export type AdminStats = {
  totalUsers: number
  activeUsers: number
  totalTransactions: number
  totalReports: number
}

import { getToken } from './auth'

const RAILWAY_API = 'https://kaamil-production.up.railway.app'

/**
 * Dev: empty → Vite proxy /api → localhost:5177
 * Prod: VITE_API_URL or Railway fallback (CORS enabled on backend)
 */
export const API_BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') ||
  (import.meta.env.PROD ? RAILWAY_API : '')

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  let res: Response
  try {
    res = await fetch(`${API_BASE}/api${path}`, { ...options, headers })
  } catch {
    throw new Error(
      import.meta.env.PROD
        ? 'Backend lama gaarin. Vercel: redeploy kadib vercel.json proxy. Railway: hubi /health'
        : 'Backend lama gaarin. Fur start-backend.cmd (localhost:5177).',
    )
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    const msg = (err as { message?: string }).message
    if (res.status === 404) {
      throw new Error(
        msg && msg !== 'Not Found'
          ? msg
          : 'API lama helin. Hubi in backend-ku socdo: cd backend → dotnet run',
      )
    }
    if (res.status === 401) throw new Error(msg ?? 'Email ama password waa khalad.')
    if (res.status === 500) throw new Error(msg ?? 'Server error — Railway JWT_KEY hubi oo redeploy.')
    if (res.status === 409) throw new Error(msg ?? 'Email-kan hore ayaa loo diiwaangeliyay.')
    if (res.status === 502 || res.status === 503) {
      throw new Error('Bad Gateway — backend ma socdo. Fur start-backend.cmd kadib isku day.')
    }
    throw new Error(msg ?? 'Khalad ayaa dhacay. Isku day mar kale.')
  }
  if (res.status === 204) return undefined as T
  const data = await res.json()
  return data as T
}

function mapReport(r: Record<string, unknown>): Report {
  return {
    id: String(r.id),
    title: String(r.title),
    message: (r.message ?? r.description ?? null) as string | null,
    createdAt: String(r.createdAt),
    userEmail: r.userEmail as string | undefined,
    userFullName: r.userFullName as string | undefined,
  }
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; email: string; role: string; fullName: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (email: string, password: string, fullName: string) =>
    request<{ token: string; email: string; role: string; fullName: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, fullName }),
    }),

  getTransactions: () => request<Transaction[]>('/transactions'),

  createTransaction: (data: Omit<Transaction, 'id'>) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTransaction: (id: string, description: string, amount: number) =>
    request<Transaction>(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ description, amount }),
    }),

  deleteTransaction: (id: string) =>
    request<void>(`/transactions/${id}`, { method: 'DELETE' }),

  getCategories: () => request<{ name: string }[]>('/categories'),

  createCategory: (name: string) =>
    request<{ name: string }>('/categories', {
      method: 'POST',
      body: JSON.stringify({ name }),
    }),

  getTotals: () =>
    request<{ savedIncome: number; savedExpense: number; savedSavings: number }>('/totals'),

  updateTotals: (savedIncome: number, savedExpense: number, savedSavings: number) =>
    request<{ savedIncome: number; savedExpense: number; savedSavings: number }>('/totals', {
      method: 'PUT',
      body: JSON.stringify({ savedIncome, savedExpense, savedSavings }),
    }),

  adminGetStats: () => request<AdminStats>('/admin/stats'),

  adminGetUsers: () => request<AdminUser[]>('/admin/users'),

  adminCreateUser: (data: {
    email: string
    password: string
    fullName: string
    role: string
  }) =>
    request<AdminUser>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  adminUpdateUser: (
    id: string,
    data: { email: string; fullName: string; role: string; isActive: boolean },
  ) =>
    request<AdminUser>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adminResetPassword: (id: string, newPassword: string) =>
    request<void>(`/admin/users/${id}/password`, {
      method: 'PUT',
      body: JSON.stringify({ newPassword }),
    }),

  adminDeleteUser: (id: string) =>
    request<void>(`/admin/users/${id}`, { method: 'DELETE' }),

  adminChangePassword: (currentPassword: string, newPassword: string) =>
    request<void>('/admin/change-password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    }),

  getMyReports: async () => {
    const list = await request<Record<string, unknown>[]>('/reports')
    return list.map(mapReport)
  },

  sendReport: async (message: string) => {
    const r = await request<Record<string, unknown>>('/reports', {
      method: 'POST',
      body: JSON.stringify({ message }),
    })
    return mapReport(r)
  },

  deleteReport: (id: string) => request<void>(`/reports/${id}`, { method: 'DELETE' }),

  adminGetReports: async () => {
    const list = await request<Record<string, unknown>[]>('/admin/reports')
    return list.map(mapReport)
  },

  adminDeleteReport: (id: string) => request<void>(`/admin/reports/${id}`, { method: 'DELETE' }),
}
