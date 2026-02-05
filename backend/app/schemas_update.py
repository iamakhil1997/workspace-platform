from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# ... (Previous schemas would be imported or this file appends to schemas.py if used differently, 
# but for now I will create a new file schemas_update.py to append)

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
