# 🚗 Realtime Geofencing & Live Vehicle Tracking System 

A full-stack web application for real-time GPS vehicle tracking and polygon-based geofencing using Express.js + PostgreSQL (Supabase) backend and React + TypeScript + Leaflet frontend.

---

### 🔥 Features  
• Live GPS Tracking 📍  
• WebSocket vehicle streaming  
• Live map visualization  

---

### 🗺 Geofence Zones  
• Polygon zones stored as GeoJSON  
• Hover zone-name tooltip display  
• Auto-render on dashboard  

---

### 🖼 UI Highlights
Feature | Status
---|:---:
Live Map | ✔
Vehicle Pins | ✔
GeoJSON Zones | ✔
Hover Tooltip | ✔
Socket Live Stream | ✔

---

### 🏗 Tech Stack
Layer | Technology
---|---
Frontend | React + TypeScript + Vite
Backend | Express.js + Node.js
DB | Supabase PostgreSQL (Non-SSL)
Map | Leaflet + React-Leaflet
Realtime | Socket.IO
GIS | PostGIS + GeoJSON

---

### 📦 Project Structure
```
geofence-app/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── package-lock.json
│   ├── .env
│   └── src/
│       ├── index.js
│       ├── db/
│       │   ├── index.js
│       │   └── init.sql
│       ├── events/
│       │   └── eventBus.js
│       ├── routes/
│       │   ├── events.js
│       │   ├── locations.js
│       │   ├── vehicles.js
│       │   └── zones.js
│       ├── services/
│       │   └── geofenceService.js
│       └── utils/
│           └── logger.js
│
├── frontend/
│   ├── public/
│   │   └── vite.svg
│   ├── src/
│   │   ├── api/
│   │   │   └── client.ts
│   │   ├── assets/
│   │   │   └── react.svg
│   │   ├── components/
│   │   │   └── MapView.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Vehicles.tsx
│   │   │   └── Zones.tsx
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── eslint.config.js
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.app.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   └── vite.config.ts
│
└── README.md
```
---

### ⚙ Backend Setup
```
cd backend
npm install
```
Create `.env` inside backend:
```
DB_HOST=YOUR_HOST
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=YOUR_PW
```
Start backend:
```
npm run dev
→ http://localhost:4000
```
---

### 🔌 API Routes

Method | Route | Purpose
---|---|---
GET | /vehicles-list | All vehicles
GET | /latest-locations | Most recent location
GET | /vehicles/:vehicle:id | Check whereabouts of vehicle
GET | /zones | Fetch all polygon zones
POST | /events | Record event
WS | /ws/vehicles | Live streaming feed

WebSocket example:  
```
socket.on("vehicle_update",(data)=>console.log(data))
```
---

### 🎨 Frontend Setup
```
cd frontend
npm install
npm run dev
→ open http://localhost:5173
```

Page | Function
---|---
Dashboard.tsx | Main live map
Vehicles.tsx | List vehicles
Zones.tsx | Views Zones on map

---

### 🚀 Next Enhancements
• Geofence Entry/Exit Alerts  
• Route Playback  
• Satellite Tiles  
• Zone Reshape Tool  
• Updating of zones in database  
• Importing GeoJSON file to add new zones

---

### 🏁 Final Output  
✔ Realtime Live-Tracking  
✔ WebSocket Engine  
✔ Supabase + PostGIS Powered  
✔ UI Dashboard Fully Working  
