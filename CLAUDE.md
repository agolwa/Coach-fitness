# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Architecture

This is a **React Native fitness app** built with **Expo SDK 53** using **TypeScript**. The app helps users log and track their workout exercises.

### Technology Stack
- **Frontend**: React Native with Expo Router (file-based routing)
- **State Management**: Zustand with persistence via AsyncStorage
- **Styling**: NativeWind (Tailwind CSS for React Native) with HSL-based design system
- **Forms**: React Hook Form
- **Testing**: Jest with React Testing Library
- **Data Persistence**: AsyncStorage for local data

### Core Architecture Patterns

**Dual Project Structure**: The repository contains two identical React Native apps:
- Root level: Primary development version
- `Frontend/coach/`: Secondary version with additional features (auth, enhanced stores)

**State Management**: Centralized Zustand stores with automatic persistence:
- `user-store.ts`: User preferences, authentication state, weight units
- `workout-store.ts`: Active workouts, exercise data, workout history
- `exercise-store.ts`: Exercise library and selection
- `theme-store.ts`: Theme preferences

**Component Architecture**:
- `components/ui/`: Reusable UI components styled with NativeWind
- `components/compat/`: Compatibility wrappers (ThemeProvider, WeightUnitProvider)
- Authentication flow handled by `AuthWrapper` and `StoreProvider`

## Common Commands

### Development
```bash
# Install dependencies
npm install

# Start development server
npm start
# or platform-specific
npm run android
npm run ios
npm run web
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Run with coverage
npm test:coverage

# Run visual tests
npm test:visual

# Run e2e tests
npm run test:e2e
```

### Linting & Code Quality
```bash
# Lint code
npm run lint

# Reset project (removes example files)
npm run reset-project
```

## Key Implementation Details

### Store Initialization
All Zustand stores must be initialized before use. The `StoreProvider` component handles this with:
- Automatic store hydration from AsyncStorage
- Loading states during initialization
- Error handling for corrupt/missing data

### Authentication Flow
- Guest mode vs signed-in state managed by `user-store`
- `AuthWrapper` component controls app navigation based on auth state
- Weight unit preferences are locked during active workouts

### Workout Management
- Active workout sessions persist across app restarts
- Exercise data includes weight, reps, sets, and notes
- Workout history stored locally with exercise statistics
- Weight unit conversion utilities for kg/lbs

### Theme System
- HSL-based color system with CSS variables
- Dark/light mode support via `useColorScheme` hook
- Theme persistence through `theme-store`
- NativeWind integration for responsive design

### File-Based Routing (Expo Router)
- `app/(tabs)/`: Main tabbed navigation
- `app/(auth)/`: Authentication screens
- `app/(modal)/`: Modal screens for adding exercises
- Route protection handled by `AuthWrapper`

## Testing Strategy

- **Unit Tests**: Individual store methods and utility functions
- **Integration Tests**: Store interactions and component integration
- **Visual Tests**: Component rendering and styling
- **E2E Tests**: Full user workflows with Detox

Critical test coverage includes:
- Store state transitions and persistence
- Authentication flow edge cases
- Workout data validation and saving
- Weight unit conversions



### Quick Visual Check

**IMMEDIATELY after implementing any front-end change:**

1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `/context/design-principles.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages` ⚠️

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review

For significant UI changes or before merging PRs, use the design review agent:

```bash
# Option 1: Use the slash command
/design-review

# Option 2: Invoke the agent directly
@agent-design-review
```

The design review agent will:

- Test all interactive states and user flows
- Verify responsiveness (desktop/tablet/mobile)
- Check accessibility (WCAG 2.1 AA compliance)
- Validate visual polish and consistency
- Test edge cases and error states
- Provide categorized feedback (Blockers/High/Medium/Nitpicks)

### Playwright MCP Integration

#### Essential Commands for UI Testing

```javascript
// Navigation & Screenshots
mcp__playwright__browser_navigate(url); // Navigate to page
mcp__playwright__browser_take_screenshot(); // Capture visual evidence
mcp__playwright__browser_resize(
  width,
  height
); // Test responsiveness

// Interaction Testing
mcp__playwright__browser_click(element); // Test clicks
mcp__playwright__browser_type(
  element,
  text
); // Test input
mcp__playwright__browser_hover(element); // Test hover states

// Validation
mcp__playwright__browser_console_messages(); // Check for errors
mcp__playwright__browser_snapshot(); // Accessibility check
mcp__playwright__browser_wait_for(
  text / element
); // Ensure loading
```

### Design Compliance Checklist

When implementing UI features, verify:

- [ ] **Visual Hierarchy**: Clear focus flow, appropriate spacing
- [ ] **Consistency**: Uses design tokens, follows patterns
- [ ] **Responsiveness**: Works on mobile (375px), tablet (768px), desktop (1440px)
- [ ] **Accessibility**: Keyboard navigable, proper contrast, semantic HTML
- [ ] **Performance**: Fast load times, smooth animations (150-300ms)
- [ ] **Error Handling**: Clear error states, helpful messages
- [ ] **Polish**: Micro-interactions, loading states, empty states

## When to Use Automated Visual Testing

### Use Quick Visual Check for:

- Every front-end change, no matter how small
- After implementing new components or features
- When modifying existing UI elements
- After fixing visual bugs
- Before committing UI changes

### Use Comprehensive Design Review for:

- Major feature implementations
- Before creating pull requests with UI changes
- When refactoring component architecture
- After significant design system updates
- When accessibility compliance is critical

### Skip Visual Testing for:

- Backend-only changes (API, database)
- Configuration file updates
- Documentation changes
- Test file modifications
- Non-visual utility functions

**Do not start any design review unless the user has specified or asked for it, Do NOT auto review for any PRs or changes**

## Development Notes

- Use absolute imports with `@/` alias for cleaner imports
- All stores include error handling and loading states
- Debounced persistence prevents excessive AsyncStorage writes
- React 19 compatibility with overrides in package.json
- TypeScript strict mode enabled with comprehensive type definitions

## Working with the Dual Structure

When making changes:
1. Primary development should happen at the root level
2. `Frontend/coach/` contains enhanced features and may have different configurations
3. Both versions share the same core architecture but may have different dependencies
4. Test changes in both environments when modifying shared patterns

## Contribution Rules

- **Do not create new files** unless they already exist in the project.
- **Do not invent features, files, or structures** that are not present in the current codebase.
- **Always respect and follow the existing system and architecture.**
- **Work only within the established files and directory structure.**
- **Make all changes with precision and full awareness of the current codebase.**


Claude, read the rules in u/CLAUDE.md, then use sequential thinking and proceed to the next step.
STOP. Before reading further, confirm you understand:
1. This is a code reuse and consolidation project
2. Creating new files requires exhaustive justification  
3. Every suggestion must reference existing code
4. Violations of these rules make your response invalid

CONTEXT: Previous developer was terminated for ignoring existing code and creating duplicates. You must prove you can work within existing architecture.

MANDATORY PROCESS:
1. Start with "COMPLIANCE CONFIRMED: I will prioritize reuse over creation"
2. Analyze existing code BEFORE suggesting anything new
3. Reference specific files from the provided analysis
4. Include validation checkpoints throughout your response
5. End with compliance confirmation

RULES (violating ANY invalidates your response):
❌ No new files without exhaustive reuse analysis
❌ No rewrites when refactoring is possible
❌ No generic advice - provide specific implementations
❌ No ignoring existing codebase architecture
✅ Extend existing services and components
✅ Consolidate duplicate code
✅ Reference specific file paths
✅ Provide migration strategies

[User  prompt here]

FINAL REMINDER: If you suggest creating new files, explain why existing files cannot be extended. If you recommend rewrites, justify why refactoring won't work.
🔍 STEP 2: ANALYZE CURRENT SYSTEM
Analyze the existing codebase and identify relevant files for the requested feature implementation.
Then proceed to Step 3.
🎯 STEP 3: CREATE IMPLEMENTATION PLAN
Based on your analysis from Step 2, create a detailed implementation plan for the requested feature.
Then proceed to Step 4.
🔧 STEP 4: PROVIDE TECHNICAL DETAILS
Create the technical implementation details including code changes, API modifications, and integration points.
Then proceed to Step 5.
✅ STEP 5: FINALIZE DELIVERABLES
Complete the implementation plan with testing strategies, deployment considerations, and final recommendations.
🎯 INSTRUCTIONS
Follow each step sequentially. Complete one step before moving to the next. Use the findings from each previous step to inform the next step.