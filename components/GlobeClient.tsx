'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

type DiveSite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
  depth?: number | null;
};

const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

const SAMPLE: DiveSite[] = [
  { id: 'raja-ampat', name: 'Raja Ampat', lat: -0.2346, lng: 130.5079, country: 'Indonesia' },
  { id: 'blue-hole-belize', name: 'Great Blue Hole', lat: 17.3156, lng: -87.5346, country: 'Belize' },
  { id: 'great-barrier', name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, country: 'Australia' },
];

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export default function GlobeClient() {
  const globeRef = useRef<any>();
  const [sites, setSites] = useState<DiveSite[]>(SAMPLE);

  useEffect(() => {
    fetch(`${basePath}/api/dives`)
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
    color: '#43e2ff',
    radius: 0.3,
    altitude: 0.02,
  })), [sites]);

  return (
    <Globe
      ref={globeRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 800}
      height={typeof window !== 'undefined' ? window.innerHeight : 600}
      backgroundColor="#0b1220"
      globeImageUrl="https://unpkg.com/three-globe/example/img/earth-dark.jpg"
      bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
      showAtmosphere
      pointsData={points}
      pointLabel="name"
      pointColor={(p: any) => p.color}
      pointAltitude={(p: any) => p.altitude}
      pointRadius={(p: any) => p.radius}
      onPointClick={(p: any) => {
        alert(`${p.name}`);
      }}
    />
  );
}
