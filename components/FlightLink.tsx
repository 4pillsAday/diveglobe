'use client';

import { useEffect, useState } from 'react';
import { findNearestAirport } from '@/lib/airports-lite';

type Props = {
  destIata?: string;
  destLat: number;
  destLng: number;
};

export default function FlightLink({ destIata, destLat, destLng }: Props) {
  const destBest = destIata || findNearestAirport(destLat, destLng)?.iata || `${destLat},${destLng}`;
  const [href, setHref] = useState<string>(`https://www.google.com/travel/flights?q=${encodeURIComponent(`flights to ${destBest}`)}`);

  useEffect(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const oIata = findNearestAirport(pos.coords.latitude, pos.coords.longitude)?.iata;
        const origin = oIata || `${pos.coords.latitude.toFixed(3)},${pos.coords.longitude.toFixed(3)}`;
        const dIata = destIata || findNearestAirport(destLat, destLng)?.iata || `${destLat},${destLng}`;
        setHref(`https://www.google.com/travel/flights?q=${encodeURIComponent(`flights from ${origin} to ${dIata}`)}`);
      },
      () => {
        // ignore and keep default
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 600000 }
    );
  }, [destIata, destLat, destLng]);

  return (
    <a className="dg-btn" href={href} target="_blank" rel="noopener noreferrer">Check flights</a>
  );
}


