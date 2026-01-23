import { type Produto } from '../../types/Produto'
import { ArrowRight } from 'lucide-react'
import { useCart } from '../../contexts/CartContext'
import './Highlights.css'

interface Props {
  produtos: Produto[]
}

export default function Highlights({ produtos }: Props) {
  const { addToCart } = useCart()
  const destaques = produtos.slice(0, 3)

  if (!destaques.length) return null

  const [main, ...rest] = destaques

  return (
    <section id="destaques" className="highlights container">
      <div className="hero card">
        <div className="heroTag">Entrega rápida • Gelo • Bebidas • Snacks</div>
        <h1 className="heroTitle">Seu depósito com vibe de app — prático e rápido.</h1>
        <p className="heroSubtitle">
          Adicione ao carrinho e finalize em poucos cliques. {main ? `Comece por: ${main.nome}.` : ''}
        </p>
        <div className="heroActions">
          {main ? (
            <button className="heroBtn" onClick={() => addToCart(main)}>
              Adicionar {main.nome} <ArrowRight size={16} />
            </button>
          ) : null}
          <a className="heroGhost" href="#produtos">
            Ver todos os produtos
          </a>
        </div>
      </div>

      
    </section>
  )
}
