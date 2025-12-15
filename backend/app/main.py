
"""FastAPI entry point for the workspace-platform backend.
Includes mounting of API routers, health check, and a simple WebSocket.
"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .api.v1 import auth, users, chat, projects, tasks, kra

app = FastAPI(title="Workspace Platform Backend", version="0.1.0")

# CORS (allow all for dev – adjust for production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(chat.router, prefix="/api/v1/chat", tags=["chat"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])
app.include_router(kra.router, prefix="/api/v1/kra", tags=["kra"])

from .db import engine
from . import models

# Ensure tables exist (simplest migration strategy for MVP)
models.Base.metadata.create_all(bind=engine)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

