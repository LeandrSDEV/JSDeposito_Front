import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Home from './pages/Home'
import {CheckoutPage} from './pages/CheckoutPage'
import AuthPage from './pages/AuthPage'
import { CartProvider } from './contexts/CartContext'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()
  
  // Se a rota for /login ou /cadastro, não exibe a navbar
  const hideNavbar = location.pathname === '/login' || location.pathname === '/cadastro'

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/cadastro" element={<AuthPage />} />
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  )
}

export default App
