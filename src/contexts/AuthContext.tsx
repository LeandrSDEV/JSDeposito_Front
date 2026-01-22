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

const STORAGE_TOKEN = 'token'
const STORAGE_USER_ID = 'usuarioId'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [usuarioId, setUsuarioId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [pedidoConflito, setPedidoConflito] = useState<PedidoConflito | null>(null)

  useEffect(() => {
    const savedToken = localStorage.getItem(STORAGE_TOKEN)
    const savedUserId = localStorage.getItem(STORAGE_USER_ID)

    if (savedToken) setToken(savedToken)
    if (savedUserId && !Number.isNaN(Number(savedUserId))) {
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

    if (!data?.token || !data?.usuarioId) {
      throw new Error('Resposta inválida do servidor de autenticação')
    }

    localStorage.setItem(STORAGE_TOKEN, String(data.token))
    localStorage.setItem(STORAGE_USER_ID, String(data.usuarioId))

    setToken(String(data.token))
    setUsuarioId(Number(data.usuarioId))

    // associar-carrinho é disparado no useEffect acima
  }

  function logout() {
    localStorage.removeItem(STORAGE_TOKEN)
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
