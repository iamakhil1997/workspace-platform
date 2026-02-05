from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.ExitRequestRead)
def request_exit(req: schemas.ExitRequestCreate, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    db_req = models.ExitRequest(**req.dict(), employee_id=current_user.id)
    db.add(db_req)
    db.commit()
    db.refresh(db_req)
    return db_req

@router.get("/", response_model=List[schemas.ExitRequestRead])
def list_exit_requests(db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    return db.query(models.ExitRequest).all()

@router.put("/{req_id}", response_model=schemas.ExitRequestRead)
def update_exit_status(req_id: int, status: str, db: Session = Depends(get_db), current_user: models.User = Depends(deps.get_current_user)):
    if current_user.role not in ["hr", "admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    req = db.query(models.ExitRequest).filter(models.ExitRequest.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    req.status = status
    db.commit()
    db.refresh(req)
    return req
