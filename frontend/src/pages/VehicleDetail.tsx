// src/pages/VehicleDetail.tsx
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip, Popup } from 'react-leaflet';
import axios from 'axios';
import L from 'leaflet';
import { io } from 'socket.io-client';
import  MapClickHandler  from '../components/MapClickHandler';
import  MapStateTracker  from '../components/MapStateTracker';
import MapUpdater from '../components/MapUpdater';
import { baseURL } from '../api/client';

const latestIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

const VehicleDetail = ({ mapState, setMapState }: any) => {
  const { id } = useParams();
  const [history, setHistory] = useState<any[]>([]);
  const [clickedLocation, setClickedLocation] = useState<{lat: number, lon: number, addr: string} | null>(null);

useEffect(() => {
    // Initial history fetch
    axios.get(`${baseURL}/api/latest-locations/${id}`)
      .then(res => setHistory(res.data.locations))
      .catch(err => console.error(err));

    // Listen for live updates for THIS specific vehicle
    const socket = io(baseURL);
    
    socket.on('location', (payload) => {
      if (payload.vehicleId === id) {
        setHistory((prev) => [
          { 
            lat: payload.lat, 
            lon: payload.lon, 
            ts: payload.ts, 
            address: payload.address // Ensure backend sends address in payload
          }, 
          ...prev 
        ]);
      }
    });

    return () => { socket.disconnect(); };
  }, [id]);

  const pathPositions: [number, number][] = history.map(loc => [loc.lat, loc.lon]);

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
        
      {pathPositions.length > 0 && <Polyline positions={pathPositions} color="blue" />}
      
      {history.map((loc, idx) => (
        <Marker 
          key={idx} 
          position={[loc.lat, loc.lon]} 
          icon={idx === 0 ? latestIcon : new L.Icon.Default()}
        >
          {/* Hover details merged from LocationsMap logic */}
          <Tooltip direction="right">
            Time: {new Date(loc.ts).toLocaleString()}<br />
            Address: {loc.address || "Fetching..."}<br />
            Latitude: {loc.lat} <br />
            Longitude: {loc.lon} 
          </Tooltip>
        </Marker>
      ))}

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

export default VehicleDetail;