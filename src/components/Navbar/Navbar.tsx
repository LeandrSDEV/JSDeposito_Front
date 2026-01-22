import { ShoppingCart, ChevronDown, Search, Sparkles } from 'lucide-react'
import { useMemo, useRef, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import CartMenu from '../CartMenu/CartMenu'
import Marquee from '../Marquee/Marquee'
import logo from '../../assets/logo.jpeg'
import './Navbar.css'

export default function Navbar() {
  const { itens } = useCart()
  const { token, logout } = useAuth()
  const navigate = useNavigate()

  const [cartOpen, setCartOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [q, setQ] = useState('')
  const userMenuRef = useRef<HTMLDivElement | null>(null)

  const isLogged = Boolean(token)

  const itemCount = useMemo(() => {
    return itens.reduce((sum, i) => sum + (i.quantidade || 0), 0)
  }, [itens])

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!userMenuRef.current) return
      if (!userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [])

  function handleLogout() {
    logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  function onSearch(e: React.FormEvent) {
    e.preventDefault()
    const term = q.trim()
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/')
  }

  return (
    <header className="navbar">
      <div className="navbar-inner container">
        <Link to="/" className="logo-link" aria-label="Ir para a vitrine">
          <img src={logo} alt="Logo" className="logo" />
        </Link>

        {/* Removido: "Entregar em / Minha localização" fica apenas dentro do checkout */}

        <form className="search" onSubmit={onSearch} role="search">
          <Search size={18} className="search-ico" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Buscar cerveja, gelo, refrigerante..."
            aria-label="Buscar produtos"
          />
          <button type="submit">Buscar</button>
        </form>

        <div className="actions">
          <button
            className="cartBtn"
            onClick={() => setCartOpen((v) => !v)}
            aria-label="Abrir carrinho"
          >
            <ShoppingCart />
            <span className="badge">{itemCount}</span>
          </button>

          <div className="user" ref={userMenuRef}>
            {isLogged ? (
              <button
                className="user-logged"
                onClick={() => setUserMenuOpen((v) => !v)}
                aria-label="Abrir menu do usuário"
              >
                <span>Minha conta</span>
                <ChevronDown size={16} className="chevron" />
              </button>
            ) : (
              <Link to="/login" className="loginBtn">
                Entrar
              </Link>
            )}

            <div className={`user-menu ${userMenuOpen ? 'open' : ''}`}>
              <button onClick={() => alert('Configurações ainda não implementadas')}>
                Configurações
              </button>
              <button onClick={handleLogout}>Sair</button>
            </div>
          </div>
        </div>
      </div>

      <div className="navbar-sub container">
        <div className="chips">
          <a className="chip" href="#destaques">
            <Sparkles size={16} /> Destaques
          </a>
          <a className="chip" href="#promocoes">
            🔥 Promoções
          </a>
          <a className="chip" href="#produtos">
            🧺 Todos os produtos
          </a>
        </div>

        <div className="ticker">
          <Marquee />
        </div>
      </div>

      {cartOpen && <CartMenu onClose={() => setCartOpen(false)} />}
    </header>
  )
}
