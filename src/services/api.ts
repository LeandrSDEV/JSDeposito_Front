import axios from 'axios'

// Vite injects only variables prefixed with VITE_
export const API_BASE_URL =
  (import.meta as any).env?.VITE_API_URL ?? 'https://localhost:7200/api'

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers = config.headers ?? {}
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
