// src/routes/events.js
const express = require('express');
const router = express.Router();
const geofenceService = require('../services/geofenceService');
const logger = require('../util/logger');

router.post('/', async (req, res) => {
  try {
    const { vehicleId, lat, lon, ts, meta } = req.body;
    if (!vehicleId || typeof lat !== 'number' || typeof lon !== 'number') {
      return res.status(400).json({ error: 'vehicleId, lat and lon are required and lat/lon must be numbers' });
    }
    const result = await geofenceService.handleLocationEvent({ vehicleId, lat, lon, raw: { ts, meta } });
    res.json({ ok: true, result });
  } catch (err) {
    logger.error('Error in /events: ' + err.stack);
    res.status(500).json({ error: 'internal error' });
  }
});

module.exports = router;
