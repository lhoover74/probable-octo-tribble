TowTrack Database Setup

This repository now contains a SQLite-backed implementation alongside the earlier JSON-backed and scaffold-only routes.

Database-backed routes
/db
/db/dashboard
/db/vehicles
/db/vehicles/new
/db/vehicles/[id]
/db/tow-requests
/api/db-vehicles
/api/db-vehicles/[id]

Files added for the database layer
- db/schema.sql
- lib/server/sqlite.ts
- lib/server/sqlite-vehicle-store.ts
- lib/sqlite-actions.ts

How it works
- A SQLite database file is created under data/sqlite/towtrack.sqlite
- The database schema is loaded from db/schema.sql
- Reference data is seeded from lib/mock-data.ts
- Existing vehicle seed records are imported from data/vehicles.json the first time the database is initialized
- The DB routes then create, read, and update records from SQLite

Important note
- This SQLite path depends on a Node runtime that supports node:sqlite
- The older main routes are still being handled through the live JSON-backed rewrite path unless they are manually swapped later
