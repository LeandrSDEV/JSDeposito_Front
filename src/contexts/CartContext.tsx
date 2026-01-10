import { createContext, useContext, useState } from 'react'
import { type Produto } from '../types/Produto'

interface CartItem {
  produtoId: number
  nome: string
  precoUnitario: number
  quantidade: number
  subtotal: number
  imagemUrl: string
}

interface CartContextData {
  pedidoId: number | null
  items: CartItem[]
  total: number
  addToCart: (produto: Produto) => Promise<void>
  aplicarCupom: (codigo: string) => Promise<void>
  limparCarrinho: () => Promise<void>
}

const CartContext = createContext<CartContextData>({} as CartContextData)
const API = 'https://localhost:7200/api'

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const [items, setItems] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)

  async function criarPedidoSeNecessario(itens: { produtoId: number; quantidade: number }[] = []) {
  if (pedidoId) return pedidoId

  const res = await fetch(`${API}/pedidos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ itens }) // envia os itens iniciais
  })
  const data = await res.json()
  setPedidoId(data.pedidoId)
  return data.pedidoId
}

  async function carregarPedido(id: number) {
    const res = await fetch(`${API}/pedidos/${id}`)
    const pedido = await res.json()

    setItems(
      pedido.itens.map((i: any) => ({
        produtoId: i.produtoId,
        nome: i.nomeProduto,
        precoUnitario: i.precoUnitario,
        quantidade: i.quantidade,
        subtotal: i.subtotal,
        imagemUrl: i.imagemUrl || '' // pegamos do front se existir
      }))
    )
    setTotal(pedido.total)
  }

  async function addToCart(produto: Produto) {
  const id = await criarPedidoSeNecessario([{ produtoId: produto.id, quantidade: 1 }])

  const res = await fetch(`${API}/pedidos/${id}/itens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ produtoId: produto.id, quantidade: 1 })
  })

  if (!res.ok) {
    const error = await res.json()
    alert(error.message) // Notifica o usuário
    return
  }

  await carregarPedido(id)
}

  async function aplicarCupom(codigo: string) {
    if (!pedidoId) return
    await fetch(`${API}/pedidos/${pedidoId}/cupom`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigoCupom: codigo })
    })
    await carregarPedido(pedidoId)
  }

  async function limparCarrinho() {
  if (!pedidoId) return

  await fetch(`${API}/pedidos/${pedidoId}`, { method: 'DELETE' })

  setPedidoId(null)
  setItems([])
  setTotal(0)
}

  return (
    <CartContext.Provider
      value={{ pedidoId, items, total, addToCart, aplicarCupom, limparCarrinho }}
    >
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
