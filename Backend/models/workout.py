"""
Workout Request/Response Pydantic Models

Defines workout-related data models for:
- Workout CRUD operations (create, read, update, delete)
- Workout-exercise relationship management
- Set tracking with comprehensive validation
- Frontend TypeScript contract alignment

These models ensure data consistency with database schema and provide
comprehensive validation following Phase 5.3 authentication patterns.
"""

from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from uuid import UUID
from pydantic import BaseModel, Field, field_validator
from decimal import Decimal


class CreateWorkoutRequest(BaseModel):
    """Request model for creating a new workout session."""
    title: str = Field(..., min_length=1, max_length=30, description="Workout title (1-30 characters)")
    started_at: Optional[datetime] = Field(None, description="Workout start timestamp (defaults to now)")
    
    @field_validator('title')
    @classmethod
    def validate_title_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Workout title cannot be empty")
        return v.strip()
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class UpdateWorkoutRequest(BaseModel):
    """Request model for updating workout session."""
    title: Optional[str] = Field(None, min_length=1, max_length=30, description="Updated workout title")
    completed_at: Optional[datetime] = Field(None, description="Workout completion timestamp")
    duration: Optional[int] = Field(None, ge=0, description="Workout duration in seconds")
    is_active: Optional[bool] = Field(None, description="Whether workout is active")
    
    @field_validator('title')
    @classmethod
    def validate_title_if_provided(cls, v):
        if v is not None and (not v or not v.strip()):
            raise ValueError("Workout title cannot be empty")
        return v.strip() if v else v
    
    class Config:
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class WorkoutExerciseRequest(BaseModel):
    """Request model for adding exercise to workout."""
    exercise_id: UUID = Field(..., description="Exercise ID from library")
    order_index: int = Field(..., ge=0, description="Exercise order in workout (0-based)")
    notes: Optional[str] = Field(None, description="Exercise-specific notes")


class CreateSetRequest(BaseModel):
    """Request model for creating a new set."""
    reps: Optional[int] = Field(None, gt=0, description="Number of repetitions (strength exercises)")
    weight: Optional[Decimal] = Field(None, ge=0, description="Weight in user's preferred unit")
    duration: Optional[int] = Field(None, gt=0, description="Duration in seconds (cardio/time-based)")
    distance: Optional[Decimal] = Field(None, gt=0, description="Distance in meters (cardio)")
    completed: bool = Field(True, description="Whether set was completed")
    rest_time: Optional[int] = Field(None, ge=0, description="Rest time after set in seconds")
    notes: Optional[str] = Field(None, description="Set-specific notes")
    
    @field_validator('reps', 'duration')
    @classmethod
    def validate_positive_values(cls, v):
        if v is not None and v <= 0:
            raise ValueError("Reps and duration must be positive")
        return v
    
    @field_validator('weight', 'distance')
    @classmethod
    def validate_non_negative_values(cls, v):
        if v is not None and v < 0:
            raise ValueError("Weight and distance cannot be negative")
        return v


class UpdateSetRequest(BaseModel):
    """Request model for updating existing set."""
    reps: Optional[int] = Field(None, gt=0, description="Updated repetitions")
    weight: Optional[Decimal] = Field(None, ge=0, description="Updated weight")
    duration: Optional[int] = Field(None, gt=0, description="Updated duration")
    distance: Optional[Decimal] = Field(None, gt=0, description="Updated distance")
    completed: Optional[bool] = Field(None, description="Updated completion status")
    rest_time: Optional[int] = Field(None, ge=0, description="Updated rest time")
    notes: Optional[str] = Field(None, description="Updated notes")


class SetResponse(BaseModel):
    """Response model for set data."""
    id: UUID = Field(..., description="Set UUID")
    workout_exercise_id: UUID = Field(..., description="Parent workout exercise ID")
    reps: Optional[int] = Field(None, description="Number of repetitions")
    weight: Optional[Decimal] = Field(None, description="Weight used")
    duration: Optional[int] = Field(None, description="Duration in seconds")
    distance: Optional[Decimal] = Field(None, description="Distance covered")
    completed: bool = Field(..., description="Completion status")
    rest_time: Optional[int] = Field(None, description="Rest time in seconds")
    notes: Optional[str] = Field(None, description="Set notes")
    order_index: int = Field(..., description="Set order within exercise")
    completed_at: datetime = Field(..., description="Set completion timestamp")
    created_at: datetime = Field(..., description="Set creation timestamp")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None,
            Decimal: lambda v: float(v) if v is not None else None
        }


class WorkoutExerciseResponse(BaseModel):
    """Response model for workout exercise relationship."""
    id: UUID = Field(..., description="Workout exercise relationship ID")
    workout_id: UUID = Field(..., description="Parent workout ID")
    exercise_id: UUID = Field(..., description="Exercise ID")
    order_index: int = Field(..., description="Exercise order in workout")
    notes: Optional[str] = Field(None, description="Exercise notes")
    created_at: datetime = Field(..., description="Creation timestamp")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class ExerciseDetails(BaseModel):
    """Embedded exercise details for workout responses."""
    id: UUID = Field(..., description="Exercise UUID")
    name: str = Field(..., description="Exercise name")
    category: str = Field(..., description="Exercise category")
    body_part: List[str] = Field(..., description="Target body parts")
    equipment: List[str] = Field(..., description="Required equipment")
    description: Optional[str] = Field(None, description="Exercise description")
    
    class Config:
        from_attributes = True


class WorkoutExerciseWithDetails(BaseModel):
    """Workout exercise with embedded exercise details and sets."""
    id: UUID = Field(..., description="Workout exercise relationship ID")
    workout_id: UUID = Field(..., description="Parent workout ID")
    exercise_id: UUID = Field(..., description="Exercise ID")
    order_index: int = Field(..., description="Exercise order in workout")
    notes: Optional[str] = Field(None, description="Exercise notes")
    created_at: datetime = Field(..., description="Creation timestamp")
    exercise_details: ExerciseDetails = Field(..., description="Full exercise information")
    sets: List[SetResponse] = Field(..., description="All sets for this exercise")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class WorkoutResponse(BaseModel):
    """Response model for workout data."""
    id: UUID = Field(..., description="Workout UUID")
    user_id: UUID = Field(..., description="Owner user ID")
    title: str = Field(..., description="Workout title")
    started_at: datetime = Field(..., description="Workout start time")
    completed_at: Optional[datetime] = Field(None, description="Workout completion time")
    duration: Optional[int] = Field(None, description="Workout duration in seconds")
    is_active: bool = Field(..., description="Whether workout is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class WorkoutWithExercisesResponse(BaseModel):
    """Complete workout response with exercises and sets."""
    id: UUID = Field(..., description="Workout UUID")
    user_id: UUID = Field(..., description="Owner user ID")
    title: str = Field(..., description="Workout title")
    started_at: datetime = Field(..., description="Workout start time")
    completed_at: Optional[datetime] = Field(None, description="Workout completion time")
    duration: Optional[int] = Field(None, description="Workout duration in seconds")
    is_active: bool = Field(..., description="Whether workout is active")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: datetime = Field(..., description="Last update timestamp")
    exercises: List[WorkoutExerciseWithDetails] = Field(..., description="Workout exercises with sets")
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat() if v else None
        }


class WorkoutListQuery(BaseModel):
    """Query parameters for workout list endpoint."""
    is_active: Optional[bool] = Field(None, description="Filter by active status")
    limit: int = Field(50, ge=1, le=100, description="Maximum results per page")
    offset: int = Field(0, ge=0, description="Pagination offset")
    
    class Config:
        use_enum_values = True


class WorkoutStatsResponse(BaseModel):
    """Response model for workout statistics."""
    total_workouts: int = Field(..., description="Total workout count")
    active_workouts: int = Field(..., description="Active workout count")  
    completed_workouts: int = Field(..., description="Completed workout count")
    total_duration: Optional[int] = Field(None, description="Total workout time in seconds")
    average_duration: Optional[int] = Field(None, description="Average workout duration")
    
    class Config:
        from_attributes = True


class WorkoutErrorResponse(BaseModel):
    """Standard error response model for workout endpoints."""
    detail: str = Field(..., description="Error message")
    error_code: Optional[str] = Field(None, description="Machine-readable error code")
    
    @field_validator('detail')
    @classmethod
    def validate_detail_not_empty(cls, v):
        if not v or not v.strip():
            raise ValueError("Error detail cannot be empty")
        return v.strip()