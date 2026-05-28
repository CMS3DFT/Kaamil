import { Outlet, useNavigate } from 'react-router-dom'
import { clearSession, getUserEmail, getUserName } from '../auth'
import MobileNavShell, { type NavItem } from '../components/MobileNavShell'
import { UserProvider } from './UserContext'

const nav: NavItem[] = [
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
    <MobileNavShell
      variant="user"
      nav={nav}
      brandTitle="Kaamil Maal"
      brandSubtitle="Expense Tracker"
      headerTitle="Kaamil Maal"
      headerSubtitle="Maamul lacagtaada si xirfad leh"
      userName={name}
      userEmail={email}
      onLogout={logout}
    >
      <Outlet />
    </MobileNavShell>
  )
}

export default function UserLayout() {
  return (
    <UserProvider>
      <LayoutShell />
    </UserProvider>
  )
}
