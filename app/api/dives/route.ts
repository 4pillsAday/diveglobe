import { NextResponse } from 'next/server';
import { normalizeItem, FALLBACK_SITES } from '@/lib/webflow';

export async function GET() {
  const token = process.env.WEBFLOW_API_TOKEN;
  const collectionId = process.env.DIVE_COLLECTION_ID;

  if (!token || !collectionId) {
    return NextResponse.json({ items: FALLBACK_SITES });
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
