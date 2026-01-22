import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Produto } from '../types/Produto'
import Highlights from '../components/Highlights/Highlights'
import Promotions from '../components/Promotions/Promotions'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import './Home.css'

export default function Home() {
  const [produtos, setProdutos] = useState<Produto[]>([])

  useEffect(() => {
    api
      .get<Produto[]>('/produtos')
      .then((res) => setProdutos(res.data))
      .catch((err) => console.error(err))
  }, [])

  return (
    <main>
      <Highlights produtos={produtos} />
      <Promotions produtos={produtos} />
      <ProductGrid produtos={produtos} />
    </main>
  )
}
