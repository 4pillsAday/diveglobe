import { joinBasePath, type DiveSiteDetail } from '@/lib/webflow';
import Link from 'next/link';

async function fetchSites(): Promise<DiveSiteDetail[]> {
  try {
    const res = await fetch(joinBasePath('/api/dives'), { cache: 'no-store' });
    const data = await res.json();
    return Array.isArray(data.items) ? (data.items as DiveSiteDetail[]) : [];
  } catch {
    return [];
  }
}

export default async function DiveIndexPage({ searchParams }: { searchParams?: Promise<{ country?: string; difficulty?: string }> }) {
  const sites = await fetchSites();
  const sp = (await searchParams) || {};
  const country = sp.country?.toLowerCase();
  const difficulty = sp.difficulty?.toLowerCase();
  const filtered = sites.filter((s) => {
    const okCountry = country ? (s.country || '').toLowerCase() === country : true;
    const okDiff = difficulty ? (s.difficulty || '').toLowerCase() === difficulty : true;
    return okCountry && okDiff;
  });

  const countries = Array.from(new Set(sites.map((s) => s.country).filter(Boolean))) as string[];
  const difficulties = Array.from(new Set(sites.map((s) => s.difficulty).filter(Boolean))) as string[];

  return (
    <main className="dg-container">
      <h1 className="dg-title">Dive Sites</h1>
      <form className="dg-filters" action={'/dive'}>
        <div>
          <label htmlFor="country">Country</label>
          <select id="country" name="country" defaultValue={country || ''}>
            <option value="">All</option>
            {countries.map((c) => (
              <option key={c} value={c!.toLowerCase()}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="difficulty">Difficulty</label>
          <select id="difficulty" name="difficulty" defaultValue={difficulty || ''}>
            <option value="">All</option>
            {difficulties.map((d) => (
              <option key={d} value={String(d).toLowerCase()}>{d}</option>
            ))}
          </select>
        </div>
        <div style={{alignSelf:'end'}}>
          <button className="dg-btn" type="submit">Filter</button>
        </div>
      </form>
      <ul className="dg-grid">
        {filtered.map((s) => (
          <li key={s.id} className="dg-card">
            <div className="dg-card-body">
              <div className="dg-card-header">
                <h2>{s.name}</h2>
                {s.country ? <span className="dg-chip">{s.country}</span> : null}
              </div>
              {s.description ? <p className="dg-desc">{s.description}</p> : null}
              <div className="dg-meta">
                {s.difficulty ? <span>Difficulty: {s.difficulty}</span> : null}
                {s.depth != null ? <span>Depth: {s.depth} m</span> : null}
              </div>
            </div>
            <div className="dg-card-actions">
              <Link className="dg-btn" href={`/dive/${s.slug}`}>View details</Link>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
}


