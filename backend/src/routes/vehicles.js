// src/routes/vehicles.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/:vehicleId', async (req, res) => {
  const vehicleId = req.params.vehicleId;
  try {
    const q = `
      SELECT event.vehicle_id as vehicle_id, event.ts as last_seen,
      event.lat as lat, event.lon as lon, event.place_info as place_info
      FROM vehicle_current_location AS loc
      JOIN location_events AS event
      ON loc.latest_info=event.id 
      WHERE event.vehicle_id = $1
    `;
    const r = await pool.query(q, [vehicleId]);
    if (!r.rows.length) return res.status(404).json({ vehicleId, zone: null });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const q = `
      SELECT ARRAY_AGG(vehicle_id) AS vehicle_names FROM vehicle_current_location
    `;
    const r = await pool.query(q);
    const arr = r.rows[0].vehicle_names;
    if(!r || !arr || arr.length == 0) return res.status(404).json({ vehicle_names: false });
    res.json(r.rows[0]);
  } catch(err) {
    res.status(500).json({ error: err.message });
  }
})

module.exports = router;
