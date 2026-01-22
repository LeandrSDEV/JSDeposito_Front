import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Produto } from '../types/Produto'
import Highlights from '../components/Highlights/Highlights'
import Promotions from '../components/Promotions/Promotions'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import { useSearchParams } from 'react-router-dom'
import './Home.css'

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()

  useEffect(() => {
    api
      .get<Produto[]>('/produtos')
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error(err))
  }, [])

  const filtrados = useMemo(() => {
    if (!q) return produtos
    return produtos.filter((p) => p.nome.toLowerCase().includes(q))
  }, [produtos, q])

  return (
    <main>
      <Highlights produtos={filtrados} />
      <Promotions produtos={filtrados} />
      <ProductGrid produtos={filtrados} />
    </main>
  )
}
