import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useToast } from '../../contexts/ToastContext'
import { Minus, Plus, Trash2 } from 'lucide-react'
import placeholder from '../../assets/itaipava.jpg'
import './CartMenu.css'

interface Props {
  onClose: () => void
}

export default function CartMenu({ onClose }: Props) {
  const { itens, total, aplicarCupom, limparCarrinho, codigoCupom, alterarQuantidade, removeFromCart } = useCart()
  const { token } = useAuth()
  const { push } = useToast()
  const [cupom, setCupom] = useState('')
  const navigate = useNavigate()

  function handleFinalizarPedido() {
    // Queremos login antes do checkout/finalização
    if (!token) {
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
                <img className="item-img" src={placeholder} alt={item.nome} />

                <div className="item-info">
                  <h4>{item.nome}</h4>
                  <span className="item-price">R$ {item.subtotal.toFixed(2)}</span>

                  <div className="item-qty">
                    <button
                      className="qty-btn"
                      onClick={() => alterarQuantidade(item.produtoId, Math.max(0, item.quantidade - 1))}
                      aria-label="Diminuir"
                    >
                      <Minus size={18} />
                    </button>
                    <div className="qty-val">{item.quantidade}</div>
                    <button
                      className="qty-btn"
                      onClick={() => alterarQuantidade(item.produtoId, item.quantidade + 1)}
                      aria-label="Aumentar"
                    >
                      <Plus size={18} />
                    </button>

                    <button
                      className="trash"
                      onClick={() => removeFromCart(item.produtoId)}
                      aria-label="Remover item"
                      title="Remover item"
                    >
                      <Trash2 size={18} />
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
                    push({ variant: 'success', title: 'Cupom aplicado', message: 'Desconto adicionado ✅' })
                    setCupom('')
                  } catch (e: any) {
                    push({
                      variant: 'error',
                      title: 'Cupom inválido/expirado',
                      message: e?.message ?? 'Verifique o código e tente novamente.',
                    })
                  }
                }}
                disabled={!!codigoCupom || !cupom.trim()}
              >
                Aplicar
              </button>
            </div>

            <div className="actions">
              <button
                className="clear"
                onClick={async () => {
                  await limparCarrinho()
                  push({ variant: 'info', title: 'Carrinho', message: 'Carrinho limpo' })
                }}
              >
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
