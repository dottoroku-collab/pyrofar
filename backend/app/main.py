from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from fastapi.staticfiles import StaticFiles


from app.api.v1.router import api_router
from app.core.config import settings
from app.core.rate_limit import limiter
from app.jobs.reminder_cron import start_scheduler
from prometheus_fastapi_instrumentator import Instrumentator

app = FastAPI(title=settings.app_name)

Instrumentator().instrument(app).expose(app, endpoint="/metrics")

app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads",
)

app.state.limiter = limiter
app.add_exception_handler(
    RateLimitExceeded,
    _rate_limit_exceeded_handler,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(
    api_router,
    prefix=settings.api_v1_prefix,
)


@app.on_event("startup")
def on_startup():
    start_scheduler()

    if settings.jwt_secret_key == "change-this-secret-in-production":
        print(
            "[PERINGATAN KEAMANAN] JWT_SECRET_KEY masih memakai nilai default. "
            "WAJIB diganti sebelum deployment produksi "
            "(lihat .env.example)."
        )


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "app": settings.app_name,
    }