import { useEffect, useState } from 'react'
import { api } from '../services/api'
import { type Produto } from '../types/Produto'
import ProductCard from '../components/ProductCard/ProductCard'
import '../pages/Home.css'

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    api.get<Produto[]>('/produtos')
      .then(res => setProdutos(res.data))
  }, [])

  return (
    <main className="grid">
      {produtos.map(produto => (
        <ProductCard key={produto.id} produto={produto} />
      ))}
    </main>
  )
}
