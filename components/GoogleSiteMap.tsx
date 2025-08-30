'use client'

import { useEffect, useRef } from 'react';

type Props = {
  lat: number;
  lng: number;
  name: string;
};

// Loads the Google Maps JS API script once
function useGoogleMaps(apiKey: string, language: string = 'en') {
  useEffect(() => {
    const src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&language=${language}`;
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) return;
    const s = document.createElement('script');
    s.src = src;
    s.async = true;
    s.defer = true;
    document.head.appendChild(s);
  }, [apiKey, language]);
}

export default function GoogleSiteMap({ lat, lng, name }: Props) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_EMBED_KEY;
  useGoogleMaps(apiKey ?? '');
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!apiKey) return;
    let map: google.maps.Map | null = null;
    let info: google.maps.InfoWindow | null = null;

    type GoogleWindow = Window & { google?: typeof google };
    const isGoogleLoaded = (): boolean => {
      if (typeof window === 'undefined') return false;
      const w = window as GoogleWindow;
      return !!(w.google && w.google.maps);
    };

    const init = () => {
      if (!elRef.current || !isGoogleLoaded()) return;
      const center = new google.maps.LatLng(lat, lng);
      map = new google.maps.Map(elRef.current, {
        center,
        zoom: 12,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
      });
      info = new google.maps.InfoWindow();

      // Marker for the dive site itself
      new google.maps.Marker({
        position: center,
        map,
        title: name,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          strokeColor: '#0ea5e9',
          strokeWeight: 3,
          fillColor: '#22d3ee',
          fillOpacity: 1,
        },
      });

      const service = new google.maps.places.PlacesService(map);
      service.nearbySearch(
        {
          location: center,
          radius: 30000, // 30km
          keyword: 'dive shop scuba',
          type: 'store',
        },
        (results, status) => {
          if (status !== google.maps.places.PlacesServiceStatus.OK || !results) return;
          results.forEach((place) => {
            if (!place.geometry || !place.geometry.location) return;
            const marker = new google.maps.Marker({
              map,
              position: place.geometry.location,
              title: place.name,
            });
            marker.addListener('click', () => {
              const url = `https://www.google.com/maps/place/?q=place_id:${place.place_id}`;
              const content = `
                <div style="min-width:200px">
                  <div style="font-weight:600;margin-bottom:4px;">${place.name ?? 'Dive shop'}</div>
                  <a href="${url}" target="_blank" rel="noopener noreferrer">View on Google Maps</a>
                </div>
              `;
              info?.setContent(content);
              info?.open({ anchor: marker, map });
            });
          });
        }
      );
    };

    const id = window.setInterval(() => {
      if (isGoogleLoaded() && elRef.current) {
        window.clearInterval(id);
        init();
      }
    }, 100);

    return () => {
      window.clearInterval(id);
      map = null;
      info = null;
    };
  }, [apiKey, lat, lng, name]);

  if (!apiKey) {
    // Caller should render a fallback embed when no key
    return null;
  }

  return (
    <div ref={elRef} className="dg-embed-map" style={{ width: '100%', height: 360, borderRadius: 12 }} />
  );
}


