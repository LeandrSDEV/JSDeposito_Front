import { useCart } from '../../contexts/CartContext'
import { useAuth } from '../../contexts/AuthContext'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './CartMenu.css'

interface Props {
  onClose: () => void
}

export default function CartMenu({ onClose }: Props) {
  const { items, total, aplicarCupom, limparCarrinho } = useCart()
  const { usuarioId } = useAuth()
  const [cupom, setCupom] = useState('')
  const navigate = useNavigate()

  function handleFinalizarPedido() {
    if (!usuarioId) {
      // 🔹 usuário não logado → redireciona para login
      navigate('/login', { replace: true })
    } else {
      // 🔹 usuário logado → redireciona para checkout
      navigate('/checkout')
    }
    onClose() // opcional: fecha o menu
  }

  return (
    <div className="cart-menu">
      <button className="close" onClick={onClose}>×</button>

      {items.length === 0 ? (
        <p>Carrinho vazio</p>
      ) : (
        <>
          <ul className="cart-items">
            {items.map(item => (
              <li key={item.produtoId}>
                {item.imagemUrl && <img src={item.imagemUrl} alt={item.nome} />}
                <div>
                  <h4>{item.nome}</h4>
                  <p>Quantidade: {item.quantidade}</p>
                  <p>Subtotal: R$ {item.subtotal.toFixed(2)}</p>
                </div>
              </li>
            ))}
          </ul>

          <p className="total">Total: R$ {total.toFixed(2)}</p>

          <div className="cupom">
            <input
              type="text"
              placeholder="Código do cupom"
              value={cupom}
              onChange={e => setCupom(e.target.value)}
            />
            <button onClick={() => aplicarCupom(cupom)}>Aplicar</button>
          </div>

          <div className="actions">
            <button onClick={limparCarrinho}>Limpar carrinho</button>
            <button onClick={handleFinalizarPedido}>Finalizar pedido</button>
          </div>
        </>
      )}
    </div>
  )
}
