import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request, Response
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
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
from src.storage.router import router as storage_router

logger = logging.getLogger(__name__)


def _get_client_ip(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "127.0.0.1"


limiter = Limiter(key_func=_get_client_ip)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate configuration
    settings.validate_secrets()

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

    # Background task: cancel stale pending orders every 10 minutes
    async def _cleanup_stale_orders():
        from src.orders.service import cancel_stale_pending_orders

        while True:
            await asyncio.sleep(600)  # 10 minutes
            try:
                async with async_session_factory() as session:
                    cancelled = await cancel_stale_pending_orders(session)
                    await session.commit()
                    if cancelled:
                        logger.info("Auto-cancelled %d stale pending orders", cancelled)
            except Exception as e:
                logger.error("Stale order cleanup failed: %s", e)

    cleanup_task = asyncio.create_task(_cleanup_stale_orders())

    yield

    cleanup_task.cancel()
    await engine.dispose()


app = FastAPI(title="GinkoPosters API", lifespan=lifespan)

# Rate limiting
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


MAX_BODY_SIZE = 10 * 1024 * 1024  # 10 MB


# Audit logging middleware (runs after security_middleware)
@app.middleware("http")
async def audit_log(request: Request, call_next):
    response = await call_next(request)
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        logger.info(
            "AUDIT: %s %s -> %d",
            request.method,
            request.url.path,
            response.status_code,
        )
    return response


# Security headers + dynamic CORS middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    origin = request.headers.get("origin")
    allowed = getattr(request.app.state, "allowed_origins", ["http://localhost:3000"])
    is_allowed_origin = origin and (
        origin in allowed
        or (origin and ".vercel.app" in origin)
    )

    # Handle preflight OPTIONS requests
    if request.method == "OPTIONS" and is_allowed_origin:
        response = Response(status_code=204)
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
        response.headers["Access-Control-Max-Age"] = "600"
        return response

    response = await call_next(request)

    # Security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()"
    response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains"
    response.headers["Content-Security-Policy"] = "default-src 'self'; frame-ancestors 'none'"

    # Dynamic CORS
    if is_allowed_origin:
        response.headers["Access-Control-Allow-Origin"] = origin
        response.headers["Access-Control-Allow-Credentials"] = "true"
        response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, PATCH, DELETE, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "Authorization, Content-Type"
    return response


# Request body size limit (runs before security_middleware)
@app.middleware("http")
async def limit_request_body(request: Request, call_next):
    content_length = request.headers.get("content-length")
    if content_length and int(content_length) > MAX_BODY_SIZE:
        return Response(content="Request body too large", status_code=413)
    return await call_next(request)


# Include routers
app.include_router(auth_router)
app.include_router(artists_router)
app.include_router(products_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(fulfillment_router)
app.include_router(accounting_router)
app.include_router(storage_router)


@app.get("/health")
async def health_check():
    return {"status": "healthy"}
