// Centraliza leitura/escrita de tokens para evitar duplicação
// e permitir que o axios interceptor funcione sem depender de React.

const STORAGE_ACCESS = 'token'
const STORAGE_REFRESH = 'refreshToken'

// Dispara eventos para que o React reaja a mudanças feitas fora do ciclo do React
// (ex.: interceptor do axios limpando tokens quando recebe 401).
const EVT = 'auth:tokens'

function emit() {
  try {
    window.dispatchEvent(new CustomEvent(EVT))
  } catch {
    // ignore
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_REFRESH)
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE_ACCESS, accessToken)
  localStorage.setItem(STORAGE_REFRESH, refreshToken)
  emit()
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS)
  localStorage.removeItem(STORAGE_REFRESH)
  emit()
}

export function onTokensChange(handler: () => void) {
  window.addEventListener(EVT, handler)
  return () => window.removeEventListener(EVT, handler)
}
