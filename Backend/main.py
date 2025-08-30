"""
FastAPI Backend for FM-SetLogger Phase 5.4
Workout & Exercise CRUD Endpoints with Authentication
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from core.config import settings
from routers.auth import router as auth_router
from routers.workouts import router as workouts_router
from routers.exercises import router as exercises_router
from routers.users import router as users_router

app = FastAPI(
    title="FM-SetLogger API",
    description="Fitness tracking backend with secure multi-user configuration and CORS",
    version="1.0.0"
)

# CORS middleware configuration for React Native app
cors_origins = settings.cors_origins.split(',') if hasattr(settings, 'cors_origins') and settings.cors_origins else [
    "http://localhost:8084",  # React Native development
    "exp://192.168.1.0:8084",  # Expo development
    "http://localhost:3000",  # Web development
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "x-requested-with"],
)

# Register routers
app.include_router(auth_router)
app.include_router(workouts_router)
app.include_router(exercises_router)
app.include_router(users_router)

class HealthResponse(BaseModel):
    status: str
    message: str
    version: str

@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for development and deployment verification."""
    return HealthResponse(
        status="healthy",
        message="FM-SetLogger Backend is running",
        version="1.0.0"
    )

@app.get("/")
async def root():
    """Root endpoint returning basic API information."""
    return {
        "name": "FM-SetLogger API",
        "version": "1.0.0",
        "phase": "5.5 - User Profile Management Endpoints",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)