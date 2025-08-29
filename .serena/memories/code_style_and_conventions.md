# Code Style & Conventions

## TypeScript Standards

### Type Safety
- **Strict mode enabled** in tsconfig.json
- **Explicit typing required** for all function parameters and return values
- **Interface definitions** for all data structures and API contracts
- **Generic types** for reusable components and utilities
- **Never use `any`** - prefer `unknown` or proper typing

### Naming Conventions
```typescript
// Files: kebab-case with descriptive names
user-store.ts
workout-detail-screen.tsx
exercise-log-card.component.tsx

// Interfaces: PascalCase with descriptive suffixes
interface UserPreferences { }
interface WorkoutStore { }
interface ButtonProps { }

// Functions: camelCase with verb-noun pattern
createWorkout()
updateExerciseSet()
validateUserInput()

// Constants: SCREAMING_SNAKE_CASE
const MAX_WORKOUT_TITLE_LENGTH = 30;
const DEFAULT_REST_TIMER = 60;

// Components: PascalCase
const WorkoutCard: React.FC<WorkoutCardProps> = ({ }) => { }
```

### Component Patterns
```typescript
// Functional components with TypeScript
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  title, 
  onPress, 
  variant = 'primary',
  disabled = false 
}) => {
  // Component implementation
};

// Export default for single component files
export default Button;

// Named exports for multiple exports
export { Button, type ButtonProps };
```

## React Native Conventions

### Component Structure
```typescript
// 1. React imports first
import React from 'react';
import { View, Text, Pressable } from 'react-native';

// 2. Third-party imports
import { useNavigation } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

// 3. Local imports (stores, components, utilities)
import { useWorkoutStore } from '@/stores/workout-store';
import { Button } from '@/components/ui/Button';
import { formatWeight } from '@/utils/format';

// 4. Type imports at the end
import type { WorkoutCardProps } from './types';
```

### Styling with NativeWind
```typescript
// Use NativeWind classes with nested color objects
const styles = {
  container: 'flex-1 bg-background p-4',
  text: 'text-foreground text-lg font-medium',
  button: 'bg-primary px-4 py-2 rounded-lg',
  accent: 'text-primary-foreground'
};

// Access theme colors through nested objects (NativeWind v4)
const { colors } = useTheme();
style={{ backgroundColor: colors.primary.DEFAULT }}
```

### Event Handling
```typescript
// Always use async/await for async operations
const handleSaveWorkout = async () => {
  try {
    await workoutStore.saveWorkout();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert('Success', 'Workout saved!');
  } catch (error) {
    Alert.alert('Error', 'Failed to save workout');
  }
};

// Use Pressable over TouchableOpacity for better performance
<Pressable
  onPress={handlePress}
  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
  className="p-4 bg-primary rounded-lg"
>
  <Text className="text-primary-foreground">Save</Text>
</Pressable>
```

## State Management Patterns

### Zustand Store Structure
```typescript
interface WorkoutStore {
  // State (readonly from components)
  activeWorkout: Workout | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions (methods to modify state)
  startWorkout: (title: string) => void;
  endWorkout: () => Promise<void>;
  addExercise: (exercise: Exercise) => void;
  
  // Private methods (not exposed to components)
  _validateWorkout: (workout: Workout) => boolean;
}

// Store implementation with proper TypeScript
export const useWorkoutStore = create<WorkoutStore>((set, get) => ({
  // Initial state
  activeWorkout: null,
  isLoading: false,
  error: null,
  
  // Actions
  startWorkout: (title: string) => {
    set({ 
      activeWorkout: { id: generateId(), title, exercises: [] },
      error: null 
    });
  },
}));
```

### React Query Integration
```typescript
// Custom hooks for server state
export const useWorkouts = () => {
  return useQuery({
    queryKey: ['workouts'],
    queryFn: () => apiClient.getWorkouts(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Mutations with proper error handling
export const useCreateWorkout = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: apiClient.createWorkout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workouts'] });
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Success);
    },
    onError: (error) => {
      Alert.alert('Error', error.message);
    },
  });
};
```

## Testing Conventions

### Test File Structure
```typescript
// test-file.test.tsx
import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { WorkoutCard } from '../WorkoutCard';
import type { Workout } from '@/types/workout';

// Test data setup
const mockWorkout: Workout = {
  id: 'test-workout-1',
  title: 'Test Workout',
  exercises: [],
  startedAt: new Date().toISOString(),
  isActive: true,
};

describe('WorkoutCard', () => {
  it('should render workout title correctly', () => {
    const { getByText } = render(
      <WorkoutCard workout={mockWorkout} onPress={jest.fn()} />
    );
    
    expect(getByText('Test Workout')).toBeTruthy();
  });
  
  it('should call onPress when tapped', async () => {
    const mockOnPress = jest.fn();
    const { getByTestId } = render(
      <WorkoutCard workout={mockWorkout} onPress={mockOnPress} />
    );
    
    fireEvent.press(getByTestId('workout-card'));
    
    await waitFor(() => {
      expect(mockOnPress).toHaveBeenCalledWith(mockWorkout.id);
    });
  });
});
```

## Backend Conventions (Phase 5.1)

### FastAPI Structure
```python
# main.py
from fastapi import FastAPI, Depends
from pydantic import BaseModel
from typing import Optional

# Request/Response models (camelCase for JSON)
class CreateWorkoutRequest(BaseModel):
    title: str
    exercises: Optional[list] = []
    
    class Config:
        alias_generator = lambda field_name: ''.join(
            word.capitalize() if i > 0 else word 
            for i, word in enumerate(field_name.split('_'))
        )

# API endpoints
@app.post("/workouts", response_model=WorkoutResponse)
async def create_workout(
    request: CreateWorkoutRequest,
    current_user: User = Depends(get_current_user)
):
    """Create a new workout session."""
    # Implementation
```

### Database Schema (snake_case)
```sql
-- Table names: snake_case
CREATE TABLE workout_exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_id UUID NOT NULL REFERENCES workouts(id),
  exercise_id UUID NOT NULL REFERENCES exercises(id),
  order_index INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Error Handling Patterns

### Frontend Error Boundaries
```typescript
// Always wrap async operations in try-catch
const handleAsyncOperation = async () => {
  try {
    const result = await someAsyncFunction();
    // Handle success
  } catch (error) {
    console.error('Operation failed:', error);
    Alert.alert('Error', 'Something went wrong');
  }
};

// Use proper error types
interface APIError {
  message: string;
  code: string;
  details?: Record<string, any>;
}
```

These conventions ensure consistent, maintainable, and production-ready code across the FM-SetLogger fitness application.