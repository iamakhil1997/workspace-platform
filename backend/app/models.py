# models.py
"""SQLAlchemy ORM models for the workspace platform.
Simplified for demonstration – includes User, Company, Project, Task, KRA, KRAProgress.
"""

from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    # Relationships
    users = relationship("User", back_populates="company")
    projects = relationship("Project", back_populates="company")

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="users")
    tasks = relationship("Task", back_populates="assignee")
    kras = relationship("KRA", back_populates="owner")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="projects")
    tasks = relationship("Task", back_populates="project")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"))
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", back_populates="tasks")

class KRA(Base):
    __tablename__ = "kras"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    target_value = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="kras")
    progresses = relationship("KRAProgress", back_populates="kra")

class KRAProgress(Base):
    __tablename__ = "kra_progresses"
    id = Column(Integer, primary_key=True, index=True)
    kra_id = Column(Integer, ForeignKey("kras.id"))
    value = Column(Float, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    kra = relationship("KRA", back_populates="progresses")
