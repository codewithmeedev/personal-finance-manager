# app/routers/users.py

from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends, Body
from typing import List
from bson import ObjectId
from datetime import datetime, timedelta, timezone
from app.schemas import UserCreate, UserSignin, UserRead, UserUpdate, ForgotPasswordRequest, TokenPair, TokenRefresh
from app.database import users_collection
from app.utils import hash_password, verify_password, create_token, decode_access_token
from app.serializers import serialize_user
from app.auth import get_current_user
import os
from dotenv import load_dotenv
import requests
load_dotenv()


ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
RESET_TOKEN_EXPIRE_MINUTES = int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", 30))
REFRESH_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("REFRESH_TOKEN_EXPIRE_MINUTES", 1440))

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)

# ------------------------------------
# User Endpoints
# ------------------------------------


@router.post("/signup", response_model=TokenPair, status_code=201)
async def create_user(user: UserCreate):
    """
    Register a new user. All fields are required except id.
    """
    # Fetch user by email
    existing_users = await users_collection.find_one({"email": user.email})
    if existing_users:
        raise HTTPException(status_code=400, detail="Email already in use.")

    # Insert new user into MongoDB
    user_dict = user.model_dump()
    user_dict["created_at"] = datetime.now(timezone.utc)
    user_dict["updated_at"] = datetime.now(timezone.utc)

    # Hash the password before storing
    user_dict["password"] = hash_password(user.password)

    try:
        result = await users_collection.insert_one(user_dict)
        inserted_user = await users_collection.find_one({"_id": result.inserted_id})
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")

    # Generate JWT token
    access_token = create_token(
        data={"sub": str(inserted_user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_token(
        data={"sub": str(inserted_user["_id"])},
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/signin", response_model=TokenPair, status_code=200)
async def signin(credentials: UserSignin):
    """
    Sign-in a user by verifying their email and password.
    """
    email = credentials.email
    password = credentials.password

    if not email or not password:
        raise HTTPException(
            status_code=400, detail="Email and password are required."
        )
    # Fetch user by email
    user = await users_collection.find_one({"email": email})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    # Verify password
    if not verify_password(password, user.get("password", "")):
        raise HTTPException(
            status_code=400,
            detail="Invalid credentials."
        )

    # Generate JWT token
    access_token = create_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}


@router.post("/refresh", response_model=TokenPair, status_code=200)
async def refresh_token(token_refresh: TokenRefresh):
    try:
        payload = decode_access_token(token_refresh.refresh_token)
        user_id: str = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token.")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid token.")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    new_refresh_token = create_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {"access_token": access_token, "refresh_token": new_refresh_token, "token_type": "bearer"}


@router.post("/logout", status_code=200)
async def logout():
    # In a stateless JWT system, logout is handled on the client side by discarding tokens.
    return {"message": "Successfully logged out. Please discard your tokens."}


@router.get("/{user_id}", response_model=UserRead, status_code=200)
async def get_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Retrieve a user's information by their user_id.
    Only the user themselves can access their data.
    """
    if str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to view this user.")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    return serialize_user(user)


@router.get("/", response_model=List[UserRead], status_code=200)
async def get_all_users():
    """
    Retrieve a list of all users.
    """
    all_users = []
    async for user in users_collection.find():
        all_users.append(serialize_user(user))
    return all_users


@router.patch("/{user_id}", response_model=UserRead, status_code=200)
async def update_user(user_id: str, updated_fields: UserUpdate, current_user: dict = Depends(get_current_user)):
    """
    Partially update a user's information.
    Only the user themselves can update their data.
    """
    if str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to update this user.")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    user = await users_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    update_data = updated_fields.model_dump(exclude_unset=True)
    if update_data:
        update_data["updated_at"] = datetime.now(timezone.utc)
        try:
            await users_collection.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            user = await users_collection.find_one({"_id": ObjectId(user_id)})
        except Exception:
            raise HTTPException(
                status_code=500, detail="Internal server error."
            )

    return serialize_user(user)


@router.delete("/{user_id}", status_code=200)
async def delete_user(user_id: str, current_user: dict = Depends(get_current_user)):
    """
    Delete a user permanently.
    Only the user themselves can delete their account.
    """
    if str(current_user["_id"]) != user_id:
        raise HTTPException(
            status_code=403, detail="Not authorized to delete this user.")

    if not ObjectId.is_valid(user_id):
        raise HTTPException(status_code=400, detail="Invalid user ID format.")

    try:
        result = await users_collection.delete_one({"_id": ObjectId(user_id)})
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="User not found.")
    except Exception:
        raise HTTPException(status_code=500, detail="Internal server error.")

    return {"message": f"User {user_id} has been deleted successfully."}


def send_reset_email_via_service(email: str, reset_link: str):
    """
    Sends a password reset email via the email microservice.
    """
    # Get the email service URL from environment variables
    email_service_url = os.getenv("EMAIL_SERVICE_URL", "http://email_microservice:9002").strip()
    sender_email = os.getenv("SENDER_EMAIL", "default@example.com")
    subject = "Password Reset Request"
    content = f"Please click the following link to reset your password:\n\n{reset_link}"
    payload = {
        "sender_name": "FinanceManager",
        "sender_email": sender_email,
        "recipient_email": email,
        "subject": subject,
        "content": content,
    }
    try:
        response = requests.post(f"{email_service_url}/send-email", json=payload)
        response.raise_for_status()
        print(f"Email sent: {response.json()}")
    except Exception as e:
        print(f"Error sending email: {e}")

@router.post("/forgot-password")
async def forgot_password(
    request: ForgotPasswordRequest,
    background_tasks: BackgroundTasks
):
    """
    Request a password reset.
    The user supplies their email in the request body.
    If the email is registered, a reset token is generated and an email is sent with a reset link.
    For security, the endpoint always returns the same message.
    """
    email = request.email
    print(f"Received forgot-password request for email: {email}")
    
    # Look up the user by email
    user = await users_collection.find_one({"email": email})
    if not user:
        print("No user found for that email.")
        return {"msg": "If that email is registered, a reset link has been sent."}

    # Generate a temporary reset token for password reset
    reset_token = create_token(
        data={"sub": str(user["_id"])},
        expires_delta=timedelta(minutes=int(os.getenv("RESET_TOKEN_EXPIRE_MINUTES", "30"))),
        token_type="reset"
    )
    print(f"Generated reset token: {reset_token}")
    
    # Construct the reset link (update URL as needed for production)
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"
    print(f"Reset link: {reset_link}")
    
    # Schedule sending the email via the email microservice in a background task
    background_tasks.add_task(send_reset_email_via_service, email, reset_link)
    
    return {"msg": "If that email is registered, a reset link has been sent."}

@router.post("/reset-password")
async def reset_password(
    token: str = Body(...),
    new_password: str = Body(...)
):
    """
    Reset password using the provided token and new password.
    Upon success, return new access and refresh tokens.
    """
    try:
        payload = decode_access_token(token)
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token.")

    user_id: str = payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload.")

    new_hashed_password = hash_password(new_password)
    result = await users_collection.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {"password": new_hashed_password}}
    )
    if result.modified_count == 0:
        raise HTTPException(status_code=500, detail="Failed to update password.")

    # Generate new tokens for automatic sign-in
    access_token = create_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    refresh_token = create_token(
        data={"sub": user_id},
        expires_delta=timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    )

    return {
        "msg": "Password updated successfully. You are now logged in.",
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }