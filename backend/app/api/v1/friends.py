from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from ... import crud, schemas, models
from ...db import get_db
from ...deps import get_current_user

router = APIRouter()

# --- Search Users ---
@router.get("/search", response_model=List[schemas.UserRead])
def search_users(q: str, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if not q:
        return []
    # Simple search by name or email, excluding self
    users = db.query(models.User).filter(
        or_(
            models.User.email.ilike(f"%{q}%"),
            models.User.full_name.ilike(f"%{q}%")
        ),
        models.User.id != current_user.id
    ).limit(10).all()
    return users

# --- Friend Requests ---
@router.get("/requests/pending", response_model=List[schemas.UserRead])
def get_pending_requests(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get users who have sent me a request that is still pending."""
    reqs = db.query(models.FriendRequest).filter(
        models.FriendRequest.receiver_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).all()
    
    sender_ids = [r.sender_id for r in reqs]
    senders = db.query(models.User).filter(models.User.id.in_(sender_ids)).all()
    # Note: Ideally we return the Request ID too, but for UI we might just need the user details + separate request ID management
    # For simplicity, let's just return Users. Frontend will have to find the request ID or we add a helper endpoint.
    # actually, better to return a custom schema with request_id. But for now, let's keep it simple.
    # Wait, accept needs request_id.
    # Let's add an endpoint to get request ID by user ID implicitly or just fetch requests with ID.
    return senders

@router.get("/requests/pending-details")
def get_pending_requests_details(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    """Get pending requests details (request_id, sender info)."""
    reqs = db.query(models.FriendRequest).filter(
        models.FriendRequest.receiver_id == current_user.id,
        models.FriendRequest.status == "pending"
    ).all()
    
    result = []
    for r in reqs:
        sender = db.query(models.User).get(r.sender_id)
        if sender:
            result.append({
                "request_id": r.id,
                "sender": {
                    "id": sender.id,
                    "full_name": sender.full_name,
                    "email": sender.email
                },
                "timestamp": r.timestamp
            })
    return result

@router.post("/request/{receiver_id}", status_code=status.HTTP_201_CREATED)
def send_friend_request(receiver_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if receiver_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send request to yourself")
    
    # Check if already friends or pending
    existing = db.query(models.FriendRequest).filter(
        or_(
            (models.FriendRequest.sender_id == current_user.id) & (models.FriendRequest.receiver_id == receiver_id),
            (models.FriendRequest.sender_id == receiver_id) & (models.FriendRequest.receiver_id == current_user.id)
        ),
        models.FriendRequest.status.in_(["pending", "accepted"])
    ).first()
    
    if existing:
        if existing.status == "accepted":
            raise HTTPException(status_code=400, detail="Already friends")
        raise HTTPException(status_code=400, detail="Request already sent/received")

    new_req = models.FriendRequest(sender_id=current_user.id, receiver_id=receiver_id, status="pending")
    db.add(new_req)
    db.commit()
    return {"message": "Friend request sent"}

@router.post("/accept/{request_id}")
def accept_friend_request(request_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req.status = "accepted"
    db.commit()
    return {"message": "Friend request accepted"}

@router.post("/reject/{request_id}")
def reject_friend_request(request_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    req = db.query(models.FriendRequest).filter(models.FriendRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.receiver_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    req.status = "rejected"
    # Or db.delete(req) ? Usually better to keep history or just delete. Let's keep status rejected for history.
    db.commit()
    return {"message": "Friend request rejected"}

@router.get("/my-friends", response_model=List[schemas.UserRead])
def get_my_friends(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    sent = db.query(models.FriendRequest).filter(models.FriendRequest.sender_id == current_user.id, models.FriendRequest.status == "accepted").all()
    received = db.query(models.FriendRequest).filter(models.FriendRequest.receiver_id == current_user.id, models.FriendRequest.status == "accepted").all()
    
    friend_ids = [r.receiver_id for r in sent] + [r.sender_id for r in received]
    friends = db.query(models.User).filter(models.User.id.in_(friend_ids)).all()
    return friends
