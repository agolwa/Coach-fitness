import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { StatusBar } from "./StatusBar";
import { Textarea } from "./ui/textarea";
import { Button } from "./ui/button";
import { toast } from "sonner@2.0.3";

interface SuggestFeatureScreenProps {
  onBack: () => void;
}

export function SuggestFeatureScreen({ onBack }: SuggestFeatureScreenProps) {
  const [suggestion, setSuggestion] = useState("");
  const maxCharacters = 250;
  const remainingCharacters = maxCharacters - suggestion.length;

  const handleSubmit = () => {
    if (suggestion.trim().length === 0) {
      toast.error("Please enter your feedback");
      return;
    }

    if (!hasMeaningfulContent(suggestion)) {
      toast.error("Please enter meaningful feedback text");
      return;
    }

    // Here you would typically send the feedback to your backend
    console.log("Feedback submitted:", suggestion);
    toast.success("Thank you for your feedback!");
    
    // Clear the form and go back
    setSuggestion("");
    setTimeout(() => {
      onBack();
    }, 1500);
  };

  // Validate input to only allow text and numbers (NO LINE BREAKS)
  const validateInput = (text: string): string => {
    // Remove any non-text characters except basic punctuation and numbers
    // Allow: letters, numbers, spaces, basic punctuation (.,!?;:'"()[]{}/@#$%^&*-+=~`|\\)
    let cleanText = text.replace(/[^\w\s.,!?;:'"()[\]{}/@#$%^&*\-+=~`|\\]/g, '');
    
    // COMPLETELY REMOVE ALL LINE BREAKS
    cleanText = cleanText.replace(/\n+/g, ' ');
    cleanText = cleanText.replace(/\r+/g, ' ');
    
    // Clean up multiple spaces
    cleanText = cleanText.replace(/\s+/g, ' ');
    
    return cleanText;
  };

  // Check if text has meaningful content (not just whitespace)
  const hasMeaningfulContent = (text: string): boolean => {
    const trimmed = text.trim();
    return trimmed.length > 0;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newText = e.target.value;
    
    // Validate and clean the input
    newText = validateInput(newText);
    
    if (newText.length <= maxCharacters) {
      setSuggestion(newText);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    e.preventDefault();
    
    const clipboardData = e.clipboardData || (window as any).clipboardData;
    const pastedText = clipboardData.getData('text');
    
    // Check if clipboard contains files (images, videos, etc.)
    const items = clipboardData.items;
    let hasMediaContent = false;
    
    if (items) {
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith('image/') || 
            item.type.startsWith('video/') || 
            item.type.startsWith('audio/') ||
            item.type.includes('gif')) {
          hasMediaContent = true;
          break;
        }
      }
    }
    
    if (hasMediaContent) {
      toast.error("Images, videos, and other media files are not allowed. Please paste text only.");
      return;
    }
    
    // Process the text paste
    if (pastedText) {
      const cleanText = validateInput(pastedText);
      const currentText = suggestion;
      const newText = currentText + cleanText;
      
      if (newText.length <= maxCharacters) {
        setSuggestion(newText);
      } else {
        // Truncate to max characters and show warning
        const truncatedText = newText.substring(0, maxCharacters);
        setSuggestion(truncatedText);
        toast.warning("Text was truncated to fit the character limit.");
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent certain key combinations that might insert unwanted content
    if (e.ctrlKey || e.metaKey) {
      // Allow common shortcuts but prevent others
      const allowedKeys = ['a', 'c', 'v', 'x', 'z', 'y'];
      if (!allowedKeys.includes(e.key.toLowerCase())) {
        e.preventDefault();
      }
    }

    // COMPLETELY PREVENT ENTER/RETURN KEYS - No line breaks allowed
    if (e.key === 'Enter' || e.key === 'Return') {
      e.preventDefault();
      toast.warning("Line breaks are not allowed. Please write your feedback in a single paragraph.");
      return;
    }
  };

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
          <h1 className="text-foreground">Feedback & feature requests</h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-6 flex flex-col overflow-hidden">
        <div className="space-y-4 flex-1 flex flex-col">
          <div>
            <p className="text-muted-foreground mb-4 font-normal">
              Have feedback or ideas to improve the app? We'd love to hear from you! Share your thoughts below.
            </p>
          </div>

          <div className="space-y-2 flex-1 flex flex-col">
            <label htmlFor="suggestion" className="text-foreground p-[0px]">
              Your Feedback
            </label>
            
            {/* Textarea Container with controlled height */}
            <div className="flex-1 flex flex-col min-h-0">
              <Textarea
                id="suggestion"
                placeholder="Share your feedback or feature idea..."
                value={suggestion}
                onChange={handleTextChange}
                onPaste={handlePaste}
                onKeyDown={handleKeyDown}
                className="min-h-64 max-h-96 resize-none textarea-uber mx-[0px] p-[10px] flex-1 overflow-y-auto border-2 border-border"
                maxLength={maxCharacters}
                style={{
                  maxHeight: 'min(24rem, calc(100vh - 400px))', // Responsive max height - doubled
                }}
              />
              
              {/* Character Counter - Right after textarea */}
              <div className="flex justify-end mt-1">
                <span 
                  className={`text-sm ${
                    remainingCharacters < 10 
                      ? 'text-destructive' 
                      : 'text-muted-foreground'
                  }`}
                >
                  {remainingCharacters} characters remaining
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-8 flex-shrink-0">
          <Button
            onClick={handleSubmit}
            disabled={suggestion.trim().length === 0 || !hasMeaningfulContent(suggestion)}
            className="button-uber-primary w-full h-14"
          >
            Submit Feedback
          </Button>
        </div>
      </div>
    </div>
  );
}