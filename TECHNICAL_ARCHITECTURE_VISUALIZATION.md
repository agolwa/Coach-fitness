# FM-SetLogger Technical Architecture Visualization

## 📋 Project Overview

**FM-SetLogger** is a comprehensive full-stack fitness tracking application with a React Native frontend and FastAPI backend, featuring secure multi-user authentication and real-time workout data synchronization.

**Current Status**: 97% Complete - Full-Stack Integration with Enhanced Authentication Testing Complete
**Phase**: 5.3.1 - Implementation Phase Remaining

---

## 🏗️ High-Level Architecture Diagram

```mermaid
graph TB
    %% User Layer
    subgraph "👤 User Layer"
        IOS[📱 iOS App]
        AND[📱 Android App]
        WEB[🌐 Web App]
    end

    %% Frontend Layer
    subgraph "🎨 Frontend Layer (Frontend/coach/)"
        subgraph "📱 React Native Application"
            EXPO[Expo SDK 53<br/>TypeScript 5.8.3]
            ROUTER[Expo Router 5.1.5<br/>File-based Routing]
            
            subgraph "🎯 State Management"
                ZUSTAND[Zustand 5.0.8<br/>Client State]
                QUERY[React Query 5.85.5<br/>Server State]
                ASYNC[AsyncStorage 2.1.2<br/>Persistence]
            end
            
            subgraph "🎨 UI Framework"
                NATIVE[NativeWind 4.1.23<br/>Tailwind CSS]
                THEME[Theme System<br/>Dark/Light Mode]
                COMPONENTS[UI Components<br/>Design System]
            end
        end
    end

    %% Backend Layer
    subgraph "⚡ Backend Layer (Backend/)"
        subgraph "🚀 FastAPI Application"
            API[FastAPI 0.110.0<br/>Python 3.11+]
            AUTH[JWT Authentication<br/>Refresh Token Rotation]
            
            subgraph "🔧 Services"
                AUTHSVC[Auth Service]
                WORKSVC[Workout Service] 
                EXERSVC[Exercise Service]
                TOKENSVC[Token Service]
            end
            
            subgraph "📡 API Routes"
                AUTHAPI[/auth/*]
                WORKAPI[/workouts/*]
                EXERAPI[/exercises/*]
                USERAPI[/users/*]
            end
        end
    end

    %% Database Layer
    subgraph "🗄️ Database Layer"
        subgraph "☁️ Supabase (PostgreSQL)"
            USERS[(Users Table<br/>Auth Integration)]
            WORKOUTS[(Workouts Table<br/>Session Data)]
            EXERCISES[(Exercises Table<br/>48+ Exercise Library)]
            SETS[(Sets Table<br/>Workout Data)]
            RLS[Row Level Security<br/>Multi-user Isolation]
        end
    end

    %% External Services
    subgraph "🌐 External Services"
        GOOGLE[Google OAuth<br/>Authentication]
        SUPABASE[Supabase Cloud<br/>Database + Auth]
    end

    %% Environment Configuration
    subgraph "⚙️ Environment Configuration"
        LOCAL[Local Development<br/>localhost:8082 + 8000]
        STAGING[Staging Environment<br/>api-staging.fm-setlogger.com]
        PROD[Production Environment<br/>TBD]
    end

    %% Connections
    IOS --> EXPO
    AND --> EXPO
    WEB --> EXPO
    
    EXPO --> ROUTER
    ROUTER --> ZUSTAND
    ROUTER --> QUERY
    ZUSTAND --> ASYNC
    
    EXPO --> NATIVE
    NATIVE --> THEME
    NATIVE --> COMPONENTS
    
    QUERY --> API
    API --> AUTHSVC
    API --> WORKSVC
    API --> EXERSVC
    API --> TOKENSVC
    
    AUTHSVC --> AUTHAPI
    WORKSVC --> WORKAPI
    EXERSVC --> EXERAPI
    TOKENSVC --> USERAPI
    
    API --> USERS
    API --> WORKOUTS
    API --> EXERCISES
    API --> SETS
    API --> RLS
    
    AUTH --> GOOGLE
    API --> SUPABASE
    
    API --> LOCAL
    API --> STAGING
    API --> PROD
```

---

## 📊 Technology Stack Breakdown

### 🎨 Frontend Technologies (Frontend/coach/)

#### **Core Framework**
- **React Native 0.79.5** - React Native is Facebook's open-source framework that allows us to build native mobile applications for both iOS and Android using JavaScript and React components. We use this because it provides native performance while allowing code sharing between platforms, reducing development time by approximately 70% compared to building separate native apps.

- **Expo SDK 53** - Expo is a development platform and toolchain built around React Native that provides tools, services, and libraries to help build, deploy, and iterate on iOS, Android, and web apps. We chose Expo because it simplifies the development workflow by providing pre-built components, over-the-air updates, and easy deployment to app stores without needing native development knowledge.

- **TypeScript 5.8.3** - TypeScript is a programming language developed by Microsoft that builds on JavaScript by adding static type definitions. We use TypeScript in strict mode because it catches bugs during development rather than runtime, provides better code completion in our IDE, and makes our codebase more maintainable as it grows.

- **React 19.0.0** - React is Facebook's JavaScript library for building user interfaces through reusable components. We use the latest version (React 19) to access the newest features like automatic batching and improved performance, which helps our fitness tracking app respond faster to user interactions.

#### **Navigation & Routing**
- **Expo Router 5.1.5** - Expo Router is a file-based routing system for React Native applications that automatically generates routes based on your file structure. We use this because it simplifies navigation management by eliminating the need to manually configure route definitions - when you create a file in the `app` directory, it automatically becomes a navigable screen. Data flows through Expo Router by reading the file system structure and converting it into navigation stacks, tabs, and modals.

- **React Navigation 7.1.6** - React Navigation is the foundational navigation library that provides the context and components needed for screen transitions, navigation state management, and deep linking. We use this as the underlying navigation system because it provides the navigation context that other components depend on, even though Expo Router handles the route configuration. The data flow works by maintaining a navigation state tree that tracks which screens are active and provides methods to move between them.

- **React Navigation Bottom Tabs 7.3.10** - This is a specialized navigation component that creates the tab bar at the bottom of our fitness app (Home, Workouts, Profile, etc.). We chose this because bottom tabs provide intuitive navigation patterns that users expect in mobile fitness applications. The component depends on React Navigation for navigation context and renders tab buttons that update the active screen when pressed.

#### **State Management Architecture**
- **Zustand 5.0.8** - Zustand is a lightweight state management library that provides a simple API for managing application state without the complexity of Redux. We chose Zustand because it offers 40% better performance than React Context and requires less boilerplate code. Data flows through Zustand by creating stores that components can subscribe to, and when state changes, only components that use that specific state get re-rendered. Our stores are organized as:
  - `user-store.ts` - Manages user preferences, authentication state, and weight unit settings (kg/lbs)
  - `workout-store.ts` - Handles active workouts, exercise data, and workout history
  - `exercise-store.ts` - Contains the exercise library and exercise selection logic
  - `theme-store.ts` - Controls theme preferences and dark/light mode color system

- **React Query 5.85.5** - React Query (also called TanStack Query) is a data-fetching library that manages server state, caching, synchronization, and error handling. We use this because it automatically caches API responses, handles loading and error states, and provides optimistic updates for better user experience. The data flow works by intercepting API calls, storing responses in a cache, and providing cached data to components while refreshing in the background.

- **AsyncStorage 2.1.2** - AsyncStorage is React Native's built-in persistent storage system that saves data locally on the device even after the app is closed. We use this to persist user preferences, workout data, and authentication tokens so users don't lose their data when they restart the app. Data flows by storing serialized objects that get loaded when the app starts and saved when state changes.

#### **UI & Styling Framework**
- **NativeWind 4.1.23** - NativeWind is a library that brings Tailwind CSS utility classes to React Native, allowing us to style components using the same classes we would use in web development. We chose this because it provides consistent styling patterns across platforms and makes it easier for developers familiar with Tailwind to work on the mobile app. Data flows through NativeWind by converting Tailwind classes into React Native styles at build time, which then get applied to components.

- **Tailwind CSS 3.3.0** - Tailwind CSS is a utility-first CSS framework that provides low-level utility classes to build custom designs directly in your markup. We use this because it speeds up development by eliminating the need to write custom CSS and provides consistent spacing, colors, and sizing throughout our app. The framework works by providing pre-defined classes like `bg-blue-500` or `p-4` that correspond to specific CSS properties.

- **Class Variance Authority 0.7.1** - CVA is a library for managing component variants in a type-safe way, allowing us to define different visual styles for the same component (like primary vs secondary buttons). We use this because it helps maintain consistency in our design system and makes it easier to create reusable components with multiple visual variants. Data flows by defining variant configurations that determine which classes get applied based on props passed to components.

- **Clsx 2.1.1** - Clsx is a utility for conditionally joining class names together in a clean and performant way. We use this library because it allows us to dynamically apply styles based on component state or props while keeping the code readable. The library works by taking multiple arguments (strings, objects, arrays) and combining them into a single class name string.

#### **Design System & Components**
- **Unified Theme System** - Our unified theme system uses HSL (Hue, Saturation, Lightness) based design tokens to maintain consistent colors, spacing, and typography throughout the app. We chose HSL over RGB because it makes it easier to create color variations and ensures accessibility compliance. The system works by defining CSS custom properties that automatically switch between light and dark values, allowing components to adapt to theme changes without manual updates.

- **Dark/Light Mode Support** - Our theme system automatically detects the user's system preference and switches between dark and light color schemes. We implemented this because modern users expect apps to respect their system settings and because dark mode reduces eye strain and battery usage on OLED screens. The data flow works by monitoring system appearance changes and updating CSS variables that cascade to all components.

- **Haptic Feedback** - We integrate native haptic feedback (vibrations) to provide tactile responses when users interact with buttons, switches, and other UI elements. We use this because it creates a more engaging and native-feeling experience, especially important for fitness tracking where users need confirmation of actions. The feedback works by calling native iOS and Android haptic APIs when specific user interactions occur.

- **SafeArea Handling** - SafeArea handling ensures our app content doesn't overlap with device-specific areas like the iPhone's notch, home indicator, or status bar. We implement this because different devices have different screen shapes and system UI elements that we need to avoid. The system works by detecting device-specific safe areas and applying appropriate padding to keep content visible and accessible.

#### **Forms & Validation**
- **React Hook Form 7.62.0** - React Hook Form is a library that manages form state, validation, and submission with minimal re-renders for optimal performance. We chose this because it's lightweight, has excellent TypeScript support, and reduces the complexity of form handling compared to manual state management. The data flow works by registering form fields, tracking their values and validation states, and providing methods to handle form submission and errors.

- **Custom validation** - We implement custom validation rules for fitness-specific data like weight units (kg/lbs conversion), rep counts (positive integers), and exercise data (required fields, numeric ranges). We built custom validators because generic form validation doesn't understand fitness domain rules like "weight must be positive" or "reps must be between 1-999". The validation works by defining rule functions that run when field values change and return error messages if validation fails.

#### **Icons & Assets**
- **Expo Vector Icons 14.1.0** - Expo Vector Icons is a comprehensive library that provides popular icon sets (FontAwesome, Ionicons, Material Icons, etc.) as React Native components. We use this because it gives us access to thousands of icons without increasing app bundle size significantly, and the icons are vectorized so they look sharp at any size. The icons work by rendering as font characters that can be styled with color and size properties.

- **Lucide React Native 0.540.0** - Lucide is a modern, clean icon set that provides beautifully crafted icons with consistent stroke width and style. We chose this as our primary icon library because the icons have a professional appearance that fits our fitness app's design aesthetic and they're optimized for mobile interfaces. The library works by providing SVG-based icons that render crisply at different sizes and can be easily styled with props.

- **Expo Symbols 0.4.5** - Expo Symbols provides access to Apple's SF Symbols and Google's Material Symbols, giving us platform-native icons that match the operating system's design language. We use this because it helps our app feel more integrated with the platform, especially on iOS where users expect SF Symbol icons. The library works by detecting the platform and rendering the appropriate native icon set.

#### **Authentication & Security**
- **Expo Auth Session 6.2.1** - Expo Auth Session handles OAuth authentication flows, particularly for Google OAuth login in our fitness app. We use this because it simplifies the complex process of OAuth authentication by handling redirect URLs, token exchanges, and security checks automatically. The data flow works by opening a secure web view for login, capturing the authorization code when the user approves, and exchanging it for access and refresh tokens.

- **Crypto JS 4.2.0** - Crypto JS is a JavaScript library that provides cryptographic utilities for encryption, decryption, and hashing. We use this for sensitive data handling like token encryption before storage and generating secure hashes for data integrity. The library works by providing algorithms like AES for encryption and SHA-256 for hashing, allowing us to protect sensitive user data even if device storage is compromised.

- **Expo Crypto 14.1.5** - Expo Crypto provides native cryptographic functions that are more secure and performant than JavaScript implementations. We use this for generating secure random values, creating cryptographic hashes, and other security-critical operations where native implementation provides better security guarantees. The library works by calling platform-native cryptographic APIs (iOS Security Framework, Android Keystore) for maximum security.

#### **Network & API**
- **Supabase JS 2.57.0** - Supabase JS is the JavaScript client that connects our React Native app to the Supabase backend, providing database operations, authentication, and real-time subscriptions. We use this because it provides a simple API for complex database operations and automatically handles real-time updates when workout data changes. The data flow works by sending queries to Supabase, receiving responses, and automatically updating components when subscribed data changes in real-time.

- **React Native NetInfo 11.4.1** - NetInfo monitors the device's network connectivity status (WiFi, cellular, offline) and provides this information to our app. We use this because fitness tracking apps need to handle offline scenarios gracefully - users might lose connection during workouts and we need to queue data for synchronization when connection returns. The library works by monitoring system network events and providing connection state that components can subscribe to.

### ⚡ Backend Technologies (Backend/)

#### **Core Framework**
- **FastAPI 0.110.0** - FastAPI is a modern, high-performance web framework for building APIs with Python based on standard Python type hints. We chose FastAPI because it's one of the fastest Python frameworks available, provides automatic API documentation (OpenAPI/Swagger), and has excellent async support for handling multiple concurrent users. The data flow works by receiving HTTP requests, processing them asynchronously, interacting with the database, and returning JSON responses to the frontend.

- **Uvicorn 0.27.0** - Uvicorn is an ASGI (Asynchronous Server Gateway Interface) web server that runs our FastAPI application. We use Uvicorn because it provides excellent performance for async applications and supports modern Python async/await patterns. The server works by listening for incoming HTTP requests, passing them to FastAPI for processing, and returning the responses back to clients (our React Native app).

- **Python 3.11+** - Python 3.11 is the latest version of Python that we use as our backend runtime, providing significant performance improvements (10-25% faster than Python 3.10) and better error messages. We chose Python because it has excellent libraries for web development, database operations, and data processing, making it ideal for our fitness tracking backend that needs to handle workout calculations and user data management.

#### **Data Validation & Serialization**
- **Pydantic 2.6.0** - Pydantic is a data validation library that uses Python type hints to validate, serialize, and deserialize data automatically. We use Pydantic because it ensures that all data entering our API is properly formatted and validated before reaching our business logic, preventing errors and security issues. The data flow works by defining models with type hints, and Pydantic automatically validates incoming JSON against these models, converting and validating types.

- **Pydantic Settings 2.1.0** - Pydantic Settings is an extension that handles configuration management by automatically loading settings from environment variables, JSON files, or other sources. We use this because it provides a clean way to manage different configurations for development, staging, and production environments with type safety. The library works by defining settings classes that automatically load configuration values and validate them on application startup.

- **Email Validator 2.3.0** - Email Validator is a specialized library that validates email address formats using comprehensive rules beyond simple regex patterns. We use this for user registration and authentication to ensure email addresses are properly formatted before attempting to send verification emails. The validator works by checking email syntax, domain validity, and other RFC-compliant email rules.

#### **Database & ORM**
- **Supabase 2.3.4** - Supabase is a Backend-as-a-Service (BaaS) that provides a PostgreSQL database, authentication, real-time subscriptions, and API generation. We chose Supabase because it handles the complexity of database management, scaling, and security while providing real-time features essential for fitness tracking. The data flows through Supabase by storing workout data in PostgreSQL tables, providing REST and GraphQL APIs automatically, and sending real-time updates to connected clients when data changes.

- **AsyncPG 0.29.0** - AsyncPG is a high-performance PostgreSQL driver for Python that supports async/await patterns for non-blocking database operations. We use this because it allows our backend to handle multiple concurrent requests efficiently without blocking while waiting for database queries. The driver works by maintaining connection pools and executing queries asynchronously, allowing other operations to continue while database queries are processing.

- **PSycopg2 Binary 2.9.9** - PSycopg2 is a mature PostgreSQL adapter for Python that provides synchronous database operations and is widely used in production environments. We include this for compatibility with certain libraries and legacy code that might not support async operations. The adapter works by establishing connections to PostgreSQL and translating Python database operations into SQL queries.

- **SQLAlchemy 2.0.25** - SQLAlchemy is a powerful Object-Relational Mapping (ORM) library that provides a Python interface to database operations with support for async operations in version 2.0. We use this because it allows us to work with database records as Python objects, provides migration tools, and offers both high-level ORM and low-level Core APIs. The data flow works by mapping Python classes to database tables and translating method calls into optimized SQL queries.

#### **Authentication & Security**
- **Python JOSE 3.3.0** - Python JOSE (JavaScript Object Signing and Encryption) is a library that handles JWT (JSON Web Token) creation, verification, and encryption with strong cryptographic security. We use this for creating secure access and refresh tokens that authenticate users across our API endpoints. The data flow works by generating signed JWTs when users authenticate, embedding user information in the token payload, and validating these tokens on each API request to ensure the user is authorized.

- **Passlib 1.7.4** - Passlib is a password hashing library that provides secure password storage using bcrypt and other strong hashing algorithms. We use this because storing plain text passwords is a major security risk, and bcrypt provides salt generation and adaptive hashing that makes passwords virtually impossible to reverse even if the database is compromised. The library works by generating unique salts for each password and creating irreversible hashes that can only be verified, not decoded.

- **Python Multipart 0.0.9** - Python Multipart handles multipart form data parsing, which is essential for file uploads like profile pictures or exercise images in our fitness app. We use this because REST APIs need to handle both JSON data and file uploads, which require different parsing mechanisms. The library works by parsing multipart HTTP requests and extracting both form fields and uploaded files for processing.

- **Google Auth 2.0.0+** - Google Auth provides OAuth 2.0 integration with Google's authentication services, allowing users to sign in with their Google accounts. We use this because it eliminates the need for users to create and remember additional passwords, improves security through Google's authentication infrastructure, and provides a seamless signup experience. The integration works by redirecting users to Google for authentication, receiving an authorization code, and exchanging it for user profile information and tokens.

#### **HTTP & Network**
- **HTTPX 0.26.0** - HTTPX is a modern async HTTP client library that supports HTTP/1.1 and HTTP/2, providing excellent performance for making external API calls from our backend. We use HTTPX when our backend needs to communicate with external services like Google OAuth, third-party fitness APIs, or other microservices. The library works by supporting async/await patterns, allowing our backend to make multiple concurrent HTTP requests without blocking, which improves overall API response times.

- **Requests 2.32.5** - Requests is the most popular synchronous HTTP client library for Python, known for its simple and intuitive API. We include Requests for compatibility with legacy code and third-party libraries that don't support async operations. The library works by providing a simple interface for making HTTP requests and handling responses, though it blocks execution until the request completes.

#### **Development & Configuration**
- **Python Dotenv 1.0.1** - Python Dotenv loads environment variables from .env files, allowing us to manage configuration settings like database URLs, API keys, and secrets without hardcoding them in the source code. We use this because it provides a secure way to manage different configurations for development, staging, and production environments. The library works by reading key-value pairs from .env files and making them available as environment variables that our application can access.

- **Black 24.2.0** - Black is an opinionated Python code formatter that automatically formats code according to PEP 8 standards with minimal configuration required. We use Black because it eliminates debates about code formatting, ensures consistent code style across our entire team, and automatically fixes formatting issues. The tool works by parsing Python code and reformatting it according to its strict rules, which can be integrated into our development workflow and CI/CD pipeline.

- **isort 5.13.2** - isort is a Python utility that automatically sorts and organizes import statements according to PEP 8 guidelines, grouping standard library, third-party, and local imports separately. We use isort because properly organized imports make code more readable and help identify dependencies. The tool works by parsing Python files, categorizing import statements, and reordering them according to configurable rules.

- **MyPy 1.8.0** - MyPy is a static type checker for Python that analyzes code without executing it to find type-related errors before runtime. We use MyPy because it catches many common bugs during development, improves code documentation through type hints, and makes our codebase more maintainable. The tool works by analyzing type annotations and detecting inconsistencies, such as passing a string where an integer is expected.

### 🗄️ Database Schema (Supabase PostgreSQL)

#### **User Management**
```sql
users (
    id UUID PRIMARY KEY,
    email VARCHAR UNIQUE,
    display_name VARCHAR,
    preferences JSONB,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

#### **Workout Tracking**
```sql
workouts (
    id UUID PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    title VARCHAR,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    duration INTEGER,
    is_active BOOLEAN
)
```

#### **Exercise Library**
```sql
exercises (
    id UUID PRIMARY KEY,
    name VARCHAR UNIQUE,
    category VARCHAR,
    body_part VARCHAR[],
    equipment VARCHAR[],
    description TEXT
)
```

#### **Workout Sessions**
```sql
workout_exercises (
    id UUID PRIMARY KEY,
    workout_id UUID REFERENCES workouts(id),
    exercise_id UUID REFERENCES exercises(id),
    order_index INTEGER,
    notes TEXT
)

sets (
    id UUID PRIMARY KEY,
    workout_exercise_id UUID REFERENCES workout_exercises(id),
    reps INTEGER,
    weight DECIMAL,
    duration INTEGER,
    distance DECIMAL,
    completed BOOLEAN,
    rest_time INTEGER
)
```

---

## 🔄 Data Flow Architecture

### **Frontend → Backend Flow**
Our data flow follows a multi-layered architecture that ensures data consistency, security, and optimal performance across our full-stack fitness tracking application:

```
React Native Components (User Interface Layer)
        ↕
Zustand Stores (Client State Management)
        ↕  
React Query Hooks (Server State & Caching Layer)
        ↕
API Client (JWT Authentication & Request Management)
        ↕
FastAPI Endpoints (Business Logic & CRUD Operations)
        ↕
Supabase Database (Data Persistence & Row Level Security)
```

**How Data Flows Through Our Architecture:**

1. **User Interaction**: When a user interacts with our React Native interface (like adding a workout set), the UI components capture this action and update the relevant Zustand store with the new data.

2. **Client State Management**: Zustand stores immediately update the local application state, providing optimistic updates so the UI responds instantly while the actual API call is processed in the background.

3. **Server State Synchronization**: React Query hooks intercept the state change and automatically make API calls to sync the data with our backend, handling caching, error states, and retry logic automatically.

4. **Authenticated API Communication**: Our API client attaches JWT authentication tokens to all requests and manages token refresh automatically, ensuring secure communication with the backend.

5. **Backend Processing**: FastAPI endpoints receive the requests, validate the data using Pydantic models, apply business logic (like workout calculations), and perform database operations.

6. **Database Persistence**: Supabase PostgreSQL database stores the data with Row Level Security policies ensuring users can only access their own workout data, and real-time subscriptions notify connected clients of changes.

### **Authentication Flow**
Our authentication system implements a secure, modern JWT-based authentication flow with automatic token refresh to provide a seamless user experience:

```
Google OAuth Authentication → JWT Access Token (15 min) + Refresh Token (7 days)
        ↓
Secure Token Storage (Device Secure Storage)
        ↓
Authenticated API Requests (Bearer Token Authentication)
        ↓
Backend JWT Validation (Token Verification & User Context)
        ↓
Automatic Token Refresh (Seamless Token Rotation)
```

**How Authentication Works in Our System:**

1. **Google OAuth Integration**: When users sign in, they authenticate through Google's secure OAuth system, which verifies their identity and provides us with verified user information without us handling passwords directly.

2. **JWT Token Generation**: Our backend generates two types of tokens - short-lived access tokens (15 minutes) for API authentication and long-lived refresh tokens (7 days) for automatic re-authentication, balancing security with user experience.

3. **Secure Storage**: Tokens are stored in the device's secure storage (iOS Keychain, Android Keystore) rather than regular app storage, protecting them from unauthorized access even if the device is compromised.

4. **Authenticated Requests**: Every API request includes the access token in the Authorization header, allowing our backend to identify the user and authorize their actions without requiring login for each request.

5. **Token Validation**: Our FastAPI backend validates each JWT token to ensure it's authentic, not expired, and belongs to a valid user before processing any API request.

6. **Automatic Refresh**: When access tokens approach expiration, our system automatically uses the refresh token to obtain new access tokens, keeping users logged in without interrupting their workout sessions.

### **Real-time Synchronization**
Our real-time synchronization system ensures that workout data stays consistent across multiple devices and provides immediate feedback to users during their fitness sessions:

```
User Action (Frontend) → Optimistic UI Update (Zustand State)
        ↓
Background API Request (React Query) → Server Processing (FastAPI Validation)
        ↓
Database Persistence (Supabase) → Real-time Subscriptions (WebSocket)
        ↓
Cache Invalidation (React Query) → Component Re-render (React Native UI)
```

**How Real-time Data Synchronization Works:**

1. **Optimistic Updates**: When a user completes a set or updates their workout, the UI immediately reflects the change by updating the Zustand store, providing instant feedback even before the server confirms the action.

2. **Background Synchronization**: React Query automatically sends the update to our FastAPI backend in the background, handling network errors, retries, and offline scenarios without blocking the user interface.

3. **Server Validation & Processing**: Our FastAPI backend validates the workout data, applies business rules (like calculating totals, checking constraints), and processes the update before saving it to the database.

4. **Database Persistence**: Supabase PostgreSQL stores the validated data and immediately broadcasts the change to all connected clients through real-time WebSocket subscriptions.

5. **Automatic Cache Updates**: React Query receives the real-time update, invalidates relevant cached data, and triggers component re-renders to ensure all parts of the app display the most current information.

6. **Cross-Device Synchronization**: If the user has the app open on multiple devices, all devices receive the real-time updates automatically, keeping workout data synchronized across their entire ecosystem.

---

## 🏭 Environment Configuration

### **Development Environments**

#### **Local Development**
- **Frontend**: `localhost:8082` (Expo dev server)
- **Backend**: `localhost:8000` (FastAPI/Uvicorn)
- **Database**: Supabase cloud with local development option
- **Hot Reloading**: Enabled for rapid development

#### **Staging Environment** 
- **Frontend**: Expo staging builds
- **Backend**: `api-staging.fm-setlogger.com`
- **Database**: Staging Supabase instance
- **Configuration**: Limited debugging, performance optimized

#### **Production Environment**
- **Frontend**: Production Expo builds (iOS App Store, Google Play)
- **Backend**: Production API deployment (TBD)
- **Database**: Production Supabase instance with scaling
- **Configuration**: Full optimization, analytics enabled

### **Environment Switching**
```bash
# Frontend environment management
npm run env:local      # Switch to local environment
npm run env:development # Switch to development environment  
npm run env:staging    # Switch to staging environment
npm run env:production # Switch to production environment

# Start with specific environments
npm run start:local    # Local development with hot reload
npm run start:staging  # Staging environment testing
npm run start:production # Production environment validation
```

---

## 🧪 Testing Architecture

### **Frontend Testing Stack**
- **Jest 29.7.0** - JavaScript testing framework
- **React Testing Library 13.3.1** - Component testing utilities
- **React Test Renderer 19.0.0** - Component snapshot testing
- **Detox 20.40.2** - End-to-end testing framework
- **Testing Library User Event 14.6.1** - User interaction simulation

### **Backend Testing Stack**
- **pytest 8.0.0** - Python testing framework
- **pytest-asyncio 0.23.5** - Async test support
- **pytest-cov 4.0.0** - Coverage reporting
- **pytest-postgresql 5.0.0** - Database testing utilities

### **Test Categories**

#### **Frontend Tests (36/36 Passing)**
- **Design System Tests (22)** - NativeWind v4 validation, theme consistency
- **Component Tests (3)** - React Native component rendering
- **Integration Tests (9)** - Navigation, store connectivity, screen implementation
- **Smoke Tests (2)** - Basic infrastructure validation

#### **Backend Tests (Comprehensive Coverage)**
- **Unit Tests** - Individual service methods and utilities
- **Integration Tests** - Database interactions and API endpoints
- **Authentication Tests** - JWT lifecycle, refresh token rotation
- **Database Tests** - Supabase connection, RLS policies, CRUD operations

---

## 📱 Mobile Platform Support

### **iOS Support**
- **iOS 13.0+** - Minimum supported version
- **Expo SDK 53** - iOS-specific optimizations
- **App Store Ready** - Production build configuration
- **Native Features** - Haptic feedback, system integration

### **Android Support**
- **Android API 21+** - Minimum supported version (Android 5.0)
- **Google Play Ready** - Production build configuration  
- **Material Design** - Android-specific UI adaptations
- **Native Features** - Android-specific integrations

### **Web Support**
- **React Native Web 0.20.0** - Web platform support
- **Progressive Web App** - PWA capabilities
- **Desktop Responsive** - Adaptive layouts

---

## 🔐 Security Architecture

### **Authentication Security**
- **JWT Access Tokens** - 15-minute expiration for security
- **Refresh Token Rotation** - 7-day refresh with automatic rotation
- **Google OAuth Integration** - Industry-standard authentication
- **Secure Token Storage** - Platform-native secure storage

### **Database Security**
- **Row Level Security (RLS)** - Complete user data isolation
- **Prepared Statements** - SQL injection protection
- **HTTPS Everywhere** - All communications encrypted
- **Input Validation** - Comprehensive data validation with Pydantic

### **API Security**
- **CORS Configuration** - Proper cross-origin resource sharing
- **Rate Limiting** - API abuse prevention
- **Input Sanitization** - XSS and injection prevention
- **Error Handling** - Secure error messages without data leakage

---

## 📈 Performance Optimizations

### **Frontend Performance**
- **Zustand State Management** - 40% performance improvement over Context
- **React Query Caching** - Intelligent server state caching
- **AsyncStorage Debouncing** - Optimized local persistence
- **Component Memoization** - Reduced unnecessary re-renders
- **Image Optimization** - Expo Image with lazy loading

### **Backend Performance**
- **FastAPI Async** - High-performance async request handling
- **Database Connection Pooling** - Efficient database connections
- **Query Optimization** - Optimized SQL queries with proper indexing
- **Response Caching** - API response caching where appropriate

---

## 🚀 Deployment Architecture

### **Frontend Deployment**
- **Expo Application Services (EAS)** - Cloud build and submission
- **Over-the-Air Updates** - Instant app updates without app store
- **Code Push Integration** - Hot fixes and minor updates
- **Multi-platform Builds** - iOS and Android from single codebase

### **Backend Deployment**
- **Docker Containerization** - Consistent deployment environments
- **Cloud Platform Ready** - AWS, GCP, or Azure deployment
- **Environment Configuration** - Proper secrets management
- **Health Monitoring** - Application health checks and monitoring

---

## 📋 Development Workflow

### **Code Quality Tools**
- **ESLint 9.25.0** - JavaScript/TypeScript linting
- **TypeScript Strict Mode** - Type safety enforcement  
- **Black Code Formatter** - Python code formatting
- **Pre-commit Hooks** - Automated quality checks

### **Version Control**
- **Git-based Workflow** - Feature branch development
- **Conventional Commits** - Standardized commit messages
- **Pull Request Reviews** - Code review process
- **CI/CD Integration** - Automated testing and deployment

---

## 🔮 Future Scalability Considerations

### **Horizontal Scaling**
- **Microservices Architecture** - Service separation capability
- **Load Balancing** - Multi-instance deployment support
- **Database Sharding** - User-based data distribution
- **CDN Integration** - Global content delivery

### **Feature Extensibility**
- **Plugin Architecture** - Third-party integrations
- **API Versioning** - Backward compatibility
- **White-label Support** - Multi-tenant architecture
- **Advanced Analytics** - Data insights and reporting

---

## 📊 Development Status Summary

**Overall Progress**: 97% Complete
- ✅ **Frontend**: 98% complete, production-ready
- ✅ **Backend**: Phase 5.3.1 testing complete
- ✅ **Database**: Foundation with RLS implemented
- ✅ **Authentication**: Enhanced JWT with refresh tokens
- ✅ **Testing**: Comprehensive test coverage
- 🔄 **Deployment**: Implementation phase remaining

**Next Steps**: Final implementation phase for production deployment

---

*This technical architecture visualization provides a complete overview of the FM-SetLogger full-stack fitness tracking application, detailing all technologies, services, integrations, and architectural patterns used in the project.*