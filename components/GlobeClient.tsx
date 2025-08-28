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

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const SAMPLE: DiveSite[] = [
  { id: 'raja-ampat', slug: 'raja-ampat', name: 'Raja Ampat', lat: -0.2346, lng: 130.5079, country: 'Indonesia' },
  { id: 'great-blue-hole', slug: 'great-blue-hole', name: 'Great Blue Hole', lat: 17.3156, lng: -87.5346, country: 'Belize' },
  { id: 'great-barrier-reef', slug: 'great-barrier-reef', name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, country: 'Australia' },
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
    color: '#ff6b6b',
    radius: 0.28,
    altitude: 0.02,
  })), [sites]);

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
      pointColor={(p) => ((p as PointData).slug === hovered ? '#ffd166' : (p as PointData).color)}
      pointAltitude={(p) => (p as PointData).slug === hovered ? (p as PointData).altitude * 1.8 : (p as PointData).altitude}
      pointRadius={(p) => (p as PointData).slug === hovered ? (p as PointData).radius * 1.8 : (p as PointData).radius}
      onPointHover={(p) => setHovered((p as PointData | null)?.slug ?? null)}
      onPointClick={(p) => {
        const slug = (p as PointData).slug;
        if (slug) router.push(`/dive/${slug}`);
      }}
    />
  );
}
