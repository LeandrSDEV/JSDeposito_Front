import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'   // import Footer
import Home from './pages/Home'
import { CheckoutPage } from './pages/CheckoutPage'
import AuthPage from './pages/AuthPage'
import { CartProvider } from './contexts/CartContext'
import { AuthProvider } from './contexts/AuthContext'

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation()

  // Se a rota for /login ou /cadastro, não exibe a navbar
  const hideNavbar = location.pathname === '/login' || location.pathname === '/cadastro'

  // Se quiser esconder o footer nessas rotas, use:
  // const hideFooter = hideNavbar

  return (
    <>
      {!hideNavbar && <Navbar />}
      <main>{children}</main>
      {/* Sempre exibe footer */}
      <Footer />
      {/* Se quiser esconder o footer em login/cadastro: */}
      {/* {!hideFooter && <Footer />} */}
    </>
  )
}

function App() {
  return (
    <CartProvider>
      <AuthProvider>
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
      </AuthProvider>
    </CartProvider>
  )
}

export default App
