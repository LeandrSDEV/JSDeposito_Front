import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'
import axios from 'axios'
import './CheckoutPage.css'

type Endereco = {
  id: number
  rua: string
  numero: string
  bairro: string
  cidade: string
  latitude: number
  longitude: number
}

type Step = 'resumo' | 'endereco' | 'confirmacao'

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { push } = useToast()
  const {
    pedidoId,
    itens,
    total,
    desconto,
    valorFrete,
    fretePromocional,
    codigoCupom,
    enderecoEntrega,
    refreshPedido,
    limparCarrinho,
  } = useCart()

  const [step, setStep] = useState<Step>('resumo')
  const [enderecos, setEnderecos] = useState<Endereco[]>([])
  const [loadingEnderecos, setLoadingEnderecos] = useState(false)
  const [selectedEnderecoId, setSelectedEnderecoId] = useState<number | null>(null)
  const [err, setErr] = useState<string>('')

  const [novoRua, setNovoRua] = useState('')
  const [novoNumero, setNovoNumero] = useState('')
  const [novoBairro, setNovoBairro] = useState('')
  const [novoCidade, setNovoCidade] = useState('')

  const subtotalItens = useMemo(() => {
    return itens.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0)
  }, [itens])

  const totalFinal = useMemo(() => {
    const t = Number(total) || 0
    return t
  }, [total])

  useEffect(() => {
    // Proteção adicional: se não houver pedido, volta para vitrine
    if (!pedidoId) {
      navigate('/', { replace: true })
      return
    }

    // Apenas clientes logados devem finalizar checkout
    if (!token) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [pedidoId, token, navigate])

  async function carregarEnderecos() {
    setLoadingEnderecos(true)
    setErr('')
    try {
      const { data } = await api.get<Endereco[]>('/enderecos')
      setEnderecos(data)
      if (data.length === 1) setSelectedEnderecoId(data[0].id)
    } catch (e) {
      console.error(e)
      setErr('Não foi possível carregar seus endereços')
    } finally {
      setLoadingEnderecos(false)
    }
  }

  useEffect(() => {
    if (step === 'endereco') {
      void carregarEnderecos()
    }
  }, [step])

  async function criarEndereco() {
    setErr('')
    try {
      await api.post('/enderecos', {
        rua: novoRua,
        numero: novoNumero,
        bairro: novoBairro,
        cidade: novoCidade,
      })
      setNovoRua('')
      setNovoNumero('')
      setNovoBairro('')
      setNovoCidade('')
      await carregarEnderecos()
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Erro ao salvar endereço')
        return
      }
      setErr('Erro ao salvar endereço')
    }
  }

  async function aplicarFrete() {
    if (!pedidoId || !selectedEnderecoId) {
      setErr('Selecione um endereço')
      return
    }

    setErr('')
    try {
      await api.post(`/pedidos/${pedidoId}/frete/${selectedEnderecoId}`)
      await refreshPedido()
      setStep('confirmacao')
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Erro ao aplicar frete')
        return
      }
      setErr('Erro ao aplicar frete')
    }
  }

  async function finalizar() {
    if (!pedidoId) return
    setErr('')
    try {
      await api.post(`/checkout/${pedidoId}/finalizar`)
      push({ variant: 'success', title: 'Pedido enviado', message: 'Seu pedido foi finalizado ✅' })
      navigate('/pedido-finalizado', { replace: true })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        if (e.response?.status === 401 || e.response?.status === 403) {
          push({ variant: 'info', title: 'Faça login', message: 'Entre para finalizar o pedido.' })
          navigate('/login?redirect=/checkout', { replace: true })
          return
        }
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Não foi possível finalizar o pedido')
        return
      }
      setErr('Não foi possível finalizar o pedido')
    }
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <h2>Checkout</h2>
        <div className="checkout-steps">
          <span className={step === 'resumo' ? 'active' : ''}>Resumo</span>
          <span className={step === 'endereco' ? 'active' : ''}>Endereço</span>
          <span className={step === 'confirmacao' ? 'active' : ''}>Confirmação</span>
        </div>
      </div>

      {err && <div className="checkout-error">{err}</div>}

      {step === 'resumo' && (
        <div className="checkout-card">
          <h3>Seu pedido</h3>

          {codigoCupom ? (
            <div className="checkout-warning">
              Cupom <b>{codigoCupom}</b> aplicado. Itens ficam bloqueados.
              Para adicionar mais itens, limpe o carrinho.
            </div>
          ) : null}

          <ul className="checkout-items">
            {itens.map((i) => (
              <li key={i.produtoId}>
                <div className="row">
                  <span>{i.nome}</span>
                  <span>
                    {i.quantidade} x R$ {i.preco.toFixed(2)}
                  </span>
                </div>
              </li>
            ))}
          </ul>

          <div className="checkout-totals">
            <div className="row">
              <span>Subtotal</span>
              <span>R$ {subtotalItens.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Desconto</span>
              <span>- R$ {desconto.toFixed(2)}</span>
            </div>
            <div className="row">
              <span>Frete</span>
              <span>{fretePromocional ? 'Grátis' : `R$ ${valorFrete.toFixed(2)}`}</span>
            </div>
            <div className="row total">
              <span>Total</span>
              <span>R$ {totalFinal.toFixed(2)}</span>
            </div>
          </div>

          <div className="checkout-actions">
            <button
              className="btn secondary"
              onClick={async () => {
                await limparCarrinho()
                navigate('/', { replace: true })
              }}
            >
              Limpar carrinho
            </button>
            <button className="btn" onClick={() => setStep('endereco')}>
              Avançar
            </button>
          </div>
        </div>
      )}

      {step === 'endereco' && (
        <div className="checkout-card">
          <h3>Endereço de entrega</h3>

          {loadingEnderecos ? (
            <p>Carregando endereços...</p>
          ) : (
            <>
              <div className="address-list">
                {enderecos.length === 0 ? (
                  <p>Nenhum endereço cadastrado.</p>
                ) : (
                  enderecos.map((e) => (
                    <label key={e.id} className="address-item">
                      <input
                        type="radio"
                        name="endereco"
                        checked={selectedEnderecoId === e.id}
                        onChange={() => setSelectedEnderecoId(e.id)}
                      />
                      <span>
                        {e.rua}, {e.numero} - {e.bairro}, {e.cidade}
                      </span>
                    </label>
                  ))
                )}
              </div>

              <div className="new-address">
                <h4>Novo endereço</h4>
                <div className="grid">
                  <input
                    placeholder="Rua"
                    value={novoRua}
                    onChange={(e) => setNovoRua(e.target.value)}
                  />
                  <input
                    placeholder="Número"
                    value={novoNumero}
                    onChange={(e) => setNovoNumero(e.target.value)}
                  />
                  <input
                    placeholder="Bairro"
                    value={novoBairro}
                    onChange={(e) => setNovoBairro(e.target.value)}
                  />
                  <input
                    placeholder="Cidade"
                    value={novoCidade}
                    onChange={(e) => setNovoCidade(e.target.value)}
                  />
                </div>

                <button
                  className="btn secondary"
                  type="button"
                  onClick={criarEndereco}
                  disabled={!novoRua || !novoNumero || !novoBairro || !novoCidade}
                >
                  Salvar endereço
                </button>
              </div>

              <div className="checkout-actions">
                <button className="btn secondary" onClick={() => setStep('resumo')}>
                  Voltar
                </button>
                <button className="btn" onClick={aplicarFrete}>
                  Calcular frete
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {step === 'confirmacao' && (
        <div className="checkout-card">
          <h3>Confirmação</h3>

          <div className="checkout-summary">
            <p>
              <b>Endereço:</b>{' '}
              {enderecoEntrega
                ? `${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}, ${enderecoEntrega.cidade}`
                : 'Não informado'}
            </p>
            <p>
              <b>Frete:</b>{' '}
              {fretePromocional ? 'Grátis' : `R$ ${valorFrete.toFixed(2)}`}
            </p>
            {codigoCupom ? (
              <p>
                <b>Cupom:</b> {codigoCupom}
              </p>
            ) : null}
            <p className="total">
              <b>Total:</b> R$ {totalFinal.toFixed(2)}
            </p>
          </div>

          <div className="checkout-actions">
            <button className="btn secondary" onClick={() => setStep('endereco')}>
              Voltar
            </button>
            <button className="btn" onClick={finalizar}>
              Finalizar pedido
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
