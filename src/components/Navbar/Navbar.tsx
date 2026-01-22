import { ShoppingCart, ChevronDown } from 'lucide-react'
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

  return (
    <header className="navbar">
      <Link to="/" className="logo-link" aria-label="Ir para a vitrine">
        <img src={logo} alt="Logo" className="logo" />
      </Link>

      <Marquee />

      <div className="actions">
        <div className="cart" onClick={() => setCartOpen((v) => !v)} role="button">
          <ShoppingCart />
          <span>{itemCount}</span>
        </div>

        <div className="user" ref={userMenuRef}>
          {isLogged ? (
            <div
              className="user-logged"
              onClick={() => setUserMenuOpen((v) => !v)}
              role="button"
            >
              <span>Minha conta</span>
              <ChevronDown size={16} className="chevron" />
            </div>
          ) : (
            <Link to="/login" className="login-icon">
              Login
            </Link>
          )}

          {userMenuOpen && (
            <div className="user-menu">
              <button onClick={() => alert('Configurações ainda não implementadas')}>
                Configurações
              </button>
              <button onClick={handleLogout}>Sair</button>
            </div>
          )}
        </div>
      </div>

      {cartOpen && <CartMenu onClose={() => setCartOpen(false)} />}
    </header>
  )
}
