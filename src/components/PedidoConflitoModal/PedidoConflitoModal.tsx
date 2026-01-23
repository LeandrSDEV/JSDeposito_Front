import './PedidoConflitoModal.css'
import { ShoppingCart, ArrowRightLeft, Trash2, X } from 'lucide-react'
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
      // o próximo refresh/add irá carregar novamente
    } catch (err) {
      if (axios.isAxiosError(err)) {
        console.error(err.response?.data)
      }
      console.error(err)
      setPedidoConflito(null)
    }
  }

  if (!isOpen) return null

  const msg =
    pedidoConflito?.message ||
    'Detectamos dois carrinhos: um do seu usuário e outro criado antes do login. Escolha o que fazer.'

  return (
    <div className="pcOverlay" role="dialog" aria-modal="true" aria-label="Conflito de carrinho">
      <div className="pcModal card">
        <button className="pcClose" onClick={() => setPedidoConflito(null)} aria-label="Fechar">
          <X size={18} />
        </button>

        <div className="pcHead">
          <div className="pcIcon">
            <ShoppingCart size={18} />
          </div>
          <div>
            <h2 className="pcTitle">Conflito de carrinho</h2>
            <p className="pcSub">{msg}</p>
          </div>
        </div>

        <div className="pcChoices">
          <button className="pcChoice" onClick={descartarAnonimo}>
            <div className="pcChoiceTop">
              <div className="pcChoiceIco soft">
                <Trash2 size={18} />
              </div>
              <div className="pcChoiceTxt">
                <div className="pcChoiceTitle">Manter meu carrinho do usuário</div>
                <div className="pcChoiceDesc">Descarta o carrinho anônimo (temporário).</div>
              </div>
            </div>
            <div className="pcChoiceCta">
              Continuar <ArrowRightLeft size={16} />
            </div>
          </button>

          <button className="pcChoice danger" onClick={substituirCarrinho}>
            <div className="pcChoiceTop">
              <div className="pcChoiceIco danger">
                <ArrowRightLeft size={18} />
              </div>
              <div className="pcChoiceTxt">
                <div className="pcChoiceTitle">Usar o carrinho anônimo</div>
                <div className="pcChoiceDesc">Substitui o carrinho do usuário pelo atual.</div>
              </div>
            </div>
            <div className="pcChoiceCta">
              Substituir <ArrowRightLeft size={16} />
            </div>
          </button>
        </div>

        <div className="pcFooter">
          <button className="pcGhost" onClick={() => setPedidoConflito(null)}>
            Agora não
          </button>
        </div>
      </div>
    </div>
  )
}
