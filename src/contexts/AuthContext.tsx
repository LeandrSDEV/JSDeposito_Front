import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { api } from '../services/api'
import axios from 'axios'
import { clearTokens, getAccessToken, setTokens } from '../services/authTokens'

export type PedidoConflito = {
  conflitoCarrinho: boolean
  pedidoUsuarioId: number
  pedidoAnonimoId: number
  message?: string
}

type AuthContextType = {
  token: string | null
  usuarioId: number | null
  loading: boolean
  pedidoConflito: PedidoConflito | null
  setPedidoConflito: (v: PedidoConflito | null) => void
  login: (email: string, senha: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// usuarioId é derivado do JWT (nameid)
const STORAGE_USER_ID = 'usuarioId'

function getUserIdFromJwt(token: string): number | null {
  try {
    const payload = token.split('.')[1]
    if (!payload) return null
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    const raw =
      json?.nameid ??
      json?.sub ??
      json?.['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
    const n = Number(raw)
    return Number.isFinite(n) ? n : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [pedidoConflito, setPedidoConflito] = useState<PedidoConflito | null>(null)

  useEffect(() => {
    const savedToken = getAccessToken()
    const savedUserId = localStorage.getItem(STORAGE_USER_ID)

    if (savedToken) {
      setToken(savedToken)
      // tenta reidratar o usuarioId do JWT
      const fromJwt = getUserIdFromJwt(savedToken)
      if (fromJwt != null) {
        setUsuarioId(fromJwt)
        localStorage.setItem(STORAGE_USER_ID, String(fromJwt))
      } else if (savedUserId && !Number.isNaN(Number(savedUserId))) {
        setUsuarioId(Number(savedUserId))
      }
    } else if (savedUserId && !Number.isNaN(Number(savedUserId))) {
      setUsuarioId(Number(savedUserId))
    }

    setLoading(false)
  }, [])

  // Sempre que estiver autenticado, tenta associar o carrinho anônimo (se existir cookie)
  useEffect(() => {
    if (!token || !usuarioId) return

    ;(async () => {
      try {
        await api.post('/pedidos/associar-carrinho')
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 409) {
          setPedidoConflito(err.response.data as PedidoConflito)
          return
        }
        // silencioso: não impede uso do app
        console.error(err)
      }
    })()
  }, [token, usuarioId])

  async function login(email: string, senha: string) {
    const { data } = await api.post('/auth/login', { email, senha })

    const access = data?.accessToken ?? data?.AccessToken ?? data?.token
    const refresh = data?.refreshToken ?? data?.RefreshToken

    if (!access || !refresh) {
      throw new Error('Resposta inválida do servidor de autenticação')
    }

    setTokens(String(access), String(refresh))
    setToken(String(access))

    const uid = getUserIdFromJwt(String(access))
    if (uid != null) {
      localStorage.setItem(STORAGE_USER_ID, String(uid))
      setUsuarioId(uid)
    }

    // associar-carrinho é disparado no useEffect acima
  }

  function logout() {
    clearTokens()
    localStorage.removeItem(STORAGE_USER_ID)
    setToken(null)
    setUsuarioId(null)
    setPedidoConflito(null)
  }

  const value = useMemo(
    () => ({
      token,
      usuarioId,
      loading,
      pedidoConflito,
      setPedidoConflito,
      login,
      logout,
    }),
    [token, usuarioId, loading, pedidoConflito]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
