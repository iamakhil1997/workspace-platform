from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel

from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

class LocationUpdate(BaseModel):
    latitude: float
    longitude: float
    allowed_radius: float = 100.0

@router.put("/me/location", response_model=schemas.CompanyRead)
def update_my_company_location(
    loc: LocationUpdate, 
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user)
):
    """
    Update the location of the current user's company.
    If user has no company, creates one for them (simplifies flow for MVP).
    """
    if not current_user.company_id:
        # Create a new company for this user
        # Assume company name is user's name + "'s Company"
        new_company = models.Company(
            name=f"{current_user.full_name}'s Company",
            latitude=loc.latitude,
            longitude=loc.longitude,
            allowed_radius=loc.allowed_radius
        )
        db.add(new_company)
        db.commit()
        db.refresh(new_company)
        
        current_user.company_id = new_company.id
        db.commit()
        return new_company
    
    # Update existing company
    company = current_user.company
    company.latitude = loc.latitude
    company.longitude = loc.longitude
    company.allowed_radius = loc.allowed_radius
    db.commit()
    db.refresh(company)
    return company

@router.get("/me", response_model=schemas.CompanyRead)
def get_my_company(
    db: Session = Depends(get_db), 
    current_user: models.User = Depends(deps.get_current_user)
):
    if not current_user.company:
        raise HTTPException(status_code=404, detail="No company associated with user")
    return current_user.company
