# crud.py
"""Simple CRUD helper functions for the backend models.
These functions are used by the API routers.
"""

from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from . import models, schemas

# User CRUD

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate, hashed_password: str, role: str = "employee"):
    db_user = models.User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        role=role,
        company_id=None,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

# Company CRUD

def create_company(db: Session, company: schemas.CompanyCreate):
    db_company = models.Company(
        name=company.name
    )
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

def create_task(db: Session, task: schemas.TaskCreate, creator_id: int = None):
    db_task = models.Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        project_id=task.project_id,
        assignee_id=task.assignee_id
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

# Message CRUD

def create_message(db: Session, message: schemas.MessageCreate, sender_id: int):
    db_message = models.Message(
        content=message.content,
        room=message.room,
        sender_id=sender_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

def get_messages(db: Session, room: str = "general", limit: int = 50):
    return db.query(models.Message).filter(models.Message.room == room).order_by(models.Message.timestamp.asc()).limit(limit).all()

def create_time_entry(db: Session, entry: schemas.TimeEntryCreate, user_id: int):
    # Determine clock_in or clock_out based on action, or create a raw entry
    if entry.action == "clock_in":
        db_entry = models.TimeEntry(
            user_id=user_id,
            clock_in=datetime.utcnow()
        )
        db.add(db_entry)
        db.commit()
        db.refresh(db_entry)
        return db_entry
    elif entry.action == "clock_out":
        # Find latest open entry
        last_entry = db.query(models.TimeEntry).filter(
            models.TimeEntry.user_id == user_id, 
            models.TimeEntry.clock_out == None
        ).order_by(models.TimeEntry.clock_in.desc()).first()
        
        if last_entry:
            last_entry.clock_out = datetime.utcnow()
            db.commit()
            db.refresh(last_entry)
            return last_entry
        else:
            # Create a new completed entry (e.g., if they forgot to clock in)
            db_entry = models.TimeEntry(
                user_id=user_id,
                clock_in=datetime.utcnow(),
                clock_out=datetime.utcnow()
            )
            db.add(db_entry)
            db.commit()
            db.refresh(db_entry)
            return db_entry
    return None

# Onboarding CRUD

def create_onboarding_invite(db: Session, invite: schemas.OnboardingInviteCreate, token: str, invited_by_id: int):
    db_invite = models.OnboardingInvite(
        email=invite.email,
        full_name=invite.full_name,
        role=invite.role,
        token=token,
        invited_by_id=invited_by_id,
        expires_at=datetime.utcnow() + timedelta(days=7) # 7 days expiry
    )
    db.add(db_invite)
    db.commit()
    db.refresh(db_invite)
    return db_invite

def get_onboarding_invite_by_token(db: Session, token: str):
    return db.query(models.OnboardingInvite).filter(models.OnboardingInvite.token == token).first()
