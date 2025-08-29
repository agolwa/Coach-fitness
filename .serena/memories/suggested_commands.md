# Essential Commands for FM-SetLogger Development

## Frontend Development Commands

### Core Development
```bash
# Navigate to frontend directory
cd Frontend/coach/

# Install dependencies
npm install

# Start development server
npm start
# Alternative platform-specific commands
npm run android
npm run ios  
npm run web

# Development server runs on port 8084 by default
```

### Testing Commands
```bash
# Run all tests (36/36 should pass)
npm test

# Run tests in watch mode
npm test:watch

# Run with coverage report
npm test:coverage

# Run visual component tests
npm test:visual

# Run E2E tests
npm test:e2e
```

### Code Quality
```bash
# Lint code with ESLint
npm run lint

# Reset project (removes example files)
npm run reset-project
```

### Backend Development Commands (Phase 5.1)
```bash
# Navigate to backend directory
cd Backend/

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On macOS/Linux
# venv\Scripts\activate   # On Windows

# Install dependencies
pip install -r requirements.txt

# Run FastAPI development server
uvicorn main:app --reload --port 8000

# Run database migrations
python -m alembic upgrade head

# Run tests with pytest
pytest
pytest --asyncio-mode=auto  # For async tests
pytest --cov=app tests/     # With coverage
```

### Database Commands (Supabase)
```bash
# Connect to Supabase CLI
npx supabase login

# Start local Supabase
npx supabase start

# Generate types from database
npx supabase gen types typescript --local > types/supabase.ts

# Run SQL migrations
npx supabase db push

# Reset local database
npx supabase db reset
```

## System Commands (macOS Darwin)

### Project Navigation
```bash
# Project root
cd /Users/ankur/Desktop/FM-SetLogger

# List project structure
find . -type d -name "node_modules" -prune -o -type f -name "*.json" -print

# Search for files
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules

# Monitor file changes
fswatch -o . | xargs -n1 -I{} echo "Files changed"
```

### Development Utilities
```bash
# Clear Metro cache
npx expo start --clear

# Check development server status
lsof -ti:8084  # Frontend dev server
lsof -ti:8000  # Backend dev server

# Kill development servers
kill $(lsof -ti:8084)  # Frontend
kill $(lsof -ti:8000)  # Backend
```

### Git Workflow
```bash
# Check status (should show clean working tree for production code)
git status

# View recent commits
git log --oneline -10

# Create feature branch
git checkout -b feature/phase-5-backend

# Stage and commit changes
git add .
git commit -m "feat: implement Phase 5.1 TDD database foundation"
```

## Development Environment Setup

### Prerequisites
```bash
# Check Node.js version (requires 18+)
node --version

# Check Python version (requires 3.11+)
python --version

# Verify Expo CLI
npx expo --version

# Verify Git configuration
git config --list
```

### Android Development
```bash
# Start Android emulator
emulator -avd Pixel_4_API_30

# Check connected devices
adb devices

# Install app on device
npx expo run:android
```

### iOS Development (macOS only)
```bash
# List iOS simulators
xcrun simctl list devices

# Start iOS simulator
open -a Simulator

# Install app on simulator
npx expo run:ios
```

## Common Development Workflows

### Starting Development Session
```bash
cd Frontend/coach/
npm install            # Install/update dependencies
npm start             # Start Expo dev server
# In new terminal:
npm test:watch        # Start test watcher
```

### Backend Development Session (Phase 5.1)
```bash
cd Backend/
source venv/bin/activate
pip install -r requirements.txt
pytest --asyncio-mode=auto  # Run TDD tests
uvicorn main:app --reload   # Start FastAPI server
```

### Production Testing
```bash
# Build for production
npx expo build:android --type apk
npx expo build:ios --type archive

# Run full test suite
npm test:coverage
npm test:e2e
```

These commands represent the essential development workflow for the FM-SetLogger fitness tracking application, supporting both the current frontend (98% complete) and the upcoming backend implementation (Phase 5.1).