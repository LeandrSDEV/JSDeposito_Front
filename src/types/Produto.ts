export interface Produto {
  imagemUrl: string
  id: number
  nome: string
  preco: number
  estoque: number

  // flags futuras (podem vir da API depois)
  emPromocao?: boolean
  destaque?: boolean
}