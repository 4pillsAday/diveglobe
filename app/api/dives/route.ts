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
      // Fallback to local dataset if Webflow returns an error
      return NextResponse.json({ items: FALLBACK_SITES });
    }
    const data = await res.json();
    const items = Array.isArray(data.items)
      ? data.items.map(normalizeItem).filter(Boolean)
      : [];
    // If CMS has no items, fallback to local
    return NextResponse.json({ items: items.length ? items : FALLBACK_SITES });
  } catch (e) {
    // On any unexpected error, return fallback so UI stays populated
    return NextResponse.json({ items: FALLBACK_SITES });
  }
}
