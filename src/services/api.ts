import axios from 'axios'
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './authTokens'

// Vite injects only variables prefixed with VITE_
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? 'https://localhost:7200/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Refresh automático de token (1x) quando o backend devolver 401
let isRefreshing = false
let refreshQueue: Array<(token: string | null) => void> = []

function resolveQueue(token: string | null) {
  refreshQueue.forEach((cb) => cb(token))
  refreshQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config

    if (!original || original.__isRetryRequest) {
      return Promise.reject(error)
    }

    if (error.response?.status !== 401) {
      return Promise.reject(error)
    }

    const refreshToken = getRefreshToken()
    if (!refreshToken) {
      // Sem refresh token: desloga silenciosamente
      clearTokens()
      return Promise.reject(error)
    }

    // Se já existe refresh em andamento, enfileira
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        refreshQueue.push((newAccess) => {
          if (!newAccess) return reject(error)
          original.__isRetryRequest = true
          original.headers = original.headers ?? {}
          original.headers.Authorization = `Bearer ${newAccess}`
          resolve(api(original))
        })
      })
    }

    isRefreshing = true

    try {
      const refreshRes = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      )

      const access = refreshRes.data?.accessToken ?? refreshRes.data?.AccessToken
      const refresh = refreshRes.data?.refreshToken ?? refreshRes.data?.RefreshToken

      if (!access || !refresh) {
        clearTokens()
        resolveQueue(null)
        return Promise.reject(error)
      }

      setTokens(String(access), String(refresh))
      resolveQueue(String(access))

      original.__isRetryRequest = true
      original.headers = original.headers ?? {}
      original.headers.Authorization = `Bearer ${String(access)}`
      return api(original)
    } catch (e) {
      clearTokens()
      resolveQueue(null)
      return Promise.reject(e)
    } finally {
      isRefreshing = false
    }
  }
)
