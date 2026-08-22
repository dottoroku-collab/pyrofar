from enum import Enum
from typing import Dict, List

from app.models.user import UserRole

class Permission(str, Enum):
    # User Management
    MANAGE_USERS = "manage_users"
    VIEW_USERS = "view_users"
    
    # Armada Management
    MANAGE_ARMADA = "manage_armada"
    VIEW_ARMADA = "view_armada"

    
    # Pemeliharaan
    MANAGE_PEMELIHARAAN = "manage_pemeliharaan"
    VIEW_PEMELIHARAAN = "view_pemeliharaan"
    
    # Reports
    VIEW_REPORTS = "view_reports"
    EXPORT_REPORTS = "export_reports"
    
    # System
    VIEW_AUDIT_LOG = "view_audit_log"
    MANAGE_LICENSE = "manage_license"
    MANAGE_SETTINGS = "manage_settings"
    
    # Phase 2 Features
    MANAGE_INSIDEN = "manage_insiden"
    VIEW_INSIDEN = "view_insiden"
    MANAGE_PENCEGAHAN = "manage_pencegahan"
    VIEW_PENCEGAHAN = "view_pencegahan"
    MANAGE_SARANA = "manage_sarana"
    VIEW_SARANA = "view_sarana"


ROLE_PERMISSIONS: Dict[UserRole, List[Permission]] = {
    UserRole.administrator: [
        Permission.MANAGE_USERS, Permission.VIEW_USERS,
        Permission.MANAGE_ARMADA, Permission.VIEW_ARMADA,
        Permission.MANAGE_PEMELIHARAAN, Permission.VIEW_PEMELIHARAAN,
        Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS,
        Permission.VIEW_AUDIT_LOG, Permission.MANAGE_LICENSE,
        Permission.MANAGE_SETTINGS,
        Permission.MANAGE_INSIDEN, Permission.VIEW_INSIDEN,
        Permission.MANAGE_PENCEGAHAN, Permission.VIEW_PENCEGAHAN,
        Permission.MANAGE_SARANA, Permission.VIEW_SARANA
    ],
    UserRole.pimpinan: [
        Permission.VIEW_USERS,
        Permission.VIEW_ARMADA,
        Permission.VIEW_PEMELIHARAAN,
        Permission.VIEW_REPORTS, Permission.EXPORT_REPORTS,
        Permission.MANAGE_INSIDEN, Permission.VIEW_INSIDEN,
        Permission.MANAGE_PENCEGAHAN, Permission.VIEW_PENCEGAHAN,
        Permission.VIEW_SARANA
    ],
    UserRole.operator_cc: [
        Permission.VIEW_ARMADA,
        Permission.MANAGE_INSIDEN, Permission.VIEW_INSIDEN
    ],
    UserRole.operator_lapangan_damkar: [
        Permission.VIEW_INSIDEN, Permission.MANAGE_INSIDEN,
    ],
    UserRole.operator_lapangan_penyelamatan: [
        Permission.VIEW_INSIDEN, Permission.MANAGE_INSIDEN,
    ],
    UserRole.operator_sarpras: [
        Permission.MANAGE_ARMADA, Permission.VIEW_ARMADA,
        Permission.VIEW_PEMELIHARAAN,
        Permission.MANAGE_SARANA, Permission.VIEW_SARANA
    ],
    UserRole.teknisi: [
        Permission.VIEW_ARMADA,
        Permission.MANAGE_PEMELIHARAAN, Permission.VIEW_PEMELIHARAAN,
        Permission.MANAGE_SARANA, Permission.VIEW_SARANA
    ],
    UserRole.operator_pencegahan: [
        Permission.MANAGE_PENCEGAHAN, Permission.VIEW_PENCEGAHAN
    ]
}

def has_permission(role: UserRole, permission: Permission) -> bool:
    return permission in ROLE_PERMISSIONS.get(role, [])
