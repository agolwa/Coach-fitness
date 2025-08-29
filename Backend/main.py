"""
FastAPI Backend for FM-SetLogger Phase 5.1
Database Foundation & Row-Level Security Implementation
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(
    title="FM-SetLogger API",
    description="Fitness tracking backend with secure multi-user database foundation",
    version="1.0.0"
)

# CORS middleware for React Native app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
        "phase": "5.1 - Database Foundation & RLS",
        "documentation": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)