// src/services/geofenceService.js
const { pool } = require('../db');
const logger = require('../util/logger');
const eventBus = require('../events/eventBus');

async function findContainingZone(lat, lon) {
  const sql = `
    SELECT id, name
    FROM zones
    WHERE ST_Contains(geom, ST_SetSRID(ST_MakePoint($1, $2), 4326))
    LIMIT 1
  `;
  const res = await pool.query(sql, [lon, lat]);
  return res.rows[0] || null;
}

async function persistLocation(vehicleId, lat, lon, zone, raw = {}) {
  const sql = `
    INSERT INTO location_events (vehicle_id, lat, lon, geom, zone_id, raw)
    VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7)
    RETURNING id, ts
  `;
  const res = await pool.query(sql, [vehicleId, lat, lon, lon, lat, zone, raw]);
  return res.rows[0];
}

async function getCurrentZone(vehicleId) {
  const sql = `SELECT zone_id FROM vehicle_current_zone WHERE vehicle_id = $1`;
  const r = await pool.query(sql, [vehicleId]);
  return r.rows[0] ? r.rows[0].zone_id : null;
}

async function setCurrentZone(vehicleId, zoneId) {
  const sql = `
    INSERT INTO vehicle_current_zone (vehicle_id, zone_id, last_seen)
    VALUES ($1, $2, now())
    ON CONFLICT (vehicle_id) DO UPDATE SET zone_id = EXCLUDED.zone_id, last_seen = EXCLUDED.last_seen
  `;
  await pool.query(sql, [vehicleId, zoneId]);
}

async function recordGeofenceEvent(vehicleId, zoneId, eventType) {
  const sql = `
    INSERT INTO geofence_events (vehicle_id, zone_id, event_type)
    VALUES ($1, $2, $3)
  `;
  await pool.query(sql, [vehicleId, zoneId, eventType]);
}

async function handleLocationEvent({ vehicleId, lat, lon, raw }) {
  // Find zone that contains the point
  const zone = await findContainingZone(lat, lon);
  const newZoneId = zone ? zone.id : null;

  // Persist raw location
  const saved = await persistLocation(vehicleId, lat, lon, newZoneId, raw);

  const currentZoneId = await getCurrentZone(vehicleId);

  if (currentZoneId !== newZoneId) {
    // Exited old zone
    if (currentZoneId && (!newZoneId || currentZoneId !== newZoneId)) {
      await recordGeofenceEvent(vehicleId, currentZoneId, 'exit');
      logger.info(`vehicle ${vehicleId} exited zone ${currentZoneId}`);
    }
    // Entered new zone
    if (newZoneId && currentZoneId !== newZoneId) {
      await recordGeofenceEvent(vehicleId, newZoneId, 'enter');
      logger.info(`vehicle ${vehicleId} entered zone ${newZoneId}`);
    }
    // update current_zone mapping
    await setCurrentZone(vehicleId, newZoneId);
  } else {
    // update last_seen timestamp
    await setCurrentZone(vehicleId, newZoneId);
  }

  const result = {
    vehicleId,
    prevZone: currentZoneId,
    currentZone: newZoneId,
    lat,
    lon,
    ts: saved.ts
  };

  // Emit location event (for WebSocket broadcasting, etc.)
  try {
    eventBus.emit('location', result);
  } catch (e) {
    logger.error('Failed to emit location event: ' + e.message);
  }

  return result;
}

module.exports = {
  handleLocationEvent,
  findContainingZone
};
