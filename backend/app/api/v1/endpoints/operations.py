from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.core.database import get_db
from app.core.security import hash_password
from app.dependencies.auth import get_current_user, require_permission
from app.models.user import User
from app.models.unit_organisasi import Kompi, Pleton, Regu
from app.models.personil import Personil
from app.models.rbac import Role
from app.schemas.operations import (
    KompiCreate, KompiUpdate, KompiResponse,
    PletonCreate, PletonUpdate, PletonResponse,
    ReguCreate, ReguUpdate, ReguResponse,
    PersonilCreate, PersonilUpdate, PersonilResponse
)

router = APIRouter()

# --- KOMPI ---

@router.get("/kompi", response_model=List[KompiResponse])
def read_kompis(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(Kompi).filter(Kompi.tenant_id == current_user.tenant_id).all()

@router.post("/kompi", response_model=KompiResponse)
def create_kompi(
    *,
    db: Session = Depends(get_db),
    kompi_in: KompiCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    kompi = Kompi(**kompi_in.model_dump(), tenant_id=current_user.tenant_id)
    db.add(kompi)
    db.commit()
    db.refresh(kompi)
    return kompi

@router.put("/kompi/{id}", response_model=KompiResponse)
def update_kompi(
    *,
    db: Session = Depends(get_db),
    id: int,
    kompi_in: KompiUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    kompi = db.query(Kompi).filter(Kompi.id == id, Kompi.tenant_id == current_user.tenant_id).first()
    if not kompi:
        raise HTTPException(status_code=404, detail="Kompi not found")
    
    update_data = kompi_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(kompi, field, value)
    
    db.add(kompi)
    db.commit()
    db.refresh(kompi)
    return kompi

@router.delete("/kompi/{id}")
def delete_kompi(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    kompi = db.query(Kompi).filter(Kompi.id == id, Kompi.tenant_id == current_user.tenant_id).first()
    if not kompi:
        raise HTTPException(status_code=404, detail="Kompi not found")
    db.delete(kompi)
    db.commit()
    return {"ok": True}

# --- PLETON ---

@router.get("/pleton", response_model=List[PletonResponse])
def read_pletons(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(Pleton).filter(Pleton.tenant_id == current_user.tenant_id).all()

@router.post("/pleton", response_model=PletonResponse)
def create_pleton(
    *,
    db: Session = Depends(get_db),
    pleton_in: PletonCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    pleton = Pleton(**pleton_in.model_dump(), tenant_id=current_user.tenant_id)
    db.add(pleton)
    db.commit()
    db.refresh(pleton)
    return pleton

@router.put("/pleton/{id}", response_model=PletonResponse)
def update_pleton(
    *,
    db: Session = Depends(get_db),
    id: int,
    pleton_in: PletonUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    pleton = db.query(Pleton).filter(Pleton.id == id, Pleton.tenant_id == current_user.tenant_id).first()
    if not pleton:
        raise HTTPException(status_code=404, detail="Pleton not found")
    
    update_data = pleton_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pleton, field, value)
    
    db.add(pleton)
    db.commit()
    db.refresh(pleton)
    return pleton

@router.delete("/pleton/{id}")
def delete_pleton(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    pleton = db.query(Pleton).filter(Pleton.id == id, Pleton.tenant_id == current_user.tenant_id).first()
    if not pleton:
        raise HTTPException(status_code=404, detail="Pleton not found")
    db.delete(pleton)
    db.commit()
    return {"ok": True}

# --- REGU ---

@router.get("/regu", response_model=List[ReguResponse])
def read_regus(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(Regu).filter(Regu.tenant_id == current_user.tenant_id).all()

@router.post("/regu", response_model=ReguResponse)
def create_regu(
    *,
    db: Session = Depends(get_db),
    regu_in: ReguCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    regu = Regu(**regu_in.model_dump(), tenant_id=current_user.tenant_id)
    db.add(regu)
    db.commit()
    db.refresh(regu)
    return regu

@router.put("/regu/{id}", response_model=ReguResponse)
def update_regu(
    *,
    db: Session = Depends(get_db),
    id: int,
    regu_in: ReguUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    regu = db.query(Regu).filter(Regu.id == id, Regu.tenant_id == current_user.tenant_id).first()
    if not regu:
        raise HTTPException(status_code=404, detail="Regu not found")
    
    update_data = regu_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(regu, field, value)
    
    db.add(regu)
    db.commit()
    db.refresh(regu)
    return regu

@router.delete("/regu/{id}")
def delete_regu(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    regu = db.query(Regu).filter(Regu.id == id, Regu.tenant_id == current_user.tenant_id).first()
    if not regu:
        raise HTTPException(status_code=404, detail="Regu not found")
    db.delete(regu)
    db.commit()
    return {"ok": True}

# --- PERSONIL ---

@router.get("/personil", response_model=List[PersonilResponse])
def read_personils(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> Any:
    return db.query(Personil).filter(Personil.tenant_id == current_user.tenant_id).all()

@router.post("/personil", response_model=PersonilResponse)
def create_personil(
    *,
    db: Session = Depends(get_db),
    personil_in: PersonilCreate,
    current_user: User = Depends(get_current_user)
) -> Any:
    # Check if NIP/NIK is already taken
    existing_personil = db.query(Personil).filter(Personil.nip_nik == personil_in.nip_nik, Personil.tenant_id == current_user.tenant_id).first()
    if existing_personil:
        raise HTTPException(status_code=400, detail="Personil with this NIP/NIK already exists")

    # Create associated user for auth
    password = personil_in.password or personil_in.nip_nik
    email = personil_in.email

    # Check if user already exists
    user_query = db.query(User).filter(User.username == personil_in.nip_nik)
    if email:
        user_query = db.query(User).filter(or_(User.email == email, User.username == personil_in.nip_nik))
    
    new_user = user_query.first()
    
    operator_role = db.query(Role).filter(Role.name == "operator_lapangan_damkar").first()

    if not new_user:
        new_user = User(
            email=email,
            username=personil_in.nip_nik,
            password_hash=hash_password(password),
            nama=personil_in.nama_lengkap,
            tenant_id=current_user.tenant_id
        )
        if operator_role:
            new_user.roles.append(operator_role)
        
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
    else:
        # User already exists, ensure it has operator role if needed
        if operator_role and operator_role not in new_user.roles:
            new_user.roles.append(operator_role)
            db.commit()

    personil_data = personil_in.model_dump(exclude={"email", "password", "user_id", "nama_lengkap", "no_hp", "foto_url", "is_active"})
    personil = Personil(**personil_data, tenant_id=current_user.tenant_id, user_id=new_user.id)
    db.add(personil)
    db.commit()
    db.refresh(personil)
    return personil

@router.put("/personil/{id}", response_model=PersonilResponse)
def update_personil(
    *,
    db: Session = Depends(get_db),
    id: int,
    personil_in: PersonilUpdate,
    current_user: User = Depends(get_current_user)
) -> Any:
    personil = db.query(Personil).filter(Personil.id == id, Personil.tenant_id == current_user.tenant_id).first()
    if not personil:
        raise HTTPException(status_code=404, detail="Personil not found")
    
    personil_data = personil_in.model_dump(exclude_unset=True, exclude={"email", "password", "nama_lengkap", "no_hp", "foto_url", "is_active"})
    
    if "nip_nik" in personil_data and personil_data["nip_nik"] != personil.nip_nik:
         existing_personil = db.query(Personil).filter(Personil.nip_nik == personil_data["nip_nik"], Personil.tenant_id == current_user.tenant_id).first()
         if existing_personil:
             raise HTTPException(status_code=400, detail="Personil with this NIP/NIK already exists")
    
    for field, value in personil_data.items():
        setattr(personil, field, value)
    
    # Update associated user
    user = db.query(User).filter(User.id == personil.user_id).first()
    if user:
        if personil_in.email is not None:
            user.email = personil_in.email
        if personil_in.password:
            user.password_hash = hash_password(personil_in.password)
        if "nip_nik" in personil_data:
            user.username = personil_data["nip_nik"]
        if personil_in.nama_lengkap is not None:
            user.nama = personil_in.nama_lengkap
        if personil_in.is_active is not None:
            user.is_active = personil_in.is_active
        db.add(user)

    db.add(personil)
    db.commit()
    db.refresh(personil)
    return personil

@router.delete("/personil/{id}")
def delete_personil(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user)
) -> Any:
    personil = db.query(Personil).filter(Personil.id == id, Personil.tenant_id == current_user.tenant_id).first()
    if not personil:
        raise HTTPException(status_code=404, detail="Personil not found")
    
    if personil.user_id:
        user = db.query(User).filter(User.id == personil.user_id).first()
        if user:
            user.is_deleted = True
            db.add(user)

    db.delete(personil)
    db.commit()
    return {"ok": True}
