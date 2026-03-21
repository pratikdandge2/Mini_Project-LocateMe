# LocateMe — Campus Lost & Found

A campus Lost & Found web platform for VCET students. Report lost or found items, upload photos, and discuss via real-time comments. Access is restricted to **@vcet.edu.in** email addresses.

## Stack

- **Frontend:** React 18 + Vite, deployed on Vercel
- **Backend:** Node.js + Express, deployed on Render
- **Database:** MongoDB Atlas
- **Images:** Cloudinary (unsigned upload)
- **Auth:** Firebase (Google Sign-In, domain-restricted)
- **Real-time:** Socket.IO on the same Express server

## Quick start

### 1. Server

```bash
cd server
cp .env.example .env
# Edit .env: MONGO_URI, CLIENT_URL, FIREBASE_SERVICE_ACCOUNT_JSON
npm install
npm run dev
```

Runs on `http://localhost:5000`.

### 2. Client

```bash
cd client
cp .env.example .env
# Edit .env: VITE_API_URL, Firebase and Cloudinary keys
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### 3. Environment

- **Firebase:** Create a project, enable Google Sign-In, add `localhost` (and production domain) to Authorized domains. For the server, use a Service Account and paste the JSON as a single-line string in `FIREBASE_SERVICE_ACCOUNT_JSON`.
- **MongoDB Atlas:** Create a cluster and database, whitelist IPs (or `0.0.0.0/0` for dev), set `MONGO_URI`.
- **Cloudinary:** Create an **unsigned** upload preset and set `VITE_CLOUDINARY_CLOUD_NAME` and `VITE_CLOUDINARY_PRESET`.

## Features

- Google Sign-In restricted to @vcet.edu.in (client + server)
- Report Lost / Report Found with image, name, location, description
- Feed with filters: All | Lost | Found
- Item detail page with image, info, and comments
- Real-time comments via Socket.IO
- Mark as resolved / Delete (owner only)
- Grey-white UI with red (Lost) and green (Found) accents

## Project structure

```
locateme/
├── client/          # React + Vite
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── utils/
│   └── ...
└── server/          # Express + Socket.IO
    ├── models/
    ├── routes/
    ├── middleware/
    ├── socket/
    └── server.js
```

## Deployment

- **Vercel:** Use `client/` as root, set all `VITE_*` env vars, set `VITE_API_URL` to the Render backend URL. Add the Vercel domain to Firebase Authorized domains.
- **Render:** Use `server/` as root, set env vars, enable WebSockets, set `CLIENT_URL` to the Vercel URL.
