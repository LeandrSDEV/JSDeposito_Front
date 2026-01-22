import { type Produto } from '../../types/Produto'
import { useCart } from '../../contexts/CartContext'
import { Minus, Plus, Sparkles } from 'lucide-react'
import placeholder from '../../assets/itaipava.jpg'
import './ProductCard.css'

interface Props {
  produto: Produto
}

export default function ProductCard({ produto }: Props) {
  const { addToCart, alterarQuantidade, itens } = useCart()
  const inCart = itens.find((i) => i.produtoId === produto.id)
  const qty = inCart?.quantidade ?? 0

  return (
    <article className="pCard card">
      <div className="pImgWrap">
        <img
          className="pImg"
          src={produto.imagemUrl || placeholder}
          alt={produto.nome}
          loading="lazy"
        />
      </div>
      <div className="pTop">
        <div className="pBadge"><Sparkles size={14} /> Em alta</div>
        <div className="pStock">Estoque: {produto.estoque}</div>
      </div>

      <h3 className="pName">{produto.nome}</h3>

      <div className="pBottom">
        <div>
          <div className="pLabel">Preço</div>
          <div className="pPrice">R$ {produto.preco.toFixed(2)}</div>
        </div>

        {qty > 0 ? (
          <div className="qty">
            <button
              className="qtyBtn"
              onClick={() => alterarQuantidade(produto.id, Math.max(0, qty - 1))}
              aria-label={`Diminuir ${produto.nome}`}
            >
              <Minus size={18} />
            </button>
            <div className="qtyVal" aria-label="Quantidade no carrinho">{qty}</div>
            <button
              className="qtyBtn"
              onClick={() => alterarQuantidade(produto.id, qty + 1)}
              aria-label={`Aumentar ${produto.nome}`}
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <button className="addBtn" onClick={() => addToCart(produto)}>
            <Plus size={18} /> Adicionar
          </button>
        )}
      </div>
    </article>
  )
}
