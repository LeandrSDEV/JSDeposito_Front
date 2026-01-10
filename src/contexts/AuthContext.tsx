import { createContext, useContext, useState, useEffect } from 'react';
import {jwtDecode }from 'jwt-decode';

interface JwtPayload {
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier': string;
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress': string; // email
}

interface AuthContextType {
  usuarioId: string | null;
  usuarioNome: string | null; // agora será derivado do email
  token: string | null;
  refreshToken: string | null;
  login: (email: string, senha: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [usuarioId, setUsuarioId] = useState<string | null>(null);
  const [usuarioNome, setUsuarioNome] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedRefresh = localStorage.getItem('refreshToken');
    const storedUsuarioId = localStorage.getItem('usuarioId');
    const storedUsuarioNome = localStorage.getItem('usuarioNome');

    if (storedToken && storedUsuarioId && storedUsuarioNome) {
      setToken(storedToken);
      setRefreshToken(storedRefresh);
      setUsuarioId(storedUsuarioId);
      setUsuarioNome(storedUsuarioNome);
    }
  }, []);

  async function login(email: string, senha: string) {
    const res = await fetch('https://localhost:7200/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha })
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Erro ao fazer login');
    }

    const data = await res.json();
    const decoded: JwtPayload = jwtDecode(data.accessToken);

    const id = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'];
    const emailToken = decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'];

    const nome = emailToken.split('@')[0]; // ✅ extrai antes do @

    setToken(data.accessToken);
    setRefreshToken(data.refreshToken);
    setUsuarioId(id);
    setUsuarioNome(nome);

    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    localStorage.setItem('usuarioId', id);
    localStorage.setItem('usuarioNome', nome);
  }

  function logout() {
    setToken(null);
    setRefreshToken(null);
    setUsuarioId(null);
    setUsuarioNome(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('usuarioId');
    localStorage.removeItem('usuarioNome');
  }

  return (
    <AuthContext.Provider value={{ usuarioId, usuarioNome, token, refreshToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
