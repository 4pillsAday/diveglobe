'use client';

import { useEffect, useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
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
  const router = useRouter();

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/dives`)
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d.items) && d.items.length) setSites(d.items);
      })
      .catch(() => {
        // keep SAMPLE
      });
  }, []);

  const points = useMemo(() => sites.map(s => ({
    lat: s.lat,
    lng: s.lng,
    name: s.name,
    slug: s.slug || createSlug(s.name),
    color: colorForDifficulty(s.difficulty),
    radius: 0.28,
    altitude: 0.02,
  })), [sites]);

  const countryLabels = useMemo<LabelData[]>(() => {
    const groups = new Map<string, { latSum: number; lngSum: number; count: number }>();
    for (const s of sites) {
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
  }, [sites]);

  const labels = useMemo(() => [
    ...CONTINENT_LABELS,
    ...OCEAN_LABELS,
    ...countryLabels,
  ], [countryLabels]);

  return (
    <Globe
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
  );
}
