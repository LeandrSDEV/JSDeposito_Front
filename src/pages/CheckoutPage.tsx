import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useCart } from '../contexts/CartContext'
import { useToast } from '../contexts/ToastContext'
import { api } from '../services/api'
import axios from 'axios'
import { MapPin, PackageCheck, ReceiptText, Truck } from 'lucide-react'
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

const STEP_ORDER: Step[] = ['resumo', 'endereco', 'confirmacao']

function stepIndex(s: Step) {
  return STEP_ORDER.indexOf(s)
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const { usuarioId } = useAuth()
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

  const totalFinal = useMemo(() => Number(total) || 0, [total])

  const canProceedResumo = Boolean(pedidoId) && itens.length > 0
  const canProceedEndereco = Boolean(selectedEnderecoId)

  useEffect(() => {
    if (!pedidoId) {
      navigate('/', { replace: true })
      return
    }
    if (!usuarioId) {
      navigate('/login?redirect=/checkout', { replace: true })
    }
  }, [pedidoId, usuarioId, navigate])

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
    if (step === 'endereco') void carregarEnderecos()
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
      push({ variant: 'success', title: 'Endereço salvo', message: 'Endereço cadastrado com sucesso ✅' })
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
      push({ variant: 'success', title: 'Frete calculado', message: 'Frete aplicado ao seu pedido ✅' })
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
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Não foi possível finalizar o pedido')
        return
      }
      setErr('Não foi possível finalizar o pedido')
    }
  }

  const idx = stepIndex(step)

  return (
    <div className="checkoutV2">
      <div className="container checkoutGrid">
        <header className="checkoutTop">
          <div className="checkoutTitle">
            <div className="checkoutKicker">Finalização</div>
            <h2>Checkout</h2>
            <p className="checkoutSub">Confirme os itens, escolha o endereço e finalize.</p>
          </div>

          <div className="checkoutTimeline" aria-label="Etapas do checkout">
            <button
              className={`tlItem ${idx >= 0 ? 'done' : ''} ${step === 'resumo' ? 'active' : ''}`}
              onClick={() => setStep('resumo')}
              type="button"
            >
              <span className="tlDot"><ReceiptText size={16} /></span>
              <span className="tlTxt">
                <span className="tlName">Resumo</span>
                <span className="tlHint">Itens e totais</span>
              </span>
            </button>

            <div className="tlLine" />

            <button
              className={`tlItem ${idx >= 1 ? 'done' : ''} ${step === 'endereco' ? 'active' : ''}`}
              onClick={() => setStep('endereco')}
              type="button"
              disabled={!canProceedResumo}
              aria-disabled={!canProceedResumo}
              title={!canProceedResumo ? 'Adicione itens ao carrinho' : undefined}
            >
              <span className="tlDot"><MapPin size={16} /></span>
              <span className="tlTxt">
                <span className="tlName">Endereço</span>
                <span className="tlHint">Entrega</span>
              </span>
            </button>

            <div className="tlLine" />

            <button
              className={`tlItem ${idx >= 2 ? 'done' : ''} ${step === 'confirmacao' ? 'active' : ''}`}
              onClick={() => setStep('confirmacao')}
              type="button"
              disabled={!canProceedEndereco || step === 'resumo'}
              aria-disabled={!canProceedEndereco || step === 'resumo'}
              title={!canProceedEndereco ? 'Selecione um endereço' : undefined}
            >
              <span className="tlDot"><PackageCheck size={16} /></span>
              <span className="tlTxt">
                <span className="tlName">Confirmação</span>
                <span className="tlHint">Tudo certo?</span>
              </span>
            </button>
          </div>
        </header>

        {err ? <div className="checkoutError">{err}</div> : null}

        {/* LEFT: etapa atual */}
        <section className="checkoutLeft">
          {step === 'resumo' ? (
            <div className="panel">
              {codigoCupom ? (
                <div className="banner warn">
                  <b>Cupom aplicado:</b> {codigoCupom}. Itens ficam bloqueados. Para adicionar mais itens, limpe o carrinho.
                </div>
              ) : null}

              <div className="panelTitle">
                <Truck size={18} />
                <h3>Seu pedido</h3>
              </div>

              <div className="itemsList">
                {itens.map((i) => (
                  <div className="itemRow" key={i.produtoId}>
                    <div className="itemMain">
                      <div className="itemName">{i.nome}</div>
                      <div className="itemMeta">{i.quantidade}x • R$ {i.preco.toFixed(2)}</div>
                    </div>
                    <div className="itemPrice">R$ {i.subtotal.toFixed(2)}</div>
                  </div>
                ))}
              </div>

              <div className="panelActions">
                <button
                  className="btnGhost"
                  onClick={async () => {
                    await limparCarrinho()
                    push({ variant: 'info', title: 'Carrinho', message: 'Carrinho limpo' })
                    navigate('/', { replace: true })
                  }}
                  type="button"
                >
                  Limpar carrinho
                </button>

                <button className="btnPrimary" onClick={() => setStep('endereco')} type="button" disabled={!canProceedResumo}>
                  Continuar
                </button>
              </div>
            </div>
          ) : null}

          {step === 'endereco' ? (
            <div className="panel">
              <div className="panelTitle">
                <MapPin size={18} />
                <h3>Endereço de entrega</h3>
              </div>

              {loadingEnderecos ? (
                <div className="addrSkel">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="addrSkelRow" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="addressList">
                    {enderecos.length === 0 ? (
                      <div className="emptyHint">Nenhum endereço cadastrado. Cadastre um novo abaixo.</div>
                    ) : (
                      enderecos.map((e) => (
                        <label key={e.id} className={`addrItem ${selectedEnderecoId === e.id ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name="endereco"
                            checked={selectedEnderecoId === e.id}
                            onChange={() => setSelectedEnderecoId(e.id)}
                          />
                          <div className="addrTxt">
                            <div className="addrLine">{e.rua}, {e.numero}</div>
                            <div className="addrSub">{e.bairro} • {e.cidade}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>

                  <div className="newAddr">
                    <div className="newAddrTop">Novo endereço</div>
                    <div className="newAddrGrid">
                      <input placeholder="Rua" value={novoRua} onChange={(e) => setNovoRua(e.target.value)} />
                      <input placeholder="Número" value={novoNumero} onChange={(e) => setNovoNumero(e.target.value)} />
                      <input placeholder="Bairro" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} />
                      <input placeholder="Cidade" value={novoCidade} onChange={(e) => setNovoCidade(e.target.value)} />
                    </div>
                    <div className="newAddrActions">
                      <button
                        className="btnGhost"
                        type="button"
                        onClick={criarEndereco}
                        disabled={!novoRua || !novoNumero || !novoBairro || !novoCidade}
                      >
                        Salvar endereço
                      </button>
                    </div>
                  </div>

                  <div className="panelActions">
                    <button className="btnGhost" onClick={() => setStep('resumo')} type="button">
                      Voltar
                    </button>
                    <button className="btnPrimary" onClick={aplicarFrete} type="button" disabled={!canProceedEndereco}>
                      Calcular frete
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {step === 'confirmacao' ? (
            <div className="panel">
              <div className="panelTitle">
                <PackageCheck size={18} />
                <h3>Confirmação</h3>
              </div>

              <div className="confirmBox">
                <div className="confirmRow">
                  <div className="confirmLabel">Endereço</div>
                  <div className="confirmVal">
                    {enderecoEntrega
                      ? `${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}, ${enderecoEntrega.cidade}`
                      : 'Não informado'}
                  </div>
                </div>
                <div className="confirmRow">
                  <div className="confirmLabel">Frete</div>
                  <div className="confirmVal">{fretePromocional ? 'Grátis' : `R$ ${valorFrete.toFixed(2)}`}</div>
                </div>
                {codigoCupom ? (
                  <div className="confirmRow">
                    <div className="confirmLabel">Cupom</div>
                    <div className="confirmVal">{codigoCupom}</div>
                  </div>
                ) : null}
              </div>

              <div className="panelActions">
                <button className="btnGhost" onClick={() => setStep('endereco')} type="button">
                  Voltar
                </button>
                <button className="btnPrimary" onClick={finalizar} type="button">
                  Finalizar pedido
                </button>
              </div>
            </div>
          ) : null}
        </section>

        {/* RIGHT: resumo fixo (iFood-style) */}
        <aside className="checkoutRight">
          <div className="summaryCard">
            <div className="summaryTop">
              <div className="summaryTitle">Resumo</div>
              <div className="summaryBadge">{itens.length} itens</div>
            </div>

            <div className="summaryRows">
              <div className="sumRow">
                <span>Subtotal</span>
                <b>R$ {subtotalItens.toFixed(2)}</b>
              </div>
              <div className="sumRow">
                <span>Desconto</span>
                <b>- R$ {desconto.toFixed(2)}</b>
              </div>
              <div className="sumRow">
                <span>Frete</span>
                <b>{fretePromocional ? 'Grátis' : `R$ ${valorFrete.toFixed(2)}`}</b>
              </div>
              <div className="sumRow total">
                <span>Total</span>
                <b>R$ {totalFinal.toFixed(2)}</b>
              </div>
            </div>

            <div className="summaryHint">
              Dica: finalize em poucos passos. Seu resumo fica fixo enquanto você avança.
            </div>

            <div className="summaryCta">
              {step === 'resumo' ? (
                <button className="btnPrimary wide" onClick={() => setStep('endereco')} type="button" disabled={!canProceedResumo}>
                  Ir para endereço
                </button>
              ) : step === 'endereco' ? (
                <button className="btnPrimary wide" onClick={aplicarFrete} type="button" disabled={!canProceedEndereco}>
                  Calcular frete
                </button>
              ) : (
                <button className="btnPrimary wide" onClick={finalizar} type="button">
                  Finalizar pedido
                </button>
              )}
              <button className="btnGhost wide" onClick={() => navigate('/', { replace: true })} type="button">
                Continuar comprando
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
