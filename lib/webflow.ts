export type DiveSite = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  country?: string;
  depth?: number | null;
};

export function normalizeItem(item: any): DiveSite | null {
  const f = item?.fieldData ?? {};
  const lat = parseFloat(f.latitude ?? f.lat);
  const lng = parseFloat(f.longitude ?? f.lng);
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
