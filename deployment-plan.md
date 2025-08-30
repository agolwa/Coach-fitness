# FM-SetLogger Deployment Strategy & Environment Management Plan

**Professional 3-Environment Architecture for Production-Ready Deployment**

---

## **Project Overview**

This document outlines the comprehensive deployment strategy for the FM-SetLogger fitness tracking application, establishing professional development workflows with proper environment separation, automated deployments, and production-grade infrastructure.

### **Current State**
- ✅ **Phase 5.3 Complete**: Authentication endpoints with JWT + Google OAuth
- ✅ **Single Environment**: Local development with test configurations
- ❌ **No Environment Separation**: Development and production use same configurations
- ❌ **No Deployment Pipeline**: Manual deployment processes
- ❌ **Single Database**: Risk of test data affecting production

### **Target State**
- ✅ **3-Environment Architecture**: Development → Staging → Production
- ✅ **Automated Deployments**: CI/CD pipeline with approval gates
- ✅ **Database Separation**: Isolated data environments with migration management
- ✅ **Professional Monitoring**: Logging, metrics, error tracking, alerting

---

## **Environment Architecture**

### **Development Environment (Local)**

**Purpose**: Developer workstations, feature development, rapid iteration, unit testing

#### **Infrastructure**
- **Runtime**: Local FastAPI server (`uvicorn main:app --reload --port 8000`)
- **Database**: Supabase project: `fm-setlogger-dev`
- **Frontend**: React Native Metro bundler (`npm start` on port 8084)
- **File Storage**: Local file system for uploads/media
- **External APIs**: Development-only API keys and tokens

#### **Configuration**
```bash
# .env.development
ENVIRONMENT=development
DEBUG=true
LOG_LEVEL=DEBUG

# Database
SUPABASE_URL=https://fm-setlogger-dev.supabase.co
SUPABASE_ANON_KEY=eyJ... (development anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (development service key)

# Authentication  
JWT_SECRET_KEY=dev_jwt_secret_change_in_production
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60

# Google OAuth (Development App)
GOOGLE_CLIENT_ID=xxx-dev.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-dev-xxx

# CORS
CORS_ORIGINS=http://localhost:8084,exp://192.168.1.0:8084,http://localhost:3000
```

#### **Data Management**
- **Test Data**: Seeded with representative workout/exercise data
- **Reset Capability**: Database can be dropped and recreated freely
- **User Accounts**: Test Google accounts for OAuth testing

#### **Development Workflow**
1. **Local Development**: Code changes with hot reload
2. **Unit Testing**: `pytest` with test database
3. **Integration Testing**: Local API + React Native simulator
4. **Git Commit**: Triggers automated tests in CI

---

### **Staging Environment (Cloud)**

**Purpose**: Integration testing, pre-production validation, client demos, QA testing

#### **Infrastructure**
- **Runtime**: Cloud deployment (Railway Pro or Render Standard)
- **Database**: Supabase project: `fm-setlogger-staging`  
- **Frontend**: Expo EAS preview builds or TestFlight/Internal Testing
- **File Storage**: Cloud storage (Supabase Storage or AWS S3)
- **External APIs**: Staging API keys and sandbox environments

#### **Configuration**
```bash
# .env.staging
ENVIRONMENT=staging
DEBUG=false
LOG_LEVEL=INFO

# Database
SUPABASE_URL=https://fm-setlogger-staging.supabase.co
SUPABASE_ANON_KEY=eyJ... (staging anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (staging service key)

# Authentication
JWT_SECRET_KEY=staging_secure_jwt_secret_256_bits_minimum
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (Staging App)
GOOGLE_CLIENT_ID=xxx-staging.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-staging-xxx

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/staging-project-id

# CORS
CORS_ORIGINS=https://staging-app.fm-setlogger.com
```

#### **Deployment Process**
1. **Automatic Deployment**: Triggered by merges to `develop` branch
2. **Database Migrations**: Automated schema updates
3. **Smoke Tests**: Automated endpoint validation
4. **QA Notification**: Team notified of new staging deployment

#### **Data Management**
- **Production-like Data**: Anonymized copy of production data (weekly refresh)
- **Test Scenarios**: Realistic user workflows and edge cases
- **Data Retention**: 30 days retention policy

---

### **Production Environment (Cloud)**

**Purpose**: Live users, real data, high availability, revenue generation

#### **Infrastructure**
- **Runtime**: Cloud deployment with auto-scaling (Railway Pro or Render Pro)
- **Database**: Supabase Pro with dedicated compute and enhanced security
- **Frontend**: App Store and Google Play Store releases
- **File Storage**: Production cloud storage with CDN
- **External APIs**: Production API keys and live services

#### **Configuration**
```bash
# .env.production (secured in deployment platform)
ENVIRONMENT=production
DEBUG=false
LOG_LEVEL=WARNING

# Database
SUPABASE_URL=https://fm-setlogger-prod.supabase.co
SUPABASE_ANON_KEY=eyJ... (production anon key)
SUPABASE_SERVICE_ROLE_KEY=eyJ... (production service key)

# Authentication
JWT_SECRET_KEY=production_ultra_secure_jwt_secret_512_bits_rotated
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google OAuth (Production App)
GOOGLE_CLIENT_ID=xxx-prod.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-prod-xxx

# Monitoring & Alerting
SENTRY_DSN=https://xxx@sentry.io/production-project-id
DATADOG_API_KEY=xxx (optional: advanced monitoring)

# Security
CORS_ORIGINS=https://app.fm-setlogger.com
ALLOWED_HOSTS=api.fm-setlogger.com,app.fm-setlogger.com
```

#### **Deployment Process**
1. **Manual Promotion**: Staging → Production promotion with approval
2. **Blue/Green Deployment**: Zero-downtime deployments
3. **Health Checks**: Automated validation before traffic switching
4. **Rollback Capability**: Instant rollback on failure detection

#### **Data Management**
- **Real User Data**: Complete data persistence and GDPR compliance
- **Automated Backups**: Daily database backups with point-in-time recovery
- **Data Retention**: Compliance with data retention policies
- **Audit Logging**: Complete audit trail of data changes

---

## **Database Strategy**

### **Supabase Multi-Project Architecture**

#### **Project Structure**
```
Supabase Organization: FM-SetLogger
├── fm-setlogger-dev       (Development)
├── fm-setlogger-staging   (Staging)
└── fm-setlogger-prod      (Production)
```

#### **Schema Management**
**Version-Controlled Migrations:**
```
Backend/database/migrations/
├── 001_initial_schema.sql       # Users, workouts, exercises, sets
├── 002_rls_policies.sql         # Row-level security policies  
├── 003_exercise_library.sql     # 54 exercises population
├── 004_indexes_optimization.sql # Performance indexes
└── 005_audit_logging.sql        # Audit trail tables
```

**Migration Strategy:**
1. **Development**: Test migrations locally first
2. **Staging**: Deploy and validate with staging data
3. **Production**: Deploy with approval and rollback plan

#### **Data Seeding Strategy**
**Development Data:**
```sql
-- Sample users, workouts, and exercises for testing
INSERT INTO exercises (name, category, body_part, equipment) VALUES
('Push-ups', 'bodyweight', ARRAY['chest', 'triceps'], ARRAY['bodyweight']),
('Squats', 'bodyweight', ARRAY['legs', 'glutes'], ARRAY['bodyweight']),
-- ... 54 total exercises
```

**Staging Data:**
- Anonymized production data refresh (weekly)
- Test user accounts with realistic workout history
- Edge case data for comprehensive testing

---

## **CI/CD Pipeline Architecture**

### **GitHub Actions Workflow**

#### **Pipeline Stages**
```yaml
# .github/workflows/ci-cd.yml
name: FM-SetLogger CI/CD

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Backend Tests
        run: |
          cd Backend
          pip install -r requirements.txt
          pytest tests/ --cov=. --cov-report=xml
      
  deploy-staging:
    needs: test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to Staging
        run: |
          # Deploy to Railway staging environment
          # Run smoke tests
          # Notify team

  deploy-production:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: production
    steps:
      - name: Deploy to Production
        run: |
          # Deploy to Railway production environment
          # Run health checks
          # Monitor deployment
```

#### **Branch Strategy**
```
main (production)     ←── Stable releases only
  ↑
develop (staging)     ←── Integration branch
  ↑
feature/auth-endpoints ←── Feature development
feature/workout-crud
```

### **Deployment Automation**

#### **Development → Staging**
- **Trigger**: Merge to `develop` branch
- **Process**: Automated deployment with database migrations
- **Validation**: Smoke tests and integration tests
- **Notification**: Slack/email notification to team

#### **Staging → Production**  
- **Trigger**: Manual promotion with approval
- **Process**: Blue/green deployment with health checks
- **Validation**: Production smoke tests
- **Monitoring**: Real-time metrics during deployment

---

## **Cloud Deployment Options**

### **Option 1: Railway (Recommended)**

#### **Advantages**
- **Simplified Deployment**: Git-based deployments
- **Environment Management**: Built-in staging/production environments
- **Database Integration**: PostgreSQL and Redis add-ons
- **Monitoring**: Built-in metrics and logging
- **Cost-Effective**: $20/month for production-grade hosting

#### **Configuration**
```toml
# railway.toml
[build]
builder = "nixpacks"
buildCommand = "pip install -r requirements.txt"

[deploy]
startCommand = "gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT"
healthcheckPath = "/health"
healthcheckTimeout = 300
restartPolicyType = "on_failure"
```

### **Option 2: Render**

#### **Advantages**
- **Free Tier Available**: Good for staging environment
- **Auto-Deploy**: Git integration with automatic deployments
- **SSL Certificates**: Free SSL/TLS certificates
- **Global CDN**: Built-in content delivery network

#### **Configuration**
```yaml
# render.yaml
services:
  - type: web
    name: fm-setlogger-api
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:$PORT
    healthCheckPath: /health
```

### **Option 3: Fly.io**

#### **Advantages**
- **Global Distribution**: Deploy close to users worldwide
- **Docker-Native**: Full Docker support
- **Competitive Pricing**: Pay-per-use model

#### **Configuration**
```toml
# fly.toml
app = "fm-setlogger"

[build]
  dockerfile = "Dockerfile"

[http_service]
  internal_port = 8000
  processes = ["app"]

[[http_service.checks]]
  grace_period = "10s"
  interval = "30s"
  method = "GET"
  path = "/health"
```

---

## **Docker Containerization**

### **Production Dockerfile**
```dockerfile
# Dockerfile
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && chown -R app:app /app
USER app

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# Start command
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

### **Multi-Stage Build (Optimization)**
```dockerfile
# Multi-stage build for smaller production images
FROM python:3.9 as builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.9-slim
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
CMD ["gunicorn", "main:app", "-w", "4", "-k", "uvicorn.workers.UvicornWorker", "-b", "0.0.0.0:8000"]
```

---

## **Monitoring & Observability**

### **Application Monitoring**

#### **Structured Logging**
```python
# Enhanced logging configuration
import structlog
from pythonjsonlogger import jsonlogger

# Configure structured logging
structlog.configure(
    processors=[
        structlog.stdlib.filter_by_level,
        structlog.stdlib.add_logger_name,
        structlog.stdlib.add_log_level,
        structlog.stdlib.PositionalArgumentsFormatter(),
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.processors.StackInfoRenderer(),
        structlog.processors.format_exc_info,
        structlog.processors.UnicodeDecoder(),
        structlog.processors.JSONRenderer()
    ],
    context_class=dict,
    logger_factory=structlog.stdlib.LoggerFactory(),
    wrapper_class=structlog.stdlib.BoundLogger,
    cache_logger_on_first_use=True,
)
```

#### **Metrics Collection**
```python
# Prometheus metrics integration
from prometheus_client import Counter, Histogram, generate_latest

# Define metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')

# Metrics endpoint
@app.get("/metrics")
async def metrics():
    return Response(generate_latest(), media_type="text/plain")
```

### **Error Tracking with Sentry**
```python
# Sentry integration for error tracking
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration

sentry_sdk.init(
    dsn=settings.sentry_dsn,
    integrations=[FastApiIntegration(auto_enable=True)],
    traces_sample_rate=1.0 if settings.environment == "development" else 0.1,
    environment=settings.environment,
)
```

### **Health Checks & Monitoring**
```python
# Comprehensive health check
@app.get("/health")
async def health_check():
    health_status = {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": settings.environment,
        "version": "1.0.0",
        "checks": {
            "database": await check_database_connection(),
            "auth_service": await check_auth_service(),
            "external_apis": await check_external_apis(),
        }
    }
    
    overall_healthy = all(check["status"] == "healthy" for check in health_status["checks"].values())
    
    if not overall_healthy:
        raise HTTPException(status_code=503, detail="Service unhealthy")
    
    return health_status
```

---

## **Security Implementation**

### **Environment-Specific Security**

#### **Development Security**
- **Permissive CORS**: Allow localhost and development origins
- **Debug Mode**: Enabled for detailed error messages  
- **Weak Secrets**: Acceptable for development convenience
- **Open Access**: Minimal authentication barriers for testing

#### **Staging Security**
- **Restricted CORS**: Only staging frontend origins allowed
- **Production-like Secrets**: Strong secrets but not production keys
- **Authentication Required**: Full authentication flow testing
- **Rate Limiting**: Similar to production but more permissive

#### **Production Security**
- **Strict CORS**: Only production domains allowed
- **Strong Secrets**: Cryptographically secure keys with rotation
- **Full Authentication**: Complete OAuth and JWT validation
- **Rate Limiting**: Aggressive rate limiting and DDoS protection
- **SSL/TLS**: Forced HTTPS with security headers

### **Security Headers & Middleware**
```python
# Production security middleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.middleware.httpsredirect import HTTPSRedirectMiddleware

if settings.environment == "production":
    app.add_middleware(HTTPSRedirectMiddleware)
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=["api.fm-setlogger.com"])
    
# Security headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    if settings.environment == "production":
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
    return response
```

---

## **Resource Requirements & Costs**

### **Development Environment**
- **Cost**: $0 (local development)
- **Supabase**: Free tier (2 projects, 500MB database, 5GB bandwidth)
- **Infrastructure**: Developer workstation only

### **Staging Environment**  
- **Monthly Cost**: ~$30-50
- **Hosting**: Railway Hobby ($5) or Render Standard ($25)
- **Database**: Supabase Free tier (sufficient for staging)
- **Monitoring**: Sentry Free tier (5K errors/month)
- **Domain**: Optional staging subdomain (free with main domain)

### **Production Environment**
- **Monthly Cost**: ~$70-120
- **Hosting**: Railway Pro ($20) or Render Pro ($25-85)
- **Database**: Supabase Pro ($25 - dedicated compute, enhanced security)
- **Monitoring**: Sentry Team ($26 for 50K errors/month)
- **CDN/Storage**: AWS S3 or Supabase Storage (~$5-10)
- **Domain**: Custom domain ($10-15/year)

### **Annual Cost Summary**
- **Development**: $0
- **Staging**: $360-600/year  
- **Production**: $840-1440/year
- **Total**: ~$1200-2000/year for complete professional infrastructure

---

## **Implementation Timeline**

### **Phase 1: Enhanced Configuration (Week 1)**
**Duration**: 3-5 days

#### **Tasks**
1. **Enhanced Config System**
   - Extend `core/config.py` with environment-specific settings
   - Add environment detection and validation
   - Create environment-specific `.env` files

2. **Development Environment Setup**
   - Create development Supabase project
   - Set up development Google OAuth app
   - Configure local environment variables

3. **Testing Infrastructure** 
   - Update test suite for environment-aware testing
   - Create test data fixtures
   - Validate configuration system

#### **Deliverables**
- ✅ Environment-aware configuration system
- ✅ Development Supabase project operational
- ✅ Local development environment documented

### **Phase 2: Staging Environment (Week 2)**
**Duration**: 5-7 days

#### **Tasks**
1. **Staging Infrastructure**
   - Create staging Supabase project
   - Set up staging Google OAuth app  
   - Choose and configure cloud hosting (Railway/Render)

2. **Docker Containerization**
   - Create production-ready Dockerfile
   - Set up multi-stage builds for optimization
   - Configure health checks and monitoring

3. **CI/CD Pipeline**
   - Set up GitHub Actions workflow
   - Configure automated staging deployments
   - Implement smoke tests and validation

#### **Deliverables**
- ✅ Staging environment operational
- ✅ Automated deployment pipeline
- ✅ Docker containerization complete

### **Phase 3: Production Environment (Week 3)**  
**Duration**: 5-7 days

#### **Tasks**
1. **Production Infrastructure**
   - Create production Supabase project with Pro features
   - Set up production Google OAuth app with live domain
   - Configure production cloud hosting with scaling

2. **Security Hardening**
   - Implement production security headers
   - Configure SSL/TLS certificates
   - Set up rate limiting and DDoS protection

3. **Monitoring & Alerting**
   - Integrate Sentry for error tracking
   - Set up logging aggregation
   - Configure performance monitoring and alerts

#### **Deliverables**
- ✅ Production environment operational
- ✅ Security hardening complete
- ✅ Monitoring and alerting configured

### **Phase 4: Integration & Documentation (Week 4)**
**Duration**: 5-7 days

#### **Tasks**
1. **Frontend Integration**
   - Update React Native app with environment switching
   - Configure Expo EAS builds for staging/production
   - Set up App Store/Play Store deployment pipeline

2. **End-to-End Testing**
   - Test complete user workflows across environments
   - Validate data migration and backup procedures
   - Performance testing and optimization

3. **Documentation & Training**
   - Create deployment runbooks and procedures
   - Document troubleshooting and rollback procedures
   - Team training on new deployment workflows

#### **Deliverables**
- ✅ Complete end-to-end system operational
- ✅ Comprehensive documentation complete
- ✅ Team trained on new workflows

---

## **Migration Strategy**

### **From Current Single-Environment to Multi-Environment**

#### **Phase A: Preparation (Current Phase 5.4+)**
1. **Continue Development**: Finish Phases 5.4-5.6 with current setup
2. **Document Current State**: Catalog all configurations and dependencies  
3. **Test Data Preparation**: Create comprehensive test datasets

#### **Phase B: Development Environment Setup**
1. **Create Development Supabase Project**: Separate from any future production
2. **Migration Script Development**: Create database migration and seeding scripts
3. **Configuration Enhancement**: Implement environment-aware configuration

#### **Phase C: Staging Environment**
1. **Staging Infrastructure**: Deploy staging environment
2. **CI/CD Implementation**: Automated deployments to staging
3. **Integration Testing**: Validate complete application stack

#### **Phase D: Production Deployment**  
1. **Production Infrastructure**: Deploy production environment
2. **Data Migration**: Migrate any existing data to production database
3. **Go-Live**: Switch frontend to production backend

#### **Phase E: Optimization**
1. **Performance Tuning**: Optimize based on production metrics
2. **Monitoring Refinement**: Adjust alerts and monitoring thresholds
3. **Documentation Updates**: Final documentation and team training

---

## **Success Criteria**

### **Technical Success Metrics**
- ✅ **Zero-Downtime Deployments**: Blue/green deployments with <1 second switchover
- ✅ **Environment Isolation**: Development changes never affect production
- ✅ **Automated Testing**: 95%+ test coverage with automated CI/CD validation
- ✅ **Performance Standards**: <200ms API response times, 99.9% uptime
- ✅ **Security Compliance**: All security headers, HTTPS, secure authentication

### **Operational Success Metrics**
- ✅ **Deployment Frequency**: Multiple deployments per week without issues
- ✅ **Mean Time to Recovery**: <15 minutes for rollbacks, <2 hours for fixes
- ✅ **Developer Productivity**: Reduced deployment friction, faster iteration
- ✅ **Monitoring Coverage**: Full observability with proactive alerting
- ✅ **Documentation Quality**: Complete runbooks and troubleshooting guides

### **Business Success Metrics**
- ✅ **User Experience**: Consistent application performance across environments
- ✅ **Feature Velocity**: Faster feature delivery with reduced risk
- ✅ **Operational Cost**: Predictable infrastructure costs with scaling
- ✅ **Risk Mitigation**: No production outages due to deployment issues
- ✅ **Compliance Readiness**: Audit trails and change management processes

---

## **Next Steps**

### **Immediate (Continue Phase 5.4)**
1. **Continue Current Development**: Implement workout endpoints with existing setup
2. **Prepare for Migration**: Document current configuration and dependencies
3. **Plan Implementation**: Schedule deployment strategy implementation

### **Future Implementation**
1. **Review This Plan**: Validate approach and adjust based on current needs
2. **Choose Timeline**: Select appropriate implementation timeline
3. **Resource Allocation**: Assign team members and budget for deployment work
4. **Execute Migration**: Implement professional deployment strategy

This deployment plan provides a complete roadmap for transitioning from the current development setup to a professional, production-ready deployment strategy when the time is right to implement it.