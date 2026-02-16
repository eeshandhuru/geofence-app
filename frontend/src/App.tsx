import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Dashboard from './pages/Dashboard';
import VehicleDetail from './pages/VehicleDetail';
import 'leaflet/dist/leaflet.css';
import { baseURL } from './api/client';

const SearchBar = () => {
  const [searchId, setSearchId] = useState('');
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${baseURL}/vehicles-list`)
      .then(res => setVehicles(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    if (searchId.trim()) {
      const matches = vehicles
        .filter(v => v.vehicle_id.toLowerCase().includes(searchId.toLowerCase()))
        .slice(0, 10);
      setFiltered(matches);
      setShowDropdown(true);
    } else {
      setFiltered([]);
      setShowDropdown(false);
    }
  }, [searchId, vehicles]);

  const handleSearch = (id: string) => {
    if (id.trim()) {
      navigate(`/vehicle/${id.trim()}`);
      setSearchId('');
      setShowDropdown(false);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <form onSubmit={(e) => { e.preventDefault(); handleSearch(searchId); }} style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          placeholder="Search Vehicle ID..."
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          style={{ padding: '5px 10px', borderRadius: '4px', border: 'none' }}
        />
      </form>
      {showDropdown && filtered.length > 0 && (
        <ul style={{
          position: 'absolute', top: '100%', left: 0, right: 0,
          background: 'white', color: 'black', margin: 0, padding: 0,
          listStyle: 'none', borderRadius: '4px', zIndex: 2000,
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          {filtered.map(v => (
            <li 
              key={v.vehicle_id}
              onClick={() => handleSearch(v.vehicle_id)}
              style={{ padding: '8px 12px', cursor: 'pointer', borderBottom: '1px solid #eee' }}
            >
              🚗 {v.vehicle_id}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const App = () => {
  // Global Map State to sustain zoom/center
  const [mapState, setMapState] = useState({
    center: [20, 0] as [number, number],
    zoom: 3,
    isInitialLoad: true
  });
  

  // Get Client Location on first load
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapState({
            center: [pos.coords.latitude, pos.coords.longitude],
            zoom: 10,
            isInitialLoad: true
          });
        },
        (err) => {
          console.error(`${err.code}: ${err.message}`);
          console.log('Location denied or unavailable');
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', height: '100vh', width: '100vw', flexDirection: 'column' }}>
        <nav style={{ 
          padding: '10px 20px', background: '#282c34', color: 'white', 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 1000 
        }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', fontWeight: 'bold' }}>Dashboard</Link>
          <SearchBar />
        </nav>

        <div style={{ flex: 1, position: 'relative' }}>
          <Routes>
            <Route path="/" element={<Dashboard mapState={mapState} setMapState={setMapState} />} />
            <Route path="/vehicle/:id" element={<VehicleDetail mapState={mapState} setMapState={setMapState} />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;