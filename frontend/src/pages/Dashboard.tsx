// src/pages/Dashboard.tsx
import { useEffect, useRef, useState } from "react";
import MapView from "../components/MapView";
import { api } from "../api/client";
import { io, Socket } from "socket.io-client";

type ZoneRow = { id: number; name: string; geojson: any };
type LocationRow = { rec_id: number, vehicle_id: string; lat: number; lon: number; zone_id: number; zone_name: string; ts: string; raw?: any };

export default function Dashboard() {
  const [zones, setZones] = useState<ZoneRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const z = await api.get("/zones");
        const parsed = (z.data || []).map((r: any) => ({ id: r.id, name: r.name, geojson: JSON.parse(r.geojson) }));
        setZones(parsed);
      } catch (e) {
        console.error("Failed to load zones", e);
      }

      try {
        const l = await api.get("/latest-locations?limit=200");
        setLocations(l.data || []);
      } catch (e) {
        console.error("Failed to load latest locations", e);
      }
    })();

    const socket = io("http://localhost:4000");
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("socket connected", socket.id);
    });

    socket.on("location", (payload: any) => {
      // payload: { vehicleId, prevZone, currentZone, lat, lon, ts }
      const row: LocationRow = { rec_id: payload.rec_id, vehicle_id: payload.vehicleId, lat: payload.lat, lon: payload.lon, zone_id: payload.zone_id, zone_name: payload.zone_name, ts: payload.ts };
      setLocations((prev) => {
        // keep latest unique per vehicle at front
        const filtered = prev.filter(p => p.vehicle_id !== row.vehicle_id);
        return [row, ...filtered].slice(0, 500);
      });
    });

    socket.on("disconnect", () => {
      console.log("socket disconnected");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  // markers expected shape for MapView: { id, lat, lon, popup }
  const markers = locations.map(l => ({ id: l.rec_id, vehicle_id: l.vehicle_id, lat: l.lat, lon: l.lon, popup: `${l.vehicle_id}\n${new Date(l.ts).toLocaleString()}` }));

  return (
    <div style={{ height: "100%", display: "flex", gap: 12 }}>
      <aside style={{ width: 360, padding: 12, borderRight: "1px solid #eee", overflowY: "auto" }}>
        <h3>Live Vehicles ({locations.length})</h3>
        <div>
          {locations.slice(0, 100).map(l => (
            <div key={l.rec_id} style={{ padding: 8, borderBottom: "1px solid #f0f0f0" }}>
              <div style={{ fontWeight: 600 }}>{l.vehicle_id}</div>
              <div style={{ fontSize: 12 }}>{new Date(l.ts).toLocaleString()}</div>
              <div style={{ fontSize: 12 }}>Lat: {l.lat.toFixed(6)} Lon: {l.lon.toFixed(6)}</div>
              <div style={{ fontSize: 12 }}>Zone: {(l.zone_id && l.zone_name) ? l.zone_name : "Unknown"}</div>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ flex: 1, height: "100%", minWidth: 0 }}>
        <MapView
          height="100%"
          zones={zones}
          markers={markers}
          autoFit={true}
        />
      </main>
    </div>
  );
}
