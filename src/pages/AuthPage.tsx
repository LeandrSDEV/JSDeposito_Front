import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
import './AuthPage.css'

export default function AuthPage() {
  const { login } = useAuth()
  const [isLogin, setIsLogin] = useState(true) // true = login, false = cadastro
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [nome, setNome] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const location = useLocation()
  const redirect = new URLSearchParams(location.search).get('redirect') || '/'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, senha)
      setError('')
      navigate(redirect, { replace: true })
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()
    try {
      // 🔹 Aqui você chamaria o endpoint de cadastro
      const res = await fetch('https://localhost:7200/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Erro ao cadastrar')
      }
      alert('Cadastro realizado com sucesso! Faça login.')
      setIsLogin(true)
      setNome('')
      setEmail('')
      setSenha('')
      setError('')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="tabs">
          <button
            className={isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(true); setError('') }}
          >
            Login
          </button>
          <button
            className={!isLogin ? 'active' : ''}
            onClick={() => { setIsLogin(false); setError('') }}
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
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
            <button type="submit">Entrar</button>
          </form>
        ) : (
          <form onSubmit={handleCadastro}>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              required
            />
            <button type="submit">Cadastrar</button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
