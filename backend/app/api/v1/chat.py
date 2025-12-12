"""Chat endpoints and WebSocket handler with persistence."""

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query
from typing import List
from sqlalchemy.orm import Session
from ... import models, schemas, crud
from ...db import get_db

router = APIRouter()

# --- Connection Manager ---
class ConnectionManager:
    def __init__(self):
        # Store connections by room? For now, simple list.
        # Ideally: self.active_connections: Dict[str, List[WebSocket]]
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass # Handle broken pipe

manager = ConnectionManager()

# --- Endpoints ---

@router.get("/rooms", response_model=List[str])
def list_rooms():
    return ["general", "random", "dev"]

@router.get("/history", response_model=List[schemas.MessageRead])
def get_chat_history(room: str = "general", limit: int = 50, db: Session = Depends(get_db)):
    """Fetch recent chat messages for a room."""
    messages = crud.get_messages(db, room=room, limit=limit)
    return messages

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket, 
    user_id: str = Query(...), 
    room: str = Query("general"),
    db: Session = Depends(get_db) 
):
    """
    WebSocket endpoint for real-time chat.
    Note: 'Depends' on WebSocket isn't fully supported for per-message DB sessions in all versions, 
    so we use it for initial connection or manage session manually if needed.
    """
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            
            # Persist message
            # We need a proper user ID (int) for key constraint. 
            # If user_id param is a string name, we might fail FK. 
            # MVP Hack: try conversion or use a default user if fails?
            # Ideally user_id comes from auth token in query param.
            
            sender_id_int = 1 # Default fallback
            if user_id.isdigit():
                sender_id_int = int(user_id)
            
            msg_create = schemas.MessageCreate(content=data, room=room)
            crud.create_message(db, msg_create, sender_id=sender_id_int)
            
            # Broadcast
            await manager.broadcast(f"User {user_id}: {data}")
            
    except WebSocketDisconnect:
        manager.disconnect(websocket)
        await manager.broadcast(f"User {user_id} left the chat")
    except Exception as e:
        print(f"WS Error: {e}")
        manager.disconnect(websocket)
