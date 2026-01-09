import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import './Navbar.css'
import logo from '../../assets/logo.jpeg'
import Marquee from '../Marquee/Marquee'

export default function Navbar() {
  const { items } = useCart()

  return (
    <header className="navbar">
      <img src={logo} alt="Logo" className="logo" />

      <Marquee />

      <div className="actions">
        <div className="cart">
          <ShoppingCart />
          <span>{items.length}</span>
        </div>

        <User className="login-icon" />
      </div>
    </header>
  )
}
