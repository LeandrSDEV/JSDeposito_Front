import { type Produto } from '../../types/Produto'
import { useCart } from '../../contexts/CartContext'
import { useToast } from '../../contexts/ToastContext'
import { Minus, Plus, Sparkles } from 'lucide-react'
import './ProductCard.css'

interface Props {
  produto: Produto
}

export default function ProductCard({ produto }: Props) {
  const { push } = useToast()
  const { addToCart, alterarQuantidade, itens } = useCart()
  const inCart = itens.find((i) => i.produtoId === produto.id)
  const qty = inCart?.quantidade ?? 0

  return (
    <article className="pCard card">
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
              onClick={() => {
                const next = Math.max(0, qty - 1)
                alterarQuantidade(produto.id, next)
                if (next === 0) push({ variant: 'info', title: 'Removido', message: `${produto.nome} saiu do carrinho` })
                else push({ variant: 'info', title: 'Atualizado', message: `Quantidade de ${produto.nome}: ${next}` })
              }}
              aria-label={`Diminuir ${produto.nome}`}
            >
              <Minus size={18} />
            </button>
            <div className="qtyVal" aria-label="Quantidade no carrinho">{qty}</div>
            <button
              className="qtyBtn"
              onClick={() => {
                const next = qty + 1
                alterarQuantidade(produto.id, next)
                push({ variant: 'success', title: 'Adicionado', message: `${produto.nome} (${next}x) no carrinho ✅` })
              }}
              aria-label={`Aumentar ${produto.nome}`}
            >
              <Plus size={18} />
            </button>
          </div>
        ) : (
          <button className="addBtn" onClick={() => { addToCart(produto); push({ variant: 'success', title: 'Adicionado', message: `${produto.nome} no carrinho ✅` }) }}>
            <Plus size={18} /> Adicionar
          </button>
        )}
      </div>
    </article>
  )
}
