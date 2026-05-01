from fastapi import APIRouter, Request

router = APIRouter(prefix="/api")


@router.get("/health")
async def health_check():
    return {"status": "ok"}


@router.get("/debug/headers")
async def debug_headers(request: Request):
    return {
        "headers": dict(request.headers),
        "url": str(request.url),
        "client_host": request.client.host if request.client else None,
    }
