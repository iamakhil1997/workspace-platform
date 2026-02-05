# backend/app/api/v1/projects.py
"""Project CRUD endpoints (minimal implementation)."""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

from ...deps import get_current_user

@router.post("/", response_model=schemas.ProjectRead, status_code=status.HTTP_201_CREATED)
def create_project(project_in: schemas.ProjectCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # Override company_id to match user's company (if applicable) or ensure they have perm
    # For MVP, just creating it.
    return crud.create_project(db, project_in)

@router.get("/", response_model=List[schemas.ProjectRead])
def list_projects(filter_by: str = None, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    # filter_by: 'my' (projects I have tasks in)
    if filter_by == "my":
        # Projects where user has tasks OR is a member
        # 1. Tasks
        task_project_ids = db.query(models.Task.project_id).filter(models.Task.assignee_id == current_user.id).distinct().all()
        ids = {p[0] for p in task_project_ids}
        
        # 2. Membership (association table)
        member_projects = db.query(models.Project).join(models.project_members).filter(models.project_members.c.user_id == current_user.id).all()
        for p in member_projects:
            ids.add(p.id)
            
        projects = db.query(models.Project).filter(models.Project.id.in_(ids)).all()
        return projects
        
    if current_user.company_id:
        projects = db.query(models.Project).filter(models.Project.company_id == current_user.company_id).all()
    else:
        # Fallback: show all? or none? Let's show all for demo if no company set (or maybe creating a company is step 1)
        projects = db.query(models.Project).all()
    return projects
