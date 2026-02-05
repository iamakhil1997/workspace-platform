from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.AssetRead)
def create_asset(asset: schemas.AssetCreate, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_asset = models.Asset(**asset.dict())
    db.add(db_asset)
    db.commit()
    db.refresh(db_asset)
    return db_asset

@router.get("/", response_model=List[schemas.AssetRead])
def list_assets(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    # HR sees all, Employee sees assigned to them?
    if current_user.role in ["hr", "admin"]:
        return db.query(models.Asset).all()
    return db.query(models.Asset).filter(models.Asset.assigned_to_id == current_user.id).all()

@router.put("/{asset_id}/assign/{user_id}", response_model=schemas.AssetRead)
def assign_asset(asset_id: int, user_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    asset = db.query(models.Asset).filter(models.Asset.id == asset_id).first()
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")
    asset.assigned_to_id = user_id
    asset.status = "assigned"
    db.commit()
    db.refresh(asset)
    return asset
