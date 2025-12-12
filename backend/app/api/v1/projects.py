# backend/app/api/v1/projects.py
"""Project CRUD endpoints (minimal implementation)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(project_in: schemas.ProjectCreate, db: Session = Depends(get_db)):
    return crud.create_project(db, project_in)

@router.get("/", response_model=List[schemas.ProjectRead])
def list_projects(db: Session = Depends(get_db)):
    projects = db.query(models.Project).all()
    return projects
