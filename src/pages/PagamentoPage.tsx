import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { api } from '../services/api'
import { Copy, CheckCircle2, Clock, ArrowLeft } from 'lucide-react'
import './PagamentoPage.css'
import axios from 'axios'

type Pix = {
  TxId?: string
  txId?: string
  CopiaECola?: string
  copiaECola?: string
  QrCodeBase64?: string
  qrCodeBase64?: string
  ExpiraEm?: string
  expiraEm?: string
}

type CriarPagamentoResponse = {
  pagamentoId?: number
  PagamentoId?: number
  status?: string | number
  Status?: string | number
  pix?: Pix
  Pix?: Pix
}

function pickPix(r: CriarPagamentoResponse | null): Pix | null {
  if (!r) return null
  return (r.Pix ?? r.pix) ?? null
}

function pickNumber(v: any): number | null {
  const n = Number(v)
  return Number.isFinite(n) ? n : null
}

export default function PagamentoPage() {
  const { pedidoId } = useParams()
  const id = useMemo(() => pickNumber(pedidoId), [pedidoId])
  const navigate = useNavigate()
  const location = useLocation()

  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState('')
  const [resp, setResp] = useState<CriarPagamentoResponse | null>(null)
  const [copied, setCopied] = useState(false)

  const pix = useMemo(() => pickPix(resp), [resp])

  // Tenta usar state (navigation) ou cache de sessão
  useEffect(() => {
    if (!id) {
      navigate('/', { replace: true })
      return
    }

    const stateResp = (location.state as any)?.pagamento as CriarPagamentoResponse | undefined
    if (stateResp) {
      setResp(stateResp)
      sessionStorage.setItem(`pix_${id}`, JSON.stringify(stateResp))
      return
    }

    const cached = sessionStorage.getItem(`pix_${id}`)
    if (cached) {
      try {
        setResp(JSON.parse(cached))
        return
      } catch {
        sessionStorage.removeItem(`pix_${id}`)
      }
    }

    // Se não tem nada, tenta criar/recriar (backend agora é idempotente p/ PIX)
    ;(async () => {
      setLoading(true)
      setErr('')
      try {
        const { data } = await api.post<CriarPagamentoResponse>(`/pagamentos/${id}/pagamento`, { tipo: 1 })
        setResp(data)
        sessionStorage.setItem(`pix_${id}`, JSON.stringify(data))
      } catch (e) {
        if (axios.isAxiosError(e)) {
          const msg = (e.response?.data as any)?.message
          setErr(msg || 'Não foi possível gerar o PIX.')
        } else {
          setErr('Não foi possível gerar o PIX.')
        }
      } finally {
        setLoading(false)
      }
    })()
  }, [id, location.state, navigate])

  const copiaECola =
    pix?.CopiaECola ?? pix?.copiaECola ?? ''

  const qrB64 =
    pix?.QrCodeBase64 ?? pix?.qrCodeBase64 ?? ''

  const expiraEm = pix?.ExpiraEm ?? pix?.expiraEm

  async function copy() {
    try {
      await navigator.clipboard.writeText(copiaECola)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // fallback
      const el = document.createElement('textarea')
      el.value = copiaECola
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <div className="payWrap">
      <div className="payCard card">
        <div className="payHead">
          <button className="payBack" onClick={() => navigate('/checkout')} aria-label="Voltar">
            <ArrowLeft size={18} /> Voltar
          </button>
          <h2>Pagamento via PIX</h2>
          <p className="paySub">Escaneie o QR Code ou copie o código “copia e cola”.</p>
        </div>

        {loading ? (
          <div className="payLoading">
            <Clock size={18} /> Gerando PIX...
          </div>
        ) : err ? (
          <div className="payError">
            <p>{err}</p>
            <button className="btn" onClick={() => window.location.reload()}>Tentar novamente</button>
          </div>
        ) : (
          <>
            <div className="payGrid">
              <div className="payQr">
                {qrB64 ? (
                  <img
                    className="qrImg"
                    src={`data:image/png;base64,${qrB64}`}
                    alt="QR Code PIX"
                  />
                ) : (
                  <div className="qrFallback">QR indisponível</div>
                )}

                {expiraEm ? (
                  <div className="payExpire">
                    <Clock size={16} /> Expira em: {new Date(expiraEm).toLocaleString()}
                  </div>
                ) : null}
              </div>

              <div className="payCode">
                <div className="payLabel">PIX “Copia e Cola”</div>
                <div className="codeBox">
                  <div className="codeText">{copiaECola || '—'}</div>
                </div>

                <div className="payActions">
                  <button className="btn" onClick={copy} disabled={!copiaECola}>
                    {copied ? <CheckCircle2 size={18} /> : <Copy size={18} />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>

                  <button
                    className="btn ghost"
                    onClick={() => navigate('/', { replace: true })}
                  >
                    Voltar para vitrine
                  </button>
                </div>

                <div className="payHint">
                  <strong>Importante:</strong> após pagar, a confirmação pode levar alguns instantes.
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
