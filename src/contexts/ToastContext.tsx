import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import './Toast.css'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error'

export type ToastItem = {
  id: string
  title?: string
  message: string
  variant?: ToastVariant
  durationMs?: number
}

type ToastContextValue = {
  push: (t: Omit<ToastItem, 'id'>) => void
  remove: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16)
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])
  const timeouts = useRef<Record<string, number>>({})

  const remove = useCallback((id: string) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
    const t = timeouts.current[id]
    if (t) window.clearTimeout(t)
    delete timeouts.current[id]
  }, [])

  const clear = useCallback(() => {
    setItems([])
    Object.values(timeouts.current).forEach((t) => window.clearTimeout(t))
    timeouts.current = {}
  }, [])

  const push = useCallback(
    (t: Omit<ToastItem, 'id'>) => {
      const id = uid()
      const durationMs = t.durationMs ?? 2400
      const item: ToastItem = { id, variant: t.variant ?? 'info', ...t }
      setItems((prev) => [item, ...prev].slice(0, 4))

      timeouts.current[id] = window.setTimeout(() => remove(id), durationMs)
    },
    [remove]
  )

  const value = useMemo(() => ({ push, remove, clear }), [push, remove, clear])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-viewport" aria-live="polite" aria-relevant="additions removals">
        {items.map((t) => (
          <div key={t.id} className={`toast ${t.variant ?? 'info'}`} role="status">
            <div className="toast-top">
              <div className="toast-title">{t.title ?? (t.variant === 'success' ? 'Feito!' : 'Aviso')}</div>
              <button className="toast-x" onClick={() => remove(t.id)} aria-label="Fechar">
                ×
              </button>
            </div>
            <div className="toast-msg">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
