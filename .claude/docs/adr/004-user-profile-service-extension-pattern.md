# Architecture Decision Record: User Profile Service Extension Pattern

## Status
Accepted

## Context
Phase 5.5 required implementing user profile management endpoints (GET and PUT /users/profile) to enable users to retrieve and update their profiles and preferences. The existing system already had a well-established clean architecture with distinct service layers (AuthService, SupabaseService) and Pydantic models from Phase 5.2-5.4.

The key architectural challenge was: How should user profile management functionality be integrated into the existing service architecture without creating new dependencies, breaking established patterns, or duplicating existing authentication and database logic?

Constraints and forces at play:
- Must integrate seamlessly with existing JWT authentication from Phase 5.3
- Must reuse existing UserProfile and UpdateUserRequest models from Phase 5.2
- Must maintain consistency with established service layer patterns from Phase 5.4
- Must align perfectly with frontend TypeScript contracts from React Native user-store
- Must follow TDD methodology with comprehensive test coverage
- Must not create new service files or break existing architecture

## Decision
**Extend existing services (AuthService and SupabaseService) with profile management methods rather than creating new services or duplicating existing functionality.**

### Technical Approach
1. **AuthService Extension**: Add `get_user_profile_by_id()` and `update_user_profile()` methods to the existing AuthService class
2. **SupabaseService Extension**: Add corresponding database operations (`get_user_profile_by_id()` and `update_user_profile()`) to handle CRUD operations
3. **Router Implementation**: Create new `routers/users.py` following established router patterns from Phase 5.4
4. **Model Reuse**: Leverage existing UserProfile, UpdateUserRequest, and UserResponse models without modification
5. **Authentication Integration**: Use existing `get_current_user` dependency for JWT validation

### Key Components
- **Extended AuthService**: Profile retrieval and update business logic with error handling
- **Extended SupabaseService**: Database operations with UUID handling and JSONB preferences merging
- **User Profile Router**: RESTful endpoints following FastAPI best practices
- **Comprehensive Test Suite**: 18 test cases covering all scenarios and edge cases

## Consequences

### Positive
- **Zero New Dependencies**: Extends existing services without creating new files or dependencies
- **Perfect Pattern Consistency**: Follows exact same patterns established in Phase 5.4 workout endpoints
- **Code Reuse Maximization**: Leverages existing authentication, validation, and error handling infrastructure
- **Maintainability**: All profile-related logic is centralized in logical service layers
- **Frontend Alignment**: Response models perfectly match React Native TypeScript contracts
- **Comprehensive Testing**: 18 TDD test cases ensure robustness and reliability
- **Scalability**: Service extension pattern can accommodate future profile features (stats, preferences, etc.)

### Negative
- **Service Class Size**: AuthService and SupabaseService classes become larger with additional methods
- **Service Coupling**: Profile management functionality is coupled to authentication service rather than being standalone
- **Method Discovery**: Profile-related methods may be less discoverable within larger service classes

### Risks
- **Service Bloat**: If many more features are added this way, services could become monolithic
- **Testing Complexity**: Larger service classes require more comprehensive testing
- **Refactoring Difficulty**: Future extraction of profile functionality into separate services would require more effort

## Alternatives Considered

### Alternative 1: Create UserProfileService
**Description**: Create a new dedicated UserProfileService class to handle all profile-related operations
**Pros**: 
- Clear separation of concerns
- Dedicated service for profile functionality  
- Easier to test in isolation
- Could be extended with additional profile features
**Cons**: 
- Would violate the "no new files" architectural constraint
- Would require duplicating authentication and database connection logic
- Would break established service extension patterns from Phase 5.4
- Would require additional dependency injection setup

### Alternative 2: Direct Database Operations in Router
**Description**: Implement profile logic directly in the router endpoints without service layer abstraction
**Pros**:
- Fewer layers of abstraction
- More direct and potentially faster
- Simpler call stack
**Cons**:
- Violates clean architecture principles established in Phase 5.2
- No business logic separation
- Difficult to test business logic independently
- Code duplication across endpoints
- Violates established patterns from Phase 5.3 and 5.4

### Alternative 3: Utility Functions Approach
**Description**: Create utility functions for profile operations rather than service methods
**Pros**:
- Functional programming approach
- Easy to test individual functions
- No class state dependencies
**Cons**:
- Breaks established object-oriented service patterns
- Would require restructuring existing authentication patterns
- Harder to manage shared state and configuration
- Inconsistent with Phase 5.3/5.4 implementations

## Implementation Details

### Dependencies
- **FastAPI**: RESTful API framework for router implementation
- **Pydantic**: Existing model validation and serialization (UserProfile, UpdateUserRequest)
- **Supabase Python Client**: Database operations and authentication
- **JWT**: Token validation through existing get_current_user dependency
- **pytest-asyncio**: Async testing for comprehensive test coverage

### Configuration
- **JWT Settings**: Reuses existing settings.jwt_secret_key from Phase 5.3
- **Supabase Configuration**: Leverages existing SUPABASE_URL and SUPABASE_KEY from environment
- **CORS Settings**: Integrates with existing CORS configuration for React Native development
- **Router Prefix**: `/users` prefix with `user_profile` tag for API organization

### Performance Considerations
- **Database Queries**: Single query for profile retrieval, single update operation with atomic transactions
- **JSON Processing**: Efficient JSONB handling for user preferences with partial updates
- **Memory Usage**: Minimal additional memory footprint by extending existing services
- **Response Times**: Expected < 200ms for profile operations with proper database indexing

## Validation
**Test Coverage Metrics**: 18 comprehensive test cases implemented with TDD methodology
- Profile retrieval success/failure scenarios
- Authentication validation (invalid tokens, expired tokens, missing users)
- Profile update operations (partial updates, validation errors)
- Preferences management (weight units, themes, timer validation)
- Error handling and edge cases
- Complete CRUD workflows and frontend contract alignment

**Success Criteria**:
- All endpoints respond with correct HTTP status codes (200, 401, 404, 422, 500)
- Response models exactly match frontend TypeScript UserPreferences interface
- JWT authentication integration works seamlessly with existing Phase 5.3 patterns
- Database operations maintain data integrity and support partial updates
- Error handling provides clear, actionable error messages

## References
- [Phase 5.2 ADR - FastAPI Clean Architecture Setup](./002-fastapi-clean-architecture-setup.md)
- [Phase 5.3 ADR - Authentication Endpoints Implementation](./003-authentication-endpoints-implementation.md)
- [Backend User Profile Models](/Users/ankur/Desktop/FM-SetLogger/Backend/models/user.py)
- [React Native User Store Interface](/Users/ankur/Desktop/FM-SetLogger/store/user-store.ts)
- [Phase 5.5 Test Suite](/Users/ankur/Desktop/FM-SetLogger/Backend/tests/test_phase_5_5_user_profile.py)

## Review Schedule
**Next Review**: Phase 5.6 (Frontend Integration) - Validate that the service extension pattern supports efficient React Native integration

**Trigger for Re-evaluation**: 
- If AuthService or SupabaseService classes exceed 500 lines
- If profile functionality requires complex business logic beyond basic CRUD
- If additional user-related services (notifications, social features) are implemented
- If performance issues arise from service coupling