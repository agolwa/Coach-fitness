# Development Server Guide

This guide documents the development server setup and workflow for the FM-SetLogger React Native app following the completion of **P1.2: Restore Development Server Functionality**.

## Quick Start

```bash
# Start development server (recommended)
npm run dev

# Alternative commands
npm run start:clear    # Start with cache cleared
npm run start:tunnel   # Start with tunnel access
npm run start:dev      # Start with dev client
```

## Development Server Configuration

### Environment Variables
The development server uses environment variables from `.env.development`:

```env
EXPO_PUBLIC_API_URL=http://localhost:8000
EXPO_PUBLIC_DEV_SERVER_PORT=8081
EXPO_PUBLIC_DEV_SERVER_HOST=localhost
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_ENABLE_FAST_REFRESH=true
```

### Metro Bundler Configuration
Enhanced `metro.config.js` includes:
- CORS headers for cross-origin requests
- Hot reload optimizations
- Multi-platform support (iOS, Android, Web)
- NativeWind CSS processing

### Server Startup Process
1. Environment variables loaded from `.env.development`
2. Metro bundler starts with optimized configuration
3. Hot reload and debugging tools enabled
4. Server available on configured port (default: 8081, fallback: 8082)

## Hot Reload & Fast Refresh

### Fast Refresh Features
- ✅ Component state preservation during edits
- ✅ Error overlay for runtime errors
- ✅ Automatic recompilation on file changes
- ✅ Support for React Hooks and functional components

### Testing Hot Reload
1. Start development server: `npm run dev`
2. Open the app on a simulator or device
3. Edit a component file (e.g., `app/(tabs)/index.tsx`)
4. Observe changes reflected within 1-2 seconds

## Debugging Tools

### Available Debug Tools
- **React Developer Tools**: Automatic integration when available
- **Network Inspector**: Built into Expo DevTools
- **Performance Monitor**: Available in debug menu
- **LogBox**: Enhanced error reporting with stack traces

### Debugging Workflow
1. Shake device or press `Ctrl+M` (Android) / `Cmd+D` (iOS) to open debug menu
2. Select "Debug" to open Chrome DevTools
3. Use Network tab for API request debugging
4. Use Console for log output and error tracking

## Port Management

### Default Ports
- **Metro Bundler**: 8081 (fallback to 8082)
- **DevTools**: 19000
- **Expo DevTools**: 19001

### Handling Port Conflicts
```bash
# Check for port usage
lsof -i :8081 -i :8082

# Kill conflicting processes
kill -9 <PID>

# Start on specific port
npx expo start --port 8082
```

## Network Configuration

### Local Development
- **Localhost**: http://localhost:8081
- **LAN Access**: Enabled by default for testing on physical devices
- **Tunnel**: Available via `npm run start:tunnel` for external access

### CORS Configuration
The Metro bundler is configured to handle CORS automatically:
- Allows all origins in development (`*`)
- Supports standard HTTP methods (GET, POST, PUT, DELETE, OPTIONS)
- Headers configured for API communication

## Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Error: Port 8081 is already in use
# Solution: Use different port
npm run dev  # Uses port 8082 automatically
```

#### 2. Cache Issues
```bash
# Clear Metro cache
npm run start:clear
# Or manually
npx expo start --clear
```

#### 3. Hot Reload Not Working
```bash
# Restart server with fresh cache
npm run start:clear

# Check if Fast Refresh is enabled in .env.development
EXPO_PUBLIC_ENABLE_FAST_REFRESH=true
```

#### 4. Network Connection Problems
```bash
# Test server response
curl http://localhost:8081

# Check environment variables
npx expo config

# Reset network configuration
npx expo start --clear --reset-cache
```

### Configuration Validation
Run the development server test suite:
```bash
npm run test:dev-server
```

This validates:
- Server startup capability
- Hot reload configuration
- Debug tools availability
- Environment variable handling
- Network interface setup

## Performance Optimization

### Development Optimizations
- Bundler cache enabled for faster rebuilds
- Source maps configured for debugging
- Hot reload optimized for component state preservation
- Minification disabled in development for better debugging

### Memory Management
- Metro automatically manages bundle cache
- Hot reload preserves component state efficiently
- Background cache cleanup prevents memory leaks

## Platform-Specific Notes

### iOS Development
- Simulator accessible via localhost
- Physical device requires LAN or tunnel connection
- Touch gestures: Shake to open debug menu

### Android Development
- Emulator uses 10.0.2.2 for localhost access
- Physical device requires LAN or tunnel connection
- Hardware menu button or `Ctrl+M` for debug menu

### Web Development
```bash
npm run web
```
- Metro bundler serves web version
- Hot reload works with browser refresh
- React DevTools browser extension supported

## Development Scripts Reference

| Script | Command | Purpose |
|--------|---------|---------|
| `dev` | `expo start --clear --port 8082` | Recommended development server |
| `start` | `expo start` | Basic server start |
| `start:clear` | `expo start --clear` | Start with cleared cache |
| `start:tunnel` | `expo start --tunnel` | Start with tunnel for external access |
| `start:dev` | `expo start --clear --dev-client` | Start with dev client |
| `test:dev-server` | `jest __tests__/setup/dev-server.test.js` | Test server configuration |

## Success Criteria Validation

The P1.2 implementation meets all specified success criteria:

- ✅ **`npm start` launches without critical errors**: Server starts successfully with optimized configuration
- ✅ **Hot reload functions properly**: Fast Refresh enabled with state preservation
- ✅ **Debug tools accessible and functional**: React DevTools, Network Inspector, LogBox all working
- ✅ **Metro bundler operates without warnings**: Clean startup with optimized configuration

## Next Steps

After completing P1.2, the development environment is ready for:
- **P1.3**: Set up development Supabase project
- **P1.4**: Connect backend to real database
- **P1.5**: Set up development OAuth authentication
- **P1.6**: Validate full development workflow

---

*This documentation was created as part of P1.2 implementation following TDD methodology and comprehensive testing validation.*