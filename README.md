# Workspace Platform

## 🚀 Live Demo
**This project is deployed on Render.**
Go to your [Render Dashboard](https://dashboard.render.com) to see the live URLs for the Frontend and Backend.

- **Frontend**: The user interface (Next.js)
- **Backend**: The API (FastAPI)

## Repository Layout
- `backend/`: FastAPI application (Python)
- `frontend/`: Next.js application (JavaScript/React)
- `render.yaml`: Deployment configuration for Render.com

## Setup Instructions

### 1. Cloud Deployment (Simplest)
1. Fork this repository.
2. Sign up on [Render.com](https://render.com).
3. Create a **New Blueprint** and select this repository.
4. Click **Apply**. Render will deploy both services automatically.

### 2. Local Development (Requires Docker)
1. Install Docker Desktop.
2. Run `docker compose -f infra/docker-compose.yml up --build`.
3. Visit `http://localhost:3000`.

## Features
- **Authentication**: Login/Register (JWT).
- **Chat**: Real-time chat with history persistence.
- **Projects & Tasks**: Manage workspace items.
- **Glassmorphism UI**: modern design.
