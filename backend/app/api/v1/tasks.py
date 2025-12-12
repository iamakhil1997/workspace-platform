# backend/app/api/v1/tasks.py
"""Task CRUD endpoints (minimal)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)):
    return crud.create_task(db, task_in)

@router.get("/", response_model=List[schemas.TaskRead])
def list_tasks(db: Session = Depends(get_db)):
    tasks = db.query(models.Task).all()
    return tasks
