import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from './useAuth.ts'

type Props = { adminOnly?: boolean }

export default function ProtectedRoute({ adminOnly = false }: Props) {
  const { user, loading } = useAuth()

  if (loading) return <p className="page">Loading...</p>;
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/recipes" replace />

  return <Outlet />
}