"""
Exercise Service Layer - Exercise Library Management

Implements exercise library operations for FM-SetLogger backend:
- Exercise library retrieval with filtering and search
- Exercise categorization and equipment filtering
- Exercise statistics and metadata
- Read-only exercise data management

This service layer follows the clean architecture established in Phase 5.2
and provides the exercise foundation for workout planning.
"""

import logging
from typing import Optional, List, Dict, Any, TYPE_CHECKING
from uuid import UUID

from fastapi import HTTPException, status
from postgrest.exceptions import APIError

from core.config import settings
from models.exercise import (
    ExerciseResponse,
    ExerciseListQuery,
    ExerciseStatsResponse,
    ExerciseSummaryResponse,
    ExerciseFilterOptions,
    ExerciseCategory,
    EXERCISE_BODY_PARTS,
    EXERCISE_EQUIPMENT
)

if TYPE_CHECKING:
    from supabase import Client

# Configure logging
logger = logging.getLogger(__name__)


class ExerciseService:
    """
    Core exercise service handling exercise library operations.
    
    Provides read-only access to the exercise library with comprehensive
    filtering, search, and categorization capabilities.
    """
    
    def __init__(self, supabase_client: Optional['Client'] = None):
        """Initialize exercise service with optional Supabase client."""
        if supabase_client:
            self.supabase = supabase_client
        else:
            from services.supabase_client import SupabaseService
            supabase_service = SupabaseService()
            self.supabase = supabase_service.client
    
    def get_exercise_library(self, query: ExerciseListQuery) -> List[ExerciseResponse]:
        """
        Get exercise library with filtering and search capabilities.
        
        Args:
            query: Query parameters for filtering and pagination
            
        Returns:
            List of exercises matching filter criteria
            
        Raises:
            HTTPException: If exercise retrieval fails
        """
        try:
            # Build query
            query_builder = self.supabase.table("exercises").select("*")
            
            # Apply filters
            if query.category is not None:
                # Handle both ExerciseCategory enum and string values
                category_value = query.category.value if hasattr(query.category, 'value') else query.category
                query_builder = query_builder.eq("category", category_value)
            
            if query.body_part is not None:
                # Filter by body part using array contains
                query_builder = query_builder.contains("body_part", [query.body_part])
            
            if query.equipment is not None:
                # Filter by equipment using array contains
                query_builder = query_builder.contains("equipment", [query.equipment])
            
            if query.search is not None:
                # Case-insensitive search in exercise names
                query_builder = query_builder.ilike("name", f"%{query.search}%")
            
            # Apply ordering and pagination
            query_builder = query_builder.order("name")
            query_builder = query_builder.limit(query.limit).offset(query.offset)
            
            result = query_builder.execute()
            
            if not result.data:
                return []
            
            logger.debug(f"Retrieved {len(result.data)} exercises with filters: {query.model_dump()}")
            
            # Convert to response models
            return [self._convert_to_exercise_response(record) for record in result.data]
            
        except APIError as e:
            logger.error(f"Database error retrieving exercise library: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise library retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving exercise library: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise library retrieval failed"
            )
    
    def get_exercise_by_id(self, exercise_id: UUID) -> ExerciseResponse:
        """
        Get specific exercise by ID.
        
        Args:
            exercise_id: Exercise's unique identifier
            
        Returns:
            Exercise details
            
        Raises:
            HTTPException: If exercise not found
        """
        try:
            result = self.supabase.table("exercises").select("*").eq("id", str(exercise_id)).single().execute()
            
            if not result.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Exercise not found"
                )
            
            logger.debug(f"Retrieved exercise: {exercise_id}")
            
            return self._convert_to_exercise_response(result.data)
            
        except HTTPException:
            raise
        except APIError as e:
            logger.error(f"Database error retrieving exercise: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving exercise: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise retrieval failed"
            )
    
    def get_exercise_stats(self) -> ExerciseStatsResponse:
        """
        Get exercise library statistics and metadata.
        
        Returns:
            Exercise library statistics
            
        Raises:
            HTTPException: If stats retrieval fails
        """
        try:
            # Get all exercises for statistics
            result = self.supabase.table("exercises").select("category, body_part, equipment").execute()
            
            if not result.data:
                return ExerciseStatsResponse(
                    total_exercises=0,
                    categories={},
                    body_parts=[],
                    equipment_types=[]
                )
            
            # Calculate category counts
            category_counts = {}
            all_body_parts = set()
            all_equipment = set()
            
            for exercise in result.data:
                category = exercise["category"]
                category_counts[category] = category_counts.get(category, 0) + 1
                
                # Collect unique body parts and equipment
                if exercise["body_part"]:
                    all_body_parts.update(exercise["body_part"])
                if exercise["equipment"]:
                    all_equipment.update(exercise["equipment"])
            
            logger.debug(f"Generated exercise statistics for {len(result.data)} exercises")
            
            return ExerciseStatsResponse(
                total_exercises=len(result.data),
                categories=category_counts,
                body_parts=sorted(list(all_body_parts)),
                equipment_types=sorted(list(all_equipment))
            )
            
        except APIError as e:
            logger.error(f"Database error retrieving exercise stats: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during stats retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving exercise stats: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise stats retrieval failed"
            )
    
    def get_exercise_summaries(self, category: Optional[ExerciseCategory] = None) -> List[ExerciseSummaryResponse]:
        """
        Get lightweight exercise summaries for dropdowns/selection UI.
        
        Args:
            category: Optional category filter
            
        Returns:
            List of exercise summaries
            
        Raises:
            HTTPException: If retrieval fails
        """
        try:
            # Build query for lightweight data
            query_builder = self.supabase.table("exercises").select("id, name, category")
            
            if category is not None:
                query_builder = query_builder.eq("category", category.value)
            
            query_builder = query_builder.order("name")
            
            result = query_builder.execute()
            
            if not result.data:
                return []
            
            logger.debug(f"Retrieved {len(result.data)} exercise summaries")
            
            # Convert to summary models
            return [
                ExerciseSummaryResponse(
                    id=record["id"],
                    name=record["name"],
                    category=record["category"]
                )
                for record in result.data
            ]
            
        except APIError as e:
            logger.error(f"Database error retrieving exercise summaries: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise summaries retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving exercise summaries: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise summaries retrieval failed"
            )
    
    def get_filter_options(self) -> ExerciseFilterOptions:
        """
        Get available filter options for exercise library.
        
        Returns:
            Available filter options
            
        Raises:
            HTTPException: If retrieval fails
        """
        try:
            # Get distinct values from database
            result = self.supabase.table("exercises").select("body_part, equipment").execute()
            
            if not result.data:
                return ExerciseFilterOptions(
                    categories=list(ExerciseCategory),
                    body_parts=EXERCISE_BODY_PARTS,
                    equipment_types=EXERCISE_EQUIPMENT
                )
            
            # Collect unique values from database
            all_body_parts = set()
            all_equipment = set()
            
            for exercise in result.data:
                if exercise["body_part"]:
                    all_body_parts.update(exercise["body_part"])
                if exercise["equipment"]:
                    all_equipment.update(exercise["equipment"])
            
            logger.debug("Generated exercise filter options")
            
            return ExerciseFilterOptions(
                categories=list(ExerciseCategory),
                body_parts=sorted(list(all_body_parts)),
                equipment_types=sorted(list(all_equipment))
            )
            
        except APIError as e:
            logger.error(f"Database error retrieving filter options: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during filter options retrieval"
            )
        except Exception as e:
            logger.error(f"Unexpected error retrieving filter options: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Filter options retrieval failed"
            )
    
    def search_exercises(self, search_term: str, limit: int = 20) -> List[ExerciseSummaryResponse]:
        """
        Search exercises by name with fuzzy matching.
        
        Args:
            search_term: Search query
            limit: Maximum results to return
            
        Returns:
            List of matching exercise summaries
            
        Raises:
            HTTPException: If search fails
        """
        try:
            if len(search_term.strip()) < 2:
                return []
            
            # Case-insensitive search with ILIKE
            result = self.supabase.table("exercises").select("id, name, category").ilike("name", f"%{search_term}%").order("name").limit(limit).execute()
            
            if not result.data:
                return []
            
            logger.debug(f"Exercise search for '{search_term}' returned {len(result.data)} results")
            
            return [
                ExerciseSummaryResponse(
                    id=record["id"],
                    name=record["name"],
                    category=record["category"]
                )
                for record in result.data
            ]
            
        except APIError as e:
            logger.error(f"Database error during exercise search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error during exercise search"
            )
        except Exception as e:
            logger.error(f"Unexpected error during exercise search: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Exercise search failed"
            )
    
    def _convert_to_exercise_response(self, record: Dict[str, Any]) -> ExerciseResponse:
        """Convert database record to ExerciseResponse."""
        return ExerciseResponse(
            id=record["id"],
            name=record["name"],
            category=record["category"],
            body_part=record["body_part"] or [],
            equipment=record["equipment"] or [],
            description=record.get("description"),
            created_at=record["created_at"]
        )