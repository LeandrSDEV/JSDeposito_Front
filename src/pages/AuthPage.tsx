import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import { api } from '../services/api'
import axios from 'axios'
import './AuthPage.css'

export default function AuthPage() {
  const { login, usuarioId } = useAuth()

  const [isLogin, setIsLogin] = useState(true)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [telefone, setTelefone] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')

  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  useEffect(() => {
    if (usuarioId) navigate(redirect, { replace: true })
  }, [usuarioId, navigate, redirect])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, senha)
      setError('')
    } catch (err: any) {
      setError(err?.message ?? 'Falha ao autenticar')
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    try {
      await api.post('/auth/register', { nome, email, telefone, senha })
      alert('Cadastro realizado com sucesso!')
      setIsLogin(true)
      setError('')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const msg = (err.response?.data as any)?.message
        setError(msg || 'Erro ao cadastrar')
        return
      }
      setError('Erro ao cadastrar')
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero card">
          <div className="auth-tag">🛵 Depósito delivery</div>
          <h1 className="auth-title">Entre e finalize em minutos.</h1>
          <p className="auth-sub">
            Uma experiência mais moderna, com pegada magazine/iFood: rápido, direto e com um carrinho sempre a um clique.
          </p>
          <ul className="auth-bullets">
            <li>Checkout ágil</li>
            <li>Tokens com refresh automático</li>
            <li>UI com micro-interações</li>
          </ul>
        </div>

        <div className="auth-card card">
          <div className="tabs">
          <button
            type="button"
            className={isLogin ? 'active' : ''}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            type="button"
            className={!isLogin ? 'active' : ''}
            onClick={() => setIsLogin(false)}
          >
            Cadastro
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
          </form>
        ) : (
          <form onSubmit={handleCadastro}>
            <input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              placeholder="Telefone"
              value={telefone}
              onChange={(e) => setTelefone(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <button type="submit">Cadastrar</button>
          </form>
        )}

          {error && <p className="error">{error}</p>}
        </div>
      </div>
    </div>
  )
}
