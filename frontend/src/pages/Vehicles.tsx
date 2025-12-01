// src/pages/Vehicles.tsx
import React, { useEffect, useState } from "react";
import { api } from "../api/client";

type VehicleStatus = {
  vehicle_id: string;
  zone_id: number | null;
  zone_name: string | null;
  last_seen: string | null;
};

export default function Vehicles() {
  const [vehicles, setVehicles] = useState<VehicleStatus[]>([]);
  const [search, setSearch] = useState("");

  // optional: call your backend endpoint /latest-locations or /vehicles-list
  const fetchVehicles = async () => {
    try {
      const res = await api.get("/vehicles-list"); 
      setVehicles(res.data || []);
    } catch (err) {
      console.error("Error fetching vehicles", err);
    }
  };

  useEffect(() => {
    fetchVehicles();

    // Auto refresh every 5 seconds
    const iv = setInterval(fetchVehicles, 5000);
    return () => clearInterval(iv);
  }, []);

  const filtered = vehicles.filter((v) =>
    v.vehicle_id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ padding: "20px" }}>
      <h2>Vehicle Status</h2>

      {/* Search bar */}
      <input
        placeholder="Search vehicle..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          padding: "10px",
          width: "250px",
          borderRadius: "6px",
          border: "1px solid #ddd",
          marginBottom: "20px",
        }}
      />

      <div
        style={{
          maxHeight: "80vh",
          overflowY: "auto",
          border: "1px solid #eee",
          borderRadius: "6px",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5", textAlign: "left" }}>
              <th style={th}>Vehicle ID</th>
              <th style={th}>Current Zone</th>
              <th style={th}>Last Seen</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={3} style={{ textAlign: "center", padding: "20px" }}>
                  No vehicles found
                </td>
              </tr>
            )}

            {filtered.map((v) => (
              <tr key={v.vehicle_id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={td}>{v.vehicle_id}</td>
                <td style={td}>{v.zone_name || "Outside all zones"}</td>
                <td style={td}>
                  {v.last_seen
                    ? new Date(v.last_seen).toLocaleString()
                    : "Unavailable"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "10px",
  borderBottom: "1px solid #ddd",
  fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: "10px",
};
