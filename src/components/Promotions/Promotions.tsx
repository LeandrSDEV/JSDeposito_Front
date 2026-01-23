import { useEffect, useMemo, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import './Promotions.css'

type Banner = {
  id: string
  src: string
  alt: string
  href?: string // opcional: link ao clicar
}

interface Props {
  // 5 imagens (png/jpg/webp/gif). Pode passar URLs ou imports.
  banners?: Banner[]
}

export default function Promotions({ banners }: Props) {
  // ✅ Exemplo padrão (troque pelos seus imports/urls)
  const items = useMemo<Banner[]>(
  () =>
    banners?.length
      ? banners.slice(0, 5)
      : [
          { id: 'b1', src: `${import.meta.env.BASE_URL}banners/baner1.jpg`, alt: 'Promo 1', href: '#produtos' },
          { id: 'b2', src: `${import.meta.env.BASE_URL}banners/baner2.jpg`, alt: 'Promo 2', href: '#promocoes' },
          { id: 'b3', src: `${import.meta.env.BASE_URL}banners/baner3.jpg`, alt: 'Promo 3', href: '#produtos' },
          { id: 'b4', src: `${import.meta.env.BASE_URL}banners/baner4.jpg`, alt: 'Promo 4', href: '#produtos' },
          { id: 'b5', src: `${import.meta.env.BASE_URL}banners/baner5.jpg`, alt: 'Promo 5', href: '#produtos' },
        ],
  [banners],
)

  const [index, setIndex] = useState(0)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  const total = items.length
  const go = (i: number) => setIndex((prev) => (i + total) % total)
  const next = () => go(index + 1)
  const prev = () => go(index - 1)

  // autoplay 5s
  useEffect(() => {
    if (total <= 1) return
    const id = window.setInterval(next, 5000)
    return () => window.clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, total])

  // swipe (touch/mouse) via pointer
  const startX = useRef(0)
  const dragging = useRef(false)

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true
    startX.current = e.clientX
    viewportRef.current?.setPointerCapture(e.pointerId)
    viewportRef.current?.classList.add('isDragging')
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return
    dragging.current = false
    viewportRef.current?.releasePointerCapture(e.pointerId)
    viewportRef.current?.classList.remove('isDragging')

    const dx = e.clientX - startX.current
    // threshold
    if (dx > 60) prev()
    else if (dx < -60) next()
  }

  if (!items.length) return null

  return (
    <section id="promocoes" className="promotions container">
      <div className="bannerWrap">
        <div
          ref={viewportRef}
          className="bannerViewport"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div
            className="bannerTrack"
            style={{
              transform: `translateX(-${index * 100}%)`,
              width: `${total * 100}%`,
            }}
          >
            {items.map((b) => {
              const content = (
                <>
                  <img className="bannerImg" src={b.src} alt={b.alt} loading="eager" />
                  <div className="bannerGlow" />
                </>
              )

              return (
                <div key={b.id} className="bannerSlide">
                  {b.href ? (
                    <a className="bannerLink" href={b.href} aria-label={b.alt}>
                      {content}
                    </a>
                  ) : (
                    <div className="bannerLink" aria-label={b.alt}>
                      {content}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {total > 1 && (
            <>
              <button className="bannerArrow left" onClick={prev} aria-label="Banner anterior">
                <ChevronLeft size={20} />
              </button>
              <button className="bannerArrow right" onClick={next} aria-label="Próximo banner">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {total > 1 && (
          <div className="bannerDots" role="tablist" aria-label="Paginação do carrossel">
            {items.map((b, i) => (
              <button
                key={b.id}
                className={`bannerDot ${i === index ? 'active' : ''}`}
                onClick={() => go(i)}
                aria-label={`Ir para banner ${i + 1}`}
                aria-current={i === index ? 'true' : 'false'}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
