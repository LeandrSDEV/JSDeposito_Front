import { ShoppingCart, ChevronDown } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useRef, useEffect } from 'react';
import CartMenu from '../CartMenu/CartMenu';
import './Navbar.css';
import logo from '../../assets/logo.jpeg';
import Marquee from '../Marquee/Marquee';

export default function Navbar() {
  const { items } = useCart();
  const { usuarioNome, logout } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef<HTMLDivElement>(null);

  // Fecha o menu de usuário ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Função para logout
  function handleLogout() {
    logout();
    setUserMenuOpen(false);
  }

  // Função para clicar no login/nome
  function handleUserClick() {
    setUserMenuOpen(!userMenuOpen);
  }

  return (
    <header className="navbar">
      <img src={logo} alt="Logo" className="logo" />

      <Marquee />

      <div className="actions">
        {/* Carrinho */}
        <div className="cart" onClick={() => setCartOpen(!cartOpen)}>
          <ShoppingCart />
          <span>{items.length}</span>
        </div>

        {/* Usuário / Login */}
        <div className="user" ref={userMenuRef}>
          {usuarioNome ? (
            <div className="user-logged" onClick={handleUserClick}>
              <span>{usuarioNome}</span>
              <ChevronDown size={16} className="chevron" />
            </div>
          ) : (
            <a href="/login" className="login-icon">
              Login
            </a>
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
  );
}
