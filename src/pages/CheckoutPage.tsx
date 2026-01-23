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

function moneyBR(v: number) {
  const n = Number(v) || 0
  return n.toFixed(2).replace('.', ',')
}

const steps: { key: Step; label: string; desc: string }[] = [
  { key: 'resumo', label: 'Resumo', desc: 'Revise seu pedido' },
  { key: 'endereco', label: 'Entrega', desc: 'Selecione o endereço' },
  { key: 'confirmacao', label: 'Confirmar', desc: 'Finalize o pedido' },
]

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
  const [novoLat, setNovoLat] = useState<number | ''>('')
  const [novoLng, setNovoLng] = useState<number | ''>('')

  const [locLoading, setLocLoading] = useState(false)
  const [savingEndereco, setSavingEndereco] = useState(false)
  const [applyingFrete, setApplyingFrete] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [clearing, setClearing] = useState(false)

  const subtotalItens = useMemo(() => {
    return itens.reduce((acc, i) => acc + (Number(i.subtotal) || 0), 0)
  }, [itens])

  const totalFinal = useMemo(() => Number(total) || 0, [total])

  const stepIndex = useMemo(() => steps.findIndex((s) => s.key === step), [step])

  useEffect(() => {
    if (!pedidoId) {
      navigate('/', { replace: true })
      return
    }
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
      setErr('Não foi possível carregar seus endereços.')
    } finally {
      setLoadingEnderecos(false)
    }
  }

  useEffect(() => {
    if (step === 'endereco') void carregarEnderecos()
  }, [step])

  function pedirLocalizacao() {
    setErr('')
    if (!('geolocation' in navigator)) {
      setErr('Seu navegador não suporta geolocalização.')
      return
    }
    setLocLoading(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setNovoLat(Number(pos.coords.latitude))
        setNovoLng(Number(pos.coords.longitude))
        setLocLoading(false)
      },
      () => {
        setErr('Não foi possível obter sua localização. Verifique as permissões do navegador.')
        setLocLoading(false)
      },
      { enableHighAccuracy: true, timeout: 12000 }
    )
  }

  async function criarEndereco() {
    setErr('')
    setSavingEndereco(true)
    try {
      await api.post('/enderecos', {
        rua: novoRua,
        numero: novoNumero,
        bairro: novoBairro,
        cidade: novoCidade,
        latitude: typeof novoLat === 'number' ? novoLat : undefined,
        longitude: typeof novoLng === 'number' ? novoLng : undefined,
      })

      setNovoRua('')
      setNovoNumero('')
      setNovoBairro('')
      setNovoCidade('')
      setNovoLat('')
      setNovoLng('')

      await carregarEnderecos()
      push({ variant: 'success', title: 'Endereço salvo', message: 'Endereço cadastrado com sucesso ✅' })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Erro ao salvar endereço.')
      } else {
        setErr('Erro ao salvar endereço.')
      }
    } finally {
      setSavingEndereco(false)
    }
  }

  async function aplicarFrete() {
    if (!pedidoId || !selectedEnderecoId) {
      setErr('Selecione um endereço para calcular o frete.')
      return
    }

    setErr('')
    setApplyingFrete(true)
    try {
      await api.post(`/pedidos/${pedidoId}/frete/${selectedEnderecoId}`)
      await refreshPedido()
      setStep('confirmacao')
      push({ variant: 'success', title: 'Frete calculado', message: 'Frete aplicado ao pedido ✅' })
    } catch (e) {
      if (axios.isAxiosError(e)) {
        const msg = (e.response?.data as any)?.message
        setErr(msg || 'Erro ao aplicar frete.')
      } else {
        setErr('Erro ao aplicar frete.')
      }
    } finally {
      setApplyingFrete(false)
    }
  }

  async function finalizar() {
    if (!pedidoId) return
    setErr('')
    setFinishing(true)
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
        setErr(msg || 'Não foi possível finalizar o pedido.')
      } else {
        setErr('Não foi possível finalizar o pedido.')
      }
    } finally {
      setFinishing(false)
    }
  }

  async function onLimparCarrinho() {
    setClearing(true)
    try {
      await limparCarrinho()
      navigate('/', { replace: true })
    } finally {
      setClearing(false)
    }
  }

  const canSaveEndereco =
    !!novoRua &&
    !!novoNumero &&
    !!novoBairro &&
    !!novoCidade &&
    typeof novoLat === 'number' &&
    typeof novoLng === 'number'

  return (
    <div className="checkoutPage">
      <div className="checkoutTop">
        <div className="checkoutTitle">
          <h2>Finalizar compra</h2>
          <p>Complete as etapas para concluir seu pedido.</p>
        </div>

        <div className="checkoutStepper" aria-label="Etapas do checkout">
          {steps.map((s, idx) => {
            const active = s.key === step
            const done = idx < stepIndex
            return (
              <button
                key={s.key}
                type="button"
                className={`stepPill ${active ? 'active' : ''} ${done ? 'done' : ''}`}
                onClick={() => {
                  if (idx <= stepIndex) setStep(s.key)
                }}
                title={s.desc}
              >
                <span className="dot">{done ? '✓' : idx + 1}</span>
                <span className="label">{s.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {err ? (
        <div className="checkoutAlert error" role="alert">
          <div className="icon">!</div>
          <div className="text">
            <strong>Ops.</strong>
            <span>{err}</span>
          </div>
        </div>
      ) : null}

      <div className="checkoutGrid">
        <div className="checkoutMain">
          {step === 'resumo' && (
            <section className="card">
              <header className="cardHeader">
                <div>
                  <h3>Resumo do pedido</h3>
                  <p>Confira os itens antes de continuar.</p>
                </div>
              </header>

              {codigoCupom ? (
                <div className="checkoutAlert warn">
                  <div className="icon">%</div>
                  <div className="text">
                    <strong>Cupom aplicado</strong>
                    <span>
                      <b>{codigoCupom}</b> ativo. Para adicionar itens, limpe o carrinho.
                    </span>
                  </div>
                </div>
              ) : null}

              <div className="itemsList">
                {itens.map((i) => (
                  <div key={i.produtoId} className="itemRow">
                    <div className="itemInfo">
                      <div className="itemTitle">{i.nome}</div>
                      <div className="itemMeta">
                        {i.quantidade} × R$ {moneyBR(i.preco)}
                      </div>
                    </div>
                    <div className="itemPrice">R$ {moneyBR(Number(i.subtotal) || 0)}</div>
                  </div>
                ))}
              </div>

              <div className="cardFooterActions">
                <button className="btnGhost" onClick={onLimparCarrinho} disabled={clearing}>
                  {clearing ? 'Limpando...' : 'Limpar carrinho'}
                </button>
                <button className="btnPrimary" onClick={() => setStep('endereco')}>
                  Continuar
                </button>
              </div>
            </section>
          )}

          {step === 'endereco' && (
            <section className="card">
              <header className="cardHeader">
                <div>
                  <h3>Entrega</h3>
                  <p>Selecione um endereço e calcule o frete.</p>
                </div>
              </header>

              {loadingEnderecos ? (
                <div className="skeletonWrap">
                  <div className="skeletonLine" />
                  <div className="skeletonLine" />
                  <div className="skeletonLine" />
                </div>
              ) : (
                <>
                  <div className="sectionTitle">
                    <h4>Meus endereços</h4>
                    <span className="hint">Selecione 1 para calcular o frete</span>
                  </div>

                  {enderecos.length === 0 ? (
                    <div className="emptyBox">
                      <div className="emptyIcon">📍</div>
                      <div className="emptyText">
                        <strong>Nenhum endereço cadastrado</strong>
                        <span>Cadastre abaixo e use sua localização para calcular o frete.</span>
                      </div>
                    </div>
                  ) : (
                    <div className="addressGrid">
                      {enderecos.map((e) => {
                        const checked = selectedEnderecoId === e.id
                        return (
                          <button
                            key={e.id}
                            type="button"
                            className={`addressCard ${checked ? 'selected' : ''}`}
                            onClick={() => setSelectedEnderecoId(e.id)}
                          >
                            <div className="addressTop">
                              <span className="radio">{checked ? '◉' : '○'}</span>
                              <span className="addrTitle">
                                {e.rua}, {e.numero}
                              </span>
                            </div>
                            <div className="addrSub">
                              {e.bairro} • {e.cidade}
                            </div>
                            <div className="addrMeta">
                              Lat/Lng: {Number(e.latitude).toFixed(5)}, {Number(e.longitude).toFixed(5)}
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}

                  <div className="divider" />

                  <div className="sectionTitle">
                    <h4>Novo endereço</h4>
                    <span className="hint">Informe os dados e use a localização</span>
                  </div>

                  <div className="formGrid">
                    <div className="field">
                      <label>Rua</label>
                      <input placeholder="Ex: Av. Brasil" value={novoRua} onChange={(e) => setNovoRua(e.target.value)} />
                    </div>

                    <div className="field small">
                      <label>Número</label>
                      <input placeholder="Ex: 120" value={novoNumero} onChange={(e) => setNovoNumero(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Bairro</label>
                      <input placeholder="Ex: Centro" value={novoBairro} onChange={(e) => setNovoBairro(e.target.value)} />
                    </div>

                    <div className="field">
                      <label>Cidade</label>
                      <input placeholder="Ex: Maceió" value={novoCidade} onChange={(e) => setNovoCidade(e.target.value)} />
                    </div>
                  </div>

                  <div className="geoBox">
                    <div className="geoLeft">
                      <button type="button" className="btnGhost" onClick={pedirLocalizacao} disabled={locLoading}>
                        {locLoading ? 'Obtendo localização...' : 'Usar minha localização'}
                      </button>
                      <div className="geoHint">
                        {typeof novoLat === 'number' && typeof novoLng === 'number'
                          ? `Lat/Lng: ${novoLat.toFixed(5)}, ${novoLng.toFixed(5)}`
                          : 'Necessário para calcular o frete'}
                      </div>
                    </div>

                    <button
                      className="btnPrimary"
                      type="button"
                      onClick={criarEndereco}
                      disabled={!canSaveEndereco || savingEndereco}
                      title={!canSaveEndereco ? 'Preencha tudo e obtenha a localização' : 'Salvar endereço'}
                    >
                      {savingEndereco ? 'Salvando...' : 'Salvar endereço'}
                    </button>
                  </div>

                  <div className="cardFooterActions">
                    <button className="btnGhost" onClick={() => setStep('resumo')}>
                      Voltar
                    </button>
                    <button className="btnPrimary" onClick={aplicarFrete} disabled={applyingFrete || !selectedEnderecoId}>
                      {applyingFrete ? 'Calculando...' : 'Calcular frete'}
                    </button>
                  </div>
                </>
              )}
            </section>
          )}

          {step === 'confirmacao' && (
            <section className="card">
              <header className="cardHeader">
                <div>
                  <h3>Confirmar pedido</h3>
                  <p>Revise entrega e valores e finalize.</p>
                </div>
              </header>

              <div className="confirmGrid">
                <div className="confirmCard">
                  <div className="confirmTitle">Entrega</div>
                  <div className="confirmText">
                    {enderecoEntrega
                      ? `${enderecoEntrega.rua}, ${enderecoEntrega.numero} - ${enderecoEntrega.bairro}, ${enderecoEntrega.cidade}`
                      : 'Não informado'}
                  </div>
                  <div className="confirmBadge">
                    Frete: {fretePromocional ? 'Grátis' : `R$ ${moneyBR(valorFrete)}`}
                  </div>
                </div>

                <div className="confirmCard">
                  <div className="confirmTitle">Pagamento</div>
                  <div className="confirmText">Finalize para gerar seu pedido.</div>
                  {codigoCupom ? <div className="confirmBadge">Cupom: {codigoCupom}</div> : null}
                </div>
              </div>

              <div className="cardFooterActions">
                <button className="btnGhost" onClick={() => setStep('endereco')}>
                  Voltar
                </button>
                <button className="btnPrimary" onClick={finalizar} disabled={finishing}>
                  {finishing ? 'Finalizando...' : 'Finalizar pedido'}
                </button>
              </div>
            </section>
          )}
        </div>

        <aside className="checkoutSide">
          <div className="sideCard">
            
            <div className="sideHeader">
              <h4>Resumo</h4>
              <span className="pill">{itens.length} item(ns)</span>
            </div>

            <div className="sideRows">
              <div className="sideRow">
                <span>Subtotal:</span>
                <span>R$ {moneyBR(subtotalItens)}</span>
              </div>
              
              <div className="sideRow">
                <span>Desconto:</span>
                <span>- R$ {moneyBR(desconto)}</span>
              </div>

              <div className="sideRow">
                <span>Frete:</span>
                <span>{fretePromocional ? 'Grátis' : `R$ ${moneyBR(valorFrete)}`}</span>
              </div>

              <div className="sideDivider" />

              <div className="sideRow total">
                <span>Total:</span>
                <span>R$ {moneyBR(totalFinal)}</span>
              </div>
            </div>

            
          </div>
        </aside>
      </div>
    </div>
  )
}
