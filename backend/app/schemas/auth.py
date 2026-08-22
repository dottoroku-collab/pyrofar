from uuid import UUID

from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


from typing import Optional

class LoginRequest(BaseModel):
    email: str
    password: str


class UserPublic(BaseModel):
    id: int
    tenant_id: UUID
    nama: str
    email: Optional[EmailStr] = None
    role: UserRole

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    user: UserPublic


class RefreshRequest(BaseModel):
    refresh_token: str
