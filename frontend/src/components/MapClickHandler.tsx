import { useMapEvents } from "react-leaflet";
import axios from "axios";

const MapClickHandler = ({ onLocationFound }: { onLocationFound: (lat: number, lon: number, addr: string) => void }) => {
  useMapEvents({
    async click(e) {
      try {
        const res = await axios.get('http://localhost:4000/reverse-proxy', {
            params: { lat: e.latlng.lat, lon: e.latlng.lng }
        });
        onLocationFound(e.latlng.lat, e.latlng.lng, res.data.display_name);
      } catch (err) {
        console.error("Geocoding failed", err);
      }
    },
  });
  return null;
};

export default MapClickHandler;