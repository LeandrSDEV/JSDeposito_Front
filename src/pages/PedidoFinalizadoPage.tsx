import { useNavigate } from 'react-router-dom'
import './PedidoFinalizadoPage.css'

export default function PedidoFinalizadoPage() {
  const navigate = useNavigate()
  return (
    <div className="pedido-finalizado">
      <div className="card">
        <h2>Pedido pronto para pagamento</h2>
        <p>
          Seu pedido foi confirmado e está pronto para seguir para o pagamento.
        </p>
        <button className="btn" onClick={() => navigate('/')}>Voltar para a vitrine</button>
      </div>
    </div>
  )
}
