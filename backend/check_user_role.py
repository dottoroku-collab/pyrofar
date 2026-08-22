import asyncio
from app.db.session import SessionLocal
from app.models.user import User, UserRole

async def main():
    async with SessionLocal() as db:
        user = await db.get(User, "199007082019031002")
        print(f"NIP: {user.nip}, Name: {user.full_name}, Role: {user.role}")

if __name__ == "__main__":
    asyncio.run(main())
