// src/types/types.ts
export interface VehicleLocation {
  vehicle_id: string;
  lat: number;
  lon: number;
  last_seen?: string;
  ts?: string;
  address?: any;
}

export interface NominatimDetails {
  display_name: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}