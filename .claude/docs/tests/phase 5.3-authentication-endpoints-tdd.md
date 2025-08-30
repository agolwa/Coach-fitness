# TDD Phase 5.3: Authentication Endpoints

## Feature: FastAPI Authentication System with JWT and Google OAuth Integration

**Implement secure user authentication endpoints with JWT token management and Google OAuth integration using Test-Driven Development (TDD). The authentication system must provide complete user session management while integrating seamlessly with the existing Supabase database foundation and React Native frontend.**

This phase establishes the authentication layer that will secure all subsequent API endpoints, enabling user-specific workout data access and maintaining the security model established in Phase 5.1.

## Requirements

Based on **Task 5.3: Authentication Endpoints** from the implementation plan:

1. **5.3.1** Implement `/auth/google`: Handle Google OAuth callback, create or retrieve user in Supabase, and issue a JWT
2. **5.3.2** Implement `/auth/login` (if email/password is supported): Authenticate against Supabase Auth and issue a JWT  
3. **5.3.3** Implement `/auth/me`: A protected endpoint that returns the current user's profile based on a valid JWT
4. **5.3.4** Create Pydantic models for request and response bodies, matching frontend TypeScript contracts
5. **5.3.5** Implement dependency injection for authentication and database sessions

## TDD Process Instructions

**Follow strict TDD process:**

1. **RED Phase**: Write a failing test that defines the expected authentication behavior
2. **GREEN Phase**: Write the minimal authentication code to make the test pass  
3. **REFACTOR Phase**: Clean up the implementation while ensuring all tests remain green
4. **REPEAT**: For each requirement above, following the numbered order

## Test Cases to Implement (in order)

### Authentication Flow Tests

1. **test_google_oauth_token_exchange** - Verify Google OAuth token can be exchanged for app JWT with user creation/retrieval

2. **test_email_password_authentication** - Verify email/password login against Supabase Auth returns valid JWT

3. **test_jwt_token_generation** - Verify JWT tokens are generated with correct payload (user_id, exp, iat) and signature

4. **test_user_profile_retrieval_with_valid_jwt** - Verify `/auth/me` returns user profile when valid JWT provided

5. **test_authentication_dependency_injection** - Verify FastAPI dependency correctly extracts and validates JWT from Authorization header

### JWT Token Management Tests

6. **test_jwt_token_validation** - Verify JWT signature validation with correct and incorrect secret keys

7. **test_jwt_token_expiration_handling** - Verify expired JWT tokens are rejected with appropriate error messages

8. **test_jwt_payload_extraction** - Verify user ID and metadata can be correctly extracted from valid JWT tokens

9. **test_authorization_header_parsing** - Verify "Bearer {token}" format is correctly parsed from Authorization header

### User Profile Tests

10. **test_user_creation_from_google_oauth** - Verify new user record created in database from Google OAuth data

11. **test_user_preferences_initialization** - Verify new users get default preferences (weightUnit: lbs, theme: auto, etc.)

12. **test_existing_user_login** - Verify existing users can login and receive updated JWT without creating duplicate records

### Error Handling Tests

13. **test_invalid_google_oauth_token** - Verify invalid Google OAuth tokens return proper error responses (401 Unauthorized)

14. **test_missing_authorization_header** - Verify protected endpoints return 401 when Authorization header missing

15. **test_malformed_jwt_token** - Verify malformed JWT tokens return 401 with clear error messages

### Integration Tests

16. **test_auth_endpoints_integration_with_supabase** - Verify authentication system works with real Supabase database connection

17. **test_protected_endpoint_access_control** - Verify `/auth/me` correctly identifies and returns data for authenticated users only

## Implementation Notes

- **Authentication Framework**: Use FastAPI's dependency injection system with `Depends()` for auth validation
- **JWT Library**: Use `python-jose[cryptography]` for JWT token generation and validation
- **Google OAuth**: Use Google OAuth 2.0 flow with verification of Google-issued JWT tokens
- **Database Integration**: Build on existing Supabase client and RLS policies from Phase 5.1
- **Password Hashing**: Use `passlib[bcrypt]` for secure password hashing if email/password auth implemented
- **Testing Framework**: Continue with pytest and async support for consistency with previous phases
- **Security Testing**: Critical focus on JWT validation, token expiration, and authorization header handling

### Test Data Setup

```python
# Example fixture structure
@pytest.fixture
async def google_oauth_token():
    """Mock Google OAuth token for testing"""
    # Return valid Google OAuth token structure
    
@pytest.fixture
async def test_user_data():
    """Test user data matching frontend TypeScript contracts"""
    return {
        "id": "test-user-uuid",
        "email": "test@example.com", 
        "display_name": "Test User",
        "preferences": {
            "weightUnit": "lbs",
            "theme": "auto",
            "defaultRestTimer": 60,
            "hapticFeedback": True
        }
    }

@pytest.fixture
async def valid_jwt_token(test_user_data):
    """Generate valid JWT token for testing protected endpoints"""
    # Return properly signed JWT with test user data

@pytest.fixture
async def expired_jwt_token():
    """Generate expired JWT token for expiration testing"""
    # Return JWT with past expiration date
```

### Authentication Models Validation Strategy

1. **Request/Response Models**: Ensure Pydantic models exactly match frontend TypeScript interfaces
2. **JWT Payload Models**: Define clear structure for JWT token contents and validation
3. **Error Response Models**: Consistent error response format across all auth endpoints
4. **Google OAuth Models**: Handle Google OAuth token structure and user data extraction
5. **User Profile Models**: Match database schema from Phase 5.1 with proper JSONB preferences

## Expected Outcomes

This phase will demonstrate:

- **Secure Authentication**: JWT-based authentication with proper token validation and expiration handling
- **Google OAuth Integration**: Seamless Google sign-in flow with user creation and retrieval
- **User Session Management**: Complete user profile access and preferences management
- **Database Security**: Integration with Phase 5.1 RLS policies ensuring user data isolation
- **Frontend Compatibility**: Request/response models matching React Native TypeScript contracts
- **Error Handling**: Comprehensive error responses for all authentication failure scenarios

### Success Criteria

- ✅ All 17 test cases pass with 100% success rate
- ✅ JWT token generation and validation working correctly with secure secret management
- ✅ Google OAuth flow functional with user creation and authentication
- ✅ Protected endpoints properly validate authentication and return user-specific data
- ✅ All Pydantic models match frontend TypeScript contracts exactly
- ✅ Error responses provide clear, actionable feedback for authentication failures
- ✅ Integration with Supabase RLS policies maintains user data isolation
- ✅ Ready for Phase 5.4: Workout & Exercise Endpoints implementation

### Security Validation

The authentication system is **CRITICAL** for protecting user data. Every authentication test must validate:
- JWT tokens are properly signed and cannot be forged
- Expired tokens are rejected with clear error messages  
- Invalid or missing Authorization headers return 401 Unauthorized
- User data returned by `/auth/me` matches the authenticated user only
- Google OAuth tokens are properly validated against Google's servers
- Password authentication (if implemented) uses secure bcrypt hashing

**🚨 Security Warning**: Authentication failures could compromise user data security. All security tests must pass before proceeding to workout endpoint development.

### Performance Considerations

Authentication endpoints must handle:
- Fast JWT token validation (< 10ms per request)
- Efficient database queries for user profile retrieval
- Proper caching of user session data
- Minimal Google OAuth API calls to avoid rate limiting

**⚡ Performance Note**: Authentication is called on every protected API request. All authentication tests should validate acceptable response times.

## Frontend Integration Alignment

The authentication endpoints must align with existing React Native frontend expectations:

### TypeScript Contracts to Match
- `LoginResponse`: JWT token, user profile, refresh token structure
- `UserResponse`: User profile format with JSONB preferences
- `GoogleAuthRequest`: Google OAuth token structure from frontend
- `TokenResponse`: JWT refresh token response format

### React Native Integration Points
- Authorization header format: `Bearer {jwt_token}`
- Error response format matching frontend error handling
- User preferences structure matching Zustand store expectations
- OAuth callback URL handling for React Native deep linking

**🔗 Integration Note**: All request/response models must be validated against actual frontend TypeScript interfaces to ensure seamless integration.