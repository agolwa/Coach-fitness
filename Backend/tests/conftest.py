"""
Pytest Configuration and Fixtures for FM-SetLogger Backend Testing
Phase 5.1: Database Foundation & Row-Level Security TDD
"""

import asyncio
import os
import uuid
from typing import AsyncGenerator, Generator

import asyncpg
import pytest
import pytest_asyncio
from supabase import create_client, Client

# Test database configuration
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL", 
    "postgresql://postgres:postgres@localhost:5432/fm_setlogger_test"
)

SUPABASE_URL = os.getenv("SUPABASE_URL", "http://localhost:54321")
SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "test_anon_key")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "test_service_key")

# Configure asyncio event loop for testing
@pytest.fixture(scope="session")
def event_loop() -> Generator[asyncio.AbstractEventLoop, None, None]:
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    """Create a direct database connection for testing database schema and constraints."""
    connection = await asyncpg.connect(TEST_DATABASE_URL)
    
    # Start a transaction for test isolation
    transaction = connection.transaction()
    await transaction.start()
    
    try:
        yield connection
    finally:
        # Rollback transaction to ensure test isolation
        await transaction.rollback()
        await connection.close()


@pytest_asyncio.fixture
async def supabase_client() -> Client:
    """Create Supabase client for testing RLS policies and authentication."""
    client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    return client


@pytest_asyncio.fixture
async def supabase_admin_client() -> Client:
    """Create Supabase admin client with service role key for setup operations."""
    admin_client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    return admin_client


@pytest_asyncio.fixture
async def test_user_a(supabase_admin_client: Client) -> dict:
    """
    Create test user A with authentication context for RLS testing.
    Returns user data including authentication token.
    """
    # Generate unique email for this test run
    user_email = f"test_user_a_{uuid.uuid4().hex[:8]}@example.com"
    user_password = "test_password_123"
    
    try:
        # Create user via Supabase Auth
        auth_response = supabase_admin_client.auth.admin.create_user({
            "email": user_email,
            "password": user_password,
            "email_confirm": True
        })
        
        if auth_response.user:
            # Create corresponding user profile
            user_data = {
                "id": auth_response.user.id,
                "email": user_email,
                "password": user_password,
                "display_name": "Test User A",
                "auth_user": auth_response.user
            }
            
            # Insert into users table
            supabase_admin_client.table("users").insert({
                "id": auth_response.user.id,
                "email": user_email,
                "display_name": "Test User A"
            }).execute()
            
            return user_data
        else:
            pytest.fail("Failed to create test user A")
            
    except Exception as e:
        pytest.fail(f"Error creating test user A: {str(e)}")


@pytest_asyncio.fixture
async def test_user_b(supabase_admin_client: Client) -> dict:
    """
    Create test user B with authentication context for data isolation testing.
    Returns user data including authentication token.
    """
    # Generate unique email for this test run
    user_email = f"test_user_b_{uuid.uuid4().hex[:8]}@example.com"
    user_password = "test_password_456"
    
    try:
        # Create user via Supabase Auth
        auth_response = supabase_admin_client.auth.admin.create_user({
            "email": user_email,
            "password": user_password,
            "email_confirm": True
        })
        
        if auth_response.user:
            # Create corresponding user profile
            user_data = {
                "id": auth_response.user.id,
                "email": user_email,
                "password": user_password,
                "display_name": "Test User B",
                "auth_user": auth_response.user
            }
            
            # Insert into users table
            supabase_admin_client.table("users").insert({
                "id": auth_response.user.id,
                "email": user_email,
                "display_name": "Test User B"
            }).execute()
            
            return user_data
        else:
            pytest.fail("Failed to create test user B")
            
    except Exception as e:
        pytest.fail(f"Error creating test user B: {str(e)}")


@pytest_asyncio.fixture
async def authenticated_supabase_client_a(supabase_client: Client, test_user_a: dict) -> Client:
    """Create Supabase client authenticated as test user A."""
    try:
        # Sign in as test user A
        auth_response = supabase_client.auth.sign_in_with_password({
            "email": test_user_a["email"],
            "password": test_user_a["password"]
        })
        
        if auth_response.user:
            return supabase_client
        else:
            pytest.fail("Failed to authenticate test user A")
            
    except Exception as e:
        pytest.fail(f"Error authenticating test user A: {str(e)}")


@pytest_asyncio.fixture
async def authenticated_supabase_client_b(supabase_client: Client, test_user_b: dict) -> Client:
    """Create Supabase client authenticated as test user B."""
    try:
        # Create a new client instance to avoid auth conflicts
        client_b = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
        
        # Sign in as test user B
        auth_response = client_b.auth.sign_in_with_password({
            "email": test_user_b["email"],
            "password": test_user_b["password"]
        })
        
        if auth_response.user:
            return client_b
        else:
            pytest.fail("Failed to authenticate test user B")
            
    except Exception as e:
        pytest.fail(f"Error authenticating test user B: {str(e)}")


@pytest_asyncio.fixture
async def sample_workout_data(test_user_a: dict) -> dict:
    """
    Create sample workout data for testing including exercises and sets.
    Returns structured test data matching the database schema.
    """
    workout_data = {
        "workout": {
            "id": str(uuid.uuid4()),
            "user_id": test_user_a["id"],
            "title": "Test Workout Session",
            "is_active": True
        },
        "exercises": [
            {
                "id": str(uuid.uuid4()),
                "name": "Barbell Squat",
                "category": "strength",
                "body_part": ["quadriceps", "glutes", "core"],
                "equipment": ["barbell", "squat rack"],
                "description": "Compound movement targeting lower body strength"
            },
            {
                "id": str(uuid.uuid4()),
                "name": "Push-ups",
                "category": "bodyweight",
                "body_part": ["chest", "triceps", "shoulders", "core"],
                "equipment": ["none"],
                "description": "Classic bodyweight upper body exercise"
            }
        ],
        "sets": [
            {
                "reps": 10,
                "weight": 135.0,
                "completed": True,
                "rest_time": 60
            },
            {
                "reps": 8,
                "weight": 145.0,
                "completed": True,
                "rest_time": 90
            },
            {
                "reps": 15,
                "weight": None,  # Bodyweight exercise
                "completed": True,
                "rest_time": 45
            }
        ]
    }
    
    return workout_data


@pytest_asyncio.fixture
async def setup_test_schema(db_connection: asyncpg.Connection):
    """
    Set up test database schema before running tests.
    This ensures the schema exists for testing.
    """
    # Read and execute schema file
    schema_path = os.path.join(os.path.dirname(__file__), "../database/schema.sql")
    
    try:
        with open(schema_path, 'r') as f:
            schema_sql = f.read()
        
        # Execute schema creation
        await db_connection.execute(schema_sql)
        
        # Read and execute seed data
        seed_path = os.path.join(os.path.dirname(__file__), "../database/seed_data.sql")
        with open(seed_path, 'r') as f:
            seed_sql = f.read()
        
        await db_connection.execute(seed_sql)
        
        return True
        
    except FileNotFoundError:
        pytest.skip("Schema files not found - run tests from correct directory")
    except Exception as e:
        pytest.fail(f"Failed to set up test schema: {str(e)}")


# Test markers
pytest_plugins = ["pytest_asyncio"]

# Configure test database isolation
@pytest.fixture(autouse=True)
def isolate_tests():
    """Ensure tests run in isolation."""
    yield
    # Cleanup can be added here if needed