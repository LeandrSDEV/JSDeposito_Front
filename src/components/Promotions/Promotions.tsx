import { type Produto } from '../../types/Produto'
import { Tag, Plus } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import './Promotions.css'

interface Props {
  produtos: Produto[]
}

export default function Promotions({ produtos }: Props) {
  const { addToCart } = useCart()
  const promocoes = produtos.filter(p => p.preco < 20).slice(0, 6)

  if (!promocoes.length) return null

  return (
    <section id="promocoes" className="promotions container">
      <div className="promoHeader">
        <div>
          <h2 className="promoTitle">Promoções que valem o clique</h2>
          <p className="promoSub">Ofertas rápidas — estilo feed, só que de bebidas.</p>
        </div>
        <div className="promoPill">
          <Tag size={16} />
          <span>Até R$ 19,99</span>
        </div>
      </div>

      <div className="promoList" role="list">
        {promocoes.map((produto) => (
          <div key={produto.id} className="promoCard card" role="listitem">
            <div className="promoBadge">🔥 OFF</div>
            <div className="promoName">{produto.nome}</div>
            <div className="promoRow">
              <div className="promoPrice">R$ {produto.preco.toFixed(2)}</div>
              <button className="promoAdd" onClick={() => addToCart(produto)} aria-label={`Adicionar ${produto.nome}`}>
                <Plus size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
