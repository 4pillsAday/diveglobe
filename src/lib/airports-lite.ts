export type Airport = { iata: string; name?: string; lat: number; lng: number };

export const AIRPORTS: Airport[] = [
  { iata: 'SOQ', name: 'Sorong', lat: -0.926, lng: 131.121 },
  { iata: 'BZE', name: 'Belize City', lat: 17.539, lng: -88.308 },
  { iata: 'CNS', name: 'Cairns', lat: -16.885, lng: 145.755 },
  { iata: 'TWU', name: 'Tawau', lat: 4.320, lng: 118.127 },
  { iata: 'LBJ', name: 'Labuan Bajo', lat: -8.486, lng: 119.889 },
  { iata: 'GPS', name: 'Baltra', lat: -0.453, lng: -90.266 },
  { iata: 'ROR', name: 'Koror', lat: 7.367, lng: 134.544 },
  { iata: 'MLE', name: 'Male', lat: 4.191, lng: 73.529 },
  { iata: 'SSH', name: 'Sharm el-Sheikh', lat: 27.977, lng: 34.394 },
  { iata: 'RMF', name: 'Marsa Alam', lat: 25.557, lng: 34.583 },
  { iata: 'SJO', name: 'San José', lat: 9.998, lng: -84.204 },
  { iata: 'SJD', name: 'Cabo San Lucas', lat: 23.151, lng: -109.721 },
  { iata: 'KOA', name: 'Kona', lat: 19.738, lng: -156.045 },
  { iata: 'BON', name: 'Bonaire', lat: 12.131, lng: -68.269 },
  { iata: 'TVU', name: 'Taveuni', lat: -16.690, lng: -179.876 },
  { iata: 'HKT', name: 'Phuket', lat: 8.113, lng: 98.316 },
  { iata: 'PPS', name: 'Puerto Princesa', lat: 9.742, lng: 118.759 },
  { iata: 'TKK', name: 'Chuuk', lat: 7.461, lng: 151.843 },
  { iata: 'FPO', name: 'Freeport', lat: 26.559, lng: -78.695 },
  { iata: 'DUR', name: 'Durban', lat: -29.614, lng: 31.119 },
  { iata: 'FAV', name: 'Fakarava', lat: -16.054, lng: -145.657 },
  { iata: 'LYB', name: 'Little Cayman', lat: 19.659, lng: -80.090 },
  { iata: 'PLS', name: 'Providenciales', lat: 21.774, lng: -72.265 },
  { iata: 'KEF', name: 'Reykjavík KEF', lat: 63.985, lng: -22.605 },
  { iata: 'DPS', name: 'Bali (Denpasar)', lat: -8.748, lng: 115.167 },
  { iata: 'OGG', name: 'Kahului (Maui)', lat: 20.898, lng: -156.430 },
  { iata: 'CZM', name: 'Cozumel', lat: 20.522, lng: -86.925 },
  { iata: 'GRO', name: 'Girona', lat: 41.900, lng: 2.760 },
  { iata: 'NAS', name: 'Nassau', lat: 25.039, lng: -77.466 },
  { iata: 'CUN', name: 'Cancún', lat: 21.036, lng: -86.877 },
  { iata: 'RGI', name: 'Rangiroa', lat: -14.956, lng: -147.661 },
  { iata: 'PDL', name: 'Ponta Delgada', lat: 37.741, lng: -25.697 },
  { iata: 'NOS', name: 'Nosy Be', lat: -13.312, lng: 48.314 },
  { iata: 'PUQ', name: 'Punta Arenas', lat: -53.002, lng: -70.854 },
  { iata: 'BOO', name: 'Bodø', lat: 67.269, lng: 14.365 },
  { iata: 'KOI', name: 'Kirkwall', lat: 58.958, lng: -2.904 },
  { iata: 'AMQ', name: 'Ambon', lat: -3.710, lng: 128.089 },
  { iata: 'ARD', name: 'Alor', lat: -8.132, lng: 124.598 },
  { iata: 'MDC', name: 'Manado', lat: 1.549, lng: 124.926 },
  { iata: 'WNI', name: 'Matahora (Wakatobi)', lat: -5.294, lng: 123.636 },
  { iata: 'SUV', name: 'Suva', lat: -18.043, lng: 178.559 },
  { iata: 'KDV', name: 'Kadavu', lat: -19.058, lng: 178.157 },
  { iata: 'INH', name: 'Inhambane', lat: -23.876, lng: 35.408 },
];

function toRad(d: number): number { return (d * Math.PI) / 180; }
function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLng/2)**2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export function findNearestAirport(lat: number, lng: number): Airport | null {
  let best: Airport | null = null;
  let bestDist = Infinity;
  for (const a of AIRPORTS) {
    const d = haversine(lat, lng, a.lat, a.lng);
    if (d < bestDist) { bestDist = d; best = a; }
  }
  return best;
}


