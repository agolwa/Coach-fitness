"""
Routers package for API endpoint organization.
Contains FastAPI router modules for different API domains.
"""

from .auth import router as auth_router

__all__ = ["auth_router"]