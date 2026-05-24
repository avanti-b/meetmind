from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.routes import auth

app = FastAPI(
    title=settings.app_name,
    description="Enterprise AI Meeting Intelligence Platform",
    version="1.0.0",
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# ─── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")

# ─── Health Check ─────────────────────────────────────────────────────────────
@app.get("/health", tags=["System"])
def health_check():
    return {"status": "healthy", "app": settings.app_name, "env": settings.app_env}
