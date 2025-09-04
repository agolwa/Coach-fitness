"""
Supabase Client Service - Database Operations for User Management

Handles all database operations for user management and authentication:
- User CRUD operations with RLS policy compliance
- Integration with Supabase authentication system
- User profile management and preferences handling
- Secure database queries with proper error handling

This service integrates with the existing Phase 5.1 database schema
and maintains compatibility with RLS policies and constraints.
"""

import os
import logging
from typing import Optional, Dict, Any, List
from uuid import UUID, uuid4
from datetime import datetime

from supabase import Client, create_client
from fastapi import HTTPException, status

from core.config import settings
from models.user import UserProfile, CreateUserRequest, UpdateUserRequest, GoogleUserData
from models.auth import UserPreferences, WeightUnit, Theme, JWTPayload

# Configure logging
logger = logging.getLogger(__name__)


class SupabaseService:
    """
    Supabase database service for user management operations.
    
    Provides secure database operations following RLS policies and
    maintaining data integrity with proper error handling.
    """
    
    def __init__(self, client: Optional[Client] = None):
        """
        Initialize Supabase service with optional client injection.
        
        Args:
            client: Optional Supabase client for dependency injection (testing)
        """
        if client:
            self.client = client
        else:
            self._initialize_client()
    
    def _initialize_client(self) -> None:
        """Initialize Supabase client with configuration validation."""
        if not settings.supabase_url or not settings.supabase_service_role_key:
            # For testing environments
            testing_mode = (
                settings.testing or 
                os.getenv("TESTING") == "true" or 
                os.getenv("PYTEST_CURRENT_TEST")
            )
            if testing_mode:
                logger.info("Running in test mode - using test Supabase configuration")
                return
            
            raise ValueError("Supabase configuration is required")
        
        try:
            self.client = create_client(
                settings.supabase_url,
                settings.supabase_service_role_key
            )
            logger.info("Supabase client initialized successfully")
        except Exception as e:
            logger.error(f"Supabase client initialization failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database connection failed"
            )

    def create_user(self, user_data: CreateUserRequest) -> UserProfile:
        """
        Create new user in database with default preferences.
        
        Args:
            user_data: User creation request data
            
        Returns:
            Created user profile
            
        Raises:
            HTTPException: If user creation fails
        """
        try:
            # Since we're using service role key, we need to bypass the foreign key constraint
            # The cleanest approach is to handle the constraint violation and provide a helpful error
            
            # Prepare user data for database insertion
            db_user_data = {
                "id": str(user_data.id),
                "email": user_data.email,
                "display_name": user_data.display_name,
                "preferences": user_data.preferences.model_dump() if user_data.preferences else None
            }
            
            try:
                # Try direct insertion first
                response = self.client.table("users").insert(db_user_data).execute()
            except Exception as constraint_error:
                # If foreign key constraint violation, provide specific error
                if "foreign key constraint" in str(constraint_error).lower():
                    logger.error(f"Foreign key constraint violation - database schema needs update")
                    logger.error(f"Run this SQL in Supabase dashboard: ALTER TABLE users DROP CONSTRAINT users_id_fkey;")
                    raise HTTPException(
                        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                        detail="Database schema needs to be updated. Please contact administrator."
                    )
                else:
                    # Re-raise other errors
                    raise constraint_error
            
            if not response.data:
                raise ValueError("User creation returned empty response")
            
            created_user_data = response.data[0]
            
            # Convert to UserProfile model
            preferences_data = created_user_data.get("preferences") or {}
            preferences = UserPreferences(**preferences_data) if preferences_data else UserPreferences()
            
            user_profile = UserProfile(
                id=UUID(created_user_data["id"]),
                email=created_user_data["email"],
                display_name=created_user_data.get("display_name"),
                preferences=preferences,
                created_at=datetime.fromisoformat(created_user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(created_user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.info(f"User created successfully: {user_profile.email}")
            return user_profile
            
        except Exception as e:
            logger.error(f"User creation failed for {user_data.email}: {str(e)}")
            
            # Handle unique constraint violations
            if "duplicate key value" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="User with this email already exists"
                )
            
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation failed"
            )

    def get_user_by_id(self, user_id: UUID) -> Optional[UserProfile]:
        """
        Retrieve user by ID from database.
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            User profile if found, None otherwise
        """
        try:
            response = self.client.table("users").select("*").eq("id", str(user_id)).execute()
            
            if not response.data:
                logger.debug(f"User not found: {user_id}")
                return None
            
            user_data = response.data[0]
            
            # Convert to UserProfile model
            user_profile = UserProfile(
                id=UUID(user_data["id"]),
                email=user_data["email"],
                display_name=user_data.get("display_name"),
                preferences=UserPreferences(**(user_data.get("preferences") or {})),
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.debug(f"User retrieved successfully: {user_id}")
            return user_profile
            
        except Exception as e:
            logger.error(f"User retrieval failed for {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User retrieval failed"
            )

    def get_user_by_email(self, email: str) -> Optional[UserProfile]:
        """
        Retrieve user by email address from database.
        
        Args:
            email: User's email address
            
        Returns:
            User profile if found, None otherwise
        """
        try:
            response = self.client.table("users").select("*").eq("email", email).execute()
            
            if not response.data:
                logger.debug(f"User not found by email: {email}")
                return None
            
            user_data = response.data[0]
            
            # Convert to UserProfile model
            user_profile = UserProfile(
                id=UUID(user_data["id"]),
                email=user_data["email"],
                display_name=user_data.get("display_name"),
                preferences=UserPreferences(**(user_data.get("preferences") or {})),
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.debug(f"User retrieved by email: {email}")
            return user_profile
            
        except Exception as e:
            logger.error(f"User retrieval by email failed for {email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User retrieval failed"
            )

    def update_user_profile(self, user_id: UUID, updates: UpdateUserRequest) -> UserProfile:
        """
        Update user profile with partial data.
        
        Args:
            user_id: User's unique identifier
            updates: Partial update data
            
        Returns:
            Updated user profile
            
        Raises:
            HTTPException: If update fails or user not found
        """
        try:
            # Prepare update data (exclude None values)
            update_data = {}
            
            if updates.display_name is not None:
                update_data["display_name"] = updates.display_name
            
            if updates.preferences is not None:
                update_data["preferences"] = updates.preferences.model_dump()
            
            if not update_data:
                # No updates provided, return current user
                current_user = self.get_user_by_id(user_id)
                if not current_user:
                    raise HTTPException(
                        status_code=status.HTTP_404_NOT_FOUND,
                        detail="User not found"
                    )
                return current_user
            
            # Perform update
            response = self.client.table("users").update(update_data).eq("id", str(user_id)).execute()
            
            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            updated_user_data = response.data[0]
            
            # Convert to UserProfile model
            user_profile = UserProfile(
                id=UUID(updated_user_data["id"]),
                email=updated_user_data["email"],
                display_name=updated_user_data.get("display_name"),
                preferences=UserPreferences(**(updated_user_data.get("preferences") or {})),
                created_at=datetime.fromisoformat(updated_user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(updated_user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.info(f"User profile updated: {user_id}")
            return user_profile
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"User profile update failed for {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User profile update failed"
            )

    def initialize_user_preferences(self, user_id: UUID) -> Dict[str, Any]:
        """
        Initialize default preferences for a new user.
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            Default preferences dictionary
        """
        default_preferences = UserPreferences()
        preferences_dict = default_preferences.model_dump()
        
        logger.debug(f"Default preferences initialized for user {user_id}")
        return preferences_dict

    def authenticate_user_email_password(self, email: str, password: str) -> Optional[UserProfile]:
        """
        Authenticate user with email and password via Supabase Auth.
        
        Args:
            email: User's email address
            password: User's password
            
        Returns:
            User profile if authentication successful, None otherwise
            
        Note: This method integrates with Supabase Auth system
        """
        try:
            # Authenticate with Supabase Auth
            auth_response = self.client.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                logger.warning(f"Authentication failed for email: {email}")
                return None
            
            # Retrieve user profile from database
            user_profile = self.get_user_by_id(UUID(auth_response.user.id))
            
            if user_profile:
                logger.info(f"User authenticated successfully: {email}")
            else:
                logger.warning(f"Authenticated user not found in database: {email}")
            
            return user_profile
            
        except Exception as e:
            logger.error(f"Email/password authentication failed for {email}: {str(e)}")
            return None

    def get_user_from_jwt_payload(self, payload: JWTPayload) -> UserProfile:
        """
        Retrieve user profile from JWT payload.
        
        Args:
            payload: Decoded JWT payload
            
        Returns:
            User profile
            
        Raises:
            HTTPException: If user not found
        """
        try:
            user_id = UUID(payload.sub)
            user_profile = self.get_user_by_id(user_id)
            
            if not user_profile:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            
            # Verify email matches (additional security check)
            if user_profile.email != payload.email:
                logger.warning(f"JWT email mismatch for user {user_id}")
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token email mismatch"
                )
            
            return user_profile
            
        except ValueError as e:
            logger.error(f"Invalid user ID in JWT payload: {payload.sub}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid user ID in token"
            )
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"User retrieval from JWT failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User retrieval failed"
            )

    def create_or_get_user_from_google(self, google_data: GoogleUserData) -> UserProfile:
        """
        Create new user or retrieve existing user from Google OAuth data.
        
        Args:
            google_data: Validated Google user data
            
        Returns:
            User profile (created or retrieved)
        """
        try:
            # Check if user already exists
            existing_user = self.get_user_by_email(google_data.email)
            
            if existing_user:
                logger.info(f"Existing user found for Google OAuth: {google_data.email}")
                return existing_user
            
            # Create new user
            new_user_id = uuid4()
            
            user_request = CreateUserRequest(
                id=new_user_id,
                email=google_data.email,
                display_name=google_data.name,
                preferences=None  # Will use defaults
            )
            
            created_user = self.create_user(user_request)
            logger.info(f"New user created from Google OAuth: {google_data.email}")
            
            return created_user
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Google OAuth user creation/retrieval failed for {google_data.email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Google OAuth user processing failed"
            )

    def create_user_with_preferences(self, user_data: Dict[str, Any], client: Optional[Client] = None) -> Dict[str, Any]:
        """
        Create user with default preferences (for testing compatibility).
        
        Args:
            user_data: User data dictionary
            client: Optional Supabase client override
            
        Returns:
            Created user data with preferences
        """
        # Use provided client or default
        supabase_client = client or self.client
        
        # Generate UUID for new user
        user_id = uuid4()
        
        # Prepare user data with default preferences
        db_user_data = {
            "id": str(user_id),
            "email": user_data["email"],
            "display_name": user_data.get("name"),
            "preferences": self.initialize_user_preferences(user_id)
        }
        
        try:
            # Insert user into database
            response = supabase_client.table("users").insert(db_user_data).execute()
            
            if response.data:
                created_user = response.data[0]
                logger.info(f"User created with preferences: {created_user['email']}")
                return created_user
            else:
                raise ValueError("User creation returned empty response")
                
        except Exception as e:
            logger.error(f"User creation with preferences failed: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation failed"
            )

    def get_user_profile_by_id(self, user_id: UUID) -> Optional[UserProfile]:
        """
        Retrieve user profile by ID for Phase 5.5 user profile endpoints.
        
        Args:
            user_id: User UUID to retrieve
            
        Returns:
            User profile or None if not found
            
        Raises:
            HTTPException: If database error occurs
        """
        try:
            # Query user by ID
            response = self.client.table("users").select("*").eq("id", str(user_id)).execute()
            
            if not response.data:
                logger.debug(f"User profile not found for ID: {user_id}")
                return None
            
            user_data = response.data[0]
            
            # Parse preferences JSON
            preferences_data = user_data.get("preferences", {})
            preferences = UserPreferences(**preferences_data) if preferences_data else UserPreferences()
            
            # Create UserProfile object
            user_profile = UserProfile(
                id=UUID(user_data["id"]),
                email=user_data["email"],
                display_name=user_data.get("display_name"),
                preferences=preferences,
                created_at=datetime.fromisoformat(user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.debug(f"User profile retrieved for ID: {user_id}")
            return user_profile
            
        except Exception as e:
            logger.error(f"User profile retrieval failed for ID {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error retrieving user profile"
            )

    def update_user_profile(self, user_id: UUID, update_data: UpdateUserRequest) -> Optional[UserProfile]:
        """
        Update user profile for Phase 5.5 user profile endpoints.
        
        Args:
            user_id: User UUID to update
            update_data: Validated update request data
            
        Returns:
            Updated user profile or None if not found
            
        Raises:
            HTTPException: If database error occurs
        """
        try:
            # Prepare update data
            update_dict = {}
            
            # Add display_name if provided
            if update_data.display_name is not None:
                update_dict["display_name"] = update_data.display_name
            
            # Add preferences if provided
            if update_data.preferences is not None:
                # Get existing preferences first to merge partial updates
                existing_user = self.get_user_profile_by_id(user_id)
                if not existing_user:
                    return None
                
                # Merge existing preferences with updates
                existing_prefs = existing_user.preferences.model_dump()
                new_prefs = update_data.preferences.model_dump(exclude_none=True)
                merged_prefs = {**existing_prefs, **new_prefs}
                
                update_dict["preferences"] = merged_prefs
            
            # Add updated_at timestamp
            update_dict["updated_at"] = datetime.utcnow().isoformat()
            
            # Perform update
            response = self.client.table("users").update(update_dict).eq("id", str(user_id)).execute()
            
            if not response.data:
                logger.warning(f"User profile not found for update: {user_id}")
                return None
            
            updated_user_data = response.data[0]
            
            # Parse updated preferences
            preferences_data = updated_user_data.get("preferences", {})
            preferences = UserPreferences(**preferences_data) if preferences_data else UserPreferences()
            
            # Create updated UserProfile object
            updated_profile = UserProfile(
                id=UUID(updated_user_data["id"]),
                email=updated_user_data["email"],
                display_name=updated_user_data.get("display_name"),
                preferences=preferences,
                created_at=datetime.fromisoformat(updated_user_data["created_at"].replace("Z", "+00:00")),
                updated_at=datetime.fromisoformat(updated_user_data["updated_at"].replace("Z", "+00:00"))
            )
            
            logger.info(f"User profile updated for ID: {user_id}")
            return updated_profile
            
        except Exception as e:
            logger.error(f"User profile update failed for ID {user_id}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error updating user profile"
            )

    def get_or_create_user(self, user_id: UUID, email: str, display_name: str = None) -> UserProfile:
        """
        Get existing user or create new user if not exists.
        
        This method is used by WorkoutService to ensure user exists before creating workouts.
        It first tries to get the user by ID, and if not found, creates a new user.
        
        Args:
            user_id: User's unique identifier from JWT
            email: User's email address from JWT
            display_name: Optional display name
            
        Returns:
            User profile (existing or newly created)
            
        Raises:
            HTTPException: If user creation fails
        """
        try:
            # First try to get existing user
            existing_user = self.get_user_by_id(user_id)
            if existing_user:
                logger.debug(f"User found: {user_id}")
                return existing_user
            
            # User doesn't exist, create new one
            logger.info(f"Creating new user: {email}")
            user_request = CreateUserRequest(
                id=user_id,
                email=email,
                display_name=display_name,
                preferences=None  # Will use defaults
            )
            
            created_user = self.create_user(user_request)
            logger.info(f"New user created: {email}")
            
            return created_user
            
        except HTTPException:
            # Re-raise HTTP exceptions (like 409 Conflict)
            raise
        except Exception as e:
            logger.error(f"Get or create user failed for {email}: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="User creation/retrieval failed"
            )


# Import necessary modules
import os