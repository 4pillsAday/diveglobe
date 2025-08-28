export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { normalizeItem } from '@/lib/webflow';

const SAMPLE = [
  { id: 'raja-ampat', name: 'Raja Ampat', lat: -0.2346, lng: 130.5079, country: 'Indonesia' },
  { id: 'blue-hole-belize', name: 'Great Blue Hole', lat: 17.3156, lng: -87.5346, country: 'Belize' },
  { id: 'great-barrier', name: 'Great Barrier Reef', lat: -18.2871, lng: 147.6992, country: 'Australia' },
];

export async function GET() {
  const token = process.env.WEBFLOW_API_TOKEN;
  const collectionId = process.env.DIVE_COLLECTION_ID;

  // If not configured, return sample data
  if (!token || !collectionId) {
    return NextResponse.json({ items: SAMPLE });
  }

  try {
    const url = `https://api.webflow.com/v2/collections/${collectionId}/items?limit=100`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      // Edge runtime uses WHATWG fetch; no special agent needed
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: 'Webflow API error', details: text }, { status: 502 });
    }
    const data = await res.json();
    const items = Array.isArray(data.items)
      ? data.items.map(normalizeItem).filter(Boolean)
      : [];
    return NextResponse.json({ items });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json({ error: 'Unexpected error', message }, { status: 500 });
  }
}
