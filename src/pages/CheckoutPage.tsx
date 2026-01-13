import { useCart } from '../contexts/CartContext'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

export function CheckoutPage() {
  const { pedidoId, total } = useCart()
  const { token } = useAuth()
  const navigate = useNavigate()

  async function handleFinalizar() {
    if (!pedidoId) {
      alert('Nenhum pedido encontrado.')
      return
    }

    try {
      await fetch(`https://localhost:7200/api/pedidos/${pedidoId}/finalizar`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        credentials: 'include',
      })

      navigate('/pedido-finalizado', { replace: true })
    } catch (err) {
      console.error(err)
      alert('Erro ao finalizar pedido')
    }
  }

  return (
    <div className="checkout-page">
      <h2>Resumo do Pedido</h2>

      <p>
        <strong>Nº do Pedido:</strong> {pedidoId}
      </p>

      <p>
        <strong>Total:</strong> R$ {total.toFixed(2)}
      </p>

      <button onClick={handleFinalizar} disabled={!pedidoId}>
        Finalizar Pedido
      </button>
    </div>
  )
}
