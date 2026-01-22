import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Produto } from '../types/Produto'
import Highlights from '../components/Highlights/Highlights'
import Promotions from '../components/Promotions/Promotions'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import { useSearchParams } from 'react-router-dom'
import './Home.css'
import HomeSkeleton from '../components/Skeletons/HomeSkeleton'

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loading, setLoading] = useState(true)
  const [params] = useSearchParams()
  const q = (params.get('q') || '').trim().toLowerCase()

  useEffect(() => {
    setLoading(true)
    api
      .get<Produto[]>('/produtos')
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false))
  }, [])

  const filtrados = useMemo(() => {
    if (!q) return produtos
    return produtos.filter((p) => p.nome.toLowerCase().includes(q))
  }, [produtos, q])

  if (loading) return <HomeSkeleton />

  return (
    <main>
      <Highlights produtos={filtrados} />
      <Promotions produtos={filtrados} />
      <ProductGrid produtos={filtrados} />
    </main>
  )
}
