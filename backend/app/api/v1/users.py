# backend/app/api/v1/users.py
"""User CRUD endpoints.
Only a subset is implemented for brevity.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, schemas, models
from ...db import get_db

router = APIRouter()

# In a real app you would extract the current user from a JWT dependency.
# Here we provide a placeholder that simply returns the first user.
@router.get("/me", response_model=schemas.UserRead)
def read_current_user(db: Session = Depends(get_db)):
    # Placeholder: return the first user in the database.
    user = db.query(models.User).first()
    if not user:
        raise HTTPException(status_code=404, detail="No users found")
    return user

@router.get("/{user_id}", response_model=schemas.UserRead)
def read_user(user_id: int, db: Session = Depends(get_db)):
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user
