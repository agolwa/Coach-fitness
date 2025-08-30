"""
Exercise Library Pydantic Models

Defines exercise-related data models for:
- Exercise library retrieval with filtering
- Exercise details and metadata
- Exercise categorization and equipment tracking
- Frontend TypeScript contract alignment

These models handle the read-only exercise library that serves as the
foundation for workout planning and exercise selection.
"""

from datetime import datetime
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from enum import Enum


class ExerciseCategory(str, Enum):
    """Exercise category enumeration matching database constraints."""
    STRENGTH = "strength"
    CARDIO = "cardio"
    FLEXIBILITY = "flexibility"
    BALANCE = "balance"
    BODYWEIGHT = "bodyweight"


class ExerciseResponse(BaseModel):
    """Response model for exercise library data."""
    id: UUID = Field(..., description="Exercise UUID")
    name: str = Field(..., description="Exercise name")
    category: ExerciseCategory = Field(..., description="Exercise category")
    body_part: List[str] = Field(..., description="Target body parts")
    equipment: List[str] = Field(..., description="Required equipment")
    description: Optional[str] = Field(None, description="Exercise description and instructions")
    created_at: datetime = Field(..., description="Exercise creation timestamp")
    
    class Config:
        from_attributes = True
        use_enum_values = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ExerciseListQuery(BaseModel):
    """Query parameters for exercise library filtering."""
    category: Optional[ExerciseCategory] = Field(None, description="Filter by exercise category")
    body_part: Optional[str] = Field(None, description="Filter by target body part")
    equipment: Optional[str] = Field(None, description="Filter by required equipment")
    search: Optional[str] = Field(None, description="Search exercise names (case-insensitive)")
    limit: int = Field(100, ge=1, le=200, description="Maximum results per page")
    offset: int = Field(0, ge=0, description="Pagination offset")
    
    @field_validator('search')
    @classmethod
    def validate_search_length(cls, v):
        if v is not None and len(v.strip()) < 2:
            raise ValueError("Search query must be at least 2 characters")
        return v.strip() if v else None
    
    class Config:
        use_enum_values = True


class ExerciseStatsResponse(BaseModel):
    """Response model for exercise library statistics."""
    total_exercises: int = Field(..., description="Total exercises in library")
    categories: dict = Field(..., description="Exercise count by category")
    body_parts: List[str] = Field(..., description="All available body parts")
    equipment_types: List[str] = Field(..., description="All equipment types")
    
    class Config:
        from_attributes = True


class ExerciseSummaryResponse(BaseModel):
    """Lightweight exercise summary for dropdown/selection UI."""
    id: UUID = Field(..., description="Exercise UUID")
    name: str = Field(..., description="Exercise name")
    category: ExerciseCategory = Field(..., description="Exercise category")
    
    class Config:
        from_attributes = True
        use_enum_values = True


class ExerciseErrorResponse(BaseModel):
    """Standard error response model for exercise endpoints."""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")
    
    @field_validator('detail')
    @classmethod
    def validate_detail_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Error detail cannot be empty")
        return v.strip()


class ExerciseFilterOptions(BaseModel):
    """Available filter options for exercise library."""
    categories: List[ExerciseCategory] = Field(..., description="All available categories")
    body_parts: List[str] = Field(..., description="All target body parts")
    equipment_types: List[str] = Field(..., description="All equipment types")
    
    class Config:
        use_enum_values = True


# Predefined body parts for consistency
EXERCISE_BODY_PARTS = [
    "chest", "back", "shoulders", "arms", "biceps", "triceps", 
    "forearms", "abs", "core", "legs", "quadriceps", "hamstrings",
    "glutes", "calves", "full_body", "cardio"
]

# Predefined equipment types for consistency  
EXERCISE_EQUIPMENT = [
    "barbell", "dumbbell", "machine", "cable", "bodyweight", 
    "resistance_band", "kettlebell", "medicine_ball", "treadmill",
    "bike", "rower", "elliptical", "none"
]