TowTrack Cloudflare Setup

This repository now contains a Cloudflare Workers and D1 path built for Next.js using OpenNext.

Cloudflare-backed routes
/cf
/cf/dashboard
/cf/vehicles
/cf/vehicles/new
/cf/vehicles/[id]
/cf/tow-requests
/api/cf-vehicles
/api/cf-vehicles/[id]

Main route behavior
The normal app routes can be rewritten through middleware to point to the Cloudflare-backed pages:
/dashboard
/vehicles
/vehicles/new
/vehicles/[id]
/tow-requests
/api/vehicles
/api/vehicles/[id]

Files added for Cloudflare
- wrangler.jsonc
- open-next.config.ts
- .dev.vars.example
- public/_headers
- db/d1-init.sql
- lib/server/d1-vehicle-store.ts
- lib/cloudflare-actions.ts

What you still need to do in Cloudflare
1. Create a D1 database:
   npx wrangler d1 create towtrack-db
2. Copy the returned database_id into wrangler.jsonc
3. Initialize the schema:
   npx wrangler d1 execute towtrack-db --file=db/d1-init.sql
4. Install dependencies:
   npm install
5. Run locally with Next dev:
   npm run dev
6. Preview in the Workers runtime:
   npm run preview
7. Deploy to Cloudflare Workers:
   npm run deploy

Notes
- This Cloudflare path is intended for Workers, not Cloudflare Pages static export.
- The D1 binding name in this repo is DB.
- If you want sample data in D1, you will need to seed it after schema creation or extend the app to do first-run seeding.
