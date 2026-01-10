// CheckoutPage.tsx
import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function CheckoutPage() {
  const { pedidoId, total } = useCart()
  const { usuarioId, token } = useAuth()
  const navigate = useNavigate()

  async function finalizarPedido() {
    if (!usuarioId) {
      // 🔹 Redireciona direto para a página de login
      navigate('/login', { replace: true })
      return
    }

    if (pedidoId) {
      await fetch(`https://localhost:7200/api/pedidos/associar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          tokenAnonimo: localStorage.getItem('pedido_anonimo'),
          usuarioId
        })
      })
    }

    // Redireciona para "Pedido finalizado"
    navigate('/pedido-finalizado')
  }

  return (
    <div>
      <h2>Resumo do Pedido</h2>
      <p>Total: R$ {total.toFixed(2)}</p>
      <button onClick={finalizarPedido}>Finalizar Pedido</button>
    </div>
  )
}
