Background Research App

Monorepo with React frontend and Node.js backend.

Structure:
- frontend/ — React app (Create React App)
- backend/ — Node.js Express server exposing /api/summarize

Local dev (optional):
1) Backend: cd backend && npm i && npm run start (PORT=4000)
2) Frontend: cd frontend && npm i && npm start
   - Edit frontend/public/config.js to point apiUrl to your backend URL.

Choreo:
- Frontend uses Choreo Managed Auth. Login at /auth/login and logout at /auth/logout.
- Frontend reads API base via public/config.js (mounted by Choreo) using window.configs.apiUrl. Local fallback uses window.config.apiUrl.
- Backend has .choreo/component.yaml defining a public REST endpoint at port 4000.
