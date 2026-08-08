from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserCreate(BaseModel):
    nama: str
    email: EmailStr
    password: str
    role: UserRole


class UserUpdate(BaseModel):
    nama: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None


class UserAdminPublic(BaseModel):
    id: int
    nama: str
    email: EmailStr
    role: UserRole
    is_active: bool

    class Config:
        from_attributes = True
