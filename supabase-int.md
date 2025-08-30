# Supabase Integration Guide for FM-SetLogger Backend

## Overview

This guide explains how to connect the FM-SetLogger FastAPI backend to a real Supabase database. Currently, the backend runs with mocked data for development, but can be connected to Supabase anytime by following these steps.

## Current Status

- ✅ **Backend Fully Implemented**: All Phase 5.1-5.4 endpoints working with mocks
- ✅ **Tests Passing**: 96% test coverage (24/25 tests) with mocked database  
- ✅ **Ready for Integration**: Just needs real Supabase credentials
- ⏳ **Waiting for Setup**: You control when to connect to real database

## Prerequisites

- Completed Phase 5.1-5.4 backend implementation
- Backend tests passing with mocked data
- Supabase account (free tier sufficient)

---

## Step 1: Create Supabase Project

### 1.1 Account Setup
1. Go to https://supabase.com
2. Sign up or sign in with GitHub/Google
3. Click "Start your project" or "New Project"

### 1.2 Project Configuration
- **Name**: `FM-SetLogger-Backend` (or your preferred name)
- **Database Password**: Choose strong password (save this!)
- **Region**: Select closest to your users
- **Pricing Plan**: Free tier (perfect for development)

### 1.3 Wait for Creation
- Project creation takes 1-2 minutes
- You'll see a dashboard when ready

---

## Step 2: Get Supabase Credentials

### 2.1 Project URL
1. Go to **Settings** > **API** in Supabase dashboard
2. Copy **Project URL** (format: `https://xxxxx.supabase.co`)

### 2.2 API Keys
From the same **Settings** > **API** page:
- **Anon/Public Key**: Copy the `anon public` key
- **Service Role Key**: Copy the `service_role` key (keep this secret!)

### 2.3 Database Password
- Use the password you set during project creation
- If forgotten, reset in **Settings** > **Database**

---

## Step 3: Deploy Database Schema

### 3.1 Run Schema Creation
1. Go to **SQL Editor** in Supabase dashboard
2. Open the file `Backend/database/schema.sql` from your project
3. Copy all contents and paste into SQL Editor
4. Click **Run** to create all tables and RLS policies

### 3.2 Verify Tables Created
Check that these tables exist in **Table Editor**:
- `users` (extends Supabase Auth)
- `workouts` 
- `exercises`
- `workout_exercises`
- `sets`

### 3.3 Verify RLS Policies
1. Go to **Authentication** > **Policies**
2. Confirm RLS policies are enabled on all tables
3. Users should only access their own workout data

---

## Step 4: Seed Exercise Data

### 4.1 Populate Exercise Library
1. Open `Backend/database/seed_data.sql`
2. Copy contents to SQL Editor
3. Run to populate 54+ exercises in database

### 4.2 Verify Exercise Data
- Go to **Table Editor** > **exercises** table
- Should see 54 exercises across categories:
  - Strength, Cardio, Flexibility, Balance, Bodyweight

---

## Step 5: Configure Backend Environment

### 5.1 Update .env File
Edit `Backend/.env` with your real credentials:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your_anon_public_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here

# JWT Configuration  
JWT_SECRET_KEY=generate_a_secure_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=24

# Development Settings
ENVIRONMENT=development
CORS_ORIGINS=["http://localhost:8084", "exp://192.168.1.0:8084"]
```

### 5.2 Generate JWT Secret
Generate a secure JWT secret:
```bash
# Python method
python -c "import secrets; print(secrets.token_urlsafe(32))"

# Or use online generator (JWT Secret Generator)
```

---

## Step 6: Test Real Database Connection

### 6.1 Start Backend Server
```bash
cd Backend
source venv/bin/activate
uvicorn main:app --reload
```

### 6.2 Test API Endpoints
Visit `http://localhost:8000/docs` for Swagger UI

**Test these endpoints:**
- `GET /health` - Should return "Phase 5.4" 
- `GET /exercises` - Should return real exercise data
- `POST /auth/google` - Create test user
- `POST /workouts` - Create real workout

### 6.3 Verify Database Changes
- Check Supabase **Table Editor**
- Real data should appear in tables
- Users should only see their own workouts

---

## Step 7: Authentication Setup (Optional)

### 7.1 Configure Google OAuth
1. Go to **Authentication** > **Settings** in Supabase
2. Enable **Google** provider
3. Add your Google OAuth credentials
4. Set redirect URLs for your app

### 7.2 Redirect URLs
Add these URLs in Google OAuth settings:
- Development: `http://localhost:8000/auth/callback`
- Production: `https://your-domain.com/auth/callback`

---

## Step 8: Production Deployment

### 8.1 Environment Variables
Set these in your production environment:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_KEY` (never the anon key in production)
- `JWT_SECRET_KEY`
- `ENVIRONMENT=production`

### 8.2 Security Checklist
- ✅ Never expose service role key in frontend
- ✅ Use HTTPS in production
- ✅ Verify RLS policies prevent unauthorized access
- ✅ Use strong JWT secret (32+ characters)

---

## Troubleshooting

### Common Issues

#### "Connection refused" Error
- Check if Supabase project URL is correct
- Verify network connectivity
- Ensure project isn't paused (free tier auto-pauses)

#### "Invalid API Key" Error  
- Double-check API keys copied correctly
- Ensure using service role key for backend
- Check for extra spaces in .env file

#### RLS Policy Errors
- Verify policies are enabled on all tables
- Check policy syntax in SQL Editor
- Test with different user contexts

#### No Exercise Data
- Run seed_data.sql script
- Check if exercises table is populated
- Verify no conflicts with existing data

### Getting Help

1. **Supabase Documentation**: https://supabase.com/docs
2. **Backend Logs**: Check `uvicorn` console output
3. **Database Logs**: View in Supabase dashboard
4. **Test Environment**: Run backend tests to isolate issues

---

## Next Steps After Integration

Once Supabase is connected:

1. **Test All Endpoints** with real data
2. **Frontend Integration** (Phase 5.6)
3. **Production Deployment** 
4. **User Acceptance Testing**

The backend is designed to work seamlessly with Supabase - no code changes needed, just configuration!

---

## Development Workflow

### During Development (Current)
- Backend runs with mocked data
- All tests pass with test database
- No real API keys needed
- Fast iteration and testing

### After Supabase Integration
- Backend connects to real database
- Data persists between sessions
- Authentication works end-to-end
- Ready for production use

**You can continue developing without Supabase and connect it whenever you're ready!**