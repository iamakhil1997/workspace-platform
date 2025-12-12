# backend/app/api/v1/kra.py
"""KRA endpoints.
Includes a summary endpoint that computes progress percentage.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

@router.post("/", response_model=schemas.KRARead, status_code=status.HTTP_201_CREATED)
def create_kra(kra_in: schemas.KRACreate, db: Session = Depends(get_db)):
    return crud.create_kra(db, kra_in)

@router.get("/users/{user_id}/kra_summary")
def kra_summary(user_id: int, db: Session = Depends(get_db)):
    # Fetch user's KRAs and their progresses
    kras = db.query(models.KRA).filter(models.KRA.owner_id == user_id).all()
    if not kras:
        raise HTTPException(status_code=404, detail="KRA not found for user")
    summary = []
    for kra in kras:
        total_progress = sum(p.value for p in kra.progresses)
        percent = (total_progress / kra.target_value) * 100 if kra.target_value else 0
        summary.append({"kra_id": kra.id, "name": kra.name, "progress_percent": percent})
    return summary
