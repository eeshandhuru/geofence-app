// src/pages/Zones.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import MapView from "../components/MapView";

type Zone = { id: number; name: string; geojson: any };

export default function Zones() {
  const [zones, setZones] = useState<Zone[]>([]);
  const [name, setName] = useState("");
  const [coordsText, setCoordsText] = useState("");
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const loadZones = async () => {
    try {
      const r = await api.get("/zones");
      const parsed = r.data.map((z: any) => ({ id: z.id, name: z.name, geojson: JSON.parse(z.geojson) }));
      setZones(parsed);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadZones();
  }, []);

  useEffect(() => {
    const lines = coordsText.split('\n').map(l => l.trim()).filter(Boolean);
    if (!lines.length) {
      setPreview(null);
      return;
    }
    const coords = lines.map(line => {
      const [lon, lat] = line.split(',').map(s => parseFloat(s.trim()));
      return [lon, lat];
    });
    // Ensure polygon is closed
    if (coords.length >= 3) {
      const first = coords[0];
      const last = coords[coords.length - 1];
      if (first[0] !== last[0] || first[1] !== last[1]) coords.push(first);
      setPreview({
        type: 'Feature',
        geometry: { type: 'Polygon', coordinates: [coords] }
      });
    } else {
      setPreview(null);
    }
  }, [coordsText]);

  return (
    <div style={{ display: 'flex', height: '100%' }}>

      <div style={{ flex: 1 }}>
        <MapView
          height="100vh"
          zones={[...(preview ? [{ id: -1, geojson: preview, name: 'Preview' }] : []), ...zones.map(z => ({ id: z.id, geojson: z.geojson, name: z.name }))]}
          markers={[]}
          autoFit={true}
        />
      </div>
    </div>
  );
}
