// src/routes/zones.js
const express = require('express');
const router = express.Router();
const { pool } = require('../db');

router.get('/', async (req, res) => {
  const q = `SELECT id, name, description, ST_AsGeoJSON(geom) as geojson FROM zones`;
  const r = await pool.query(q);
  res.json(r.rows);
});


module.exports = router;
