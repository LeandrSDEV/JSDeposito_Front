import { type Produto } from '../../types/Produto'
import ProductCard from '../ProductCard/ProductCard'
import './ProductGrid.css'

interface Props {
  produtos: Produto[]
}

export default function ProductGrid({ produtos }: Props) {
  const disponiveis = produtos.filter(p => p.estoque > 0)
  return (
    <section id="produtos" className="products container">
      <div className="productsHeader">
        <h2 className="productsTitle">Vitrine</h2>
        <p className="productsSub">Escolha, adicione e finalize. Simples e rápido.</p>
      </div>

      <div className="grid">
        {disponiveis.map(produto => (
          <ProductCard key={produto.id} produto={produto} />
        ))}
      </div>

      {!disponiveis.length ? (
        <div className="empty card">
          <h3>Nenhum produto encontrado.</h3>
          <p>Tente outro termo de busca ou volte mais tarde.</p>
        </div>
      ) : null}
    </section>
  )
}
