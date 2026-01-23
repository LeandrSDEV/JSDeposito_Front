import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import type { Produto } from '../types/Produto'
import Highlights from '../components/Highlights/Highlights'
import Promotions from '../components/Promotions/Promotions'
import ProductGrid from '../components/ProductGrid/ProductGrid'
import { useSearchParams } from 'react-router-dom'
import './Home.css'

// ✅ coloque seus arquivos em src/assets/banners/...
import b1 from '../assets/banners/banner1.gif'
import b2 from '../assets/banners/banner2.jpg'
import b3 from '../assets/banners/banner3.gif'
import b4 from '../assets/banners/banner4.jpg'
import b5 from '../assets/banners/banner5.gif'

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
      {/* Carrossel de banners grande */}
      <Promotions
        banners={[
          { id: 'b1', src: b1, alt: 'Oferta relâmpago', href: '#produtos' },
          { id: 'b2', src: b2, alt: 'Combo especial', href: '#promocoes' },
          { id: 'b3', src: b3, alt: 'Frete grátis', href: '#produtos' },
          { id: 'b4', src: b4, alt: 'Semana do cliente', href: '#produtos' },
          { id: 'b5', src: b5, alt: 'Desconto no PIX', href: '#checkout' },
        ]}
      />

      {/* Mantém seus componentes que dependem da lista filtrada */}
      <Highlights produtos={filtrados} />
      <ProductGrid produtos={filtrados} />
    </main>
  )
}
