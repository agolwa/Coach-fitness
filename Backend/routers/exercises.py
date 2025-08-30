"""
Exercises Router - Phase 5.4 Exercise Library Implementation

FastAPI router implementing exercise library endpoints:
- GET /exercises - Retrieve exercise library with filtering and search
- GET /exercises/{exercise_id} - Get specific exercise details
- GET /exercises/stats - Get exercise library statistics
- GET /exercises/summaries - Get lightweight exercise summaries
- GET /exercises/filter-options - Get available filter options

Integrates with existing services layer (ExerciseService) and uses established
Pydantic models for request/response validation. Follows clean architecture
patterns from Phase 5.2 and authentication patterns from Phase 5.3.
"""

from typing import Dict, Any, List, Optional
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer

# Import existing services and models
from services.auth_service import get_current_user
from services.exercise_service import ExerciseService
from models.exercise import (
    ExerciseResponse,
    ExerciseListQuery,
    ExerciseStatsResponse,
    ExerciseSummaryResponse,
    ExerciseFilterOptions,
    ExerciseCategory,
    ExerciseErrorResponse
)

# Configure logging
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/exercises",
    tags=["exercises"],
    responses={
        401: {"model": ExerciseErrorResponse, "description": "Authentication required"},
        404: {"model": ExerciseErrorResponse, "description": "Exercise not found"},
        422: {"model": ExerciseErrorResponse, "description": "Validation error"},
        500: {"model": ExerciseErrorResponse, "description": "Internal server error"}
    }
)

# Security scheme for Swagger documentation
security = HTTPBearer()

# Initialize service
exercise_service = ExerciseService()


@router.get("", response_model=List[ExerciseResponse], status_code=200)
async def get_exercise_library(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by exercise category"),
    body_part: Optional[str] = Query(None, description="Filter by target body part"),
    equipment: Optional[str] = Query(None, description="Filter by required equipment"),
    search: Optional[str] = Query(None, description="Search exercise names (case-insensitive)"),
    limit: int = Query(100, ge=1, le=200, description="Maximum results per page"),
    offset: int = Query(0, ge=0, description="Pagination offset"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[ExerciseResponse]:
    """
    Retrieve exercise library with filtering and search capabilities.
    
    Provides access to the complete exercise library with comprehensive filtering
    options for category, body part, equipment, and name search. Results are
    paginated and ordered alphabetically by name.
    
    Args:
        category: Optional filter by exercise category (strength, cardio, etc.)
        body_part: Optional filter by target body part
        equipment: Optional filter by required equipment
        search: Optional search term for exercise names (minimum 2 characters)
        limit: Maximum number of results to return (1-200)
        offset: Pagination offset for results
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        List of exercises matching filter criteria
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 422 for validation errors, 500 for server errors
    """
    try:
        logger.debug(f"Exercise library request from user {current_user['id']} with filters")
        
        # Build query parameters
        query = ExerciseListQuery(
            category=category,
            body_part=body_part,
            equipment=equipment,
            search=search,
            limit=limit,
            offset=offset
        )
        
        # Get exercise library using ExerciseService
        exercises = exercise_service.get_exercise_library(query)
        
        logger.debug(f"Retrieved {len(exercises)} exercises for user {current_user['id']}")
        return exercises
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise library retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise library retrieval failed"
        )


@router.get("/{exercise_id}", response_model=ExerciseResponse, status_code=200)
async def get_exercise_details(
    exercise_id: UUID,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ExerciseResponse:
    """
    Get specific exercise details by ID.
    
    Retrieves complete information for a single exercise including name,
    category, target body parts, required equipment, and description.
    
    Args:
        exercise_id: Unique identifier for the exercise
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Complete exercise details
        
    Raises:
        HTTPException: 401 for invalid JWT, 404 if exercise not found, 500 for server errors
    """
    try:
        logger.debug(f"Exercise details request: {exercise_id} from user {current_user['id']}")
        
        # Get exercise details using ExerciseService
        exercise = exercise_service.get_exercise_by_id(exercise_id)
        
        logger.debug(f"Retrieved exercise details: {exercise.name}")
        return exercise
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise details retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise details retrieval failed"
        )


@router.get("/stats", response_model=ExerciseStatsResponse, status_code=200)
async def get_exercise_stats(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ExerciseStatsResponse:
    """
    Get exercise library statistics and metadata.
    
    Provides statistical overview of the exercise library including total count,
    exercises by category, available body parts, and equipment types.
    
    Args:
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Exercise library statistics
        
    Raises:
        HTTPException: 401 for invalid JWT, 500 for server errors
    """
    try:
        logger.debug(f"Exercise stats request from user {current_user['id']}")
        
        # Get exercise stats using ExerciseService
        stats = exercise_service.get_exercise_stats()
        
        logger.debug(f"Retrieved exercise stats: {stats.total_exercises} total exercises")
        return stats
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise stats retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise stats retrieval failed"
        )


@router.get("/summaries", response_model=List[ExerciseSummaryResponse], status_code=200)
async def get_exercise_summaries(
    category: Optional[ExerciseCategory] = Query(None, description="Filter by exercise category"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[ExerciseSummaryResponse]:
    """
    Get lightweight exercise summaries for dropdowns/selection UI.
    
    Provides a lightweight list of exercises with only essential information
    (ID, name, category) for use in selection interfaces and dropdowns.
    
    Args:
        category: Optional filter by exercise category
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        List of exercise summaries
        
    Raises:
        HTTPException: 401 for invalid JWT, 500 for server errors
    """
    try:
        logger.debug(f"Exercise summaries request from user {current_user['id']}")
        
        # Get exercise summaries using ExerciseService
        summaries = exercise_service.get_exercise_summaries(category)
        
        logger.debug(f"Retrieved {len(summaries)} exercise summaries")
        return summaries
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise summaries retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise summaries retrieval failed"
        )


@router.get("/filter-options", response_model=ExerciseFilterOptions, status_code=200)
async def get_exercise_filter_options(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> ExerciseFilterOptions:
    """
    Get available filter options for exercise library.
    
    Provides all available filter options for the exercise library including
    categories, body parts, and equipment types for building filter interfaces.
    
    Args:
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        Available filter options
        
    Raises:
        HTTPException: 401 for invalid JWT, 500 for server errors
    """
    try:
        logger.debug(f"Exercise filter options request from user {current_user['id']}")
        
        # Get filter options using ExerciseService
        filter_options = exercise_service.get_filter_options()
        
        logger.debug("Retrieved exercise filter options")
        return filter_options
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise filter options retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise filter options retrieval failed"
        )


@router.get("/search", response_model=List[ExerciseSummaryResponse], status_code=200)
async def search_exercises(
    q: str = Query(..., min_length=2, description="Search query (minimum 2 characters)"),
    limit: int = Query(20, ge=1, le=50, description="Maximum results to return"),
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> List[ExerciseSummaryResponse]:
    """
    Search exercises by name with fuzzy matching.
    
    Provides fast exercise search functionality with case-insensitive matching
    for building exercise selection interfaces with search-as-you-type functionality.
    
    Args:
        q: Search query (minimum 2 characters)
        limit: Maximum number of results to return (1-50)
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        List of matching exercise summaries
        
    Raises:
        HTTPException: 401 for invalid JWT, 422 for validation errors, 500 for server errors
    """
    try:
        logger.debug(f"Exercise search request: '{q}' from user {current_user['id']}")
        
        # Search exercises using ExerciseService
        results = exercise_service.search_exercises(search_term=q, limit=limit)
        
        logger.debug(f"Exercise search returned {len(results)} results")
        return results
        
    except HTTPException:
        # Re-raise HTTP exceptions from services
        raise
    except Exception as e:
        logger.error(f"Exercise search failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Exercise search failed"
        )


@router.get("/health")
async def exercise_health_check():
    """Health check endpoint for exercise service."""
    return {
        "status": "healthy",
        "service": "exercises",
        "endpoints": [
            "GET /exercises - Retrieve exercise library with filtering and search",
            "GET /exercises/{exercise_id} - Get specific exercise details",
            "GET /exercises/stats - Get exercise library statistics",
            "GET /exercises/summaries - Get lightweight exercise summaries",
            "GET /exercises/filter-options - Get available filter options",
            "GET /exercises/search - Search exercises by name"
        ]
    }