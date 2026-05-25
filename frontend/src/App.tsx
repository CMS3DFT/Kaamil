import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import AdminLayout from './admin/AdminLayout'
import AdminDashboard from './admin/AdminDashboard'
import AdminSettings from './admin/AdminSettings'
import AdminUsers from './admin/AdminUsers'
import ProtectedRoute from './components/ProtectedRoute'
import { getToken, isAdmin } from './auth'
import LoginPage from './pages/LoginPage'
import UserLayout from './user/UserLayout'
import UserAddTransaction from './user/pages/UserAddTransaction'
import UserCategories from './user/pages/UserCategories'
import UserOverview from './user/pages/UserOverview'
import UserTransactions from './user/pages/UserTransactions'
import UserReports from './user/pages/UserReports'
import AdminReports from './admin/AdminReports'

function HomeRedirect() {
  if (!getToken()) return <Navigate to="/login" replace />
  return <Navigate to={isAdmin() ? '/admin' : '/'} replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/home" element={<HomeRedirect />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <UserLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<UserOverview />} />
          <Route path="transactions" element={<UserTransactions />} />
          <Route path="add" element={<UserAddTransaction />} />
          <Route path="categories" element={<UserCategories />} />
          <Route path="reports" element={<UserReports />} />
        </Route>

        <Route
          path="/admin"
          element={
            <ProtectedRoute adminOnly>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
