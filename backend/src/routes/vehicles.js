// src/routes/vehicles.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/:vehicleId', async (req, res) => {
  const vehicleId = req.params.vehicleId;
  try {
    const q = `
      SELECT v.vehicle_id, v.zone_id, z.name as zone_name, v.last_seen
      FROM vehicle_current_zone v
      LEFT JOIN zones z ON v.zone_id = z.id
      WHERE v.vehicle_id = $1
    `;
    const r = await pool.query(q, [vehicleId]);
    if (!r.rows.length) return res.status(404).json({ vehicleId, zone: null });
    res.json(r.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
