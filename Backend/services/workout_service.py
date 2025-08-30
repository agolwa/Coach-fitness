"""
Workout Service Layer - Business Logic for Workout Management

Implements secure workout operations for FM-SetLogger backend:
- Workout CRUD operations with user isolation (RLS)
- Workout-exercise relationship management
- Set tracking and validation
- Integration with existing Supabase client and authentication

This service layer follows the clean architecture established in Phase 5.2
and integrates with the authentication system from Phase 5.3.
"""

import logging
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from uuid import UUID
from decimal import Decimal

from fastapi import HTTPException, status
from postgrest.exceptions import APIError

from core.config import settings
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
    ExerciseDetails,
    WorkoutExerciseWithDetails
)

if TYPE_CHECKING:
    from supabase import Client

# Configure logging
logger = logging.getLogger(__name__)


class WorkoutService:
    """
    Core workout service handling CRUD operations and exercise management.
    
    Provides secure workout management with user isolation through RLS policies
    and comprehensive error handling following established patterns.
    """
    
    def __init__(self, supabase_client: Optional['Client'] = None):
        """Initialize workout service with optional Supabase client."""
        if supabase_client:
            self.supabase = supabase_client
        else:
            from services.supabase_client import SupabaseService
            supabase_service = SupabaseService()
            self.supabase = supabase_service.client
    
    def create_workout(self, user_id: UUID, workout_data: CreateWorkoutRequest) -> WorkoutResponse:
        """
        Create new workout session for authenticated user.
        
        Args:
            user_id: User's unique identifier
            workout_data: Workout creation data
            
        Returns:
            Created workout response
            
        Raises:
            HTTPException: If workout creation fails
        """
        try:
            # Prepare workout data for insertion
            workout_insert = {
                "user_id": str(user_id),
                "title": workout_data.title,
                "started_at": workout_data.started_at.isoformat() if workout_data.started_at else datetime.now(timezone.utc).isoformat(),
                "is_active": True
            }
            
            # Insert workout using RLS policy enforcement
            result = self.supabase.table("workouts").insert(workout_insert).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Workout creation failed"
                )
            
            workout_record = result.data[0]
            logger.info(f"Workout created: {workout_record['id']} for user {user_id}")
            
            # Convert to response model
            return self._convert_to_workout_response(workout_record)
            
        except APIError as e:
            logger.error(f"Database error creating workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during workout creation"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Workout creation failed"
            )
    
    def get_user_workouts(self, user_id: UUID, query: WorkoutListQuery) -> List[WorkoutResponse]:
        """
        Get all workouts for user with filtering and pagination.
        
        Args:
            user_id: User's unique identifier
            query: Query parameters for filtering and pagination
            
        Returns:
            List of user's workouts
            
        Raises:
            HTTPException: If workout retrieval fails
        """
        try:
            # Build query with RLS policy enforcement
            query_builder = self.supabase.table("workouts").select("*")
            
            # Apply filters
            if query.is_active is not None:
                query_builder = query_builder.eq("is_active", query.is_active)
            
            # Apply pagination and ordering
            query_builder = query_builder.order("created_at", desc=True)
            query_builder = query_builder.limit(query.limit).offset(query.offset)
            
            result = query_builder.execute()
            
            if not result.data:
                return []
            
            logger.debug(f"Retrieved {len(result.data)} workouts for user {user_id}")
            
            # Convert to response models
            return [self._convert_to_workout_response(record) for record in result.data]
            
        except APIError as e:
            logger.error(f"Database error retrieving workouts: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during workout retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving workouts: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Workout retrieval failed"
            )
    
    def get_workout_details(self, user_id: UUID, workout_id: UUID) -> WorkoutWithExercisesResponse:
        """
        Get workout details with exercises and sets.
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier
            
        Returns:
            Complete workout with exercises and sets
            
        Raises:
            HTTPException: If workout not found or access denied
        """
        try:
            # Get workout with RLS policy enforcement
            workout_result = self.supabase.table("workouts").select("*").eq("id", str(workout_id)).single().execute()
            
            if not workout_result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workout not found"
                )
            
            workout_record = workout_result.data
            
            # Get workout exercises with exercise details and sets
            exercises_result = self.supabase.table("workout_exercises").select("""
                *,
                exercises(*),
                sets(*)
            """).eq("workout_id", str(workout_id)).order("order_index").execute()
            
            exercises_data = []
            if exercises_result.data:
                for we_record in exercises_result.data:
                    # Build exercise details
                    exercise_details = ExerciseDetails(
                        id=we_record["exercises"]["id"],
                        name=we_record["exercises"]["name"],
                        category=we_record["exercises"]["category"],
                        body_part=we_record["exercises"]["body_part"],
                        equipment=we_record["exercises"]["equipment"],
                        description=we_record["exercises"].get("description")
                    )
                    
                    # Build sets list
                    sets_data = []
                    if we_record["sets"]:
                        sets_data = [self._convert_to_set_response(set_record) for set_record in we_record["sets"]]
                        # Sort sets by order_index
                        sets_data.sort(key=lambda x: x.order_index)
                    
                    # Build workout exercise with details
                    exercise_with_details = WorkoutExerciseWithDetails(
                        id=we_record["id"],
                        workout_id=we_record["workout_id"],
                        exercise_id=we_record["exercise_id"],
                        order_index=we_record["order_index"],
                        notes=we_record.get("notes"),
                        created_at=we_record["created_at"],
                        exercise_details=exercise_details,
                        sets=sets_data
                    )
                    
                    exercises_data.append(exercise_with_details)
            
            logger.debug(f"Retrieved workout details: {workout_id} with {len(exercises_data)} exercises")
            
            # Build complete workout response
            return WorkoutWithExercisesResponse(
                id=workout_record["id"],
                user_id=workout_record["user_id"],
                title=workout_record["title"],
                started_at=workout_record["started_at"],
                completed_at=workout_record.get("completed_at"),
                duration=workout_record.get("duration"),
                is_active=workout_record["is_active"],
                created_at=workout_record["created_at"],
                updated_at=workout_record["updated_at"],
                exercises=exercises_data
            )
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error retrieving workout details: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during workout retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving workout details: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Workout detail retrieval failed"
            )
    
    def update_workout(self, user_id: UUID, workout_id: UUID, update_data: UpdateWorkoutRequest) -> WorkoutResponse:
        """
        Update workout session.
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier  
            update_data: Workout update data
            
        Returns:
            Updated workout response
            
        Raises:
            HTTPException: If workout not found or update fails
        """
        try:
            # Prepare update data
            update_dict = {}
            if update_data.title is not None:
                update_dict["title"] = update_data.title
            if update_data.completed_at is not None:
                update_dict["completed_at"] = update_data.completed_at.isoformat()
            if update_data.duration is not None:
                update_dict["duration"] = update_data.duration
            if update_data.is_active is not None:
                update_dict["is_active"] = update_data.is_active
            
            # Add updated_at timestamp
            update_dict["updated_at"] = datetime.now(timezone.utc).isoformat()
            
            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid update fields provided"
                )
            
            # Update with RLS policy enforcement
            result = self.supabase.table("workouts").update(update_dict).eq("id", str(workout_id)).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workout not found"
                )
            
            updated_record = result.data[0]
            logger.info(f"Workout updated: {workout_id} for user {user_id}")
            
            return self._convert_to_workout_response(updated_record)
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error updating workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during workout update"
            )
        except Exception as e:
            logger.error(f"Unexpected error updating workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Workout update failed"
            )
    
    def delete_workout(self, user_id: UUID, workout_id: UUID) -> None:
        """
        Delete workout and cascade delete related data.
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier
            
        Raises:
            HTTPException: If workout not found or deletion fails
        """
        try:
            # Delete with RLS policy enforcement (cascade handled by database)
            result = self.supabase.table("workouts").delete().eq("id", str(workout_id)).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workout not found"
                )
            
            logger.info(f"Workout deleted: {workout_id} for user {user_id}")
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error deleting workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during workout deletion"
            )
        except Exception as e:
            logger.error(f"Unexpected error deleting workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Workout deletion failed"
            )
    
    def add_exercise_to_workout(self, user_id: UUID, workout_id: UUID, exercise_data: WorkoutExerciseRequest) -> WorkoutExerciseResponse:
        """
        Add exercise to workout with order tracking.
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier
            exercise_data: Exercise addition data
            
        Returns:
            Created workout-exercise relationship
            
        Raises:
            HTTPException: If workout or exercise not found, or addition fails
        """
        try:
            # Verify workout exists and user has access (RLS will enforce)
            workout_check = self.supabase.table("workouts").select("id").eq("id", str(workout_id)).single().execute()
            if not workout_check.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Workout not found"
                )
            
            # Verify exercise exists
            exercise_check = self.supabase.table("exercises").select("id").eq("id", str(exercise_data.exercise_id)).single().execute()
            if not exercise_check.data:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Exercise not found"
                )
            
            # Prepare workout exercise data
            workout_exercise_insert = {
                "workout_id": str(workout_id),
                "exercise_id": str(exercise_data.exercise_id),
                "order_index": exercise_data.order_index,
                "notes": exercise_data.notes
            }
            
            # Insert workout exercise relationship
            result = self.supabase.table("workout_exercises").insert(workout_exercise_insert).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Failed to add exercise to workout"
                )
            
            created_record = result.data[0]
            logger.info(f"Exercise {exercise_data.exercise_id} added to workout {workout_id}")
            
            return WorkoutExerciseResponse(
                id=created_record["id"],
                workout_id=created_record["workout_id"],
                exercise_id=created_record["exercise_id"],
                order_index=created_record["order_index"],
                notes=created_record.get("notes"),
                created_at=created_record["created_at"]
            )
            
        except HTTPException:
            raise
        except APIError as e:
            # Handle unique constraint violation (duplicate exercise in workout)
            if "duplicate key" in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Exercise already exists in this workout"
                )
            logger.error(f"Database error adding exercise to workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise addition"
            )
        except Exception as e:
            logger.error(f"Unexpected error adding exercise to workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise addition failed"
            )
    
    def remove_exercise_from_workout(self, user_id: UUID, workout_id: UUID, exercise_id: UUID) -> None:
        """
        Remove exercise from workout (cascade deletes sets).
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier
            exercise_id: Exercise's unique identifier
            
        Raises:
            HTTPException: If workout exercise not found or removal fails
        """
        try:
            # Delete workout exercise relationship (cascade deletes sets)
            result = self.supabase.table("workout_exercises").delete().match({
                "workout_id": str(workout_id),
                "exercise_id": str(exercise_id)
            }).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise not found in workout"
                )
            
            logger.info(f"Exercise {exercise_id} removed from workout {workout_id}")
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error removing exercise from workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise removal"
            )
        except Exception as e:
            logger.error(f"Unexpected error removing exercise from workout: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise removal failed"
            )
    
    def add_set_to_exercise(self, user_id: UUID, workout_id: UUID, exercise_id: UUID, set_data: CreateSetRequest) -> SetResponse:
        """
        Add set to exercise in workout.
        
        Args:
            user_id: User's unique identifier
            workout_id: Workout's unique identifier
            exercise_id: Exercise's unique identifier
            set_data: Set creation data
            
        Returns:
            Created set response
            
        Raises:
            HTTPException: If workout exercise not found or set creation fails
        """
        try:
            # Get workout exercise ID for set relationship
            we_result = self.supabase.table("workout_exercises").select("id").match({
                "workout_id": str(workout_id),
                "exercise_id": str(exercise_id)
            }).single().execute()
            
            if not we_result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise not found in workout"
                )
            
            workout_exercise_id = we_result.data["id"]
            
            # Get next order index for sets
            order_result = self.supabase.table("sets").select("order_index").eq("workout_exercise_id", workout_exercise_id).order("order_index", desc=True).limit(1).execute()
            next_order = 0
            if order_result.data:
                next_order = order_result.data[0]["order_index"] + 1
            
            # Prepare set data for insertion
            set_insert = {
                "workout_exercise_id": workout_exercise_id,
                "order_index": next_order,
                "completed": set_data.completed,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }
            
            # Add optional fields
            if set_data.reps is not None:
                set_insert["reps"] = set_data.reps
            if set_data.weight is not None:
                set_insert["weight"] = float(set_data.weight)
            if set_data.duration is not None:
                set_insert["duration"] = set_data.duration
            if set_data.distance is not None:
                set_insert["distance"] = float(set_data.distance)
            if set_data.rest_time is not None:
                set_insert["rest_time"] = set_data.rest_time
            if set_data.notes is not None:
                set_insert["notes"] = set_data.notes
            
            # Insert set
            result = self.supabase.table("sets").insert(set_insert).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="Set creation failed"
                )
            
            created_record = result.data[0]
            logger.info(f"Set created for exercise {exercise_id} in workout {workout_id}")
            
            return self._convert_to_set_response(created_record)
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error creating set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during set creation"
            )
        except Exception as e:
            logger.error(f"Unexpected error creating set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Set creation failed"
            )
    
    def update_set(self, user_id: UUID, set_id: UUID, update_data: UpdateSetRequest) -> SetResponse:
        """
        Update existing set.
        
        Args:
            user_id: User's unique identifier
            set_id: Set's unique identifier
            update_data: Set update data
            
        Returns:
            Updated set response
            
        Raises:
            HTTPException: If set not found or update fails
        """
        try:
            # Prepare update data
            update_dict = {}
            if update_data.reps is not None:
                update_dict["reps"] = update_data.reps
            if update_data.weight is not None:
                update_dict["weight"] = float(update_data.weight)
            if update_data.duration is not None:
                update_dict["duration"] = update_data.duration
            if update_data.distance is not None:
                update_dict["distance"] = float(update_data.distance)
            if update_data.completed is not None:
                update_dict["completed"] = update_data.completed
            if update_data.rest_time is not None:
                update_dict["rest_time"] = update_data.rest_time
            if update_data.notes is not None:
                update_dict["notes"] = update_data.notes
            
            if not update_dict:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No valid update fields provided"
                )
            
            # Update set (RLS enforced through workout_exercise relationship)
            result = self.supabase.table("sets").update(update_dict).eq("id", str(set_id)).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Set not found"
                )
            
            updated_record = result.data[0]
            logger.info(f"Set updated: {set_id}")
            
            return self._convert_to_set_response(updated_record)
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error updating set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during set update"
            )
        except Exception as e:
            logger.error(f"Unexpected error updating set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Set update failed"
            )
    
    def delete_set(self, user_id: UUID, set_id: UUID) -> None:
        """
        Delete set from exercise.
        
        Args:
            user_id: User's unique identifier
            set_id: Set's unique identifier
            
        Raises:
            HTTPException: If set not found or deletion fails
        """
        try:
            # Delete set (RLS enforced through workout_exercise relationship)
            result = self.supabase.table("sets").delete().eq("id", str(set_id)).execute()
            
            if not result.data or len(result.data) == 0:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Set not found"
                )
            
            logger.info(f"Set deleted: {set_id}")
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error deleting set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during set deletion"
            )
        except Exception as e:
            logger.error(f"Unexpected error deleting set: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Set deletion failed"
            )
    
    def get_workout_stats(self, user_id: UUID) -> WorkoutStatsResponse:
        """
        Get workout statistics for user.
        
        Args:
            user_id: User's unique identifier
            
        Returns:
            User workout statistics
            
        Raises:
            HTTPException: If stats retrieval fails
        """
        try:
            # Get workout counts
            all_workouts = self.supabase.table("workouts").select("id, duration, is_active").execute()
            
            total_workouts = len(all_workouts.data) if all_workouts.data else 0
            active_workouts = len([w for w in all_workouts.data if w["is_active"]]) if all_workouts.data else 0
            completed_workouts = total_workouts - active_workouts
            
            # Calculate duration statistics
            completed_durations = [w["duration"] for w in all_workouts.data if w["duration"] is not None and not w["is_active"]] if all_workouts.data else []
            total_duration = sum(completed_durations) if completed_durations else None
            average_duration = int(total_duration / len(completed_durations)) if completed_durations else None
            
            return WorkoutStatsResponse(
                total_workouts=total_workouts,
                active_workouts=active_workouts,
                completed_workouts=completed_workouts,
                total_duration=total_duration,
                average_duration=average_duration
            )
            
        except APIError as e:
            logger.error(f"Database error retrieving workout stats: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during stats retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving workout stats: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Stats retrieval failed"
            )
    
    def _convert_to_workout_response(self, record: Dict[str, Any]) -> WorkoutResponse:
        """Convert database record to WorkoutResponse."""
        return WorkoutResponse(
            id=record["id"],
            user_id=record["user_id"],
            title=record["title"],
            started_at=record["started_at"],
            completed_at=record.get("completed_at"),
            duration=record.get("duration"),
            is_active=record["is_active"],
            created_at=record["created_at"],
            updated_at=record["updated_at"]
        )
    
    def _convert_to_set_response(self, record: Dict[str, Any]) -> SetResponse:
        """Convert database record to SetResponse."""
        return SetResponse(
            id=record["id"],
            workout_exercise_id=record["workout_exercise_id"],
            reps=record.get("reps"),
            weight=Decimal(str(record["weight"])) if record.get("weight") is not None else None,
            duration=record.get("duration"),
            distance=Decimal(str(record["distance"])) if record.get("distance") is not None else None,
            completed=record["completed"],
            rest_time=record.get("rest_time"),
            notes=record.get("notes"),
            order_index=record["order_index"],
            completed_at=record["completed_at"],
            created_at=record["created_at"]
        )