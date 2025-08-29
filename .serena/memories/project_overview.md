# Project Overview: FM-SetLogger

## Project Purpose
A **React Native fitness tracking app** built with **Expo SDK 53** and **TypeScript**. The app helps users log and track their workout exercises with the goal of becoming a production-ready fitness application. The project is 98% complete on the frontend and is now transitioning to full-stack implementation with backend integration.

## Current Project Status
- **Frontend**: 98% complete with production-ready React Native components
- **Backend**: Phase 5.1 - Database Foundation & Row-Level Security implementation starting
- **Architecture**: Dual project structure with root level (primary) and `Frontend/coach/` (enhanced version)
- **Testing**: 36/36 tests passing with comprehensive coverage
- **Development Environment**: Stable and production-ready

## Technology Stack

### Frontend (Production Ready)
- **React Native 0.79.5** via **Expo SDK 53**
- **TypeScript ~5.8.3** with strict mode
- **NativeWind v4.1.23** for Tailwind CSS styling
- **Zustand 5.0.8** for client-side state management
- **React Query 5.85.5** for server state management (ready for backend integration)
- **Expo Router 5.1.5** for file-based routing
- **React Hook Form 7.62.0** for form validation

### Backend (Phase 5.1 Implementation)
- **FastAPI** with **Python 3.11+**
- **Supabase (PostgreSQL)** with Row-Level Security
- **Pydantic** for data validation and API contracts
- **pytest** with asyncio support for TDD

### Key Features Implemented
- Complete workout tracking interface
- Exercise library with 48+ fitness exercises
- User authentication flow (Google OAuth ready)
- Theme system with dark/light mode
- State persistence with AsyncStorage
- Navigation system with tabs and modals
- Complete testing infrastructure

## Architecture Patterns
- **Dual Project Structure**: Root level + Frontend/coach/ enhanced version
- **Component-Based**: Pure React Native components (no HTML elements)
- **Store Architecture**: Separate Zustand stores for user, workout, exercise, theme, navigation
- **Mobile-First Design**: SafeArea handling, haptic feedback, native alerts
- **Test-Driven Development**: Comprehensive Jest + React Testing Library setup