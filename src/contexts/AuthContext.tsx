import { createContext, useContext, useState } from 'react'

interface AuthContextData {
  usuarioId: number | null
  token: string | null
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData)
const API = 'https://localhost:7200/api'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [token, setToken] = useState<string | null>(null)

  async function login(email: string, senha: string) {
    const res = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    })

    if (!res.ok) throw new Error('Email ou senha inválidos')

    const data = await res.json()
    setUsuarioId(data.usuarioId)
    setToken(data.token)
    localStorage.setItem('token', data.token)
    localStorage.setItem('usuarioId', data.usuarioId)
  }

  function logout() {
    setUsuarioId(null)
    setToken(null)
    localStorage.removeItem('token')
    localStorage.removeItem('usuarioId')
  }

  return (
    <AuthContext.Provider value={{ usuarioId, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
