-- src/db/init.sql
-- enable extensions (requires superuser; Aiven supports extensions like postgis)
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;

-- Table to store zones as polygons
CREATE TABLE IF NOT EXISTS zones (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  geom GEOMETRY(POLYGON, 4326),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

TRUNCATE TABLE zones;

-- Spatial index on zones
CREATE INDEX IF NOT EXISTS idx_zones_geom ON zones USING GIST (geom);

-- Table to store vehicles' last known zone (one row per vehicle)
CREATE TABLE IF NOT EXISTS vehicle_current_zone (
  vehicle_id TEXT PRIMARY KEY,
  zone_id INTEGER REFERENCES zones(id) ON DELETE SET NULL,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Table to store location events (history)
CREATE TABLE IF NOT EXISTS location_events (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  ts TIMESTAMP WITH TIME ZONE DEFAULT now(),
  lat DOUBLE PRECISION NOT NULL,
  lon DOUBLE PRECISION NOT NULL,
  geom GEOMETRY(POINT, 4326),
  raw JSONB
);

CREATE INDEX IF NOT EXISTS idx_location_events_geom ON location_events USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_location_events_vehicle_ts ON location_events (vehicle_id, ts DESC);

-- Table to store enter/exit events
CREATE TABLE IF NOT EXISTS geofence_events (
  id BIGSERIAL PRIMARY KEY,
  vehicle_id TEXT NOT NULL,
  zone_id INTEGER REFERENCES zones(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'enter' or 'exit'
  ts TIMESTAMP WITH TIME ZONE DEFAULT now()
);

INSERT INTO zones (name, description, geom)
VALUES (
  'Bandra West',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8268, 19.0550],
          [72.8400, 19.0550],
          [72.8400, 19.0800],
          [72.8268, 19.0800],
          [72.8268, 19.0550]
        ]]
      }'), 4326)
),(
  'Andheri East MIDC',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8600, 19.1000],
          [72.8850, 19.1000],
          [72.8850, 19.1250],
          [72.8600, 19.1250],
          [72.8600, 19.1000]
        ]]
      }'), 4326)
),(
  'Marine Drive',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8150, 18.9350],
          [72.8300, 18.9350],
          [72.8300, 18.9550],
          [72.8150, 18.9550],
          [72.8150, 18.9350]
        ]]
      }'), 4326)
),(
  'Lower Parel',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8200, 18.9900],
          [72.8350, 18.9900],
          [72.8350, 19.0100],
          [72.8200, 19.0100],
          [72.8200, 18.9900]
        ]]
      }'), 4326)
),(
  'IIT Powai',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.9100, 19.1100],
          [72.9250, 19.1100],
          [72.9250, 19.1350],
          [72.9100, 19.1350],
          [72.9100, 19.1100]
        ]]
      }'), 4326)
),(
  'BKC',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8550, 19.0550],
          [72.8750, 19.0550],
          [72.8750, 19.0750],
          [72.8550, 19.0750],
          [72.8550, 19.0550]
        ]]
      }'), 4326)
),(
  'Dadar West',
  'Sample zone in Mumbai',
  ST_SetSRID(ST_GeomFromGeoJSON('{
        "type": "Polygon",
        "coordinates": [[
          [72.8300, 19.0150],
          [72.8450, 19.0150],
          [72.8450, 19.0350],
          [72.8300, 19.0350],
          [72.8300, 19.0150]
        ]]
      }'), 4326)
);