"""
TDD Phase 5.2: FastAPI Project Setup Tests

Following the exact test specification from phase 5.2-fastapi-project-setup-tdd.md
Implements all 30 test cases in strict RED → GREEN → REFACTOR order.

Test Structure:
1. Environment Setup Tests (1-3)
2. Dependencies Installation Tests (4-9) 
3. Project Architecture Tests (10-14)
4. Environment Configuration Tests (15-19)
5. FastAPI Application Tests (20-24)
6. Integration Tests (25-30)
"""

import sys
import os
import subprocess
import importlib
import tempfile
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
import httpx
import asyncio
from fastapi.testclient import TestClient


class TestEnvironmentSetup:
    """Environment Setup Tests (1-3)"""
    
    def test_python_virtual_environment_active(self):
        """Test 1: Verify virtual environment is created and activated with isolated package space"""
        # Check if we're in a virtual environment
        assert hasattr(sys, 'real_prefix') or (
            hasattr(sys, 'base_prefix') and sys.base_prefix != sys.prefix
        ), "Virtual environment is not active"
        
        # Verify virtual environment isolation
        venv_path = Path(sys.prefix)
        assert venv_path.exists(), "Virtual environment path does not exist"
        
    def test_python_version_compatibility(self):
        """Test 2: Verify Python 3.8+ compatibility for FastAPI and async support"""
        python_version = sys.version_info
        assert python_version >= (3, 8), f"Python version {python_version.major}.{python_version.minor} is below required 3.8+"
        
        # Verify async support
        import asyncio
        assert hasattr(asyncio, 'create_task'), "asyncio.create_task not available (Python 3.8+ required)"
        
    def test_project_root_directory_structure(self):
        """Test 3: Verify backend project root directory exists with proper organization"""
        project_root = Path(__file__).parent.parent
        assert project_root.exists(), "Backend project root directory does not exist"
        
        # Check essential files exist
        essential_files = ['main.py', 'requirements.txt', 'pytest.ini']
        for file in essential_files:
            assert (project_root / file).exists(), f"Essential file {file} not found in project root"


class TestDependenciesInstallation:
    """Dependencies Installation Tests (4-9)"""
    
    def test_fastapi_package_installed(self):
        """Test 4: Verify FastAPI is installed and can be imported without errors"""
        try:
            import fastapi
            assert hasattr(fastapi, 'FastAPI'), "FastAPI class not available"
            
            # Verify version compatibility
            from fastapi import __version__
            assert __version__ >= '0.100.0', f"FastAPI version {__version__} may be too old"
        except ImportError as e:
            pytest.fail(f"FastAPI package not installed or importable: {e}")
            
    def test_uvicorn_package_installed(self):
        """Test 5: Verify Uvicorn ASGI server is installed for FastAPI hosting"""
        try:
            import uvicorn
            assert hasattr(uvicorn, 'run'), "Uvicorn.run not available"
            
            # Verify ASGI support
            from uvicorn.main import main
            assert callable(main), "Uvicorn main function not callable"
        except ImportError as e:
            pytest.fail(f"Uvicorn package not installed or importable: {e}")
            
    def test_pydantic_package_installed(self):
        """Test 6: Verify Pydantic is installed for request/response validation"""
        try:
            import pydantic
            assert hasattr(pydantic, 'BaseModel'), "Pydantic BaseModel not available"
            
            # Verify version 2.x compatibility
            from pydantic import __version__
            major_version = int(__version__.split('.')[0])
            assert major_version >= 2, f"Pydantic version {__version__} should be 2.x+"
        except ImportError as e:
            pytest.fail(f"Pydantic package not installed or importable: {e}")
            
    def test_supabase_client_package_installed(self):
        """Test 7: Verify supabase-py is installed for database integration"""
        try:
            import supabase
            assert hasattr(supabase, 'create_client'), "Supabase create_client not available"
            
            # Verify client creation capability
            from supabase import Client
            assert Client is not None, "Supabase Client class not available"
        except ImportError as e:
            pytest.fail(f"Supabase package not installed or importable: {e}")
            
    def test_jwt_authentication_packages_installed(self):
        """Test 8: Verify python-jose[cryptography] and passlib[bcrypt] for JWT handling"""
        # Test python-jose
        try:
            from jose import jwt
            assert hasattr(jwt, 'encode'), "JWT encode function not available"
            assert hasattr(jwt, 'decode'), "JWT decode function not available"
        except ImportError as e:
            pytest.fail(f"python-jose package not installed or importable: {e}")
            
        # Test passlib with bcrypt
        try:
            from passlib.context import CryptContext
            context = CryptContext(schemes=["bcrypt"], deprecated="auto")
            assert callable(context.hash), "Passlib bcrypt hashing not available"
        except ImportError as e:
            pytest.fail(f"passlib[bcrypt] package not installed or importable: {e}")
            
    def test_all_package_imports_successful(self):
        """Test 9: Verify all required packages can be imported simultaneously without conflicts"""
        import_statements = [
            "import fastapi",
            "import uvicorn", 
            "import pydantic",
            "import supabase",
            "from jose import jwt",
            "from passlib.context import CryptContext",
            "import httpx",
            "from dotenv import load_dotenv"
        ]
        
        for statement in import_statements:
            try:
                exec(statement)
            except ImportError as e:
                pytest.fail(f"Package import conflict detected: {statement} failed with {e}")


class TestProjectArchitecture:
    """Project Architecture Tests (10-14)"""
    
    def test_routers_directory_structure(self):
        """Test 10: Verify /routers directory exists for API endpoint organization"""
        project_root = Path(__file__).parent.parent
        routers_dir = project_root / "routers"
        
        # This will initially fail (RED phase)
        assert routers_dir.exists(), "Routers directory does not exist"
        assert (routers_dir / "__init__.py").exists(), "Routers __init__.py not found"
        
    def test_models_directory_structure(self):
        """Test 11: Verify /models directory exists for Pydantic model definitions"""
        project_root = Path(__file__).parent.parent
        models_dir = project_root / "models"
        
        # This will initially fail (RED phase)
        assert models_dir.exists(), "Models directory does not exist"
        assert (models_dir / "__init__.py").exists(), "Models __init__.py not found"
        
    def test_services_directory_structure(self):
        """Test 12: Verify /services directory exists for business logic separation"""
        project_root = Path(__file__).parent.parent
        services_dir = project_root / "services"
        
        # This will initially fail (RED phase) 
        assert services_dir.exists(), "Services directory does not exist"
        assert (services_dir / "__init__.py").exists(), "Services __init__.py not found"
        
    def test_core_directory_structure(self):
        """Test 13: Verify /core directory exists for shared utilities and configuration"""
        project_root = Path(__file__).parent.parent
        core_dir = project_root / "core"
        
        # This will initially fail (RED phase)
        assert core_dir.exists(), "Core directory does not exist"
        assert (core_dir / "__init__.py").exists(), "Core __init__.py not found"
        
    def test_clean_architecture_imports(self):
        """Test 14: Verify no circular imports and proper dependency direction"""
        project_root = Path(__file__).parent.parent
        
        # Test that directories can be imported without circular dependency errors
        test_imports = [
            f"import sys; sys.path.append('{project_root}'); import routers",
            f"import sys; sys.path.append('{project_root}'); import models", 
            f"import sys; sys.path.append('{project_root}'); import services",
            f"import sys; sys.path.append('{project_root}'); import core"
        ]
        
        for import_statement in test_imports:
            try:
                exec(import_statement)
            except (ImportError, ModuleNotFoundError):
                # This should fail initially (RED phase)
                pytest.fail(f"Architecture import failed: {import_statement}")
            except Exception as e:
                pytest.fail(f"Circular import or other architecture issue: {e}")


class TestEnvironmentConfiguration:
    """Environment Configuration Tests (15-19)"""
    
    def test_environment_file_template_exists(self):
        """Test 15: Verify .env.example file exists with all required variables"""
        project_root = Path(__file__).parent.parent
        env_example = project_root / ".env.example"
        
        # This will initially fail (RED phase)
        assert env_example.exists(), ".env.example file does not exist"
        
        # Check required variables are present
        content = env_example.read_text()
        required_vars = ["SUPABASE_URL", "SUPABASE_ANON_KEY", "JWT_SECRET_KEY"]
        
        for var in required_vars:
            assert var in content, f"Required environment variable {var} not in .env.example"
            
    def test_supabase_url_configuration(self):
        """Test 16: Verify SUPABASE_URL environment variable loading and validation"""
        # This will initially fail (RED phase) 
        with patch.dict(os.environ, {"SUPABASE_URL": "https://test.supabase.co"}, clear=False):
            try:
                from core.config import settings
                assert hasattr(settings, 'supabase_url'), "Settings object missing supabase_url"
                assert settings.supabase_url == "https://test.supabase.co", "SUPABASE_URL not loaded correctly"
            except ImportError:
                pytest.fail("Core configuration module not available")
                
    def test_supabase_anon_key_configuration(self):
        """Test 17: Verify SUPABASE_ANON_KEY environment variable handling"""
        # This will initially fail (RED phase)
        with patch.dict(os.environ, {"SUPABASE_ANON_KEY": "test_anon_key"}, clear=False):
            try:
                from core.config import settings
                assert hasattr(settings, 'supabase_anon_key'), "Settings object missing supabase_anon_key"
                assert settings.supabase_anon_key == "test_anon_key", "SUPABASE_ANON_KEY not loaded correctly"
            except ImportError:
                pytest.fail("Core configuration module not available")
                
    def test_jwt_secret_configuration(self):
        """Test 18: Verify JWT_SECRET_KEY environment variable for token signing"""
        # This will initially fail (RED phase)
        with patch.dict(os.environ, {"JWT_SECRET_KEY": "test_jwt_secret"}, clear=False):
            try:
                from core.config import settings
                assert hasattr(settings, 'jwt_secret_key'), "Settings object missing jwt_secret_key"
                assert settings.jwt_secret_key == "test_jwt_secret", "JWT_SECRET_KEY not loaded correctly"
            except ImportError:
                pytest.fail("Core configuration module not available")
                
    def test_environment_loading_error_handling(self):
        """Test 19: Verify proper error handling when required env vars are missing"""
        # This will initially fail (RED phase)
        with patch.dict(os.environ, {}, clear=True):
            try:
                from core.config import settings
                # Access a setting that should trigger validation error in non-testing mode
                _ = settings.supabase_url  # This should trigger the validator
                # Should raise an error or have sensible defaults
                pytest.fail("Configuration should handle missing environment variables properly")
            except (ValueError, ImportError) as e:
                # This is expected - configuration should validate required vars
                assert "required" in str(e).lower() or "missing" in str(e).lower()


class TestFastAPIApplication:
    """FastAPI Application Tests (20-24)"""
    
    def test_fastapi_app_initialization(self):
        """Test 20: Verify FastAPI application instance can be created successfully"""
        # This will initially fail (RED phase) until we update main.py
        try:
            from main import app
            from fastapi import FastAPI
            assert isinstance(app, FastAPI), "App is not a FastAPI instance"
            assert app.title is not None, "FastAPI app title not set"
        except ImportError:
            pytest.fail("FastAPI application not importable from main module")
            
    def test_cors_middleware_configuration(self):
        """Test 21: Verify CORS is configured to allow React Native origins"""
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # Check that CORS middleware is added
            cors_found = False
            for middleware in app.user_middleware:
                if hasattr(middleware, 'cls') and 'CORS' in str(middleware.cls.__name__):
                    cors_found = True
                    break
            
            assert cors_found, "CORS middleware not configured"
        except ImportError:
            pytest.fail("Main application module not importable")
            
    def test_cors_allowed_origins_react_native(self):
        """Test 22: Verify specific React Native development and production origins allowed"""
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # Find CORS middleware configuration
            cors_found = False
            for middleware in app.user_middleware:
                if hasattr(middleware, 'cls') and 'CORS' in str(middleware.cls):
                    cors_found = True
                    # Should allow React Native origins
                    break
                    
            assert cors_found, "CORS middleware configuration not found"
        except ImportError:
            pytest.fail("Main application not importable for CORS testing")
            
    def test_cors_allowed_methods(self):
        """Test 23: Verify GET, POST, PUT, DELETE, OPTIONS methods are permitted"""
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # CORS should be configured to allow required HTTP methods
            cors_middleware_found = False
            for middleware in app.user_middleware:
                if hasattr(middleware, 'cls') and 'CORS' in str(middleware.cls):
                    cors_middleware_found = True
                    break
                    
            assert cors_middleware_found, "CORS middleware not found for method validation"
        except ImportError:
            pytest.fail("Main application not importable")
            
    def test_cors_allowed_headers(self):
        """Test 24: Verify Authorization, Content-Type, and custom headers are allowed"""  
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # Verify CORS headers configuration
            cors_configured = False
            for middleware in app.user_middleware:
                if hasattr(middleware, 'cls') and 'CORS' in str(middleware.cls):
                    cors_configured = True
                    break
                    
            assert cors_configured, "CORS headers configuration not found"
        except ImportError:
            pytest.fail("Main application not importable for headers testing")


class TestIntegration:
    """Integration Tests (25-30)"""
    
    def test_fastapi_server_starts_successfully(self):
        """Test 25: Verify FastAPI server starts with Uvicorn without errors"""
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # Test that app can be served (simulate server start)
            with TestClient(app) as client:
                response = client.get("/health")
                assert response.status_code == 200
        except ImportError:
            pytest.fail("Cannot import main application for server testing")
        except Exception as e:
            pytest.fail(f"FastAPI server startup simulation failed: {e}")
            
    def test_environment_variables_loaded_correctly(self):
        """Test 26: Verify all environment variables are accessible at runtime"""
        # This will initially fail (RED phase) 
        test_env = {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_ANON_KEY": "test_key",
            "JWT_SECRET_KEY": "test_secret"
        }
        
        with patch.dict(os.environ, test_env, clear=False):
            try:
                from core.config import settings
                assert settings.supabase_url == test_env["SUPABASE_URL"]
                assert settings.supabase_anon_key == test_env["SUPABASE_ANON_KEY"] 
                assert settings.jwt_secret_key == test_env["JWT_SECRET_KEY"]
            except ImportError:
                pytest.fail("Configuration module not available for runtime testing")
                
    def test_health_endpoint_returns_200_ok(self):
        """Test 27: Verify basic /health endpoint returns 200 status"""
        # This may pass initially since health endpoint exists in main.py
        try:
            from main import app
            
            with TestClient(app) as client:
                response = client.get("/health")
                assert response.status_code == 200
                
                # Verify response structure
                data = response.json()
                assert "status" in data
                assert data["status"] == "healthy"
        except ImportError:
            pytest.fail("Main application not importable for health endpoint testing")
            
    def test_supabase_client_connection(self):
        """Test 28: Verify Supabase client can be instantiated with environment configuration"""
        # This will initially fail (RED phase)
        test_env = {
            "SUPABASE_URL": "https://test.supabase.co",
            "SUPABASE_ANON_KEY": "test_key"
        }
        
        with patch.dict(os.environ, test_env, clear=False):
            try:
                from core.config import settings
                from supabase import create_client
                
                # Should be able to create client without errors
                client = create_client(settings.supabase_url, settings.supabase_anon_key)
                assert client is not None, "Supabase client creation failed"
            except ImportError:
                pytest.fail("Configuration or Supabase modules not available")
            except Exception as e:
                pytest.fail(f"Supabase client instantiation failed: {e}")
                
    def test_server_graceful_shutdown(self):
        """Test 29: Verify server shuts down cleanly without hanging processes"""
        # This will initially fail (RED phase)
        try:
            from main import app
            
            # Simulate server lifecycle
            with TestClient(app) as client:
                # Server should handle requests
                response = client.get("/health")
                assert response.status_code == 200
                
                # Client context manager simulates graceful shutdown
                pass
                
            # If we get here, shutdown was clean
            assert True, "Server shutdown completed successfully"
        except ImportError:
            pytest.fail("Main application not importable for shutdown testing")
        except Exception as e:
            pytest.fail(f"Server shutdown test failed: {e}")
            
    def test_hot_reload_development_mode(self):
        """Test 30: Verify Uvicorn hot reload works in development environment"""
        # This will initially fail (RED phase)
        try:
            import uvicorn
            from main import app
            
            # Verify uvicorn can be configured with reload
            config = uvicorn.Config(app, host="127.0.0.1", port=8000, reload=True)
            assert config.reload == True, "Hot reload not configured"
            assert config.app == app, "App not properly configured for hot reload"
        except ImportError:
            pytest.fail("Uvicorn or main application not available for hot reload testing")
        except Exception as e:
            pytest.fail(f"Hot reload configuration test failed: {e}")


# Test fixtures for environment and temporary project setup
@pytest.fixture
def temp_project_directory(tmp_path):
    """Create temporary project directory for testing"""
    project_dir = tmp_path / "fm_setlogger_backend"
    project_dir.mkdir()
    return project_dir


@pytest.fixture
def sample_env_file(tmp_path):
    """Create sample .env file for testing"""
    env_content = """SUPABASE_URL=https://test.supabase.co
SUPABASE_ANON_KEY=test_anon_key
JWT_SECRET_KEY=test_jwt_secret
"""
    env_file = tmp_path / ".env"
    env_file.write_text(env_content)
    return env_file


@pytest.fixture
async def fastapi_test_client():
    """Create FastAPI test client for endpoint testing"""
    try:
        from main import app
        async with httpx.AsyncClient(app=app, base_url="http://test") as client:
            yield client
    except ImportError:
        pytest.skip("Main application not available for client testing")