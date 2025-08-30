'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { GlobeMethods } from 'react-globe.gl';
import { useRouter } from 'next/navigation';
import { createSlug } from '@/lib/webflow';

type DiveSite = {
  id: string;
  slug?: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
  depth?: number | null;
  difficulty?: 'Beginner' | 'Intermediate' | 'Advanced' | string;
};

type PointData = {
  lat: number;
  lng: number;
  name: string;
  slug: string;
  color: string;
  radius: number;
  altitude: number;
};

type LabelData = {
  lat: number;
  lng: number;
  text: string;
  size: number;
  color: string;
  altitude: number;
};

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const SAMPLE: DiveSite[] = [
  { id: 'raja-ampat', slug: 'raja-ampat', name: 'Raja Ampat', lat: -0.2346, lng: 130.5079, country: 'Indonesia', difficulty: 'Intermediate' },
  { id: 'great-blue-hole', slug: 'great-blue-hole', name: 'Great Blue Hole', lat: 17.3156, lng: -87.5346, country: 'Belize', difficulty: 'Advanced' },
  { id: 'great-barrier-reef', slug: 'great-barrier-reef', name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, country: 'Australia', difficulty: 'Beginner' },
];

function colorForDifficulty(difficulty?: string): string {
  const d = String(difficulty || '').toLowerCase();
  if (d.startsWith('beg')) return '#2ecc71'; // green
  if (d.startsWith('int')) return '#f4d03f'; // amber
  if (d.startsWith('adv')) return '#e74c3c'; // red
  return '#7f8c8d'; // gray fallback
}

const CONTINENT_LABELS: LabelData[] = [
  { text: 'North America', lat: 40, lng: -100, size: 1.4, color: '#eaf6ff', altitude: 0.02 },
  { text: 'South America', lat: -15, lng: -60, size: 1.4, color: '#eaf6ff', altitude: 0.02 },
  { text: 'Europe', lat: 54, lng: 15, size: 1.3, color: '#eaf6ff', altitude: 0.02 },
  { text: 'Africa', lat: 4, lng: 20, size: 1.4, color: '#eaf6ff', altitude: 0.02 },
  { text: 'Asia', lat: 35, lng: 90, size: 1.5, color: '#eaf6ff', altitude: 0.02 },
  { text: 'Oceania', lat: -23, lng: 140, size: 1.3, color: '#eaf6ff', altitude: 0.02 },
  { text: 'Antarctica', lat: -78, lng: 0, size: 1.2, color: '#eaf6ff', altitude: 0.02 },
];

const OCEAN_LABELS: LabelData[] = [
  { text: 'Pacific Ocean', lat: 10, lng: -150, size: 1.2, color: '#b7dcff', altitude: 0.01 },
  { text: 'Pacific Ocean', lat: -10, lng: 160, size: 1.2, color: '#b7dcff', altitude: 0.01 },
  { text: 'Atlantic Ocean', lat: 5, lng: -30, size: 1.2, color: '#b7dcff', altitude: 0.01 },
  { text: 'Indian Ocean', lat: -15, lng: 80, size: 1.2, color: '#b7dcff', altitude: 0.01 },
  { text: 'Southern Ocean', lat: -55, lng: 60, size: 1.1, color: '#b7dcff', altitude: 0.01 },
  { text: 'Arctic Ocean', lat: 82, lng: 0, size: 1.0, color: '#b7dcff', altitude: 0.01 },
];

export default function GlobeClient() {
  const [sites, setSites] = useState<DiveSite[]>(SAMPLE);
  const [hovered, setHovered] = useState<string | null>(null);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [continentFilter, setContinentFilter] = useState<string>('');
  const [countryFilter, setCountryFilter] = useState<string>('');
  const [oceanFilter, setOceanFilter] = useState<string>('');
  const router = useRouter();
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  useEffect(() => {
    const envBase = (process.env.NEXT_PUBLIC_BASE_PATH || '').replace(/\/$/, '');
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const firstSeg = typeof window !== 'undefined' ? (window.location.pathname.split('/').filter(Boolean)[0] || '') : '';
    const guessedBase = firstSeg ? `/${firstSeg}` : '';
    const bases = Array.from(new Set([
      envBase,
      guessedBase,
      '/app',
      '',
    ].filter((b) => typeof b === 'string')));
    const candidates = bases.map((b) => `${origin}${b}/api/dives`);
    (async () => {
      for (const path of candidates) {
        try {
          const res = await fetch(path, { cache: 'no-store' });
          if (!res.ok) continue;
          const d = await res.json();
          if (Array.isArray(d.items) && d.items.length) {
            setSites(d.items);
            return;
          }
        } catch {}
      }
      // keep SAMPLE if all attempts fail
    })();
  }, []);

  // Center globe on user's approximate location at start (best-effort)
  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    let cancelled = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (cancelled) return;
        const globe = globeRef.current;
        if (!globe) return;
        const { latitude, longitude } = pos.coords;
        try {
          globe.pointOfView({ lat: latitude, lng: longitude, altitude: 1.4 }, 1200);
        } catch {}
      },
      () => {
        // ignore errors; keep default view
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
    );
    return () => { cancelled = true; };
  }, []);

  function inferContinent(lat: number, lng: number): string {
    if (lat < -60) return 'Antarctica';
    if (lat > 35 && lat < 72 && lng > -25 && lng < 45) return 'Europe';
    if (lat > -35 && lat < 37 && lng > -20 && lng < 55) return 'Africa';
    if (lat > 0 && lng > 45 && lng <= 180) return 'Asia';
    if (lat > -50 && lat < 10 && (lng > 110 || lng < -150)) return 'Oceania';
    if (lat < 12 && lng > -90 && lng < -30) return 'South America';
    if (lat > 0 && lng > -170 && lng < -30) return 'North America';
    return 'Other';
  }

  function inferOcean(lat: number, lng: number): string {
    if (lat > 66) return 'Arctic Ocean';
    if (lat < -60) return 'Southern Ocean';
    const lon = ((lng + 540) % 360) - 180;
    if (lon > -70 && lon < 20) return 'Atlantic Ocean';
    if (lon >= 20 && lon < 150) return 'Indian Ocean';
    return 'Pacific Ocean';
  }

  // Compute available option sets based on other selected filters
  function sitePassesFilters(s: DiveSite, skip: 'country' | 'continent' | 'ocean' | 'difficulty' | null): boolean {
    const d = String(s.difficulty || '').toLowerCase();
    const passDiff = skip === 'difficulty' ? true : (difficultyFilter ? d.startsWith(difficultyFilter) : true);
    const passCountry = skip === 'country' ? true : (countryFilter ? (s.country || '').toLowerCase() === countryFilter : true);
    const passCont = skip === 'continent' ? true : (continentFilter ? inferContinent(s.lat, s.lng).toLowerCase() === continentFilter : true);
    const passOcean = skip === 'ocean' ? true : (oceanFilter ? inferOcean(s.lat, s.lng).toLowerCase() === oceanFilter : true);
    return passDiff && passCountry && passCont && passOcean;
  }

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (sitePassesFilters(s, 'country') && s.country) set.add(s.country);
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sites, difficultyFilter, continentFilter, oceanFilter]);

  const availableContinents = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (sitePassesFilters(s, 'continent')) set.add(inferContinent(s.lat, s.lng));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sites, difficultyFilter, countryFilter, oceanFilter]);

  const availableOceans = useMemo(() => {
    const set = new Set<string>();
    for (const s of sites) if (sitePassesFilters(s, 'ocean')) set.add(inferOcean(s.lat, s.lng));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [sites, difficultyFilter, countryFilter, continentFilter]);

  const filteredSites = useMemo(() => sites.filter((s) => {
    const d = String(s.difficulty || '').toLowerCase();
    const passDiff = difficultyFilter ? d.startsWith(difficultyFilter) : true;
    const passCountry = countryFilter ? (s.country || '').toLowerCase() === countryFilter : true;
    const passCont = continentFilter ? inferContinent(s.lat, s.lng).toLowerCase() === continentFilter : true;
    const passOcean = oceanFilter ? inferOcean(s.lat, s.lng).toLowerCase() === oceanFilter : true;
    return passDiff && passCountry && passCont && passOcean;
  }), [sites, difficultyFilter, countryFilter, continentFilter, oceanFilter]);

  const points = useMemo(() => filteredSites.map(s => ({
    lat: s.lat,
    lng: s.lng,
    name: s.name,
    slug: s.slug || createSlug(s.name),
    color: colorForDifficulty(s.difficulty),
    radius: 0.28,
    altitude: 0.02,
  })), [filteredSites]);

  const countryLabels = useMemo<LabelData[]>(() => {
    const groups = new Map<string, { latSum: number; lngSum: number; count: number }>();
    for (const s of filteredSites) {
      if (!s.country) continue;
      const key = s.country;
      const g = groups.get(key) || { latSum: 0, lngSum: 0, count: 0 };
      g.latSum += s.lat; g.lngSum += s.lng; g.count += 1;
      groups.set(key, g);
    }
    return Array.from(groups.entries()).map(([country, g]) => ({
      text: country,
      lat: g.latSum / g.count,
      lng: g.lngSum / g.count,
      size: 0.9,
      color: '#ffffff',
      altitude: 0.015,
    }));
  }, [filteredSites]);

  const labels = useMemo(() => [
    ...CONTINENT_LABELS,
    ...OCEAN_LABELS,
    ...countryLabels,
  ], [countryLabels]);

  function centroidForCountry(countryLower: string): { lat: number; lng: number } | null {
    const matches = sites.filter((s) => (s.country || '').toLowerCase() === countryLower);
    if (!matches.length) return null;
    const lat = matches.reduce((sum, s) => sum + s.lat, 0) / matches.length;
    const lng = matches.reduce((sum, s) => sum + s.lng, 0) / matches.length;
    return { lat, lng };
  }

  function centroidForContinent(contLower: string): { lat: number; lng: number } | null {
    const matches = sites.filter((s) => inferContinent(s.lat, s.lng).toLowerCase() === contLower);
    if (!matches.length) return null;
    const lat = matches.reduce((sum, s) => sum + s.lat, 0) / matches.length;
    const lng = matches.reduce((sum, s) => sum + s.lng, 0) / matches.length;
    return { lat, lng };
  }

  function centroidForOcean(oceanLower: string): { lat: number; lng: number } | null {
    const matches = sites.filter((s) => inferOcean(s.lat, s.lng).toLowerCase() === oceanLower);
    if (!matches.length) return null;
    const lat = matches.reduce((sum, s) => sum + s.lat, 0) / matches.length;
    const lng = matches.reduce((sum, s) => sum + s.lng, 0) / matches.length;
    return { lat, lng };
  }

  // Focus the globe on selection (country > continent > ocean)
  useEffect(() => {
    const globe = globeRef.current;
    if (!globe) return;
    // If filters cleared, reset to initial view
    if (!countryFilter && !continentFilter && !oceanFilter) {
      try {
        globe.pointOfView({ lat: 0, lng: 0, altitude: 2.2 }, 800);
      } catch {}
      return;
    }
    let target: { lat: number; lng: number } | null = null;
    if (countryFilter) target = centroidForCountry(countryFilter);
    else if (continentFilter) target = centroidForContinent(continentFilter);
    else if (oceanFilter) target = centroidForOcean(oceanFilter);
    if (target) {
      try {
        globe.pointOfView({ lat: target.lat, lng: target.lng, altitude: 0.9 }, 1200);
      } catch {}
    }
  }, [countryFilter, continentFilter, oceanFilter, sites]);

  return (
    <>
      <div className="dg-overlay">
        <div className="dg-filter-row">
          <div>
            <label htmlFor="diff" className="dg-spec-label">Difficulty</label>
            <select id="diff" value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}>
              <option value="">All</option>
              <option value="begin">Beginner</option>
              <option value="inter">Intermediate</option>
              <option value="adv">Advanced</option>
            </select>
          </div>
          <div>
            <label htmlFor="ocean" className="dg-spec-label">Ocean</label>
            <select id="ocean" value={oceanFilter} onChange={(e) => setOceanFilter(e.target.value)}>
              <option value="">All</option>
              {availableOceans.map((o) => (
                <option key={o} value={o.toLowerCase()}>{o}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cont" className="dg-spec-label">Continent</label>
            <select id="cont" value={continentFilter} onChange={(e) => setContinentFilter(e.target.value)}>
              <option value="">All</option>
              {availableContinents.map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="country" className="dg-spec-label">Country</label>
            <select id="country" value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}>
              <option value="">All</option>
              {availableCountries.map((c) => (
                <option key={c} value={c.toLowerCase()}>{c}</option>
              ))}
            </select>
          </div>
          <div style={{alignSelf:'end'}}>
            <button type="button" className="dg-btn" onClick={() => { setDifficultyFilter(''); setContinentFilter(''); setOceanFilter(''); setCountryFilter(''); }}>Clear</button>
          </div>
        </div>
      </div>
      <Globe
      ref={globeRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 800}
      height={typeof window !== 'undefined' ? window.innerHeight : 600}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
      showAtmosphere
      atmosphereColor="#7efaff"
      atmosphereAltitude={0.25}
      pointsData={points}
      pointLabel="name"
      pointColor={(p) => (p as PointData).color}
      pointAltitude={(p) => (p as PointData).slug === hovered ? (p as PointData).altitude * 1.8 : (p as PointData).altitude}
      pointRadius={(p) => (p as PointData).slug === hovered ? (p as PointData).radius * 1.8 : (p as PointData).radius}
      onPointHover={(p) => setHovered((p as PointData | null)?.slug ?? null)}
      onPointClick={(p) => {
        const slug = (p as PointData).slug;
        if (slug) router.push(`/dive/${slug}`);
      }}
      labelsData={labels}
      labelText={(d) => (d as LabelData).text}
      labelSize={(d) => (d as LabelData).size}
      labelColor={(d) => (d as LabelData).color}
      labelAltitude={(d) => (d as LabelData).altitude}
      labelLat={(d) => (d as LabelData).lat}
      labelLng={(d) => (d as LabelData).lng}
      labelDotRadius={0}
    />
    </>
  );
}
