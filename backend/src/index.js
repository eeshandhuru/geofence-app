// src/index.js
const express = require('express');
const bodyParser = require('body-parser');
const eventsRouter = require('./routes/events');
const zonesRouter = require('./routes/zones');
const vehiclesRouter = require('./routes/vehicles');
const logger = require('./util/logger');
const locationsRouter = require('./routes/locations');
const cors = require('cors');


const app = express();

app.use(cors());


app.use(bodyParser.json({ limit: '1mb' }));
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`);
  next();
});

app.use('/', locationsRouter); // or app.use('/api', locationsRouter) if you prefer prefix
app.use('/events', eventsRouter);
app.use('/zones', zonesRouter);
app.use('/vehicles', vehiclesRouter);

app.get('/', (req, res) => res.send('Geofence Service OK'));

module.exports = app;
