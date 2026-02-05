
"""FastAPI entry point for the workspace-platform backend.
Includes mounting of API routers, health check, and a simple WebSocket.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.v1 import auth, users, chat, projects, tasks, kra

app = FastAPI(title="Workspace Platform Backend", version="0.1.0")

from fastapi.staticfiles import StaticFiles
from pathlib import Path
Path("static/uploads").mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory="static"), name="static")

# CORS (allow all for dev – adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
from .api.v1 import companies
app.include_router(companies.router, prefix="/api/v1/companies", tags=["companies"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(kra.router, prefix="/api/v1/kra", tags=["kra"])
from .api.v1 import time_tracking
app.include_router(time_tracking.router, prefix="/api/v1/time-tracking", tags=["time-tracking"])
from .api.v1 import friends
app.include_router(friends.router, prefix="/api/v1/friends", tags=["friends"])

from .api.v1 import assets, training, exit_requests
app.include_router(assets.router, prefix="/api/v1/assets", tags=["assets"])
app.include_router(training.router, prefix="/api/v1/training", tags=["training"])
app.include_router(exit_requests.router, prefix="/api/v1/exit-requests", tags=["exit-requests"])

from .db import engine
from . import models

# Ensure tables exist (simplest migration strategy for MVP)
models.Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

