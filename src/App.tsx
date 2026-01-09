import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import { CartProvider } from './contexts/CartContext'

function App() {
  return (
    <CartProvider>
      <Navbar />
      <Home />
    </CartProvider>
  )
}

export default App
