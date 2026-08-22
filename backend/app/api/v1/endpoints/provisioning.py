from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from uuid import uuid4
import datetime

from app.core.database import get_db
from app.models.tenant import Tenant
from app.models.user import User, UserRole
from app.models.license import License
from app.core.security import hash_password
from app.worker import send_welcome_email

router = APIRouter(prefix="/provisioning", tags=["SaaS Provisioning"])

class ProvisioningRequest(BaseModel):
    company_name: str
    admin_name: str
    admin_email: EmailStr
    plan_code: str = "basic"

class ProvisioningResponse(BaseModel):
    message: str
    tenant_id: str
    license_key: str

@router.post("/register", response_model=ProvisioningResponse)
def register_new_tenant(request: ProvisioningRequest, db: Session = Depends(get_db)):
    """
    Onboard a new customer:
    1. Create Tenant
    2. Generate License
    3. Create Admin User
    4. Enqueue Welcome Email task
    """
    # 1. Create Tenant
    slug = request.company_name.lower().replace(" ", "-") + "-" + str(uuid4().hex[:6])
    new_tenant = Tenant(
        name=request.company_name,
        slug=slug
    )
    db.add(new_tenant)
    db.flush() # flush to get tenant.id

    # 2. Generate License
    # Example mock license key logic
    license_key = f"SIM-{request.plan_code.upper()}-{uuid4().hex[:8].upper()}"
    new_license = License(
        tenant_id=new_tenant.id,
        license_key=license_key,
        license_id=uuid4().hex,
        plan_code=request.plan_code,
        plan_name=request.plan_code.capitalize(),
        is_active=True,
        issued_at=datetime.datetime.utcnow(),
        expires_at=datetime.datetime.utcnow() + datetime.timedelta(days=365)
    )
    db.add(new_license)

    # 3. Create Admin User
    temp_password = uuid4().hex[:12]
    new_user = User(
        tenant_id=new_tenant.id,
        nama=request.admin_name,
        email=request.admin_email,
        password_hash=hash_password(temp_password),
        role=UserRole.admin
    )
    db.add(new_user)
    db.commit()

    # 4. Enqueue Welcome Email (Celery task)
    send_welcome_email.delay(
        tenant_id=str(new_tenant.id),
        email=request.admin_email,
        temporary_password=temp_password
    )

    return {
        "message": "Provisioning successful",
        "tenant_id": str(new_tenant.id),
        "license_key": license_key
    }
