from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
import shutil
import os
import secrets
from pathlib import Path

from ... import crud, schemas, models, deps
from ...db import get_db

router = APIRouter()

UPLOAD_DIR = Path("static/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

@router.get("/me", response_model=schemas.UserRead)
def read_users_me(current_user: models.User = Depends(deps.get_current_user)):
    return current_user

@router.put("/me", response_model=schemas.UserRead)
def update_user_me(
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Basic update logic - in a real app, use crud.update_user
    # For now, manually updating fields if present
    if user_in.full_name is not None:
        current_user.full_name = user_in.full_name
    # Handle other fields...
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/me/profile-picture", response_model=schemas.UserRead)
async def upload_profile_picture(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    # Validate file type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Generate unique filename
    file_ext = os.path.splitext(file.filename)[1]
    filename = f"{secrets.token_hex(8)}{file_ext}"
    file_path = UPLOAD_DIR / filename
    
    # Save file
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail="Could not save file")
    
    # Update user profile
    # Ensure we store a relative path or a full URL. For simplicity, relative.
    # Frontend will need to prepend the static URL.
    # Actually, let's serve static files and store the path.
    valid_path = f"/static/uploads/{filename}"
    current_user.profile_picture = valid_path
    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/invite", response_model=schemas.OnboardingInviteRead)
def invite_user(
    invite_in: schemas.OnboardingInviteCreate, 
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    if current_user.role != "admin" and current_user.role != "hr":
         raise HTTPException(status_code=403, detail="Not authorized to invite users")
    
    # Check if user already exists
    if crud.get_user_by_email(db, invite_in.email):
        raise HTTPException(status_code=400, detail="User with this email already exists")

    # Generate token
    token = secrets.token_urlsafe(32)
    
    # Create invite
    invite = crud.create_onboarding_invite(db, invite_in, token, current_user.id)
    
    # Mock sending email
    print(f"------------ ONBOARDING EMAIL ------------")
    print(f"To: {invite.email}")
    print(f"Subject: You are invited to join Workspace!")
    print(f"Link: http://localhost:3000/auth/onboarding?token={token}")
    print(f"------------------------------------------")
    
    return invite

@router.post("/verify")
def verify_email(
    token: str,
    db: Session = Depends(get_db)
):
    user = db.query(models.User).filter(models.User.verification_token == token).first()
    if not user:
        raise HTTPException(status_code=400, detail="Invalid verification token")
    
    user.is_verified = True
    user.verification_token = None # Invalidate token
    db.commit()
    return {"message": "Email verified successfully"}
