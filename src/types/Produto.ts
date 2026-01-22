export interface Produto {
  id: number
  nome: string
  preco: number
  estoque: number
  ativo?: boolean

  // Se o backend ainda não expõe imagem, deixe opcional.
  imagemUrl?: string

  // Flags visuais/curadoria (podem ser populadas no frontend)
  emPromocao?: boolean
  destaque?: boolean
}
