# backend/app/api/v1/chat.py
"""Placeholder chat endpoint.
In a real app you'd have message models and DB persistence.
Here we expose a simple GET that returns a static message list.
"""

from fastapi import APIRouter, Depends
from typing import List

router = APIRouter()

@router.get("/rooms", response_model=List[str])
def list_rooms():
    return ["general", "random", "dev"]
