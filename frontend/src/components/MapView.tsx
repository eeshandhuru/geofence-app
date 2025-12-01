// src/components/MapView.tsx
import React, { useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

/* Fix default marker icon issue in Vite bundlers */
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

// Leaflet marker icon config
const DefaultIcon = L.icon({
  iconUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type MapViewProps = {
  height?: string;
  zoom?: number;
  center?: [number, number];

  // Vehicle markers
  markers?: {
    id: number;
    vehicle_id: string;
    lat: number;
    lon: number;
    popup?: string;
  }[];

  // Zone polygons
  zones?: {
    id: number;
    name: string;
    geojson: any;
  }[];

  // Auto-fit entire map to all markers + zones
  autoFit?: boolean;
};

function AutoFit({ markers, zones }: { markers?: any[]; zones?: any[] }) {
  const map = useMap();

  useEffect(() => {
    const bounds = L.latLngBounds([]);

    if (markers) {
      markers.forEach((m) => bounds.extend([m.lat, m.lon]));
    }

    if (zones) {
      zones.forEach((z) => {
        const layer = L.geoJSON(z.geojson);
        try {
          layer.getBounds().isValid() && bounds.extend(layer.getBounds());
        } catch {}
      });
    }

    if (bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [markers, zones]);

  return null;
}

export default function MapView({
  height = "100%",
  zoom = 5,
  center = [20.5937, 78.9629],
  markers = [],
  zones = [],
  autoFit = true,
}: MapViewProps) {
  return (
    <div style={{ width: "100%", height }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: "100%", width: "100%", minWidth: 0, minHeight: 0 }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {zones.map((z) => (
          <GeoJSON
            key={z.id}
            data={z.geojson}
            style={{
              color: "blue",
              weight: 2,
              fillOpacity: 0.3,
            }}

            onEachFeature={(feature, layer) => {
              const zoneName = z.name || "Unnamed Zone";

              // Add hover tooltip
              layer.bindTooltip(zoneName, {
                permanent: false,
                direction: "top",
                offset: [0, -10],
              });

              // Show on hover
              layer.on("mouseover", () => layer.openTooltip());
              layer.on("mouseout", () => layer.closeTooltip());
            }}
          />
        ))}


        {markers.map((m) => (
          <Marker key={m.id} position={[m.lat, m.lon]}>
            {m.popup && <Popup>{m.popup}</Popup>}
          </Marker>
        ))}

        {autoFit && <AutoFit markers={markers} zones={zones} />}
      </MapContainer>
    </div>
  );
}
