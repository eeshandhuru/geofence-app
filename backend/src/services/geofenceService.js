// src/services/geofenceService.js
const { pool } = require('../db');
const logger = require('../util/logger');
const eventBus = require('../events/eventBus');
const axios = require('axios');

async function getLocationData(lat, lon) {
  const url = 'https://nominatim.openstreetmap.org/reverse';
  
  const response = await axios.get(url, {
    params: {
      lat: lat,
      lon: lon,
      format: 'json', // Requesting response in JSON format
      zoom: 18 // Adjust zoom for the level of detail (0-18)
    },
    headers: {
      // IMPORTANT: Provide a meaningful User-Agent to comply with the Nominatim usage policy
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36' 
    }
  });

  // The result is in response.data
  return response.data;
}

async function updateLocation(vehicleId, lat, lon, raw = {}) {

  const locData = await getLocationData(lat, lon);
  const sql1 = `
    INSERT INTO location_events (vehicle_id, lat, lon, raw, place_info)
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, ts
  `;
  const res = await pool.query(sql1, [vehicleId, lat, lon, raw, locData]);
  const id = res.rows[0].id
  console.log(res.rows)
  const sql2 = `
    INSERT INTO vehicle_current_location (vehicle_id, latest_info)
    VALUES ($1, $2)
    ON CONFLICT (vehicle_id) 
    DO UPDATE SET  
    latest_info = EXCLUDED.latest_info
  `;
  try {
    await pool.query(sql2, [vehicleId, id]);
  } catch(err) {
    const sql3 = `
      DELETE FROM location_events WHERE id = $1
    `;
    await pool.query(sql3, [id]);
    throw err;
  }
  return res.rows[0];
}

module.exports = { updateLocation }