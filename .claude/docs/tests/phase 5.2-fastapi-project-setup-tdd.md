# TDD Phase 5.2: FastAPI Project Setup

## Feature: Complete FastAPI Backend Project Structure and Configuration

**Implement a production-ready FastAPI backend project with proper architecture, dependency management, and environment configuration using Test-Driven Development (TDD). The project must integrate seamlessly with Supabase and support React Native cross-origin requests.**

This phase establishes the complete backend foundation that will host the authentication, workout management, and user profile API endpoints in subsequent phases.

## Requirements

Based on **Task 5.2: FastAPI Project Setup** from the implementation plan:

1. **5.2.1** Initialize Python project with virtual environment and proper isolation
2. **5.2.2** Install all required dependencies: `fastapi`, `uvicorn`, `pydantic`, `supabase-py`, `python-jose[cryptography]`, `passlib[bcrypt]`  
3. **5.2.3** Structure backend project with clean separation of concerns (`/routers`, `/models`, `/services`, `/core`)
4. **5.2.4** Configure environment variables for Supabase URL, keys, and JWT secret management
5. **5.2.5** Set up CORS (Cross-Origin Resource Sharing) to allow React Native app requests

## TDD Process Instructions

**Follow strict TDD process:**

1. **RED Phase**: Write a failing test that defines the expected project setup behavior
2. **GREEN Phase**: Write the minimal code/configuration to make the test pass  
3. **REFACTOR Phase**: Clean up the implementation while ensuring all tests remain green
4. **REPEAT**: For each requirement above, following the numbered order

## Test Cases to Implement (in order)

### Environment Setup Tests

1. **test_python_virtual_environment_active** - Verify virtual environment is created and activated with isolated package space

2. **test_python_version_compatibility** - Verify Python 3.8+ compatibility for FastAPI and async support

3. **test_project_root_directory_structure** - Verify backend project root directory exists with proper organization

### Dependencies Installation Tests

4. **test_fastapi_package_installed** - Verify FastAPI is installed and can be imported without errors

5. **test_uvicorn_package_installed** - Verify Uvicorn ASGI server is installed for FastAPI hosting

6. **test_pydantic_package_installed** - Verify Pydantic is installed for request/response validation

7. **test_supabase_client_package_installed** - Verify supabase-py is installed for database integration

8. **test_jwt_authentication_packages_installed** - Verify python-jose[cryptography] and passlib[bcrypt] for JWT handling

9. **test_all_package_imports_successful** - Verify all required packages can be imported simultaneously without conflicts

### Project Architecture Tests

10. **test_routers_directory_structure** - Verify `/routers` directory exists for API endpoint organization

11. **test_models_directory_structure** - Verify `/models` directory exists for Pydantic model definitions

12. **test_services_directory_structure** - Verify `/services` directory exists for business logic separation

13. **test_core_directory_structure** - Verify `/core` directory exists for shared utilities and configuration

14. **test_clean_architecture_imports** - Verify no circular imports and proper dependency direction

### Environment Configuration Tests

15. **test_environment_file_template_exists** - Verify `.env.example` file exists with all required variables

16. **test_supabase_url_configuration** - Verify SUPABASE_URL environment variable loading and validation

17. **test_supabase_anon_key_configuration** - Verify SUPABASE_ANON_KEY environment variable handling

18. **test_jwt_secret_configuration** - Verify JWT_SECRET_KEY environment variable for token signing

19. **test_environment_loading_error_handling** - Verify proper error handling when required env vars are missing

### FastAPI Application Tests

20. **test_fastapi_app_initialization** - Verify FastAPI application instance can be created successfully

21. **test_cors_middleware_configuration** - Verify CORS is configured to allow React Native origins

22. **test_cors_allowed_origins_react_native** - Verify specific React Native development and production origins allowed

23. **test_cors_allowed_methods** - Verify GET, POST, PUT, DELETE, OPTIONS methods are permitted

24. **test_cors_allowed_headers** - Verify Authorization, Content-Type, and custom headers are allowed

### Integration Tests (Testing Checklist Part 1)

25. **test_fastapi_server_starts_successfully** - Verify FastAPI server starts with Uvicorn without errors (T5.1.3)

26. **test_environment_variables_loaded_correctly** - Verify all environment variables are accessible at runtime (T5.1.4)

27. **test_health_endpoint_returns_200_ok** - Verify basic `/health` endpoint returns 200 status (T5.1.5)

28. **test_supabase_client_connection** - Verify Supabase client can be instantiated with environment configuration

29. **test_server_graceful_shutdown** - Verify server shuts down cleanly without hanging processes

30. **test_hot_reload_development_mode** - Verify Uvicorn hot reload works in development environment

## Implementation Notes

- **Python Environment**: Use Python 3.8+ with `venv` for virtual environment isolation
- **Testing Framework**: Continue using pytest with async support for consistency with Phase 5.1
- **Package Management**: Use `requirements.txt` for dependency specification and version pinning
- **Environment Management**: Use `python-dotenv` for `.env` file loading in development
- **Architecture Validation**: Use `import` statements and module inspection for structure verification
- **CORS Testing**: Test actual cross-origin requests using httpx test client
- **Server Testing**: Use pytest-asyncio for async FastAPI application testing

### Test Data Setup

```python
# Example fixture structure
@pytest.fixture
def temp_project_directory(tmp_path):
    """Create temporary project directory for testing"""
    project_dir = tmp_path / "fm_setlogger_backend"
    project_dir.mkdir()
    return project_dir

@pytest.fixture
def sample_env_file(tmp_path):
    """Create sample .env file for testing"""
    env_content = """
    SUPABASE_URL=https://test.supabase.co
    SUPABASE_ANON_KEY=test_anon_key
    JWT_SECRET_KEY=test_jwt_secret
    """
    env_file = tmp_path / ".env"
    env_file.write_text(env_content)
    return env_file

@pytest.fixture
async def fastapi_test_client():
    """Create FastAPI test client for endpoint testing"""
    # Return test client for API endpoint testing
```

### Project Structure Validation Strategy

1. **Directory Tests First**: Validate project structure before testing functionality
2. **Dependency Tests**: Verify all packages are installed and importable
3. **Configuration Tests**: Confirm environment setup and variable loading
4. **Application Tests**: Test FastAPI app creation and basic functionality
5. **Integration Tests**: Verify the complete setup works end-to-end

## Expected Outcomes

This phase will demonstrate:

- **Clean Architecture**: Proper separation of concerns with organized directory structure
- **Dependency Management**: All required packages correctly installed and compatible
- **Environment Configuration**: Secure environment variable handling for different deployment environments
- **CORS Security**: Proper cross-origin configuration for React Native integration
- **Server Readiness**: FastAPI server ready to host API endpoints from subsequent phases
- **Development Workflow**: Hot reload and development tools properly configured

### Success Criteria

- ✅ All 30 test cases pass with 100% success rate
- ✅ FastAPI server starts successfully and serves requests
- ✅ All required dependencies installed and importable without conflicts
- ✅ Clean architecture structure enforced with no circular dependencies
- ✅ Environment configuration secure and production-ready
- ✅ CORS properly configured for React Native cross-origin requests
- ✅ Health endpoint functional and returning proper HTTP status
- ✅ Project ready for Phase 5.3: Authentication Endpoints implementation

### Architecture Validation

The project structure must follow clean architecture principles:

```
backend/
├── main.py                  # FastAPI application entry point
├── requirements.txt         # Dependency specification
├── .env.example            # Environment template
├── routers/                # API endpoint routing
│   └── __init__.py
├── models/                 # Pydantic request/response models
│   └── __init__.py  
├── services/               # Business logic layer
│   └── __init__.py
└── core/                   # Configuration and shared utilities
    └── __init__.py
```

**🚨 Architecture Warning**: Proper separation of concerns is critical for maintainability. All architecture tests must pass before proceeding to API endpoint development.

### Environment Security

Environment configuration must handle:
- Development vs production environment detection
- Secure secret management (JWT keys, database credentials)  
- Proper error handling for missing configuration
- CORS origin validation for security

**🔒 Security Note**: All environment configuration tests must validate secure handling of sensitive data before production deployment.