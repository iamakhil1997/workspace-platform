from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.TrainingRead)
def assign_training(training: schemas.TrainingCreate, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    db_training = models.Training(**training.dict())
    db.add(db_training)
    db.commit()
    db.refresh(db_training)
    return db_training

@router.get("/my", response_model=List[schemas.TrainingRead])
def get_my_trainings(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    return db.query(models.Training).filter(models.Training.assigned_to_id == current_user.id).all()

@router.get("/", response_model=List[schemas.TrainingRead])
def list_trainings(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.Training).all()
