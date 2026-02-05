
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

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
