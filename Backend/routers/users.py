"""
User Profile Router - Phase 5.5 TDD Implementation

FastAPI router implementing 2 core user profile management endpoints:
- GET /users/profile - Retrieve authenticated user's profile and preferences  
- PUT /users/profile - Update user profile and preferences

Integrates with existing services layer (AuthService, SupabaseService)
and uses established Pydantic models for request/response validation.
Follows clean architecture patterns from Phase 5.2.
"""

from typing import Dict, Any
import logging
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Header
from fastapi.security import HTTPBearer

# Import existing services and models - no new files needed
from services.auth_service import AuthService, get_current_user
from models.auth import UserResponse, AuthErrorResponse
from models.user import UpdateUserRequest

# Configure logging
logger = logging.getLogger(__name__)

# Router configuration
router = APIRouter(
    prefix="/users", 
    tags=["user_profile"],
    responses={
        401: {"model": AuthErrorResponse, "description": "Authentication failed"},
        404: {"model": AuthErrorResponse, "description": "User not found"}, 
        422: {"model": AuthErrorResponse, "description": "Validation error"},
        500: {"model": AuthErrorResponse, "description": "Internal server error"}
    }
)

# Security scheme for Swagger documentation
security = HTTPBearer()

# Initialize services - reusing existing implementation
auth_service = AuthService()


@router.get("/profile", response_model=UserResponse, status_code=200)
async def get_user_profile(
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserResponse:
    """
    Retrieve authenticated user's profile and preferences.
    
    Returns complete user profile including preferences that align with
    the frontend user-store TypeScript contracts.
    
    Process:
    1. Extract user ID from JWT via get_current_user dependency
    2. Retrieve full user profile from database via AuthService
    3. Return UserResponse with profile and preferences data
    
    Args:
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        UserResponse with user profile and preferences
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 404 if user not found, 500 for server errors
    """
    try:
        logger.debug(f"User profile request for user {current_user['id']}")
        
        # Extract user ID from current_user dependency
        user_id = UUID(current_user['id'])
        
        # Get full user profile using existing AuthService
        user_profile = auth_service.get_user_profile_by_id(user_id)
        
        if not user_profile:
            logger.warning(f"User profile not found for ID: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Convert to UserResponse using existing model
        user_response = UserResponse(
            id=user_profile.id,
            email=user_profile.email,
            display_name=user_profile.display_name,
            preferences=user_profile.preferences,
            created_at=user_profile.created_at,
            updated_at=user_profile.updated_at
        )
        
        logger.debug(f"User profile retrieved for {user_profile.email}")
        return user_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from dependencies/services
        raise
    except ValueError as e:
        logger.error(f"Invalid user ID format: {current_user.get('id')}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    except Exception as e:
        logger.error(f"User profile retrieval failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User profile retrieval failed"
        )


@router.put("/profile", response_model=UserResponse, status_code=200)
async def update_user_profile(
    update_data: UpdateUserRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
) -> UserResponse:
    """
    Update authenticated user's profile and preferences.
    
    Allows partial updates of user display name and preferences.
    Maintains data integrity and validates input using existing Pydantic models.
    
    Process:
    1. Extract user ID from JWT via get_current_user dependency
    2. Validate update data using UpdateUserRequest model
    3. Update user profile in database via AuthService
    4. Return updated UserResponse with profile and preferences
    
    Args:
        update_data: UpdateUserRequest containing fields to update
        current_user: Current user data from JWT (injected by dependency)
        
    Returns:
        UserResponse with updated user profile and preferences
        
    Raises:
        HTTPException: 401 for invalid/missing JWT, 404 if user not found, 422 for validation errors, 500 for server errors
    """
    try:
        logger.info(f"User profile update request for user {current_user['id']}")
        
        # Extract user ID from current_user dependency
        user_id = UUID(current_user['id'])
        
        # Update user profile using existing AuthService
        updated_profile = auth_service.update_user_profile(
            user_id=user_id,
            update_data=update_data.model_dump(exclude_none=True)
        )
        
        if not updated_profile:
            logger.warning(f"User profile not found for update: {user_id}")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User profile not found"
            )
        
        # Convert to UserResponse using existing model
        user_response = UserResponse(
            id=updated_profile.id,
            email=updated_profile.email,
            display_name=updated_profile.display_name,
            preferences=updated_profile.preferences,
            created_at=updated_profile.created_at,
            updated_at=updated_profile.updated_at
        )
        
        logger.info(f"User profile updated successfully for {updated_profile.email}")
        return user_response
        
    except HTTPException:
        # Re-raise HTTP exceptions from dependencies/services
        raise
    except ValueError as e:
        logger.error(f"Invalid user ID format: {current_user.get('id')}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    except Exception as e:
        logger.error(f"User profile update failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="User profile update failed"
        )


@router.get("/health")
async def users_health_check():
    """Health check endpoint for user profile service."""
    return {
        "status": "healthy",
        "service": "user_profile",
        "endpoints": [
            "GET /users/profile - Retrieve authenticated user profile",
            "PUT /users/profile - Update user profile and preferences"
        ]
    }