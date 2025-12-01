// src/routes/locations.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

/**
 * GET /vehicles-list
 * Returns one row per known vehicle with current zone info
 */
router.get('/vehicles-list', async (req, res) => {
  try {
    const q = `
      SELECT v.vehicle_id, v.zone_id, z.name as zone_name, v.last_seen
      FROM vehicle_current_zone v
      LEFT JOIN zones z ON v.zone_id = z.id
      ORDER BY v.last_seen DESC
      LIMIT 1000
    `;
    const r = await pool.query(q);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


/**
 * GET /latest-locations?limit=100
 * Returns the most recent location events (globally)
 */
router.get('/latest-locations', async (req, res) => {
  const limit = Math.min(1000, Math.max(1, parseInt(req.query.limit) || 100));
  try {
    const q = `
      SELECT le.id as rec_id, le.vehicle_id as vehicle_id, le.lat as lat, le.lon as lon, le.zone_id as zone_id, z.name as zone_name, le.ts as ts, le.raw as raw
      FROM location_events le
      LEFT JOIN zones z ON le.zone_id = z.id
      ORDER BY le.ts DESC
      LIMIT $1
    `;
    const r = await pool.query(q, [limit]);
    res.json(r.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
