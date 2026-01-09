import { type Produto } from '../../types/Produto'
import ProductCard from '../ProductCard/ProductCard'
import './ProductGrid.css'

interface Props {
  produtos: Produto[]
}

export default function ProductGrid({ produtos }: Props) {
  return (
    <section className="products">
      <h2>🛒 Todos os Produtos</h2>

      <div className="grid">
        {produtos
          .filter(p => p.estoque > 0)
          .map(produto => (
            <ProductCard key={produto.id} produto={produto} />
          ))}
      </div>
    </section>
  )
}
