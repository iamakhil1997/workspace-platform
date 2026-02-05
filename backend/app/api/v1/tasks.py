# backend/app/api/v1/tasks.py
"""Task CRUD endpoints (minimal)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

from ...deps import get_current_user
@router.post("/", response_model=schemas.TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return crud.create_task(db, task_in, creator_id=current_user.id)

@router.get("/", response_model=List[schemas.TaskRead])
def list_tasks(filter_by: str = "assigned", db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # filter_by: 'assigned' (default) or 'created'
    if filter_by == "created":
        tasks = db.query(models.Task).filter(models.Task.creator_id == current_user.id).all()
    else:
        tasks = db.query(models.Task).filter(models.Task.assignee_id == current_user.id).all()
    return tasks
