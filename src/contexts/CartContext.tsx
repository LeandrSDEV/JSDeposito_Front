import {
  createContext,
  useContext,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { api } from '../services/api'
import { useAuth } from './AuthContext'
import axios from 'axios'
import type { Produto } from '../types/Produto'

export type CartItem = {
  produtoId: number
  nome: string
  preco: number
  quantidade: number
  subtotal: number
}

type EnderecoEntrega = {
  rua: string
  numero: string
  bairro: string
  cidade: string
  latitude: number
  longitude: number
}

type CartContextType = {
  pedidoId: number | null
  itens: CartItem[]
  total: number
  desconto: number
  valorFrete: number
  fretePromocional: boolean
  codigoCupom: string | null
  enderecoEntrega: EnderecoEntrega | null
  refreshPedido: () => Promise<void>
  addToCart: (produto: Produto) => Promise<void>
  removeFromCart: (produtoId: number) => Promise<void>
  alterarQuantidade: (produtoId: number, quantidade: number) => Promise<void>
  aplicarCupom: (codigo: string) => Promise<void>
  limparCarrinho: () => Promise<void>
  aplicarFreteLocalizacao: (endereco: EnderecoEntrega) => Promise<void>
  resetarCarrinho: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function toNumber(v: any): number {
  const n = Number(v)
  return Number.isFinite(n) ? n : 0
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { usuarioId } = useAuth()

  const [pedidoId, setPedidoId] = useState<number | null>(null)
  const [itens, setItens] = useState<CartItem[]>([])
  const [total, setTotal] = useState(0)
  const [desconto, setDesconto] = useState(0)
  const [valorFrete, setValorFrete] = useState(0)
  const [fretePromocional, setFretePromocional] = useState(false)
  const [codigoCupom, setCodigoCupom] = useState<string | null>(null)
  const [enderecoEntrega, setEnderecoEntrega] = useState<EnderecoEntrega | null>(null)

  


// Se o usuário definir um endereço enquanto anônimo e depois fizer login,
// persistimos esse endereço automaticamente na conta (1x por sessão).
useEffect(() => {
  if (!usuarioId) return
  if (!enderecoEntrega) return

  const key = `enderecoPersistido:${usuarioId}:${pedidoId ?? 'none'}`
  if (sessionStorage.getItem(key) === '1') return

  ;(async () => {
    try {
      const { data } = await api.get<any[]>('/enderecos')
      const jaExiste =
        Array.isArray(data) &&
        data.some(
          (e) =>
            Number(e.latitude) === Number(enderecoEntrega.latitude) &&
            Number(e.longitude) === Number(enderecoEntrega.longitude) &&
            String(e.rua ?? '').trim().toLowerCase() ===
              String(enderecoEntrega.rua ?? '').trim().toLowerCase()
        )

      if (!jaExiste) {
        await api.post('/enderecos', {
          rua: enderecoEntrega.rua || 'Minha localização',
          numero: enderecoEntrega.numero || 'S/N',
          bairro: enderecoEntrega.bairro || '',
          cidade: enderecoEntrega.cidade || '',
          latitude: enderecoEntrega.latitude,
          longitude: enderecoEntrega.longitude,
        })
      }

      sessionStorage.setItem(key, '1')
    } catch {
      // silencioso
    }
  })()
}, [usuarioId, enderecoEntrega, pedidoId])

function resetarCarrinho() {
    setPedidoId(null)
    setItens([])
    setTotal(0)
    setDesconto(0)
    setValorFrete(0)
    setFretePromocional(false)
    setCodigoCupom(null)
    setEnderecoEntrega(null)
  }

  async function carregarPedido(id: number) {
    const { data } = await api.get(`/pedidos/${id}`)

    setPedidoId(data.id)

    const novosItens: CartItem[] = (data.itens ?? []).map((i: any) => ({
      produtoId: toNumber(i.produtoId ?? i.ProdutoId),
      nome: String(i.nomeProduto ?? i.NomeProduto ?? ''),
      preco: toNumber(i.precoUnitario ?? i.PrecoUnitario),
      quantidade: toNumber(i.quantidade ?? i.Quantidade),
      subtotal: toNumber(i.subtotal ?? i.Subtotal),
    }))

    setItens(novosItens)
    setTotal(toNumber(data.total ?? data.Total))
    setDesconto(toNumber(data.desconto ?? data.Desconto))
    setValorFrete(toNumber(data.valorFrete ?? data.ValorFrete))
    setFretePromocional(Boolean(data.fretePromocional ?? data.FretePromocional))
    setCodigoCupom((data.codigoCupom ?? data.CodigoCupom) || null)
    setEnderecoEntrega((data.enderecoEntrega ?? data.EnderecoEntrega) || null)
  }

  async function refreshPedido() {
    if (!pedidoId) return
    await carregarPedido(pedidoId)
  }

  async function criarPedidoSeNecessario(): Promise<number> {
    if (pedidoId) return pedidoId

    // Se usuário estiver logado, tenta pegar pedido aberto
    if (usuarioId) {
      const res = await api.get('/pedidos/pedido-atual', {
        validateStatus: (s) => (s >= 200 && s < 300) || s === 204,
      })

      if (res.status === 200 && res.data?.id) {
        await carregarPedido(res.data.id)
        return res.data.id
      }
    }

    // Cria (ou recupera) pedido anônimo pelo cookie
    const { data } = await api.post('/pedidos', {})
    if (!data?.pedidoId) throw new Error('Falha ao criar pedido')

    await carregarPedido(data.pedidoId)
    return data.pedidoId
  }

  async function addToCart(produto: Produto) {
    try {
      const id = await criarPedidoSeNecessario()

      await api.post(`/pedidos/${id}/itens`, {
        produtoId: produto.id,
        quantidade: 1,
      })

      await carregarPedido(id)
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const status = err.response?.status
        const msg = (err.response?.data as any)?.message as string | undefined

        // Se o pedido atual foi finalizado/excluído no backend, recria e tenta novamente
        if (status === 404 || (msg && /pedido (não encontrado|invalido|inválido|não pode ser alterado)/i.test(msg))) {
          resetarCarrinho()
          const id = await criarPedidoSeNecessario()
          await api.post(`/pedidos/${id}/itens`, { produtoId: produto.id, quantidade: 1 })
          await carregarPedido(id)
          return
        }

        if (msg) throw new Error(msg)
      }
      throw err
    }
  }

  async function removeFromCart(produtoId: number) {
    if (!pedidoId) return

    await api.delete(`/pedidos/${pedidoId}/produtos/${produtoId}`)
    await carregarPedido(pedidoId)
  }

  async function alterarQuantidade(produtoId: number, quantidade: number) {
    if (!pedidoId) return

    await api.put(`/pedidos/${pedidoId}/itens/${produtoId}`, { quantidade })
    await carregarPedido(pedidoId)
  }

  async function aplicarCupom(codigo: string) {
    const id = await criarPedidoSeNecessario()
    await api.post(`/pedidos/${id}/cupom`, { codigoCupom: codigo })
    await carregarPedido(id)
  }

  

async function aplicarFreteLocalizacao(endereco: EnderecoEntrega) {
  const id = await criarPedidoSeNecessario()
  await api.post(`/pedidos/${id}/frete-localizacao`, endereco)
  await carregarPedido(id)
}

async function limparCarrinho() {
  if (!pedidoId) return
  // mantém o pedido ativo (e o cookie anônimo), limpando apenas os itens
  await api.delete(`/pedidos/${pedidoId}/itens`)
  await carregarPedido(pedidoId)
}

  const value = useMemo(
    () => ({
      pedidoId,
      itens,
      total,
      desconto,
      valorFrete,
      fretePromocional,
      codigoCupom,
      enderecoEntrega,
      refreshPedido,
      addToCart,
      removeFromCart,
      alterarQuantidade,
      aplicarCupom,
      aplicarFreteLocalizacao,
      limparCarrinho,
      resetarCarrinho,
    }),
    [
      pedidoId,
      itens,
      total,
      desconto,
      valorFrete,
      fretePromocional,
      codigoCupom,
      enderecoEntrega,
    ]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
