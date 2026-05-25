import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getUserEmail, getUserName } from '../auth'
import { UserProvider } from './UserContext'

const nav = [
  { to: '/', label: 'Dashboard', end: true, icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { to: '/transactions', label: 'Transactions', end: false, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { to: '/add', label: 'Ku dar', end: false, icon: 'M12 4v16m8-8H4' },
  { to: '/categories', label: 'Qaybaha', end: false, icon: 'M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A2 2 0 013 12V7a4 4 0 014-4z' },
  { to: '/reports', label: 'U dir Admin', end: false, icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
]

function LayoutShell() {
  const navigate = useNavigate()
  const name = getUserName() ?? 'User'
  const email = getUserEmail() ?? ''

  const logout = () => {
    clearSession()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-72 flex-col border-r border-pink-100 bg-white shadow-xl shadow-pink-100/40">
        <div className="border-b border-pink-100 px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-pink-500 to-rose-500 text-lg font-bold text-white shadow-lg shadow-pink-300/50">
              K
            </div>
            <div>
              <p className="font-bold text-slate-900">Kaamil Maal</p>
              <p className="text-xs text-pink-500">Expense Tracker</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1.5 px-4 py-6">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg shadow-pink-300/40'
                    : 'text-slate-600 hover:bg-pink-50 hover:text-pink-700'
                }`
              }
            >
              <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-pink-100 p-4">
          <div className="rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 p-4">
            <p className="truncate text-sm font-semibold text-slate-900">{name}</p>
            <p className="truncate text-xs text-slate-500">{email}</p>
          </div>
          <button
            type="button"
            onClick={logout}
            className="mt-3 w-full rounded-xl border border-pink-200 py-2.5 text-sm font-medium text-pink-600 transition hover:bg-pink-50"
          >
            Logout
          </button>
        </div>
      </aside>

      <div className="ml-72 min-h-screen">
        <header className="sticky top-0 z-20 border-b border-pink-100/80 bg-white/80 px-8 py-5 backdrop-blur-md">
          <p className="text-sm font-medium text-pink-500">Kaamil Maal</p>
          <p className="text-xs text-slate-400">Maamul lacagtaada si xirfad leh</p>
        </header>
        <main className="px-8 py-8 pb-16">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default function UserLayout() {
  return (
    <UserProvider>
      <LayoutShell />
    </UserProvider>
  )
}
