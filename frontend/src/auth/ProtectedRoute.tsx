import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './AuthContext'

type Props = { adminOnly?: boolean }

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/recipes" replace />

  return <Outlet />
}