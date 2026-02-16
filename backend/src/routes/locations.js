// src/routes/locations.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const axios = require('axios')

/**
 * GET /vehicles-list
 * Returns one row per known vehicle with current zone info
 */
router.get('/vehicles-list', async (req, res) => {
  try {
    const q = `
      SELECT event.vehicle_id as vehicle_id, event.ts as last_seen,
      event.lat as lat, event.lon as lon, ((event.place_info)->>'display_name') as address
      FROM vehicle_current_location AS loc
      JOIN location_events AS event
      ON loc.latest_info=event.id 
      ORDER BY event.ts DESC
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add to your backend routes
router.get('/reverse-proxy', async (req, res) => {
  const { lat, lon } = req.query;
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: { lat, lon, format: 'json', zoom: 18 },
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36'  } // Backend can set this safely!
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
/**
 * GET /latest-locations?limit=100
 * Returns the most recent location events (globally)
 */
router.get('/latest-locations/:vehicleId', async (req, res) => {
  const vehicleId = req.params.vehicleId
  try {
    const q = `
      SELECT ts, lat, lon, (place_info->>'display_name') as address, raw 
      FROM location_events WHERE vehicle_id = $1
      ORDER BY ts DESC
    `;
    const r = await pool.query(q, [vehicleId]);
    out = {vehicle_id: vehicleId, locations: r.rows};
    res.json(out);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

router.get('/latest-locations', async (req, res) => {
  try {
    const q = `
      SELECT vehicle_id, ts, lat, lon, (place_info->>'display_name') as address, raw 
      FROM location_events
      ORDER BY ts DESC
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
