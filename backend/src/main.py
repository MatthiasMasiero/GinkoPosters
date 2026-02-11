import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address
from sqlalchemy import text

from src.accounting.router import router as accounting_router
from src.artists.router import router as artists_router
from src.auth.router import router as auth_router
from src.config import settings
from src.database import async_session_factory, engine
from src.fulfillment.router import router as fulfillment_router
from src.orders.router import router as orders_router
from src.payments.router import router as payments_router
from src.products.router import router as products_router

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify DB connection on startup
    try:
        async with engine.begin() as conn:
            await conn.execute(text("SELECT 1"))
        logger.info("Database connection verified")
    except Exception as e:
        logger.error("Database connection failed: %s", e)
        raise

    # Load artist domains for CORS
    try:
        async with async_session_factory() as session:
            from src.artists.service import get_all_artist_domains

            domains = await get_all_artist_domains(session)
            origins = [f"http://{d}" for d in domains] + [f"https://{d}" for d in domains]
            origins.append(settings.FRONTEND_URL)
            origins.append(f"http://{settings.PRIMARY_DOMAIN}:3000")
            origins.append("http://localhost:3000")
            app.state.allowed_origins = origins
    except Exception as e:
        logger.warning("Could not load artist domains for CORS: %s", e)
        app.state.allowed_origins = [
            settings.FRONTEND_URL,
            "http://localhost:3000",
        ]

    yield

    await engine.dispose()


app = FastAPI(title="GinkoPosters API", lifespan=lifespan)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Security headers + dynamic CORS middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    response: Response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"

    # Dynamic CORS
    origin = request.headers.get("origin")
    allowed = getattr(request.app.state, "allowed_origins", ["http://localhost:3000"])
    if origin and origin in allowed:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return response


# Also add standard CORS middleware as fallback for preflight requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(artists_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(fulfillment_router)
app.include_router(accounting_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
