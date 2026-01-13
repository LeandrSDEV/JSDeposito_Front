import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate, useLocation } from 'react-router-dom'
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

  // 🔥 REDIRECT CONTROLADO
  useEffect(() => {
    if (usuarioId) {
      navigate(redirect, { replace: true })
    }
  }, [usuarioId])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, senha)
      setError('')
      // ❌ NÃO navega aqui
    } catch (err: any) {
      setError(err.message)
    }
  }

  async function handleCadastro(e: React.FormEvent) {
    e.preventDefault()

    try {
      const res = await fetch('https://localhost:7200/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, telefone, senha }),
      })

      if (!res.ok) throw new Error('Erro ao cadastrar')

      alert('Cadastro realizado com sucesso!')
      setIsLogin(true)
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="tabs">
          <button className={isLogin ? 'active' : ''} onClick={() => setIsLogin(true)}>
            Login
          </button>
          <button className={!isLogin ? 'active' : ''} onClick={() => setIsLogin(false)}>
            Cadastro
          </button>
        </div>

        {isLogin ? (
          <form onSubmit={handleLogin}>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} />
            <button type="submit">Entrar</button>
          </form>
        ) : (
          <form onSubmit={handleCadastro}>
            <input value={nome} onChange={e => setNome(e.target.value)} />
            <input value={email} onChange={e => setEmail(e.target.value)} />
            <input value={telefone} onChange={e => setTelefone(e.target.value)} />
            <input type="password" value={senha} onChange={e => setSenha(e.target.value)} />
            <button type="submit">Cadastrar</button>
          </form>
        )}

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
