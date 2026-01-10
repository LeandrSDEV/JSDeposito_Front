import { ShoppingCart, User, ChevronDown } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartMenu from '../CartMenu/CartMenu';
import './Navbar.css';
import logo from '../../assets/logo.jpeg';
import Marquee from '../Marquee/Marquee';

export default function Navbar() {
  const { items } = useCart();
  const { usuarioId, usuarioNome, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const primeiroNome = usuarioNome || '';

  return (
    <header className="navbar">
      <img src={logo} alt="Logo" className="logo" />
      <Marquee />

      <div className="actions">
        <div className="cart" onClick={() => setOpen(!open)}>
          <ShoppingCart />
          <span>{items.length}</span>
        </div>

        {usuarioId ? (
          <div className="user-menu" onClick={() => setUserMenuOpen(!userMenuOpen)}>
            <span>{primeiroNome}</span>
            <ChevronDown />
            {userMenuOpen && (
              <div className="dropdown">
                <button onClick={logout}>Sair</button>
                {/* Aqui você pode adicionar outras opções de perfil, pedidos etc */}
              </div>
            )}
          </div>
        ) : (
          <div
            className="login-icon"
            onClick={() => navigate('/login', { replace: true })} // 🔹 redireciona para login
            style={{ cursor: 'pointer' }}
          >
            <User />
          </div>
        )}
      </div>

      {open && <CartMenu onClose={() => setOpen(false)} />}
    </header>
  );
}
