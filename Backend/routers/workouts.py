"""
Workouts Router - Phase 5.4 TDD Implementation

FastAPI router implementing workout and exercise management endpoints:
- POST /workouts - Create new workout session
- GET /workouts - Get all workouts for authenticated user
- GET /workouts/{workout_id} - Get workout details with exercises and sets
- PUT /workouts/{workout_id} - Update workout (complete session)
- DELETE /workouts/{workout_id} - Delete workout
- POST /workouts/{workout_id}/exercises - Add exercise to workout
- POST /workouts/{workout_id}/exercises/{exercise_id}/sets - Add set to exercise
- PUT /sets/{set_id} - Update set
- DELETE /sets/{set_id} - Delete set
- DELETE /workouts/{workout_id}/exercises/{exercise_id} - Remove exercise from workout

Integrates with existing services layer (WorkoutService) and uses established
Pydantic models for request/response validation. Follows clean architecture
patterns from Phase 5.2 and authentication patterns from Phase 5.3.
"""

from typing import Dict, Any, List
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer

# Import existing services and models - no new files needed
from services.auth_service import get_current_user
from services.workout_service import WorkoutService
from models.workout import (
    CreateWorkoutRequest,
    UpdateWorkoutRequest,
    WorkoutExerciseRequest,
    CreateSetRequest,
    UpdateSetRequest,
    WorkoutResponse,
    WorkoutWithExercisesResponse,
    WorkoutExerciseResponse,
    SetResponse,
    WorkoutListQuery,
    WorkoutStatsResponse,
    WorkoutErrorResponse
)

# Configure logging
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/workouts",
    tags=["workouts"],
    responses={
        401: {"model": WorkoutErrorResponse, "description": "Authentication required"},
        403: {"model": WorkoutErrorResponse, "description": "Access denied"},
        404: {"model": WorkoutErrorResponse, "description": "Resource not found"},
        422: {"model": WorkoutErrorResponse, "description": "Validation error"},
        500: {"model": WorkoutErrorResponse, "description": "Internal server error"}
    }
)

# Security scheme for Swagger documentation
security = HTTPBearer()

# Initialize service - reusing existing implementation
workout_service = WorkoutService()


@router.post("", response_model=WorkoutResponse, status_code=201)
async def create_workout(
    workout_data: CreateWorkoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> WorkoutResponse:
    """
    Create new workout session for authenticated user.
    
    Creates a new workout with the provided title and optional start time.
    The workout will be marked as active and associated with the authenticated user.
    
    Args:
        workout_data: Workout creation data
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        WorkoutResponse with created workout details
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 422 for validation errors, 500 for server errors
    """
    try:
        logger.info(f"Creating workout '{workout_data.title}' for user {current_user['id']}")
        
        # Create workout using existing WorkoutService
        workout_response = workout_service.create_workout(
            user_id=UUID(current_user["id"]),
            workout_data=workout_data
        )
        
        logger.info(f"Workout created successfully: {workout_response.id}")
        return workout_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout creation failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout creation failed"
        )


@router.get("", response_model=List[WorkoutResponse], status_code=200)
async def get_user_workouts(
    is_active: bool = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=100, description="Maximum results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[WorkoutResponse]:
    """
    Get all workouts for authenticated user with filtering and pagination.
    
    Retrieves user's workouts with optional filtering by active status and pagination.
    Results are ordered by creation date (newest first).
    
    Args:
        is_active: Optional filter for active/completed workouts
        limit: Maximum number of results to return
        offset: Pagination offset for results
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        List of user's workouts matching filter criteria
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 500 for server errors
    """
    try:
        logger.debug(f"Retrieving workouts for user {current_user['id']} with filters")
        
        # Build query parameters
        query = WorkoutListQuery(
            is_active=is_active,
            limit=limit,
            offset=offset
        )
        
        # Get workouts using existing WorkoutService
        workouts = workout_service.get_user_workouts(
            user_id=UUID(current_user["id"]),
            query=query
        )
        
        logger.debug(f"Retrieved {len(workouts)} workouts for user {current_user['id']}")
        return workouts
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout retrieval failed"
        )


@router.get("/{workout_id}", response_model=WorkoutWithExercisesResponse, status_code=200)
async def get_workout_details(
    workout_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> WorkoutWithExercisesResponse:
    """
    Get workout details including exercises and sets.
    
    Retrieves complete workout information including all associated exercises
    and their sets, ordered by exercise order and set order.
    
    Args:
        workout_id: Unique identifier for the workout
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Complete workout details with exercises and sets
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout not found, 500 for server errors
    """
    try:
        logger.debug(f"Retrieving workout details: {workout_id} for user {current_user['id']}")
        
        # Get workout details using existing WorkoutService
        workout_details = workout_service.get_workout_details(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id
        )
        
        logger.debug(f"Retrieved workout details with {len(workout_details.exercises)} exercises")
        return workout_details
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout detail retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout detail retrieval failed"
        )


@router.put("/{workout_id}", response_model=WorkoutResponse, status_code=200)
async def update_workout(
    workout_id: UUID,
    update_data: UpdateWorkoutRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> WorkoutResponse:
    """
    Update workout session (typically to mark as completed).
    
    Updates workout properties such as title, completion status, duration,
    and active status. Commonly used to complete active workout sessions.
    
    Args:
        workout_id: Unique identifier for the workout
        update_data: Workout update data
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Updated workout details
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout not found, 422 for validation errors, 500 for server errors
    """
    try:
        logger.info(f"Updating workout: {workout_id} for user {current_user['id']}")
        
        # Update workout using existing WorkoutService
        updated_workout = workout_service.update_workout(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id,
            update_data=update_data
        )
        
        logger.info(f"Workout updated successfully: {workout_id}")
        return updated_workout
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout update failed"
        )


@router.delete("/{workout_id}", status_code=204)
async def delete_workout(
    workout_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Delete workout and cascade delete related data.
    
    Permanently deletes the workout and all associated exercises and sets.
    This operation cannot be undone.
    
    Args:
        workout_id: Unique identifier for the workout
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        No content (204 status code)
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout not found, 500 for server errors
    """
    try:
        logger.info(f"Deleting workout: {workout_id} for user {current_user['id']}")
        
        # Delete workout using existing WorkoutService
        workout_service.delete_workout(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id
        )
        
        logger.info(f"Workout deleted successfully: {workout_id}")
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout deletion failed"
        )


@router.post("/{workout_id}/exercises", response_model=WorkoutExerciseResponse, status_code=201)
async def add_exercise_to_workout(
    workout_id: UUID,
    exercise_data: WorkoutExerciseRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> WorkoutExerciseResponse:
    """
    Add exercise to workout with order tracking.
    
    Associates an exercise from the library with the specified workout,
    including order index for exercise sequencing and optional notes.
    
    Args:
        workout_id: Unique identifier for the workout
        exercise_data: Exercise addition data including exercise_id and order_index
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Created workout-exercise relationship
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout/exercise not found, 409 for duplicates, 500 for server errors
    """
    try:
        logger.info(f"Adding exercise {exercise_data.exercise_id} to workout {workout_id}")
        
        # Add exercise to workout using existing WorkoutService
        workout_exercise = workout_service.add_exercise_to_workout(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id,
            exercise_data=exercise_data
        )
        
        logger.info(f"Exercise added to workout successfully: {workout_exercise.id}")
        return workout_exercise
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise addition to workout failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise addition to workout failed"
        )


@router.delete("/{workout_id}/exercises/{exercise_id}", status_code=204)
async def remove_exercise_from_workout(
    workout_id: UUID,
    exercise_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Remove exercise from workout and cascade delete sets.
    
    Removes the exercise from the workout and deletes all associated sets.
    This operation cannot be undone.
    
    Args:
        workout_id: Unique identifier for the workout
        exercise_id: Unique identifier for the exercise
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        No content (204 status code)
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout/exercise not found, 500 for server errors
    """
    try:
        logger.info(f"Removing exercise {exercise_id} from workout {workout_id}")
        
        # Remove exercise from workout using existing WorkoutService
        workout_service.remove_exercise_from_workout(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id,
            exercise_id=exercise_id
        )
        
        logger.info(f"Exercise removed from workout successfully")
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise removal from workout failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise removal from workout failed"
        )


@router.post("/{workout_id}/exercises/{exercise_id}/sets", response_model=SetResponse, status_code=201)
async def add_set_to_exercise(
    workout_id: UUID,
    exercise_id: UUID,
    set_data: CreateSetRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> SetResponse:
    """
    Add set to exercise in workout.
    
    Creates a new set for the specified exercise within the workout.
    Supports both strength training (reps/weight) and cardio (duration/distance) sets.
    
    Args:
        workout_id: Unique identifier for the workout
        exercise_id: Unique identifier for the exercise
        set_data: Set creation data (reps, weight, duration, distance, etc.)
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Created set details
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if workout/exercise not found, 422 for validation errors, 500 for server errors
    """
    try:
        logger.info(f"Adding set to exercise {exercise_id} in workout {workout_id}")
        
        # Add set to exercise using existing WorkoutService
        set_response = workout_service.add_set_to_exercise(
            user_id=UUID(current_user["id"]),
            workout_id=workout_id,
            exercise_id=exercise_id,
            set_data=set_data
        )
        
        logger.info(f"Set added to exercise successfully: {set_response.id}")
        return set_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Set addition to exercise failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Set addition to exercise failed"
        )


@router.put("/sets/{set_id}", response_model=SetResponse, status_code=200)
async def update_set(
    set_id: UUID,
    update_data: UpdateSetRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> SetResponse:
    """
    Update existing set data.
    
    Updates set properties such as reps, weight, completion status, or notes.
    Only provided fields will be updated.
    
    Args:
        set_id: Unique identifier for the set
        update_data: Set update data
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Updated set details
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if set not found, 422 for validation errors, 500 for server errors
    """
    try:
        logger.info(f"Updating set: {set_id} for user {current_user['id']}")
        
        # Update set using existing WorkoutService
        updated_set = workout_service.update_set(
            user_id=UUID(current_user["id"]),
            set_id=set_id,
            update_data=update_data
        )
        
        logger.info(f"Set updated successfully: {set_id}")
        return updated_set
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Set update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Set update failed"
        )


@router.delete("/sets/{set_id}", status_code=204)
async def delete_set(
    set_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> None:
    """
    Delete set from exercise.
    
    Permanently deletes the specified set. This operation cannot be undone.
    
    Args:
        set_id: Unique identifier for the set
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        No content (204 status code)
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if set not found, 500 for server errors
    """
    try:
        logger.info(f"Deleting set: {set_id} for user {current_user['id']}")
        
        # Delete set using existing WorkoutService
        workout_service.delete_set(
            user_id=UUID(current_user["id"]),
            set_id=set_id
        )
        
        logger.info(f"Set deleted successfully: {set_id}")
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Set deletion failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Set deletion failed"
        )


@router.get("/stats", response_model=WorkoutStatsResponse, status_code=200)
async def get_workout_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> WorkoutStatsResponse:
    """
    Get workout statistics for authenticated user.
    
    Provides statistical overview of user's workouts including total counts,
    active/completed workouts, and duration statistics.
    
    Args:
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        User workout statistics
        
    Raises:
        HTTPException: 401 for invalid JWT, 500 for server errors
    """
    try:
        logger.debug(f"Retrieving workout stats for user {current_user['id']}")
        
        # Get workout stats using existing WorkoutService
        stats = workout_service.get_workout_stats(
            user_id=UUID(current_user["id"])
        )
        
        logger.debug(f"Retrieved workout stats: {stats.total_workouts} total workouts")
        return stats
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Workout stats retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Workout stats retrieval failed"
        )


@router.get("/health")
async def workout_health_check():
    """Health check endpoint for workout service."""
    return {
        "status": "healthy",
        "service": "workouts",
        "endpoints": [
            "POST /workouts - Create new workout session",
            "GET /workouts - Get all workouts for authenticated user",
            "GET /workouts/{workout_id} - Get workout details with exercises and sets",
            "PUT /workouts/{workout_id} - Update workout (complete session)",
            "DELETE /workouts/{workout_id} - Delete workout",
            "POST /workouts/{workout_id}/exercises - Add exercise to workout",
            "POST /workouts/{workout_id}/exercises/{exercise_id}/sets - Add set to exercise",
            "PUT /sets/{set_id} - Update set",
            "DELETE /sets/{set_id} - Delete set",
            "DELETE /workouts/{workout_id}/exercises/{exercise_id} - Remove exercise from workout"
        ]
    }