// src/routes/events.js
const express = require('express');
const router = express.Router();
const geofenceService = require('../services/geofenceService');
const logger = require('../util/logger');
const { pool } = require('../db');

router.post('/', async (req, res) => {
  try {
    const { vehicleId, lat, lon, ts, meta } = req.body;
    console.log(req.body)
    if (!vehicleId || typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'vehicleId, lat and lon are required and lat/lon must be numbers' });
    }
    const sql = `
      SELECT event.lat AS lat, event.lon AS lon FROM vehicle_current_location AS loc 
      JOIN location_events AS event 
      ON loc.latest_info=event.id
      WHERE event.vehicle_id = $1
    `;
    const r = await pool.query(sql, [vehicleId]);
    const loc = r.rows[0];
    if (loc != null) {
      if (loc.lat == lat && loc.lon == lon) {
        return res.json({ok: true, result: "Location Persists"});
      } 
    } 

    const raw = { ts: ts, meta: meta};
    const result = await geofenceService.updateLocation( vehicleId, lat, lon, raw );
    
    res.json({ ok: true, result: result });

  } catch (err) {
    logger.error('Error in /events: ' + err.stack);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
