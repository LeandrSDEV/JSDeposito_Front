import './PedidoConflitoModal.css'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { api } from '../../services/api'
import axios from 'axios'

export default function PedidoConflitoModal() {
  const { pedidoConflito, setPedidoConflito } = useAuth()
  const { resetarCarrinho, refreshPedido } = useCart()

  const isOpen = Boolean(pedidoConflito)

  async function descartarAnonimo() {
    try {
      await api.post('/pedidos/descartar-anonimo')
      setPedidoConflito(null)
      // carrinho anônimo foi descartado, mantém o carrinho do usuário
      await refreshPedido().catch(() => {})
    } catch (err) {
      console.error(err)
      setPedidoConflito(null)
    }
  }

  async function substituirCarrinho() {
    try {
      await api.post('/pedidos/substituir')
      // após substituir, o pedido anônimo vira o carrinho do usuário
      setPedidoConflito(null)
      resetarCarrinho()
      // o próximo add/refresh irá carregar novamente
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data)
      }
      console.error(err)
      setPedidoConflito(null)
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal-content">
        <h2>Conflito de carrinho</h2>
        <p>
          Você já possui um carrinho ativo. O que deseja fazer com o carrinho
          anônimo atual?
        </p>

        <div className="modal-buttons">
          <button className="modal-btn" onClick={descartarAnonimo}>
            Descartar carrinho anônimo
          </button>

          <button className="modal-btn" onClick={substituirCarrinho}>
            Substituir carrinho do usuário
          </button>

          <button
            className="modal-btn modal-btn-secondary"
            onClick={() => setPedidoConflito(null)}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}
