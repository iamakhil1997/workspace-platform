
from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, Text, Table
from sqlalchemy.orm import relationship
from datetime import datetime
from .db import Base

project_members = Table(
    "project_members",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id"), primary_key=True),
    Column("project_id", Integer, ForeignKey("projects.id"), primary_key=True),
)

class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    allowed_radius = Column(Float, default=100.0)
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
    tasks = relationship("Task", foreign_keys="Task.assignee_id", back_populates="assignee")
    created_tasks = relationship("Task", foreign_keys="Task.creator_id", back_populates="creator")
    kras = relationship("KRA", back_populates="owner")
    
    sent_requests = relationship("FriendRequest", foreign_keys="FriendRequest.sender_id", back_populates="sender")
    received_requests = relationship("FriendRequest", foreign_keys="FriendRequest.receiver_id", back_populates="receiver")
    
    role = Column(String, default="employee") 
    profile_picture = Column(String, nullable=True)
    is_verified = Column(Boolean, default=False)
    verification_token = Column(String, nullable=True)
    
    ticket_requests = relationship("Ticket", back_populates="requester")
    time_entries = relationship("TimeEntry", back_populates="user")
    appraisals_owned = relationship("Appraisal", foreign_keys="Appraisal.employee_id", back_populates="employee")
    projects_included = relationship("Project", secondary="project_members", back_populates="members")

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    receiver_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_requests")

class TimeEntry(Base):
    __tablename__ = "time_entries"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    clock_in = Column(DateTime, default=datetime.utcnow)
    clock_out = Column(DateTime, nullable=True)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    user = relationship("User", back_populates="time_entries")

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="open")
    requester_id = Column(Integer, ForeignKey("users.id"))
    requester = relationship("User", back_populates="ticket_requests")
    created_at = Column(DateTime, default=datetime.utcnow)

class Appraisal(Base):
    __tablename__ = "appraisals"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    review_period = Column(String, nullable=False)
    score = Column(Float, nullable=True)
    feedback = Column(Text, nullable=True)
    status = Column(String, default="draft")
    employee = relationship("User", foreign_keys=[employee_id], back_populates="appraisals_owned")

class Approval(Base):
    __tablename__ = "approvals"
    id = Column(Integer, primary_key=True, index=True)
    type = Column(String, nullable=False)
    details = Column(Text, nullable=True)
    requester_id = Column(Integer, ForeignKey("users.id"))
    status = Column(String, default="pending")
    requester = relationship("User")

class Project(Base):
    __tablename__ = "projects"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="projects")
    tasks = relationship("Task", back_populates="project")
    members = relationship("User", secondary="project_members", back_populates="projects_included")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    completed = Column(Boolean, default=False)
    project_id = Column(Integer, ForeignKey("projects.id"))
    assignee_id = Column(Integer, ForeignKey("users.id"))
    creator_id = Column(Integer, ForeignKey("users.id"))
    project = relationship("Project", back_populates="tasks")
    assignee = relationship("User", foreign_keys=[assignee_id], back_populates="tasks")
    creator = relationship("User", foreign_keys=[creator_id])

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

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    sender_id = Column(Integer, ForeignKey("users.id"))
    room = Column(String, default="general")
    sender = relationship("User")

class VerificationCode(Base):
    __tablename__ = "verification_codes"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, index=True)
    code = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_used = Column(Boolean, default=False)

# HR Features
class Asset(Base):
    __tablename__ = "assets"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    type = Column(String, nullable=True)
    serial_number = Column(String, unique=True, nullable=True)
    status = Column(String, default="available")
    assigned_to_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_to = relationship("User", backref="assets")

class Training(Base):
    __tablename__ = "learnings"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default="assigned")
    assigned_to_id = Column(Integer, ForeignKey("users.id"))
    due_date = Column(DateTime, nullable=True)
    completion_date = Column(DateTime, nullable=True)
    assigned_to = relationship("User", backref="trainings")

class ExitRequest(Base):
    __tablename__ = "exit_requests"
    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("users.id"))
    reason = Column(Text, nullable=True)
    status = Column(String, default="pending")
    requested_date = Column(DateTime, default=datetime.utcnow)
    last_working_day = Column(DateTime, nullable=True)
    employee = relationship("User", backref="exit_requests")