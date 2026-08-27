from pydantic import BaseModel, EmailStr

from app.models.user import UserRole


class UserCreate(BaseModel):
    nama: str
    email: EmailStr | None = None
    username: str | None = None
    password: str
    role: UserRole
    is_superadmin: bool | None = False


class UserUpdate(BaseModel):
    nama: str | None = None
    email: EmailStr | None = None
    username: str | None = None
    role: UserRole | None = None
    is_active: bool | None = None
    is_superadmin: bool | None = None


class UserAdminPublic(BaseModel):
    id: int
    nama: str
    email: EmailStr | None
    username: str | None
    role: UserRole
    is_active: bool
    is_superadmin: bool

    class Config:
        from_attributes = True
