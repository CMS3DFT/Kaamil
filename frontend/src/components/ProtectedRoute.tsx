import { Navigate } from 'react-router-dom'
import { getToken, isAdmin } from '../auth'

type Props = {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({ children, adminOnly }: Props) {
  const token = getToken()
  if (!token) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />
  if (!adminOnly && isAdmin()) return <Navigate to="/admin" replace />
  return <>{children}</>
}
