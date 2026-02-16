// src/components/MapUpdater.tsx
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

const MapUpdater = ({ center, zoom, isInitialLoad }: any) => {
  const map = useMap();
  
  useEffect(() => {
    // Only move the map automatically if it's the first load
    if (isInitialLoad) {
      map.setView(center, zoom, { animate: true });
    }
  }, [center, zoom, map, isInitialLoad]);

  return null;
};

export default MapUpdater;