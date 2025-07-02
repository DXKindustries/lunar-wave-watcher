// src/services/tide/stationService.ts
import { cacheService } from '../cacheService';

const STATION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * 🔗 Your live backend (or proxy) endpoint.
 * - If you already deploy a Cloud-Function / Worker that serves
 *   /noaa-stations and /noaa-station, put its full HTTPS origin here.
 * - Example below uses a placeholder domain — replace with yours.
 */
const API_BASE = 'https://moontide-api.dkindustries.com';

export interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  zip?: string;
  city?: string;
  state?: string;
  distance?: number;
}

// Always fetch from backend API (dynamic, live, no mock data)
export async function getStationsForLocation(
  userInput: string
): Promise<Station[]> {
  const key = `stations:${userInput.toLowerCase()}`;

  const cached = cacheService.get<Station[]>(key);
  if (cached) return cached;

  const response = await fetch(
    `${API_BASE}/noaa-stations?locationInput=${encodeURIComponent(userInput)}`
  );
  if (!response.ok) throw new Error('Unable to fetch station list.');

  const data = await response.json();
  const stations: Station[] = data.stations || [];

  cacheService.set(key, stations, STATION_CACHE_TTL);
  return stations;
}

export async function getStationById(id: string): Promise<Station | null> {
  const key = `station:${id}`;
  const cached = cacheService.get<Station>(key);
  if (cached) return cached;

  const response = await fetch(`${API_BASE}/noaa-station/${id}`);
  if (!response.ok) throw new Error('Unable to fetch station');

  const data = await response.json();
  if (!data.station) return null;

  const station: Station = {
    id: data.station.id,
    name: data.station.name,
    latitude: data.station.latitude,
    longitude: data.station.longitude,
    state: data.station.state,
  };

  cacheService.set(key, station, STATION_CACHE_TTL);
  return station;
}
