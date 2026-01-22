import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Minus, Plus, Trash2 } from 'lucide-react'
import fallbackImg from '../../assets/itaipava.jpg'
import './CartMenu.css'

interface Props {
  onClose: () => void
}

export default function CartMenu({ onClose }: Props) {
  const { itens, total, aplicarCupom, limparCarrinho, codigoCupom, alterarQuantidade, removeFromCart } = useCart()
  const { push } = useToast()
  const { usuarioId } = useAuth()
  const [cupom, setCupom] = useState('')
  const navigate = useNavigate()

  function handleFinalizarPedido() {
    if (!usuarioId) {
      push({ variant: 'info', title: 'Faça login', message: 'Entre para finalizar seu pedido' })
      navigate('/login?redirect=/checkout', { replace: true })
    } else {
      navigate('/checkout')
    }
    onClose()
  }

  return (
    <div className="cart-menu">
      <div className="cart-header">
        <h3>Carrinho</h3>
        <button className="close" onClick={onClose}>
          ×
        </button>
      </div>

      {itens.length === 0 ? (
        <div className="empty-cart">
          <p>Seu carrinho está vazio</p>
        </div>
      ) : (
        <>
          <div className="cart-content">
            {itens.map((item) => (
  <div className="cart-item" key={item.produtoId}>
    <img className="cart-item-img" src={fallbackImg} alt={item.nome} />
    <div className="item-info">
      <h4>{item.nome}</h4>
      <span className="item-price">R$ {item.subtotal.toFixed(2)}</span>

      <div className="cart-item-actions">
        <div className="qtyMini" aria-label="Quantidade">
          <button
            className="qtyBtn"
            onClick={async () => {
              const next = Math.max(0, item.quantidade - 1)
              if (next === 0) await removeFromCart(item.produtoId)
              else await alterarQuantidade(item.produtoId, next)
            }}
            aria-label="Diminuir"
          >
            <Minus size={16} />
          </button>
          <div className="qtyVal">{item.quantidade}</div>
          <button
            className="qtyBtn"
            onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
            aria-label="Aumentar"
          >
            <Plus size={16} />
          </button>
        </div>

        <button
          className="removeOne"
          onClick={async () => {
            await removeFromCart(item.produtoId)
            push({ variant: 'info', title: 'Removido', message: `${item.nome} saiu do carrinho` })
          }}
          aria-label="Remover item"
          title="Remover item"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  </div>
))}
          </div>

          <div className="cart-footer">
            <div className="total">
              <span>Total:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>

            <div className="cupom">
              <input
                type="text"
                placeholder="Código do cupom"
                value={codigoCupom ?? cupom}
                onChange={(e) => setCupom(e.target.value)}
                disabled={!!codigoCupom}
              />
              <button
                className="apply"
                onClick={async () => {
                  try {
                    await aplicarCupom(cupom)
                    push({ variant: 'success', title: 'Cupom aplicado', message: `Cupom ${cupom.toUpperCase()} aplicado ✅` })
                  } catch (e: any) {
                    const msg = e?.message || 'Cupom inválido ou expirado'
                    push({ variant: 'danger', title: 'Cupom inválido', message: msg })
                  }
                }}
                disabled={!!codigoCupom || !cupom.trim()}
              >
                Aplicar
              </button>
            </div>

            <div className="actions">
              <button className="clear" onClick={async () => { await limparCarrinho(); push({ variant: 'info', title: 'Carrinho', message: 'Carrinho limpo' }) }}>
                Limpar
              </button>
              <button className="checkout" onClick={handleFinalizarPedido}>
                Finalizar Pedido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
