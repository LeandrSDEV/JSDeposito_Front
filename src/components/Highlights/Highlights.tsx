import { type Produto } from '../../types/Produto'
import './Highlights.css'

interface Props {
  produtos: Produto[]
}

export default function Highlights({ produtos }: Props) {
  const destaques = produtos.slice(0, 2)

  return (
    <section className="highlights">
      {destaques.map(produto => (
        <div key={produto.id} className="highlight-card primary">
          {produto.nome}
          <span>R$ {produto.preco.toFixed(2)}</span>
        </div>
      ))}
    </section>
  )
}
