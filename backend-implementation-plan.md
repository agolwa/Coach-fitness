# Backend Implementation & Integration Plan

**Full-Stack Connection: FastAPI, Supabase, and React Native**  
**Target: 10 Days | 95%+ API Test Coverage | Production Deployment**

---

## **Phase 5: Backend Implementation & Integration (Days 1-10)**

### **🎯 Goal**: Connect the production-ready frontend to a robust, scalable, and secure backend using FastAPI and Supabase.

---

### **Part 1: Database & API Foundation (Days 1-3)**

#### **Task 5.1: Database Schema & Supabase Setup**
- [ ] **5.1.1** Create a new Supabase project and configure database settings.
- [ ] **5.1.2** Define the database schema using SQL or Supabase Studio:
  - `users` table (integrating with Supabase Auth, includes `preferences`).
  - `workouts` table (with `user_id`, `name`, `start_time`, `end_time`, `status`).
  - `exercises` table (pre-populated with 48+ exercises, includes `name`, `muscle_group`, `equipment`).
  - `sets` table (with `workout_id`, `exercise_id`, `reps`, `weight`, `notes`).
- [ ] **5.1.3** Establish proper relationships and constraints:
  - Foreign keys (e.g., `workouts.user_id` -> `users.id`).
  - Row-Level Security (RLS) policies to ensure users can only access their own data.
- [ ] **5.1.4** Generate database types/models for use in the FastAPI application.
- [ ] **5.1.5** Document the final schema and relationships.

#### **Task 5.2: FastAPI Project Setup**
- [ ] **5.2.1** Initialize a new Python project with a virtual environment.
- [ ] **5.2.2** Install dependencies: `fastapi`, `uvicorn`, `pydantic`, `supabase-py`, `python-jose[cryptography]`, `passlib[bcrypt]`.
- [ ] **5.2.3** Structure the backend project with clear separation of concerns (e.g., `/routers`, `/models`, `/services`, `/core`).
- [ ] **5.2.4** Configure environment variables for Supabase URL, keys, and JWT secret.
- [ ] **5.2.5** Set up CORS (Cross-Origin Resource Sharing) to allow requests from the React Native app.

#### **Testing Checklist - Part 1**
- [ ] **T5.1.1** Database tables and relationships are correctly created in Supabase.
- [ ] **T5.1.2** RLS policies effectively prevent unauthorized data access when tested via Supabase SQL editor.
- [ ] **T5.1.3** FastAPI server starts successfully with all dependencies.
- [ ] **T5.1.4** Environment variables are loaded correctly.
- [ ] **T5.1.5** A basic `/health` endpoint returns a 200 OK status.

---

### **Part 2: Core API Endpoint Development (Days 4-6)**

#### **Task 5.3: Authentication Endpoints**
- [ ] **5.3.1** Implement `/auth/google`: Handle Google OAuth callback, create or retrieve user in Supabase, and issue a JWT.
- [ ] **5.3.2** Implement `/auth/login` (if email/password is supported): Authenticate against Supabase Auth and issue a JWT.
- [ ] **5.3.3** Implement `/auth/me`: A protected endpoint that returns the current user's profile based on a valid JWT.
- [ ] **5.3.4** Create Pydantic models for request and response bodies, matching frontend TypeScript contracts.
- [ ] **5.3.5** Implement dependency injection for authentication and database sessions.

#### **Task 5.4: Workout & Exercise Endpoints**
- [ ] **5.4.1** Implement CRUD endpoints for `/workouts`:
  - `POST /workouts`: Create a new workout session.
  - `GET /workouts`: Get all workouts for the authenticated user.
  - `GET /workouts/{workout_id}`: Get details of a specific workout, including its exercises and sets.
  - `PUT /workouts/{workout_id}`: Update a workout (e.g., complete a session).
  - `DELETE /workouts/{workout_id}`: Delete a workout.
- [ ] **5.4.2** Implement `/exercises` endpoint:
  - `GET /exercises`: Retrieve the complete library of exercises.
- [ ] **5.4.3** Implement CRUD endpoints for `/workouts/{workout_id}/sets`: Manage sets within a workout.
- [ ] **5.4.4** Ensure all endpoints are protected and operate only on data owned by the authenticated user.

#### **Task 5.5: User Profile Endpoints**
- [ ] **5.5.1** Implement `/user/profile`:
  - `GET /user/profile`: Retrieve the user's profile and preferences.
  - `PUT /user/profile`: Update user preferences (e.g., weight unit, theme).
- [ ] **5.5.2** Ensure Pydantic models align with the `user-store` on the frontend.

#### **Testing Checklist - Part 2**
- [ ] **T5.2.1** Write `pytest` tests for all authentication endpoints, covering success and failure cases.
- [ ] **T5.2.2** Achieve 95%+ test coverage for all `/auth`, `/workouts`, `/exercises`, and `/user` endpoints.
- [ ] **T5.2.3** Test endpoint logic against the RLS policies to confirm data isolation.
- [ ] **T5.2.4** Validate request and response schemas using Pydantic models.
- [ ] **T5.2.5** Manually test endpoints using FastAPI's interactive documentation (Swagger UI).

---

### **Part 3: Frontend Integration (Days 7-8)**

#### **Task 5.6: API Client & React Query Setup**
- [ ] **5.6.1** Create a centralized API client (e.g., using Axios or `fetch`) in the React Native project.
- [ ] **5.6.2** Implement an interceptor to automatically attach the JWT to outgoing requests.
- [ ] **5.6.3** Set up React Query (`@tanstack/react-query`) for server state management.
- [ ] **5.6.4** Define query keys and custom hooks for all backend resources (e.g., `useWorkouts`, `useUserProfile`).

#### **Task 5.7: Connecting Frontend to Backend**
- [ ] **5.7.1** Replace mock authentication logic with calls to the `/auth` endpoints.
- [ ] **5.7.2** Refactor Zustand stores (`user-store`, `workout-store`) to synchronize with React Query.
  - Use React Query as the source of truth for server data.
  - Use Zustand for client-side state and caching server data.
- [ ] **5.7.3** Connect the `TodaysLog` screen to the `/workouts` endpoints.
- [ ] **5.7.4** Connect the `AddExercisesScreen` to the `/exercises` library endpoint.
- [ ] **5.7.5** Integrate the `ProfileScreen` with the `/user/profile` endpoints.

#### **Testing Checklist - Part 3**
- [ ] **T5.3.1** Authentication flow works end-to-end (Google login -> JWT received -> authenticated requests succeed).
- [ ] **T5.3.2** Data fetched via React Query is correctly displayed in the UI.
- [ ] **T5.3.3** Mutations (create, update, delete) successfully update the server and reflect in the UI.
- [ ] **T5.3.4** Zustand stores are correctly updated after successful API calls.
- [ ] **T5.3.5** Run existing frontend test suite (`npm run test`) to ensure no regressions were introduced.

---

### **Part 4: Deployment & Finalization (Days 9-10)**

#### **Task 5.8: Backend Deployment**
- [ ] **5.8.1** Choose a hosting platform (e.g., Railway, Render) and configure the project.
- [ ] **5.8.2** Create a `Dockerfile` for the FastAPI application.
- [ ] **5.8.3** Set up environment variables for production (database credentials, JWT secret).
- [ ] **5.8.4** Configure a production-ready web server (e.g., Gunicorn with Uvicorn workers).
- [ ] **5.8.5** Deploy the backend and verify it's running and accessible.

#### **Task 5.9: Final Integration & Security**
- [ ] **5.9.1** Update the React Native app to point to the production backend URL.
- [ ] **5.9.2** Conduct a final end-to-end test of the entire application on a physical device.
- [ ] **5.9.3** Review and harden Supabase RLS policies and database security.
- [ ] **5.9.4** Ensure all API endpoints have proper input validation and error handling.
- [ ] **5.9.5** Create final documentation for the backend API and deployment process.

#### **Testing Checklist - Part 4**
- [ ] **T5.4.1** Backend successfully deploys and runs on the chosen hosting platform.
- [ ] **T5.4.2** The production frontend successfully communicates with the production backend.
- [ ] **T5.4.3** A full user journey (signup -> create workout -> add exercises -> save) works flawlessly in the production environment.
- [ ] **T5.4.4** Security scan or manual review confirms no obvious vulnerabilities.

---

### **🎯 Phase 5 Success Criteria**

- ✅ **Full-stack connectivity established and functional.**
- ✅ **FastAPI backend achieves 95%+ test coverage.**
- ✅ **Frontend successfully uses React Query for all server state, eliminating mock data.**
- ✅ **Data is persisted in Supabase with strict user-based security policies.**
- ✅ **Backend is successfully deployed to a production-ready hosting environment.**
- ✅ **All 36/36 frontend tests continue to pass after integration.**

### **Timeline & Deliverables**

- **Estimated Duration**: 10 Days
- **Deliverables**:
  - A fully functional FastAPI backend codebase.
  - A Supabase database schema with RLS policies.
  - An updated React Native frontend integrated with the live backend.
  - A deployed backend service on a public URL.
  - Comprehensive API documentation and `pytest` test suite.

---

## **Database Schema Design**

### **Core Tables Structure**

Based on the frontend TypeScript contracts and user workflows, the following database schema will be implemented:

```sql
-- Users table (extends Supabase Auth)
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  display_name TEXT,
  preferences JSONB DEFAULT '{
    "weightUnit": "lbs",
    "theme": "auto",
    "defaultRestTimer": 60,
    "hapticFeedback": true
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Workouts table
CREATE TABLE workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL CHECK (char_length(title) <= 30),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completed_at TIMESTAMP WITH TIME ZONE,
  duration INTEGER, -- seconds
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Exercises library table (pre-populated)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio', 'flexibility', 'balance', 'bodyweight')),
  body_part TEXT[] NOT NULL,
  equipment TEXT[] NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Workout exercises junction table
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  order_index INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(workout_id, exercise_id)
);

-- Sets table
CREATE TABLE sets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id UUID NOT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  reps INTEGER CHECK (reps > 0),
  weight DECIMAL(5,2) CHECK (weight >= 0),
  duration INTEGER CHECK (duration > 0), -- seconds for time-based exercises
  distance DECIMAL(8,2) CHECK (distance > 0), -- meters for cardio
  completed BOOLEAN DEFAULT true,
  rest_time INTEGER CHECK (rest_time >= 0), -- seconds
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

### **Row-Level Security (RLS) Policies**

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE sets ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Workouts policies
CREATE POLICY "Users can view own workouts" ON workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create own workouts" ON workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own workouts" ON workouts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own workouts" ON workouts FOR DELETE USING (auth.uid() = user_id);

-- Exercises table is read-only for all authenticated users
CREATE POLICY "Authenticated users can view exercises" ON exercises FOR SELECT USING (auth.role() = 'authenticated');

-- Workout exercises policies
CREATE POLICY "Users can manage own workout exercises" ON workout_exercises 
  FOR ALL USING (
    workout_id IN (SELECT id FROM workouts WHERE user_id = auth.uid())
  );

-- Sets policies  
CREATE POLICY "Users can manage own sets" ON sets 
  FOR ALL USING (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workouts w ON w.id = we.workout_id
      WHERE w.user_id = auth.uid()
    )
  );
```

---

## **API Endpoint Specifications**

### **Authentication Endpoints**

```python
# FastAPI endpoint specifications

@router.post("/auth/google", response_model=LoginResponse)
async def google_auth(request: GoogleAuthRequest):
    """Exchange Google OAuth token for app JWT"""
    pass

@router.post("/auth/guest", response_model=LoginResponse)  
async def guest_auth():
    """Create temporary guest user and return JWT"""
    pass

@router.get("/auth/me", response_model=UserResponse)
async def get_current_user(current_user: User = Depends(get_current_user)):
    """Get current authenticated user profile"""
    pass

@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """Refresh expired JWT token"""
    pass
```

### **Workout Management Endpoints**

```python
@router.get("/workouts", response_model=List[WorkoutResponse])
async def get_user_workouts(
    skip: int = 0, 
    limit: int = 50,
    current_user: User = Depends(get_current_user)
):
    """Get paginated list of user's workouts"""
    pass

@router.post("/workouts", response_model=WorkoutResponse)
async def create_workout(
    workout: CreateWorkoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Create new workout session"""
    pass

@router.get("/workouts/{workout_id}", response_model=WorkoutDetailResponse)
async def get_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user)
):
    """Get detailed workout with exercises and sets"""
    pass

@router.put("/workouts/{workout_id}", response_model=WorkoutResponse)
async def update_workout(
    workout_id: str,
    workout: UpdateWorkoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Update workout (complete, add exercises, etc.)"""
    pass

@router.delete("/workouts/{workout_id}")
async def delete_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user)
):
    """Delete workout and all associated data"""
    pass
```

### **Exercise Library Endpoints**

```python
@router.get("/exercises", response_model=List[ExerciseResponse])
async def get_exercises(
    category: Optional[ExerciseCategory] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user)
):
    """Get exercise library with optional filtering"""
    pass

@router.post("/workouts/{workout_id}/exercises", response_model=WorkoutExerciseResponse)
async def add_exercise_to_workout(
    workout_id: str,
    exercise: AddExerciseRequest,
    current_user: User = Depends(get_current_user)
):
    """Add exercise to active workout"""
    pass

@router.post("/workouts/{workout_id}/exercises/{exercise_id}/sets", response_model=SetResponse)
async def add_set(
    workout_id: str,
    exercise_id: str,
    set_data: CreateSetRequest,
    current_user: User = Depends(get_current_user)
):
    """Add set to exercise in workout"""
    pass
```

### **User Profile Endpoints**

```python
@router.get("/users/profile", response_model=UserResponse)
async def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get user profile and preferences"""
    pass

@router.put("/users/profile", response_model=UserResponse)
async def update_user_profile(
    profile: UpdateUserRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user profile and preferences"""
    pass

@router.put("/users/preferences", response_model=UserPreferencesResponse)
async def update_preferences(
    preferences: UserPreferencesRequest,
    current_user: User = Depends(get_current_user)
):
    """Update user preferences (theme, weight units, etc.)"""
    pass
```

---

## **Frontend Integration Strategy**

### **API Client Implementation**

```typescript
// services/api-client.ts
export class ApiClient {
  private baseURL: string;
  private authToken: string | null = null;

  constructor() {
    this.baseURL = __DEV__ 
      ? 'http://localhost:8000' 
      : process.env.EXPO_PUBLIC_API_URL;
  }

  setAuthToken(token: string) {
    this.authToken = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<APIResponse<T>> {
    // Implementation with JWT auth header injection
  }

  // Workout methods
  async getWorkouts(): Promise<APIResponse<WorkoutResponse[]>> {
    return this.request('/workouts');
  }

  async createWorkout(workout: CreateWorkoutRequest): Promise<APIResponse<WorkoutResponse>> {
    return this.request('/workouts', { method: 'POST', body: workout });
  }

  // Exercise methods
  async getExercises(category?: ExerciseCategory): Promise<APIResponse<ExerciseResponse[]>> {
    const params = category ? `?category=${category}` : '';
    return this.request(`/exercises${params}`);
  }

  // User methods
  async getUserProfile(): Promise<APIResponse<UserResponse>> {
    return this.request('/users/profile');
  }
}

export const apiClient = new ApiClient();
```

### **React Query Hooks**

```typescript
// hooks/api/workouts.ts
export function useWorkouts() {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => apiClient.getWorkouts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWorkout(workoutId: string) {
  return useQuery({
    queryKey: ['workout', workoutId],
    queryFn: () => apiClient.getWorkout(workoutId),
    enabled: !!workoutId,
  });
}

export function useCreateWorkout() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
    },
  });
}

// hooks/api/exercises.ts
export function useExercises(category?: ExerciseCategory) {
  return useQuery({
    queryKey: ['exercises', category],
    queryFn: () => apiClient.getExercises(category),
    staleTime: 60 * 60 * 1000, // 1 hour (exercises don't change often)
  });
}
```

### **Updated Zustand Store Integration**

```typescript
// stores/workout-store.ts (updated for backend integration)
interface WorkoutStore {
  // Client-side active workout state
  activeWorkout: Workout | null;
  
  // Actions that sync with backend
  startWorkout: (title: string) => Promise<void>;
  addExerciseToWorkout: (exerciseId: string) => void;
  updateSet: (exerciseId: string, setId: string, updates: Partial<Set>) => void;
  saveWorkout: () => Promise<void>;
  
  // React Query integration
  syncWithServer: (serverWorkout: Workout) => void;
  clearActiveWorkout: () => void;
}

export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  activeWorkout: null,
  
  startWorkout: async (title: string) => {
    // Create workout on server first
    const createMutation = useCreateWorkout();
    const result = await createMutation.mutateAsync({ title });
    
    // Update local state
    set({ activeWorkout: result.data });
  },
  
  saveWorkout: async () => {
    const { activeWorkout } = get();
    if (!activeWorkout) return;
    
    // Send to server via React Query mutation
    const updateMutation = useUpdateWorkout();
    await updateMutation.mutateAsync({
      workoutId: activeWorkout.id,
      completedAt: new Date().toISOString(),
      isActive: false
    });
    
    // Clear local state
    set({ activeWorkout: null });
  },
}));
```

This comprehensive backend implementation plan provides the complete roadmap to connect your 98% complete React Native frontend with a robust FastAPI + Supabase backend, maintaining the existing architecture while adding full-stack capabilities.