import { useCart } from '../../contexts/CartContext'
import { useState } from 'react'
import './CartMenu.css'

interface Props {
  onClose: () => void
}

export default function CartMenu({ onClose }: Props) {
  const { items, total, aplicarCupom, limparCarrinho } = useCart()
  const [cupom, setCupom] = useState('')

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
            <button onClick={() => alert('Finalizar pedido')}>Finalizar pedido</button>
          </div>
        </>
      )}
    </div>
  )
}
