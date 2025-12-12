# crud.py
"""Simple CRUD helper functions for the backend models.
These functions are used by the API routers.
"""

from sqlalchemy.orm import Session
from . import models, schemas

# User CRUD

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str):
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        company_id=None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Company CRUD

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(name=company.name)
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company

# Project CRUD

def create_project(db: Session, project: schemas.ProjectCreate):
    db_project = models.Project(
        name=project.name,
        description=project.description,
        company_id=project.company_id,
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project

# Task CRUD

def create_task(db: Session, task: schemas.TaskCreate):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        project_id=task.project_id,
        assignee_id=task.assignee_id,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

# KRA CRUD

def create_kra(db: Session, kra: schemas.KRACreate):
    db_kra = models.KRA(
        name=kra.name,
        target_value=kra.target_value,
        owner_id=kra.owner_id,
    )
    db.add(db_kra)
    db.commit()
    db.refresh(db_kra)
    return db_kra

# KRAProgress CRUD

def create_kra_progress(db: Session, progress: schemas.KRAProgressCreate):
    db_progress = models.KRAProgress(
        kra_id=progress.kra_id,
        value=progress.value,
        timestamp=progress.timestamp or None,
    )
    db.add(db_progress)
    db.commit()
    db.refresh(db_progress)
    return db_progress
