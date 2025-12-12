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

class UserRead(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    company_id: Optional[int] = None

    class Config:
        orm_mode = True

class CompanyBase(BaseModel):
    name: str

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
