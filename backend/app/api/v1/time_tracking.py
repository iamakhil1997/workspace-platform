from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from math import radians, cos, sin, asin, sqrt
from datetime import datetime, date, timedelta
from typing import List

from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

def haversine(lon1, lat1, lon2, lat2):
    """
    Calculate the great circle distance in meters between two points 
    on the earth (specified in decimal degrees)
    """
    if lon1 is None or lat1 is None or lon2 is None or lat2 is None:
        return float('inf')

    # convert decimal degrees to radians 
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])

    # haversine formula 
    dlon = lon2 - lon1 
    dlat = lat2 - lat1 
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a)) 
    r = 6371 * 1000 # Radius of earth in meters
    return c * r

@router.post("/clock", response_model=schemas.TimeEntryRead)
def clock_action(entry: schemas.TimeEntryCreate, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    # 1. Check location constraints if clocking in
    if entry.action == "clock_in":
        if not current_user.company:
            # If no company, check if user has forced location check enabled? For now pass
            pass
        else:
            company = current_user.company
            if company.latitude and company.longitude:
                # Require user location
                if entry.latitude is None or entry.longitude is None:
                    raise HTTPException(status_code=400, detail="Location data is required to clock in.")
                
                dist = haversine(entry.longitude, entry.latitude, company.longitude, company.latitude)
                radius = company.allowed_radius or 100.0
                
                if dist > radius:
                    raise HTTPException(
                        status_code=403, 
                        detail=f"You are {int(dist)}m away from the allowed location. Max allowed is {int(radius)}m."
                    )
    
    # 2. Perform action
    db_entry = crud.create_time_entry(db, entry, user_id=current_user.id)
    if not db_entry:
        raise HTTPException(status_code=400, detail="Could not process time entry")
    
    return db_entry

@router.get("/dashboard", response_model=schemas.AttendanceDashboard)
def get_attendance_dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    today_start = datetime.combine(date.today(), datetime.min.time())
    users = db.query(models.User).all()
    
    stats = []
    online_count = 0
    offline_count = 0
    
    for user in users:
        # Get entries for today
        entries = db.query(models.TimeEntry).filter(
            models.TimeEntry.user_id == user.id,
            models.TimeEntry.clock_in >= today_start
        ).order_by(models.TimeEntry.clock_in.asc()).all()
        
        # Calculate total hours
        total_seconds = 0.0
        is_online = False
        last_clock_in = None
        last_clock_out = None
        
        for entry in entries:
            last_clock_in = entry.clock_in
            if entry.clock_out:
                last_clock_out = entry.clock_out
                total_seconds += (entry.clock_out - entry.clock_in).total_seconds()
            else:
                # Currently clocked in
                is_online = True
                # Add duration until now
                total_seconds += (datetime.utcnow() - entry.clock_in).total_seconds()
        
        status = "online" if is_online else "offline"
        if is_online:
            online_count += 1
        else:
            offline_count += 1
            
        stats.append(schemas.AttendanceStat(
            user_id=user.id,
            full_name=user.full_name,
            status=status,
            clock_in=entries[0].clock_in if entries else None,
            clock_out=last_clock_out,
            total_hours=round(total_seconds / 3600, 2),
            last_seen=last_clock_out if not is_online else datetime.utcnow()
        ))
        
    return schemas.AttendanceDashboard(
        stats=stats,
        online_count=online_count,
        offline_count=offline_count
    )
