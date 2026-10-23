# KisanTractor ERP

React (Vite) + Express + MongoDB clone of the KisanTractor & Implements Ltd. control centre.

## Setup
```bash
npm run install:all
```
Edit `server/.env` with your MongoDB credentials:
```
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
DB_NAME=kisantractor
```
(Defaults to a local `mongodb://127.0.0.1:27017`.)

## Run
```bash
npm run dev      # API on :5000, web on http://localhost:5173
npm run seed     # wipe + reload the mock data
```
Mock data is auto-seeded on first start when the database is empty (`SEED_ON_START=false` to disable).
Mock data lives in `server/data.js`; each key becomes a MongoDB collection.
