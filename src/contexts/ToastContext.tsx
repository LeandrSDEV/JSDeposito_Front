import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import './ToastContext.css'

export type ToastVariant = 'success' | 'info' | 'warning' | 'error'

export type Toast = {
  id: string
  variant: ToastVariant
  title: string
  message?: string
  ttlMs?: number
}

type ToastContextType = {
  push: (t: Omit<Toast, 'id'>) => void
  remove: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  function remove(id: string) {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  function push(t: Omit<Toast, 'id'>) {
    const id = uid()
    const ttl = t.ttlMs ?? 3200
    const toast: Toast = { id, ...t }
    setToasts((prev) => [toast, ...prev].slice(0, 4))
    window.setTimeout(() => remove(id), ttl)
  }

  const value = useMemo(() => ({ push, remove }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toastStack" aria-live="polite" aria-relevant="additions removals">
        {toasts.map((t) => (
          <div key={t.id} className={`toastItem ${t.variant}`} role="status">
            <div className="toastTop">
              <div className="toastTitle">{t.title}</div>
              <button className="toastX" onClick={() => remove(t.id)} aria-label="Fechar">
                ×
              </button>
            </div>
            {t.message ? <div className="toastMsg">{t.message}</div> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}
