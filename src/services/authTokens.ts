// Centraliza leitura/escrita de tokens para evitar duplicação
// e permitir que o axios interceptor funcione sem depender de React.

const STORAGE_ACCESS = 'token';
const STORAGE_REFRESH = 'refreshToken';

export function getAccessToken(): string | null {
  return localStorage.getItem(STORAGE_ACCESS);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(STORAGE_REFRESH);
}

export function setTokens(accessToken: string, refreshToken: string) {
  localStorage.setItem(STORAGE_ACCESS, accessToken);
  localStorage.setItem(STORAGE_REFRESH, refreshToken);
}

export function clearTokens() {
  localStorage.removeItem(STORAGE_ACCESS);
  localStorage.removeItem(STORAGE_REFRESH);
}
