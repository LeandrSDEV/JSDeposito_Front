import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar/Navbar'
import Footer from './components/Footer/Footer'
import Home from './pages/Home'
import AuthPage from './pages/AuthPage'
import CheckoutPage from './pages/CheckoutPage'
import Contato from './pages/Contato'
import Sobre from './pages/Sobre'
import ProtectedRoute from './services/ProtectedRoute'
import PedidoFinalizadoPage from './pages/PedidoFinalizadoPage'
import PedidoConflitoModal from './components/PedidoConflitoModal/PedidoConflitoModal'
import './App.css'

export default function App() {
  return (
    <Router>
      <div className="appShell">
        <Navbar />
        <PedidoConflitoModal />

        <main className="appMain">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<AuthPage />} />

        <Route
          path="/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />

            <Route path="/pedido-finalizado" element={<PedidoFinalizadoPage />} />
            <Route path="/contato" element={<Contato />} />
            <Route path="/sobre" element={<Sobre />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  )
}
