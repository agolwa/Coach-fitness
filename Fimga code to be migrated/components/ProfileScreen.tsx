import { useState } from "react";
import { ArrowLeft, ChevronRight, ExternalLink, LogOut, MessageCircle, Moon, Sun, Trash2, User } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useWeightUnit } from "./WeightUnitProvider";
import { StatusBar } from "./StatusBar";
import { BottomNavigation } from "./BottomNavigation";
import { Switch } from "./ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "./ui/alert-dialog";

interface ProfileScreenProps {
  onBack: () => void;
  onHomeClick: () => void;
  onActivityClick: () => void;
  onSuggestFeature: () => void;
  onTermsAndConditions: () => void;
  onContactUs: () => void;
  onPrivacyPolicy: () => void;
  isSignedIn: boolean;
  isGuest: boolean;
  onSignOut: () => void;
  onSignUp: () => void;
}

export function ProfileScreen({ onBack, onHomeClick, onActivityClick, onSuggestFeature, onTermsAndConditions, onContactUs, onPrivacyPolicy, isSignedIn, isGuest, onSignOut, onSignUp }: ProfileScreenProps) {
  const { theme, toggleTheme } = useTheme();
  const { weightUnit, setWeightUnit, canChangeWeightUnit } = useWeightUnit();
  const [weekStartsOn, setWeekStartsOn] = useState("monday");
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showSignOutDialog, setShowSignOutDialog] = useState(false);
  const [showWeightUnitDialog, setShowWeightUnitDialog] = useState(false);

  const handleDeleteAccount = () => {
    setShowDeleteDialog(true);
  };

  const handleSignOut = () => {
    setShowSignOutDialog(true);
  };

  const handleConfirmDelete = () => {
    // Handle account deletion logic here
    console.log("Account deleted");
    setShowDeleteDialog(false);
    // Redirect to login or home
  };

  const handleConfirmSignOut = () => {
    onSignOut();
    setShowSignOutDialog(false);
  };

  const handleWeightUnitChange = (checked: boolean) => {
    const newUnit = checked ? 'lbs' : 'kg';
    if (canChangeWeightUnit) {
      setWeightUnit(newUnit);
    } else {
      setShowWeightUnitDialog(true);
    }
  };

  const menuItems = [
    {
      title: "Feedback & feature requests",
      icon: MessageCircle,
      action: onSuggestFeature
    },
    {
      title: "Terms & Conditions",
      icon: ExternalLink,
      action: onTermsAndConditions
    },
    {
      title: "Contact Us",
      icon: ExternalLink,
      action: onContactUs
    },
    {
      title: "Privacy Policy",
      icon: ExternalLink,
      action: onPrivacyPolicy
    }
  ];

  return (
    <div className="bg-background relative w-full h-dvh max-w-[440px] mx-auto overflow-hidden flex flex-col">
      <StatusBar />
      
      {/* Header */}
      <div className="px-6 py-4 mt-14 flex-shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 -m-2 rounded-lg"
          >
            <ArrowLeft className="w-6 h-6 text-foreground" />
          </button>
          <h1 className="text-foreground">Profile</h1>
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 pb-6">
          {/* User Avatar Section */}
          <div className="py-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <div>
                {isSignedIn ? (
                  <>
                    <h2 className="text-foreground">John Doe</h2>
                    <p className="text-muted-foreground">john.doe@example.com</p>
                  </>
                ) : (
                  <>
                    <h2 className="text-foreground">Guest User</h2>
                    <p className="text-muted-foreground">Sign up to save your workouts</p>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Guest Sign Up Prompt */}
          {isGuest && (
            <div className="card-uber p-4 mb-6 border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-foreground mb-1">Unlock Full Features</h4>
                  <p className="text-muted-foreground text-sm">Sign up to save workouts, track progress, and access your data across devices</p>
                </div>
                <button
                  onClick={onSignUp}
                  className="button-uber-primary ml-4 px-4 py-2 h-auto text-sm"
                >
                  Sign Up
                </button>
              </div>
            </div>
          )}

          {/* User Preferences Section - Available for all users */}
          <div className="space-y-6">
            <div className="mb-4">
              <h4 className="text-foreground">User Preferences</h4>
            </div>

            {/* Weight Unit Preference */}
            <div className="card-uber p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-foreground mb-1">Weight Unit</h4>
                  <p className="text-muted-foreground text-sm">Choose your preferred weight measurement</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${weightUnit === 'kg' ? 'text-primary' : 'text-muted-foreground'}`}>
                    KG
                  </span>
                  <Switch
                    checked={weightUnit === 'lbs'}
                    onCheckedChange={handleWeightUnitChange}
                  />
                  <span className={`text-sm ${weightUnit === 'lbs' ? 'text-primary' : 'text-muted-foreground'}`}>
                    LBS
                  </span>
                </div>
              </div>
            </div>

            {/* Week Starts On */}
            <div className="card-uber p-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-foreground mb-1">Week starts on</h4>
                  <p className="text-muted-foreground text-sm">Choose the first day of your week</p>
                </div>
                <div className="min-w-[120px]">
                  <Select value={weekStartsOn} onValueChange={setWeekStartsOn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sunday">Sunday</SelectItem>
                      <SelectItem value="monday">Monday</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Theme Preference */}
            <div className="card-uber p-4 mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-foreground mb-1">Theme</h4>
                  <p className="text-muted-foreground text-sm">Choose your preferred app appearance</p>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className={`w-4 h-4 ${theme === 'light' ? 'text-primary' : 'text-muted-foreground'}`} />
                  <Switch
                    checked={theme === 'dark'}
                    onCheckedChange={toggleTheme}
                  />
                  <Moon className={`w-4 h-4 ${theme === 'dark' ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <div className="space-y-4">
            {menuItems.map((item, index) => (
              <button
                key={index}
                onClick={item.action}
                className="card-uber w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-primary" />
                    </div>
                    <span className="text-foreground">{item.title}</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>

          {/* Account Actions - Only show for signed in users */}
          {isSignedIn && (
            <div className="space-y-4 mt-8">
              {/* Sign Out */}
              <button
                onClick={handleSignOut}
                className="card-uber w-full p-4 text-left"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <LogOut className="w-5 h-5 text-orange-600" />
                    </div>
                    <span className="text-foreground">Sign Out</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>

              {/* Delete Account */}
              <button
                onClick={handleDeleteAccount}
                className="card-uber w-full p-4 text-left border-destructive/20"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-destructive/10 rounded-full flex items-center justify-center">
                      <Trash2 className="w-5 h-5 text-destructive" />
                    </div>
                    <span className="text-destructive">Delete Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Sign Out Confirmation Dialog */}
      <AlertDialog open={showSignOutDialog} onOpenChange={setShowSignOutDialog}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Sign Out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out? You'll need to sign back in to access your workouts.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={() => setShowSignOutDialog(false)}
              className="button-uber-secondary w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSignOut}
              className="bg-orange-600 text-white hover:bg-orange-700 w-full sm:w-auto"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? This action cannot be undone and all your workout data will be permanently lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogCancel
              onClick={() => setShowDeleteDialog(false)}
              className="button-uber-secondary w-full sm:w-auto"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 w-full sm:w-auto"
            >
              Delete Account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Weight Unit Change Prevention Dialog */}
      <AlertDialog open={showWeightUnitDialog} onOpenChange={setShowWeightUnitDialog}>
        <AlertDialogContent className="max-w-[320px]">
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Update Units</AlertDialogTitle>
            <AlertDialogDescription>
              Cannot update units during a workout. Complete the workout and try again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col gap-2 sm:flex-row">
            <AlertDialogAction
              onClick={() => setShowWeightUnitDialog(false)}
              className="button-uber-primary w-full sm:w-auto"
            >
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bottom Navigation */}
      <div className="flex-shrink-0">
        <BottomNavigation 
          onHomeClick={onHomeClick}
          onActivityClick={onActivityClick}
          currentScreen="profile"
        />
      </div>
    </div>
  );
}