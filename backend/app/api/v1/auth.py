# backend/app/api/v1/auth.py
"""Authentication endpoints: register and login.
Uses bcrypt for password hashing and python-jose for JWT.
"""

from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import jwt
import random
import string

from ... import crud, schemas, models
from ...db import get_db
from ...config import settings
from ...utils.email import send_email

router = APIRouter()

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

@router.post("/send-otp")
def send_otp(request: schemas.OTPRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Check if user already exists
    if crud.get_user_by_email(db, request.email):
         raise HTTPException(status_code=400, detail="Email already registered. Please login.")

    # Generate 6 digit OTP
    otp = ''.join(random.choices(string.digits, k=6))
    
    # Store in DB
    # Invalidate old codes
    old_codes = db.query(models.VerificationCode).filter(models.VerificationCode.email == request.email).all()
    for code in old_codes:
        code.is_used = True
    
    new_code = models.VerificationCode(email=request.email, code=otp)
    db.add(new_code)
    db.commit()
    
    # Send Email
    background_tasks.add_task(send_email, request.email, "Workspace Registration OTP", f"Your OTP is: {otp}")
    
    return {"message": "OTP sent to email"}

@router.post("/register", response_model=schemas.UserRead)
def register(user_in: schemas.OTPVerify, db: Session = Depends(get_db)):
    # Verify OTP
    record = db.query(models.VerificationCode).filter(
        models.VerificationCode.email == user_in.email,
        models.VerificationCode.code == user_in.code,
        models.VerificationCode.is_used == False
    ).order_by(models.VerificationCode.created_at.desc()).first()
    
    if not record:
        raise HTTPException(status_code=400, detail="Invalid OTP")
        
    # Check expiration (e.g., 10 mins)
    if datetime.utcnow() - record.created_at > timedelta(minutes=10):
        raise HTTPException(status_code=400, detail="OTP expired")
        
    record.is_used = True
    db.commit()
    
    # Create User
    db_user = crud.get_user_by_email(db, user_in.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
        
    hashed_password = get_password_hash(user_in.password)
    user_data = schemas.UserCreate(email=user_in.email, password=user_in.password, full_name=user_in.full_name)
    return crud.create_user(db, user_data, hashed_password, role=user_in.role)

@router.post("/login", response_model=schemas.Token)
def login(background_tasks: BackgroundTasks, form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = crud.get_user_by_email(db, form_data.username)
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect credentials")
    
    # Trigger login alert mail
    background_tasks.add_task(send_email, user.email, "New Login Alert", f"New login detected at {datetime.utcnow()}. If this wasn't you, verify your account.")
    
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/complete-onboarding", response_model=schemas.UserRead)
def complete_onboarding(
    data: schemas.OnboardingComplete, 
    db: Session = Depends(get_db)
):
    # Check invite
    invite = crud.get_onboarding_invite_by_token(db, data.token)
    if not invite:
        raise HTTPException(status_code=400, detail="Invalid onboarding token")
    
    if invite.is_used:
        raise HTTPException(status_code=400, detail="This invitation has already been used")
        
    if invite.expires_at and invite.expires_at < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Invitation expired")
        
    # Check if user email already exists (safety check)
    if crud.get_user_by_email(db, invite.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    # Create User
    hashed_password = get_password_hash(data.password)
    
    try:
        db_user = models.User(
            email=invite.email,
            hashed_password=hashed_password,
            full_name=invite.full_name,
            role=invite.role,
            is_verified=True,
            company_id=None
        )
        db.add(db_user)
        
        # Mark invite used
        invite.is_used = True
        
        db.commit()
        db.refresh(db_user)
        return db_user
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
