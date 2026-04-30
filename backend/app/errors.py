import json
import logging
import traceback
from typing import Any, TypeVar, Type

from fastapi import FastAPI, HTTPException, Request, status
from fastapi.responses import JSONResponse
from sqlalchemy import ColumnElement
from sqlalchemy.exc import IntegrityError, OperationalError
from sqlalchemy.orm import Session
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)

T = TypeVar("T")

# --- Standardized error detail builder ---


def not_found(resource: str, resource_id: str | None = None) -> dict[str, Any]:
    if resource_id:
        return {"error": "not_found", "detail": f"{resource} not found: {resource_id}"}
    return {"error": "not_found", "detail": f"{resource} not found"}


def bad_request(detail: str) -> dict[str, Any]:
    return {"error": "bad_request", "detail": detail}


def unauthorized(detail: str = "Not authenticated") -> dict[str, Any]:
    return {"error": "unauthorized", "detail": detail}


def conflict(detail: str) -> dict[str, Any]:
    return {"error": "conflict", "detail": detail}


# --- Database helpers ---


def find_or_404(
    db: Session,
    model: Type[T],
    identifier: str,
    resource_name: str | None = None,
) -> T:
    """Query a model by primary key and raise 404 if not found."""
    resource_name = resource_name or model.__name__
    result = db.query(model).filter(model.id == identifier).first()
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"{resource_name} not found: {identifier}",
        )
    return result


# --- Global exception handlers ---


def register_exception_handlers(app: FastAPI) -> None:
    """Attach standardized exception handlers to a FastAPI app."""

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"error": "http_error", "detail": exc.detail, "status": exc.status_code},
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(request: Request, exc: IntegrityError):
        logger.error("IntegrityError: %s — %s", exc, traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_409_CONFLICT,
            content={"error": "integrity_error", "detail": "Database integrity constraint violated"},
        )

    @app.exception_handler(OperationalError)
    async def operational_error_handler(request: Request, exc: OperationalError):
        logger.error("OperationalError: %s — %s", exc, traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={"error": "database_error", "detail": "Database unavailable"},
        )

    @app.exception_handler(json.JSONDecodeError)
    async def json_decode_handler(request: Request, exc: json.JSONDecodeError):
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content={"error": "bad_request", "detail": "Invalid JSON in request body"},
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        logger.error("Unhandled exception: %s — %s", exc, traceback.format_exc())
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"error": "internal_error", "detail": "An unexpected error occurred"},
        )
