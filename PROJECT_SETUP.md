TowTrack Web Setup

This repository contains a browser-first tow tracking website scaffold for private property operations.

Routes
/
/dashboard
/vehicles
/vehicles/new
/vehicles/[id]
/tow-requests
/reports
/properties
/users
/settings
/api/vehicles

Run locally
1. Install dependencies with npm install
2. Start development with npm run dev
3. Open the local Next.js address shown in the terminal

Current state
- Uses mock data from lib/mock-data.ts
- Forms are scaffolded and not yet saved to a database
- Authentication is demo only
- Evidence upload and plate or VIN scanning are placeholder UI flows

Recommended next steps
- Add real authentication
- Add a database for vehicle records
- Wire create and update forms to API routes
- Add cloud file storage for evidence uploads
- Integrate scanning service for plate and VIN lookup
- Add protected routes by role
