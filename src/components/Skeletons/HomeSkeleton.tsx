import './HomeSkeleton.css'

function SkBlock({ className }: { className?: string }) {
  return <div className={`sk ${className ?? ''}`} />
}

export default function HomeSkeleton() {
  return (
    <main className="home-skel">
      <section className="skSection">
        <div className="skHeader">
          <SkBlock className="skTitle" />
          <SkBlock className="skChip" />
        </div>
        <div className="skRow">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="skCard">
              <SkBlock className="skLine sm" />
              <SkBlock className="skLine lg" />
              <SkBlock className="skLine md" />
            </div>
          ))}
        </div>
      </section>

      <section className="skSection">
        <div className="skHeader">
          <SkBlock className="skTitle" />
          <SkBlock className="skChip" />
        </div>
        <div className="skHRow">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skPromo">
              <SkBlock className="skLine sm" />
              <SkBlock className="skLine md" />
            </div>
          ))}
        </div>
      </section>

      <section className="skSection">
        <div className="skHeader">
          <SkBlock className="skTitle" />
          <SkBlock className="skChip" />
        </div>
        <div className="skGrid">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="skProduct">
              <SkBlock className="skLine sm" />
              <SkBlock className="skLine lg" />
              <SkBlock className="skLine md" />
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
