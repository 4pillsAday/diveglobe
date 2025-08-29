import Image from 'next/image';
import { joinBasePath, type DiveSiteDetail, FALLBACK_SITES } from '@/lib/webflow';

async function fetchSite(slug: string): Promise<DiveSiteDetail | null> {
  try {
    const res = await fetch(joinBasePath(`/api/dives/${slug}`), { cache: 'no-store' });
    if (res.ok) {
      const data = await res.json();
      return data.item ?? null;
    }
  } catch {}
  // Fallback to local dataset
  const local = FALLBACK_SITES.find((s) => s.slug === slug) || null;
  return local;
}

export default async function DiveDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const site = await fetchSite(slug);
  if (!site) {
    return (
      <main className="dg-container dg-empty">
        <h1>Not found</h1>
        <p>We couldn’t find that dive site.</p>
      </main>
    );
  }

  return (
    <main className="dg-container dg-detail">
      <div className="dg-hero">
        <div className="dg-hero-text">
          <h1 className="dg-title">{site.name}</h1>
          {site.country ? <p className="dg-subtitle">{site.country}</p> : null}
        </div>
        {site.imageUrl ? (
          <Image src={site.imageUrl} alt={site.name} width={960} height={480} className="dg-hero-img" />
        ) : (
          <div className="dg-hero-fallback" aria-hidden />
        )}
      </div>

      <section className="dg-section">
        <div className="dg-specs">
          {site.bestTime ? (
            <div><span className="dg-spec-label">Best time</span><span>{site.bestTime}</span></div>
          ) : null}
          {site.waterTemp ? (
            <div><span className="dg-spec-label">Water temp</span><span>{site.waterTemp}</span></div>
          ) : null}
          {site.difficulty ? (
            <div><span className="dg-spec-label">Difficulty</span><span>{site.difficulty}</span></div>
          ) : null}
          {site.depth != null ? (
            <div><span className="dg-spec-label">Typical depth</span><span>{site.depth} m</span></div>
          ) : null}
        </div>
        {site.highlights && site.highlights.length ? (
          <div className="dg-highlights">
            {site.highlights.map((h) => (
              <span key={h} className="dg-chip">{h}</span>
            ))}
          </div>
        ) : null}
        {site.description ? <p className="dg-desc-large">{site.description}</p> : null}
      </section>

      <section className="dg-mini-map">
        <iframe
          title="map"
          className="dg-iframe"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://www.openstreetmap.org/export/embed.html?bbox=${site.lng-0.5}%2C${site.lat-0.3}%2C${site.lng+0.5}%2C${site.lat+0.3}&layer=mapnik&marker=${site.lat}%2C${site.lng}`}
        />
      </section>
    </main>
  );
}


