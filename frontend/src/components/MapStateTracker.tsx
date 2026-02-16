// src/components/MapStateTracker.tsx
import { useMapEvents } from 'react-leaflet';

const MapStateTracker = ({ mapState, setMapState }: any) => {
  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const newCenter = map.getCenter();
      const newZoom = map.getZoom();

      // Only update if the movement is significant to avoid tiny float loops
      const latDiff = Math.abs(newCenter.lat - mapState.center[0]);
      const zoomDiff = newZoom !== mapState.zoom;

      if (latDiff > 0.000001 || zoomDiff) {
        setMapState({
          center: [newCenter.lat, newCenter.lng],
          zoom: newZoom,
          isInitialLoad: false // NEW: Tell the app the user is now in control
        });
      }
    }
  });
  return null;
};

export default MapStateTracker;