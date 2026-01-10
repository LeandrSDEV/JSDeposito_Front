import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartMenu.css';

interface Props {
  onClose: () => void;
}

export default function CartMenu({ onClose }: Props) {
  const { items, total, aplicarCupom, limparCarrinho } = useCart();
  const { usuarioId } = useAuth();
  const [cupom, setCupom] = useState('');
  const navigate = useNavigate();

  function handleFinalizarPedido() {
    if (!usuarioId) {
      navigate('/login', { replace: true });
    } else {
      navigate('/checkout');
    }
    onClose();
  }

  return (
    <div className="cart-menu">
      <div className="cart-header">
        <h3>Carrinho</h3>
        <button className="close" onClick={onClose}>×</button>
      </div>

      {items.length === 0 ? (
        <div className="empty-cart">
          <p>Seu carrinho está vazio</p>
        </div>
      ) : (
        <>
          <div className="cart-content">
            {items.map(item => (
              <div className="cart-item" key={item.produtoId}>
                {item.imagemUrl && <img src={item.imagemUrl} alt={item.nome} className="item-image" />}
                <div className="item-info">
                  <h4>{item.nome}</h4>
                  <span>Quantidade: {item.quantidade}</span>
                  <span className="item-price">R$ {item.subtotal.toFixed(2)}</span>
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
                value={cupom}
                onChange={e => setCupom(e.target.value)}
              />
              <button className="apply" onClick={() => aplicarCupom(cupom)}>Aplicar</button>
            </div>

            <div className="actions">
              <button className="clear" onClick={limparCarrinho}>Limpar</button>
              <button className="checkout" onClick={handleFinalizarPedido}>Finalizar Pedido</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
