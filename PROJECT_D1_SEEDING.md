TowTrack D1 Seeding

This repository now includes a starter seed file for Cloudflare D1.

Seed file
- db/d1-seed.sql

What it inserts
- properties
- towing companies
- users
- vehicles
- vehicle photos
- vehicle activity log

How to load it into the remote D1 database
1. Make sure the schema has already been applied.
2. Run this from the project root in your terminal:

npx wrangler d1 execute towtrack-db --remote --file=./db/d1-seed.sql

How to verify
Use the D1 SQL console or run a query like:

SELECT COUNT(*) FROM vehicles;

Notes
- The seed file uses INSERT OR IGNORE so it can be run more than once without duplicating the same starter rows.
- The seeded vehicle IDs and related activity/photo IDs are fixed so the app has a stable starter dataset.
