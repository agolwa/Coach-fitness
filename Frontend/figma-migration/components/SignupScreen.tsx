import { ArrowLeft } from "lucide-react";
import { StatusBar } from "./StatusBar";

interface SignupScreenProps {
  onBack?: () => void;
  onGoogleSignup: () => void;
  onTryWithoutSignup: () => void;
}

export function SignupScreen({ onBack, onGoogleSignup, onTryWithoutSignup }: SignupScreenProps) {
  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />
      
      {/* Header with back button */}
      {onBack && (
        <div className="px-6 py-4 mt-14 flex-shrink-0">
          <div className="flex items-center">
            <button 
              onClick={onBack}
              className="p-2 -m-2 hover:bg-accent rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-foreground" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        {/* Top Section - Logo and Welcome */}
        <div className="flex flex-col items-center justify-center flex-1">
          {/* Logo Section */}
          <div className="text-center mb-8">
            {/* App Icon */}
            <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center mb-6 mx-auto shadow-lg">
              <span className="text-4xl">🏋🏼‍♂️</span>
            </div>
            
            {/* App Name */}
            <h1 className="text-foreground mb-2">VoiceLog</h1>
            <p className="text-muted-foreground">
              AI-powered workout logging
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center">
            <h2 className="text-foreground mb-2">Welcome to VoiceLog</h2>
            <p className="text-muted-foreground max-w-sm">
              Track your workouts effortlessly with voice commands and smart logging
            </p>
          </div>
        </div>

        {/* Bottom Section - Signup Button and Terms */}
        <div className="flex flex-col items-center space-y-6 pb-4">
          {/* Google Sign Up Button */}
          <div className="w-full max-w-sm space-y-3">
            <button
              onClick={onGoogleSignup}
              className="w-full bg-card border border-border rounded-lg px-6 py-4 flex items-center justify-center gap-3 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {/* Google Logo SVG */}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              
              <span className="text-foreground font-medium">
                Continue with Google
              </span>
            </button>

            {/* Try without signup button */}
            <button
              onClick={onTryWithoutSignup}
              className="w-full bg-transparent border border-border rounded-lg px-6 py-4 flex items-center justify-center transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="text-muted-foreground font-medium">
                Try without signup
              </span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="text-center max-w-sm">
            <p className="text-xs text-muted-foreground leading-relaxed">
              By continuing, you agree to our{" "}
              <span className="text-muted-foreground">
                Terms of Service
              </span>{" "}
              and{" "}
              <span className="text-muted-foreground">
                Privacy Policy
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 pb-8">
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            Made with ❤️ for fitness enthusiasts
          </p>
        </div>
      </div>
    </div>
  );
}