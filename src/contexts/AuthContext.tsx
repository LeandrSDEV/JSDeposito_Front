import { createContext, useContext, useEffect, useState } from 'react'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string
}

interface AuthContextType {
  usuarioId: string | null
  usuarioNome: string | null
  token: string | null
  refreshToken: string | null
  loading: boolean
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [refreshToken, setRefreshToken] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<string | null>(null)
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = localStorage.getItem('token')
    const storedRefresh = localStorage.getItem('refreshToken')

    if (storedToken) {
      const decoded: JwtPayload = jwtDecode(storedToken)
      setToken(storedToken)
      setRefreshToken(storedRefresh)
      setUsuarioId(
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
      )
      setUsuarioNome(
        decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'].split('@')[0]
      )
    }

    setLoading(false)
  }, [])

  async function login(email: string, senha: string) {
    const res = await fetch('https://localhost:7200/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, senha })
    })

    if (!res.ok) throw new Error('Credenciais inválidas')

    const data = await res.json()
    const decoded: JwtPayload = jwtDecode(data.accessToken)

    setToken(data.accessToken)
    setRefreshToken(data.refreshToken)
    setUsuarioId(
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    )
    setUsuarioNome(
      decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'].split('@')[0]
    )

    localStorage.setItem('token', data.accessToken)
    localStorage.setItem('refreshToken', data.refreshToken)

    await fetch('https://localhost:7200/api/pedidos/associar-carrinho', {
    method: 'POST',
    credentials: 'include'
    })
  }

  

  function logout() {
    setToken(null)
    setRefreshToken(null)
    setUsuarioId(null)
    setUsuarioNome(null)
    localStorage.clear()
  }

  return (
    <AuthContext.Provider
      value={{ usuarioId, usuarioNome, token, refreshToken, login, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
