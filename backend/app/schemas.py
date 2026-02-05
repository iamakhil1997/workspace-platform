# schemas.py
"""Pydantic schemas (DTOs) for request/response models.
Only essential fields are included for brevity.
"""

from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    user_id: Optional[int] = None

class UserBase(BaseModel):
    email: EmailStr
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

class UserRead(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    company_id: Optional[int] = None
    role: str = "employee"
    profile_picture: Optional[str] = None
    is_verified: bool = False

    class Config:
        orm_mode = True

class UserInvite(BaseModel):
    email: EmailStr
    full_name: str
    role: str = "employee"

class TicketBase(BaseModel):
    title: str
    description: Optional[str] = None

class TicketCreate(TicketBase):
    pass

class TicketRead(TicketBase):
    id: int
    status: str
    created_at: datetime
    requester_id: int
    class Config:
        orm_mode = True

class TimeEntryCreate(BaseModel):
    action: str = "clock_in" # clock_in or clock_out
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class TimeEntryRead(BaseModel):
    id: int
    clock_in: datetime
    clock_out: Optional[datetime]
    user_id: int
    class Config:
        orm_mode = True

class AppraisalBase(BaseModel):
    review_period: str
    score: Optional[float] = None
    feedback: Optional[str] = None

class AppraisalCreate(AppraisalBase):
    employee_id: int

class AppraisalRead(AppraisalBase):
    id: int
    status: str
    employee_id: int
    class Config:
        orm_mode = True

class CompanyBase(BaseModel):
    name: str
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    allowed_radius: Optional[float] = 100.0

class CompanyCreate(CompanyBase):
    pass

class CompanyRead(CompanyBase):
    id: int

    class Config:
        orm_mode = True

class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None

class ProjectCreate(ProjectBase):
    company_id: int

class ProjectRead(ProjectBase):
    id: int
    company_id: int

    class Config:
        orm_mode = True

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    completed: bool = False

class TaskCreate(TaskBase):
    project_id: int
    assignee_id: int

class TaskRead(TaskBase):
    id: int
    project_id: int
    assignee_id: int

    class Config:
        orm_mode = True

class KRABase(BaseModel):
    name: str
    target_value: float

class KRACreate(KRABase):
    owner_id: int

class KRARead(KRABase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

class KRAProgressBase(BaseModel):
    value: float
    timestamp: Optional[datetime] = None

class KRAProgressCreate(KRAProgressBase):
    kra_id: int

class KRAProgressRead(KRAProgressBase):
    id: int
    kra_id: int

    class Config:
        orm_mode = True

class MessageBase(BaseModel):
    content: str
    room: str = "general"

class MessageCreate(MessageBase):
    pass

class MessageRead(MessageBase):
    id: int
    sender_id: int
    timestamp: datetime

    class Config:
        orm_mode = True

# HR & Admin Features

class AssetBase(BaseModel):
    name: str
    type: Optional[str] = None
    serial_number: Optional[str] = None
    status: str = "available"

class AssetCreate(AssetBase):
    pass

class AssetRead(AssetBase):
    id: int
    assigned_to_id: Optional[int] = None
    class Config:
        orm_mode = True

class TrainingBase(BaseModel):
    name: str
    description: Optional[str] = None
    due_date: Optional[datetime] = None

class TrainingCreate(TrainingBase):
    assigned_to_id: int

class TrainingRead(TrainingBase):
    id: int
    status: str
    assigned_to_id: int
    completion_date: Optional[datetime] = None
    class Config:
        orm_mode = True

class ExitRequestBase(BaseModel):
    reason: Optional[str] = None
    last_working_day: Optional[datetime] = None

class ExitRequestCreate(ExitRequestBase):
    pass

class ExitRequestRead(ExitRequestBase):
    id: int
    employee_id: int
    status: str
    requested_date: datetime
    class Config:
        orm_mode = True 

class AttendanceStat(BaseModel):
    user_id: int
    full_name: Optional[str]
    status: str # "online" or "offline"
    clock_in: Optional[datetime] = None
    clock_out: Optional[datetime] = None
    total_hours: float = 0.0
    last_seen: Optional[datetime] = None

class AttendanceDashboard(BaseModel):
    stats: List[AttendanceStat]
    online_count: int
    offline_count: int

class OTPRequest(BaseModel):
    email: EmailStr

class OTPVerify(BaseModel):
    email: EmailStr
    code: str
    password: str
    full_name: str