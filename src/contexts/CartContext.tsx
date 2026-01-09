import { createContext, useContext, useState } from 'react'
import { type Produto } from '../types/Produto'

interface CartItem extends Produto {
  quantidade: number
}

interface CartContextData {
  items: CartItem[]
  addToCart: (produto: Produto) => void
}

const CartContext = createContext<CartContextData>({} as CartContextData)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  function addToCart(produto: Produto) {
    setItems(prev => {
      const exists = prev.find(p => p.id === produto.id)
      if (exists) {
        return prev.map(p =>
          p.id === produto.id
            ? { ...p, quantidade: p.quantidade + 1 }
            : p
        )
      }
      return [...prev, { ...produto, quantidade: 1 }]
    })
  }

  return (
    <CartContext.Provider value={{ items, addToCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
