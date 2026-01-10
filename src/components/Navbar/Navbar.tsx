import { ShoppingCart, User } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import { useState } from 'react'
import CartMenu from '../CartMenu/CartMenu'
import './Navbar.css'
import logo from '../../assets/logo.jpeg'
import Marquee from '../Marquee/Marquee'

export default function Navbar() {
  const { items } = useCart()
  const [open, setOpen] = useState(false)

  return (
    <header className="navbar">
      <img src={logo} alt="Logo" className="logo" />

      <Marquee />

      <div className="actions">
        <div className="cart" onClick={() => setOpen(!open)}>
          <ShoppingCart />
          <span>{items.length}</span>
        </div>

        <User className="login-icon" />
      </div>

      {open && <CartMenu onClose={() => setOpen(false)} />}
    </header>
  )
}
