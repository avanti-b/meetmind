from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.user import User
from app.schemas.auth import UserRegisterRequest, UserLoginRequest
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, payload: UserRegisterRequest) -> tuple[User, str, str]:
        # Check for existing user
        existing = self.db.query(User).filter(User.email == payload.email.lower()).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this email already exists",
            )

        user = User(
            email=payload.email.lower(),
            full_name=payload.full_name.strip(),
            hashed_password=hash_password(payload.password),
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return user, access_token, refresh_token

    def login(self, payload: UserLoginRequest) -> tuple[User, str, str]:
        user = self.db.query(User).filter(User.email == payload.email.lower()).first()

        if not user or not verify_password(payload.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password",
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Account is deactivated",
            )

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return user, access_token, refresh_token

    def refresh_tokens(self, refresh_token: str) -> tuple[User, str, str]:
        user_id = decode_token(refresh_token, token_type="refresh")
        user = self.db.query(User).filter(User.id == user_id).first()

        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token",
            )

        new_access = create_access_token(user.id)
        new_refresh = create_refresh_token(user.id)
        return user, new_access, new_refresh

    def get_user_by_id(self, user_id: str) -> User:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found",
            )
        return user
