// src/pages/Dashboard.tsx
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client'; // Import socket.io
import axios from 'axios';
import  MapClickHandler  from '../components/MapClickHandler';
import  MapStateTracker  from '../components/MapStateTracker';
import MapUpdater from '../components/MapUpdater';

const Dashboard = ({ mapState, setMapState }: any) => {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lon: number, addr: string} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('http://localhost:4000/vehicles-list')
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const socket = io('http://localhost:4000'); // Connect to your backend port

    socket.on('location', (payload) => {
      // payload: { vehicleId, lat, lon, ts, address ... }
      setVehicles((prevVehicles) => {
        const index = prevVehicles.findIndex(v => v.vehicle_id === payload.vehicleId);
        
        if (index !== -1) {
          // Update existing vehicle position
          const updated = [...prevVehicles];
          updated[index] = { 
            ...updated[index], 
            lat: payload.lat, 
            lon: payload.lon, 
            last_seen: payload.ts 
          };
          return updated;
        } else {
          // Add new vehicle if it doesn't exist in state
          return [...prevVehicles, { 
            vehicle_id: payload.vehicleId, 
            lat: payload.lat, 
            lon: payload.lon, 
            last_seen: payload.ts 
          }];
        }
      });
    });

    return () => { socket.disconnect(); };
  }, []);

  return (
    <MapContainer 
      center={mapState.center} 
      zoom={mapState.zoom} 
      style={{ height: '100%', width: '100%' }}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <MapUpdater 
        center={mapState.center} 
        zoom={mapState.zoom} 
        isInitialLoad={mapState.isInitialLoad} 
      />
      
      <MapStateTracker mapState={mapState} setMapState={setMapState} />

      <MapClickHandler onLocationFound={(lat, lon, addr) => setClickedLocation({lat, lon, addr})} />

      {/* Existing Vehicles with Hover Tooltips */}
      {vehicles.map(v => (
        <Marker key={v.vehicle_id} position={[v.lat, v.lon]} eventHandlers={{ click: () => navigate(`/vehicle/${v.vehicle_id}`) }}>
          <Tooltip direction="top" offset={[0, -10]}>
            <strong>Vehicle: {v.vehicle_id}</strong><br />
            Last Seen: {v.last_seen} <br />
            Latitude: {v.lat} <br />
            Longitude: {v.lon} <br />
            Address: {v.address || "Details in DB"}
          </Tooltip>
        </Marker>
      ))}

      {/* New Clicked Location Marker */}
      {clickedLocation && (
          <Popup 
            position={[clickedLocation.lat, clickedLocation.lon]} 
            eventHandlers={{
              remove: () => setClickedLocation(null) // 'remove' triggers when the popup is closed
            }}
          >
            <strong>Clicked Point:</strong><br/>{clickedLocation.addr}<br />
            Latitude: {clickedLocation.lat} <br />
            Longitude: {clickedLocation.lon}
          </Popup>
      )}
    </MapContainer>
  );
};

export default Dashboard;