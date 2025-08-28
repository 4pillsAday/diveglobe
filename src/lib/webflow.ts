export type DiveSite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
  depth?: number | null;
};

type WebflowItem = {
  id?: string;
  fieldData?: {
    latitude?: string | number;
    lat?: string | number;
    longitude?: string | number;
    lng?: string | number;
    name?: string;
    country?: string;
    depth?: number;
  };
};

export function normalizeItem(item: WebflowItem): DiveSite | null {
  const f = item?.fieldData ?? {};
  const lat = parseFloat(String(f.latitude ?? f.lat));
  const lng = parseFloat(String(f.longitude ?? f.lng));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: item.id ?? `${lat},${lng}`,
    name: f.name ?? 'Unnamed site',
    lat,
    lng,
    country: f.country ?? '',
    depth: typeof f.depth === 'number' ? f.depth : null,
  };
}
