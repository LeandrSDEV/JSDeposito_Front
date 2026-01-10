import { type Produto } from '../../types/Produto'
import { useCart } from '../../contexts/CartContext'
import './ProductCard.css'

interface Props {
  produto: Produto
}

export default function ProductCard({ produto }: Props) {
  const { addToCart } = useCart()

  return (
    <div className="card">
      <h3>{produto.nome}</h3>
      <p>R$ {produto.preco.toFixed(2)}</p>

      <button onClick={() => addToCart(produto)}>
        Adicionar ao carrinho
      </button>
    </div>
  )
}
