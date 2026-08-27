import logging
from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.core.database import get_db
from app.dependencies.auth import get_current_user
from app.core.security import hash_password
from app.utils.file_storage import save_upload
from app.models.user import User, UserRole
from app.models.operator_lapangan import OperatorLapangan
from app.models.armada import Armada
from app.schemas.operator_lapangan import (
    OperatorLapanganCreate,
    OperatorLapanganUpdate,
    OperatorLapanganResponse,
    ArmadaInfo
)

router = APIRouter()
logger = logging.getLogger(__name__)


def build_operator_response(operator: OperatorLapangan, armada: Armada = None) -> dict:
    return {
        "id": operator.id,
        "tenant_id": operator.tenant_id,
        "user_id": operator.user_id,
        "nip_nik": operator.nip_nik,
        "foto_url": operator.foto_url,
        "sim_file_url": operator.sim_file_url,
        "sim_expiry_date": operator.sim_expiry_date,
        "nama": operator.user.nama,
        "role": operator.user.role.value,
        "created_at": operator.created_at,
        "updated_at": operator.updated_at,
        "armada": ArmadaInfo.model_validate(armada) if armada else None,
    }


@router.get("/", response_model=List[OperatorLapanganResponse])
def read_operators(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
    skip: int = 0,
    limit: int = 100,
) -> Any:
    """
    Retrieve operators.
    """
    query = (
        db.query(OperatorLapangan, Armada)
        .join(User, User.id == OperatorLapangan.user_id)
        .outerjoin(Armada, Armada.driver_id == User.id)
        .filter(OperatorLapangan.tenant_id == current_user.tenant_id)
        .order_by(OperatorLapangan.created_at.desc())
    )
    results = query.offset(skip).limit(limit).all()

    return [build_operator_response(op, arm) for op, arm in results]


@router.post("/", response_model=OperatorLapanganResponse)
def create_operator(
    *,
    db: Session = Depends(get_db),
    operator_in: OperatorLapanganCreate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Create new field operator.
    """
    if operator_in.role not in [UserRole.operator_lapangan_damkar.value, UserRole.operator_lapangan_penyelamatan.value]:
        raise HTTPException(
            status_code=400,
            detail="Role harus operator_lapangan_damkar atau operator_lapangan_penyelamatan",
        )

    # Check NIK/NIP uniqueness in User (username) and OperatorLapangan
    user = db.query(User).filter(User.username == operator_in.nip_nik).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User dengan NIK/NIP ini sudah terdaftar.",
        )

    # Create User
    password = operator_in.password or "123456"
    new_user = User(
        tenant_id=current_user.tenant_id,
        nama=operator_in.nama,
        username=operator_in.nip_nik,
        password_hash=hash_password(password),
        role=UserRole(operator_in.role),
        is_active=True,
    )
    db.add(new_user)
    db.flush()

    # Create OperatorLapangan
    new_op = OperatorLapangan(
        tenant_id=current_user.tenant_id,
        user_id=new_user.id,
        nip_nik=operator_in.nip_nik,
        foto_url=operator_in.foto_url,
        sim_file_url=operator_in.sim_file_url,
        sim_expiry_date=operator_in.sim_expiry_date,
    )
    db.add(new_op)

    # Bind Armada if requested
    assigned_armada = None
    if operator_in.armada_id:
        armada = db.query(Armada).filter(Armada.id == operator_in.armada_id, Armada.tenant_id == current_user.tenant_id).first()
        if not armada:
            raise HTTPException(status_code=404, detail="Armada tidak ditemukan")
        armada.driver_id = new_user.id
        assigned_armada = armada

    db.commit()
    db.refresh(new_op)
    
    return build_operator_response(new_op, assigned_armada)


@router.get("/{id}", response_model=OperatorLapanganResponse)
def read_operator(
    *,
    db: Session = Depends(get_db),
    id: int,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Get operator by ID.
    """
    result = (
        db.query(OperatorLapangan, Armada)
        .join(User, User.id == OperatorLapangan.user_id)
        .outerjoin(Armada, Armada.driver_id == User.id)
        .filter(OperatorLapangan.id == id, OperatorLapangan.tenant_id == current_user.tenant_id)
        .first()
    )
    if not result:
        raise HTTPException(status_code=404, detail="Operator tidak ditemukan")
    
    op, arm = result
    return build_operator_response(op, arm)


@router.put("/{id}", response_model=OperatorLapanganResponse)
def update_operator(
    *,
    db: Session = Depends(get_db),
    id: int,
    operator_in: OperatorLapanganUpdate,
    current_user: User = Depends(get_current_user),
) -> Any:
    """
    Update an operator.
    """
    op = db.query(OperatorLapangan).filter(OperatorLapangan.id == id, OperatorLapangan.tenant_id == current_user.tenant_id).first()
    if not op:
        raise HTTPException(status_code=404, detail="Operator tidak ditemukan")

    user = op.user
    
    if operator_in.nama is not None:
        user.nama = operator_in.nama
    if operator_in.role is not None:
        if operator_in.role not in [UserRole.operator_lapangan_damkar.value, UserRole.operator_lapangan_penyelamatan.value]:
            raise HTTPException(status_code=400, detail="Role tidak valid")
        user.role = UserRole(operator_in.role)
    if operator_in.password:
        user.password_hash = hash_password(operator_in.password)

    if operator_in.foto_url is not None:
        op.foto_url = operator_in.foto_url
    if operator_in.sim_file_url is not None:
        op.sim_file_url = operator_in.sim_file_url
    if operator_in.sim_expiry_date is not None:
        op.sim_expiry_date = operator_in.sim_expiry_date

    assigned_armada = None
    if operator_in.armada_id is not None:
        # Clear current assignment
        current_armada = db.query(Armada).filter(Armada.driver_id == user.id).first()
        if current_armada and current_armada.id != operator_in.armada_id:
            current_armada.driver_id = None
        
        if operator_in.armada_id != 0:
            new_armada = db.query(Armada).filter(Armada.id == operator_in.armada_id, Armada.tenant_id == current_user.tenant_id).first()
            if not new_armada:
                raise HTTPException(status_code=404, detail="Armada tidak ditemukan")
            new_armada.driver_id = user.id
            assigned_armada = new_armada
    else:
        assigned_armada = db.query(Armada).filter(Armada.driver_id == user.id).first()

    db.commit()
    db.refresh(op)

    return build_operator_response(op, assigned_armada)


@router.post("/upload", response_model=dict)
def upload_operator_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload foto profil atau SIM untuk operator lapangan.
    Returns: {"url": "path/to/uploaded/file"}
    """
    file_url = save_upload(file, subfolder="operator_lapangan")
    return {"url": file_url}
