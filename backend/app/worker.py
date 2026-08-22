import os
from celery import Celery

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "worker",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.task_routes = {
    "app.worker.send_welcome_email": "main-queue"
}

@celery_app.task
def send_welcome_email(tenant_id: str, email: str, temporary_password: str):
    """
    Mock task to send a welcome email.
    In production, this would use a service like SendGrid, SES, or Mailgun.
    """
    # Simulate sending email
    import time
    time.sleep(2)
    print(f"==================================================")
    print(f"EMAIL SENT TO: {email}")
    print(f"TENANT ID: {tenant_id}")
    print(f"TEMP PASSWORD: {temporary_password}")
    print(f"==================================================")
    return True
