import React from 'react';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Zones from './pages/Zones';

export default function App() {
  const [route, setRoute] = React.useState<'dashboard'|'vehicles'|'zones'>('dashboard');

  return (
    <div style={{display:'flex', height: '100vh', fontFamily:'system-ui'}}>
      <aside style={{width:240, padding:20, borderRight:'1px solid #eee'}}>
        <h2>Geofence UI</h2>
        <nav>
          <button onClick={()=>setRoute('dashboard')}>Dashboard</button><br/>
          <button onClick={()=>setRoute('vehicles')}>Vehicles</button><br/>
          <button onClick={()=>setRoute('zones')}>Zones</button><br/>
        </nav>
      </aside>
      <main style={{flex:1}}>
        {route === 'dashboard' && <Dashboard />}
        {route === 'vehicles' && <Vehicles />}
        {route === 'zones' && <Zones />}
      </main>
    </div>
  );
}
