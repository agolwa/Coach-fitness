# 🚀 Development to Production Roadmap for FM-SetLogger

## Overview
This document outlines the systematic approach to take the FM-SetLogger fitness tracking application from development to production. The plan is organized in phases, with Phase 0 focusing on immediate authentication fixes to enable proper testing.

**UPDATED:** This plan now incorporates code review recommendations focusing on component standardization, refresh token implementation, environment configuration centralization, and state management discipline.

---

## Phase 0: Immediate Authentication Fix (30 mins)
**Goal:** Enable proper login flow in simulator without dev validation checks

### Tasks:
1. **Remove Auto Test User Login**
   - Remove automatic test user authentication in `user-store.ts`
   - Remove all `__DEV__` validation bypasses
   - Clean up test@example.com hardcoded credentials

2. **Fix OAuth Configuration**
   - Add Google Client ID to `.env.local` for development testing
   - Configure proper OAuth redirect URLs in Supabase dashboard
   - Test real Google OAuth flow in simulator

### Files to Modify:
- `Frontend/coach/stores/user-store.ts`
- `Frontend/coach/.env.local`
- `Frontend/coach/app/(auth)/signup.tsx`

---

## Phase 1: Error Resolution & Component Standardization (4-5 hours)
**Goal:** Fix existing issues, clean up technical debt, and create reusable component library

### Tasks:
1. **Backend & Frontend Test Cleanup (2 hours)**
   - Resolve pytest-asyncio compatibility error
   - Update deprecated Pydantic configurations
   - Fix SSL warnings with urllib3
   - Update test dependencies in requirements.txt
   - Fix dotenv multiple injection warnings
   - Resolve API URL configuration warnings in tests
   - Clean up test console output
   - Update jest configuration

2. **Component Library Creation (2-3 hours) [NEW - CRITICAL FOR CONSISTENCY]**
   - **Create Core UI Components:**
     - `Frontend/coach/components/ui/Button.tsx`
       - Variants: primary, secondary, destructive, ghost, link
       - Sizes: default, sm, lg, icon
       - Loading states with spinner
       - Use class-variance-authority for clean variant management
     - Enhance existing `Frontend/coach/components/ui/card.tsx`
       - Add CardHeader, CardContent, CardFooter sub-components
       - Standardize padding and border styles
   
   - **Refactor Existing Code:**
     - Replace manual TouchableOpacity implementations with Button component
     - Update all card patterns to use Card component
     - Ensure consistency across auth screens and workout pages
     - Example refactoring:
       ```typescript
       // Before:
       <TouchableOpacity onPress={handleSignIn} className="bg-primary rounded-xl py-3 px-6">
         <Text className="text-primary-foreground font-semibold">Sign In</Text>
       </TouchableOpacity>
       
       // After:
       <Button variant="primary" onPress={handleSignIn}>
         Sign In
       </Button>
       ```

3. **Code Quality**
   - Remove all development-only code paths
   - Clean up console.log statements
   - Remove mock authentication flows
   - Standardize error handling

### Success Criteria:
- [ ] All tests pass without warnings
- [ ] No development-specific code in production paths
- [ ] Clean console output
- [ ] Consistent UI components across the app
- [ ] Button and Card components fully implemented and adopted

---

## Phase 2: Production Environment & Configuration Centralization (4-5 hours)
**Goal:** Configure all production services and centralize environment configuration

### Tasks:
1. **Supabase Production Instance (2 hours)**
   ```sql
   -- Required database setup
   - Create production Supabase project
   - Migrate database schema
   - Configure Row Level Security policies
   - Set up database backups
   - Configure Google OAuth in Supabase Auth
   ```

2. **Environment Configuration Centralization (1-2 hours) [NEW - ARCHITECTURE IMPROVEMENT]**
   - **Enhance `app.config.js`:**
     ```javascript
     import 'dotenv/config';
     import { Platform } from 'react-native';

     const getApiUrl = () => {
       const env = process.env.APP_ENV || 'development';
       let baseUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

       // Transform URL during config phase, not runtime
       if (env === 'development' && Platform.OS === 'android') {
         baseUrl = baseUrl.replace('localhost', '10.0.2.2');
       }
       return baseUrl;
     };

     export default {
       // ... other expo config
       extra: {
         eas: { projectId: '...' },
         API_URL: getApiUrl(), // Provide final, platform-specific URL
       },
     };
     ```
   
   - **Simplify `api-client.ts`:**
     ```typescript
     import Constants from 'expo-constants';

     const getBaseURL = (): string => {
       // No more platform checks here! Clean and simple
       return Constants.expoConfig?.extra?.API_URL;
     };
     ```

3. **Backend Production Config**
   ```env
   # .env.production
   SUPABASE_URL=https://your-prod-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-prod-service-key
   JWT_SECRET_KEY=<generate-32-char-secure-key>
   JWT_ALGORITHM=HS256
   JWT_ACCESS_TOKEN_EXPIRE_MINUTES=15
   JWT_REFRESH_TOKEN_EXPIRE_DAYS=7
   DEBUG=false
   TESTING=false
   CORS_ORIGINS=https://your-domain.com
   ```

4. **Frontend Production Config**
   ```env
   # .env.production
   EXPO_PUBLIC_API_URL=https://api.fm-setlogger.com
   EXPO_PUBLIC_SUPABASE_URL=https://your-prod.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-prod-anon-key
   EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-prod-google-client-id
   EXPO_PUBLIC_ENABLE_ANALYTICS=true
   EXPO_PUBLIC_ENABLE_CRASH_REPORTING=true
   ```

### Infrastructure Requirements:
- [ ] Production Supabase project
- [ ] SSL certificates
- [ ] Domain names (API + app)
- [ ] CDN configuration

---

## Phase 3: Security & Authentication Hardening (5-6 hours)
**Goal:** Implement production-grade security with refresh token strategy

### Tasks:
1. **Refresh Token Implementation - Backend (2-3 hours) [CRITICAL - UX REQUIREMENT]**
   - **Enhance `Backend/services/token_service.py`:**
     - Generate token pairs (access + refresh)
     - Implement token family tracking with UUID for security
     - Add refresh token rotation mechanism
     - Configure: Access token (15 min), Refresh token (7 days)
     - Add token blacklisting mechanism
   
   - **Update Authentication Endpoints:**
     - Modify `/auth/login` and `/auth/google` to return both tokens
     - Create `POST /auth/refresh` endpoint
     - Add refresh token invalidation for logout
   
   - **Database Changes:**
     - Create refresh_tokens table or add token_family column
     - Implement secure token storage and lookup

2. **Refresh Token Implementation - Frontend (2-3 hours) [CRITICAL - UX REQUIREMENT]**
   - **Update `Frontend/coach/services/api-client.ts`:**
     - Implement full 401 interceptor logic:
       1. Pause all outgoing API requests
       2. Request new token with refresh endpoint
       3. Store new access token securely
       4. Retry original request with new token
       5. Resume paused requests
       6. If refresh fails, log user out
   
   - **Token Storage Enhancement:**
     - Use React Native Keychain/Keystore for secure token storage
     - Separate access and refresh token management
     - Handle token persistence across app restarts
     - Manage concurrent refresh requests

3. **Additional Security Hardening (1 hour)**
   - **API Security**
     ```python
     # Required implementations
     - Request validation middleware
     - Input sanitization
     - HTTPS enforcement
     - Rate limiting: 100 req/min per IP on auth endpoints
     ```
   
   - **Mobile Security**
     ```typescript
     // Required implementations
     - Secure storage for tokens (Keychain/Keystore)
     - Certificate pinning
     - ProGuard rules (Android)
     - App Transport Security (iOS)
     ```

### Security Checklist:
- [ ] Refresh token rotation implemented
- [ ] Token blacklisting for logout
- [ ] No sensitive data in logs
- [ ] All endpoints authenticated
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] CSRF tokens implemented
- [ ] Secure token storage on mobile

---

## Phase 4: Error Handling & Edge Cases (3-4 hours)
**Goal:** Handle all failure scenarios gracefully, especially auth edge cases

### Tasks:
1. **Network Error Handling**
   ```typescript
   // Implement retry logic
   const retryConfig = {
     maxRetries: 3,
     backoffMultiplier: 2,
     initialDelay: 1000,
     maxDelay: 10000
   };
   ```

2. **Authentication Edge Cases [EXPANDED]**
   - Handle token refresh failures gracefully
   - Manage concurrent refresh requests (prevent multiple simultaneous refreshes)
   - Handle OAuth cancellation
   - Implement account recovery flow
   - Session timeout handling
   - Token refresh during active workout sessions
   - Handle refresh token expiration

3. **Data Validation**
   - Comprehensive input validation
   - Data migration strategies
   - Handle corrupt local storage
   - Data consistency checks
   - Conflict resolution

### Edge Cases to Handle:
- [ ] Network disconnection during workout
- [ ] Token expiry during active session
- [ ] Concurrent token refresh requests
- [ ] OAuth provider downtime
- [ ] Database connection failures
- [ ] Storage quota exceeded

---

## Phase 5: Performance Optimization (2-3 hours)
**Goal:** Optimize for production performance

### Tasks:
1. **Frontend Optimization**
   ```javascript
   // Metro config optimizations
   - Code splitting by route
   - Bundle size optimization (<5MB)
   - Lazy loading for screens
   - Image optimization (WebP support)
   - Font subsetting
   ```

2. **Backend Optimization**
   ```sql
   -- Database optimizations
   CREATE INDEX idx_workouts_user_id ON workouts(user_id);
   CREATE INDEX idx_exercises_workout_id ON workout_exercises(workout_id);
   CREATE INDEX idx_refresh_tokens_family ON refresh_tokens(token_family);
   -- Add more as needed
   ```

3. **API Optimization**
   - Request batching
   - Response compression (gzip)
   - CDN for static assets
   - Optimize payload sizes
   - Implement caching headers

### Performance Targets:
- [ ] App launch time < 2s
- [ ] API response time < 200ms (p95)
- [ ] Bundle size < 5MB
- [ ] 60fps UI interactions

---

## Phase 6: Monitoring & Analytics (2-3 hours)
**Goal:** Set up production monitoring

### Tasks:
1. **Error Monitoring**
   ```typescript
   // Sentry configuration
   Sentry.init({
     dsn: "your-sentry-dsn",
     environment: "production",
     tracesSampleRate: 0.1,
   });
   ```

2. **Analytics Setup**
   - User analytics (Mixpanel/Amplitude)
   - Track key metrics:
     - Daily Active Users (DAU)
     - Workout completion rate
     - Feature adoption
     - User retention (D1, D7, D30)
     - Authentication success/failure rates

3. **Logging Infrastructure**
   - Structured logging (JSON format)
   - Log aggregation (CloudWatch/Datadog)
   - Audit logging for sensitive operations
   - Security event logging (failed auth attempts)

### Monitoring Dashboard:
- [ ] Error rate monitoring
- [ ] API latency graphs
- [ ] User activity metrics
- [ ] Database performance
- [ ] Infrastructure health
- [ ] Authentication metrics

---

## Phase 7: Testing & Validation (4-5 hours)
**Goal:** Comprehensive testing before launch, including new components and auth flows

### Tasks:
1. **Component Library Testing (1 hour) [NEW]**
   - Unit tests for Button and Card components
   - Visual regression tests for UI consistency
   - Accessibility testing for new components
   - Test all button variants and sizes

2. **Refresh Token Testing (1 hour) [NEW - CRITICAL]**
   - Test complete token refresh flow end-to-end
   - Verify concurrent refresh request handling
   - Test token expiration scenarios during active sessions
   - Test refresh token rotation security
   - Test logout token invalidation

3. **End-to-End Testing (2 hours)**
   ```typescript
   // Critical user journeys to test
   - New user signup flow with Google OAuth
   - Complete workout session with token refresh
   - Offline to online sync
   - Data export/import
   - Account deletion
   ```

4. **Load Testing (1 hour)**
   ```bash
   # Using k6 or similar
   - Test 1000 concurrent users
   - Validate rate limiting on auth endpoints
   - Check database performance with token operations
   - Monitor resource usage
   ```

5. **Security Testing**
   - OWASP compliance check
   - Penetration testing
   - Authentication flow audit
   - Data encryption validation

### Test Coverage Requirements:
- [ ] Unit tests > 80%
- [ ] Integration tests for all APIs
- [ ] E2E tests for critical paths
- [ ] Component library tests pass
- [ ] Token refresh flow tests pass
- [ ] Performance benchmarks met
- [ ] Security audit passed

---

## Phase 8: Documentation & Maintainability (3-4 hours)
**Goal:** Document system and establish maintainability guidelines

### Tasks:
1. **State Management Documentation (1 hour) [NEW - CRITICAL FOR TEAM]**
   - Create `Frontend/coach/docs/STATE_MANAGEMENT.md`:
     ```markdown
     ## State Management Decision Tree
     
     1. Is the data from/to the backend API?
        → YES: Use React Query (server state)
     
     2. Is the data local to a single component?
        → YES: Use useState/useReducer (component state)
     
     3. Is the data client-side but shared across components?
        → YES: Use Zustand (global client state)
     
     Special Case: If global client state needs server data,
     use React Query onSuccess callbacks to update Zustand.
     ```

2. **Service Refactoring Guidelines (30 minutes) [NEW - FUTURE MAINTAINABILITY]**
   - Document refactoring triggers in `Backend/docs/ARCHITECTURE.md`:
     - Service > 500 lines → Consider splitting
     - Service spans > 3 conceptual domains → Extract new service
     - Example: When to create UserProfileService vs extending AuthService

3. **Component Library Documentation (30 minutes) [NEW]**
   - Document Button and Card component APIs
   - Usage examples for each variant
   - Design system integration guide

4. **Standard Documentation (1.5 hours)**
   - Deployment guide
   - Environment variables reference
   - Troubleshooting guide
   - Operations runbook
   - API documentation

### Documentation Deliverables:
- [ ] State management decision tree documented
- [ ] Service refactoring guidelines established
- [ ] Component library documentation complete
- [ ] Deployment procedures documented

---

## Phase 9: Production Launch (1-2 days)
**Goal:** Deploy to production

### Tasks:
1. **Staged Rollout**
   ```
   Day 1: Internal team (10 users)
   Day 2: Beta testers (100 users) - Monitor token refresh behavior
   Day 3: 10% of users - Watch authentication metrics
   Day 5: 50% of users
   Day 7: 100% rollout
   ```

2. **Launch Monitoring**
   - Real-time error monitoring
   - Performance metrics tracking
   - User feedback collection
   - Support ticket monitoring
   - Social media monitoring
   - Token refresh success rates

3. **Post-Launch**
   - Daily standup for first week
   - Address critical issues immediately
   - Gather and prioritize feedback
   - Plan hotfix releases if needed

### Success Metrics:
- [ ] < 0.1% crash rate
- [ ] < 1% error rate
- [ ] > 95% token refresh success rate
- [ ] > 4.5 app store rating
- [ ] < 2s average load time
- [ ] > 60% D1 retention

---

## 📊 UPDATED Timeline Summary

| Phase | Duration | Priority | Key Additions |
|-------|----------|----------|---------------|
| Phase 0: Auth Fix | 30 mins | CRITICAL | Remove dev bypasses |
| Phase 1: Errors & Components | 4-5 hours | HIGH | **Component library** |
| Phase 2: Prod Environment | 4-5 hours | HIGH | **Config centralization** |
| Phase 3: Security | 5-6 hours | CRITICAL | **Refresh token implementation** |
| Phase 4: Edge Cases | 3-4 hours | MEDIUM | Auth edge cases |
| Phase 5: Performance | 2-3 hours | MEDIUM | Unchanged |
| Phase 6: Monitoring | 2-3 hours | MEDIUM | Auth metrics |
| Phase 7: Testing | 4-5 hours | HIGH | **Component & auth testing** |
| Phase 8: Documentation | 3-4 hours | HIGH | **State mgmt & maintainability docs** |
| Phase 9: Launch | 1-2 days | CRITICAL | Monitor auth metrics |

**Total Timeline:** 4-5 days of focused development work (increased from 3-4 days)

---

## 🎯 Critical Path Items [UPDATED]

### MUST DO BEFORE LAUNCH:
1. **Phase 0:** Remove all dev authentication bypasses
2. **Phase 1B:** Component library creation and adoption
3. **Phase 3A&B:** Complete refresh token implementation (backend + frontend)
4. **Phase 2B:** Environment configuration centralization

### HIGH VALUE IMPROVEMENTS:
- Reusable component library for long-term consistency
- State management documentation for team alignment
- Service refactoring guidelines for maintainable growth
- Centralized environment configuration

### PRODUCTION READINESS:
- Refresh token strategy for mobile UX
- Secret management via platform injection
- Comprehensive auth flow testing
- Performance monitoring with auth metrics

---

## 🔑 Critical Dependencies

### Required Services:
- [ ] Production Supabase instance
- [ ] Google OAuth Client ID (iOS & Android)
- [ ] SSL certificates for API domain
- [ ] App Store Developer Account
- [ ] Google Play Developer Account
- [ ] Sentry account for monitoring
- [ ] Analytics service account
- [ ] **class-variance-authority package for component variants**

### Required Credentials:
- [ ] Production database credentials
- [ ] JWT signing keys (both access and refresh)
- [ ] OAuth client secrets
- [ ] Push notification certificates
- [ ] Code signing certificates

---

## 🚨 Risk Mitigation [UPDATED]

### Potential Risks:
1. **OAuth Configuration Issues**
   - Mitigation: Test thoroughly in staging
   - Fallback: Email/password authentication

2. **Refresh Token Implementation Complexity**
   - Mitigation: Implement and test in phases
   - Fallback: Extend access token lifetime temporarily

3. **Component Library Adoption**
   - Mitigation: Refactor incrementally, test each change
   - Fallback: Keep old components until full migration

4. **Database Migration Failures**
   - Mitigation: Test migrations on staging
   - Fallback: Rollback procedures ready

5. **Performance Degradation**
   - Mitigation: Load testing before launch
   - Fallback: Horizontal scaling ready

---

## 📝 Notes [UPDATED]

### Immediate Actions (Today):
1. Start with Phase 0 - Remove dev authentication bypasses
2. Begin component library planning and class-variance-authority setup
3. Plan refresh token database schema changes
4. Set up production Supabase instance

### Team Responsibilities:
- **Backend**: Refresh token implementation, API security
- **Frontend**: Component library, token management, OAuth integration
- **DevOps**: Infrastructure, monitoring, CI/CD
- **QA**: Auth flow testing, component testing, validation

### Communication Plan:
- Daily standups during implementation phases
- Code review focus on component consistency
- Auth flow testing in staging environment
- Slack channel for production issues

---

## 📚 References [UPDATED]

- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)
- [React Native Production Guide](https://reactnative.dev/docs/performance)
- [FastAPI Production Deployment](https://fastapi.tiangolo.com/deployment/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- **[Class Variance Authority Documentation](https://cva.style/docs)**
- **[JWT Refresh Token Best Practices](https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/)**
- **[React Native Secure Storage](https://github.com/emeraldsanto/react-native-encrypted-storage)**

---

*Last Updated: January 2025*
*Version: 2.0.0 - Incorporates code review recommendations*