import { type Produto } from '../../types/Produto'
import './Promotions.css'

interface Props {
  produtos: Produto[]
}

export default function Promotions({ produtos }: Props) {
  const promocoes = produtos.filter(p => p.preco < 20).slice(0, 6)

  return (
    <section className="promotions">
      <h2>🔥 Em Promoção</h2>

      <div className="promo-list">
        {promocoes.map(produto => (
          <div key={produto.id} className="promo-card">
            {produto.nome}
            <span>R$ {produto.preco.toFixed(2)}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
