
# TaskFlow Frontend

React SPA for TaskFlow task management application.

## Features

- JWT authentication with secure token storage
- Real-time notifications via Server-Sent Events (SSE)
- Kanban board with drag-to-update status
- Axios interceptors for automatic token injection
- Protected routes with React Router

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Build for Production

```bash
npm run build
```

## Technologies

- React 18
- React Router v6
- Axios with interceptors
- Vite build tool
- Nginx (production serving)
- Docker multi-stage build

## Local Development

Prerequisites: taskflow-backend must be running first.

### Option 1 — Docker (recommended)
```bash
cp .env.example .env
docker compose up --build
# Open http://localhost:5173
```

### Option 2 — npm dev server
```bash
cp .env.example .env
npm install
npm run dev
# Open http://localhost:5173
```