import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import type { JSX } from 'react'

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { usuarioId, loading } = useAuth()
  const location = useLocation()

  if (loading) return null

  if (!usuarioId) {
    return (
      <Navigate
        to={`/login?redirect=${location.pathname}`}
        replace
      />
    )
  }

  return children
}
