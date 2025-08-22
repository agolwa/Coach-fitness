import { useState, useEffect, useRef } from "react";
import { Mic, Plus, X, Check, ArrowUp } from "lucide-react";

interface MicrophoneSectionProps {
  onAddExercise: () => void;
}

type RecordingState = 'idle' | 'recording' | 'transcribed';

export function MicrophoneSection({ onAddExercise }: MicrophoneSectionProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [transcribedText, setTranscribedText] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Character limit for transcribed text
  const MAX_TRANSCRIBED_LENGTH = 200;
  
  // Max height for textarea (8 lines based on line-height: 1.25rem)
  const MAX_TEXTAREA_HEIGHT = 160; // 8 lines * 20px (1.25rem) = 160px
  
  // State to track if text was truncated
  const [wasTruncated, setWasTruncated] = useState(false);

  const handleMicrophoneClick = () => {
    if (recordingState === 'idle') {
      // Start recording
      setRecordingState('recording');
    }
  };

  // Smart text truncation function
  const truncateTextToLimits = (text: string): { truncatedText: string; wasTruncated: boolean } => {
    // First, check character limit
    let workingText = text;
    let isTruncated = false;
    
    if (workingText.length > MAX_TRANSCRIBED_LENGTH) {
      workingText = workingText.substring(0, MAX_TRANSCRIBED_LENGTH);
      isTruncated = true;
      
      // Try to truncate at word boundary for better readability
      const lastSpaceIndex = workingText.lastIndexOf(' ');
      if (lastSpaceIndex > MAX_TRANSCRIBED_LENGTH * 0.8) { // Only if we're not losing too much text
        workingText = workingText.substring(0, lastSpaceIndex);
      }
    }
    
    // Then check height limit by testing with a virtual textarea
    if (inputRef.current) {
      const testTextarea = document.createElement('textarea');
      const computedStyle = window.getComputedStyle(inputRef.current);
      
      // Copy relevant styles
      testTextarea.style.position = 'absolute';
      testTextarea.style.visibility = 'hidden';
      testTextarea.style.height = 'auto';
      testTextarea.style.width = inputRef.current.offsetWidth + 'px';
      testTextarea.style.padding = computedStyle.padding;
      testTextarea.style.border = computedStyle.border;
      testTextarea.style.fontSize = computedStyle.fontSize;
      testTextarea.style.fontFamily = computedStyle.fontFamily;
      testTextarea.style.lineHeight = computedStyle.lineHeight;
      testTextarea.style.boxSizing = computedStyle.boxSizing;
      
      document.body.appendChild(testTextarea);
      
      // If text exceeds height, progressively truncate
      testTextarea.value = workingText;
      while (testTextarea.scrollHeight > MAX_TEXTAREA_HEIGHT && workingText.length > 0) {
        isTruncated = true;
        
        // Try to truncate at word boundary first
        const lastSpaceIndex = workingText.lastIndexOf(' ');
        if (lastSpaceIndex > workingText.length * 0.7) {
          workingText = workingText.substring(0, lastSpaceIndex);
        } else {
          // If no good word boundary, truncate by character
          workingText = workingText.substring(0, workingText.length - 10);
        }
        
        testTextarea.value = workingText;
      }
      
      document.body.removeChild(testTextarea);
    }
    
    return { truncatedText: workingText.trim(), wasTruncated: isTruncated };
  };

  const handleDoneClick = () => {
    if (recordingState === 'recording') {
      // Simulate transcription process
      setRecordingState('transcribed');
      
      // Simulate a longer transcribed text that might exceed limits
      const simulatedLongText = 'Chest press 3 sets of 12 reps at 135 pounds with 2 minute rest between sets. Then lat pulldowns 4 sets of 10 reps at 120 pounds focusing on slow controlled movements. After that shoulder press 3 sets of 8 reps at 85 pounds making sure to maintain proper form throughout the entire range of motion and keeping core engaged for stability.';
      
      // Apply truncation logic
      const { truncatedText, wasTruncated } = truncateTextToLimits(simulatedLongText);
      
      setTranscribedText(truncatedText);
      setWasTruncated(wasTruncated);
    }
  };

  const handleTranscribedTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Allow all typing, but truncate if it exceeds limits
    let finalValue = newValue;
    
    // Enforce character limit by truncating
    if (finalValue.length > MAX_TRANSCRIBED_LENGTH) {
      finalValue = finalValue.substring(0, MAX_TRANSCRIBED_LENGTH);
    }
    
    setTranscribedText(finalValue);
    
    // Auto-resize the textarea
    setTimeout(() => {
      if (inputRef.current) {
        autoResize(inputRef.current);
      }
    }, 0);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent all Enter key presses to avoid new lines and overflow
    if (e.key === 'Enter') {
      e.preventDefault();
      // Only send if it's Enter without Shift
      if (!e.shiftKey) {
        handleSendClick();
      }
      // Block Shift+Enter as well to prevent new lines
    }
    // Let all other keys work normally - the onChange handler will manage limits
  };

  const handleSendClick = () => {
    if (recordingState === 'transcribed') {
      // Process the transcribed text (could add exercises here)
      console.log('Sending transcribed text:', transcribedText);
      
      // Reset to initial state
      setRecordingState('idle');
      setTranscribedText('');
      setWasTruncated(false);
      
      // You could parse the transcribed text and add exercises here
      // For now, just show a toast or similar feedback
    }
  };

  const handleDiscardClick = () => {
    // Reset to initial state from any state
    setRecordingState('idle');
    setTranscribedText('');
    setWasTruncated(false);
  };

  const handleAddExerciseClick = () => {
    if (recordingState === 'idle') {
      onAddExercise();
    }
  };

  // Get character count info for transcribed text
  const getTranscribedCharacterInfo = () => {
    const current = transcribedText.length;
    const remaining = MAX_TRANSCRIBED_LENGTH - current;
    const isAt90Percent = current >= Math.ceil(MAX_TRANSCRIBED_LENGTH * 0.9); // 450 characters
    const isNearLimit = remaining <= 25; // Last 25 characters
    const isAtLimit = remaining === 0;
    
    return { 
      current, 
      remaining, 
      isAt90Percent, 
      isNearLimit, 
      isAtLimit, 
      max: MAX_TRANSCRIBED_LENGTH 
    };
  };

  // Auto-resize function with hard height constraint
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    
    // Set height to scrollHeight or max height, whichever is smaller
    const newHeight = Math.min(scrollHeight, MAX_TEXTAREA_HEIGHT);
    textarea.style.height = `${newHeight}px`;
    
    // Always keep overflow hidden - no scrolling allowed
    textarea.style.overflowY = 'hidden';
  };

  // Check if adding text would exceed height limit
  const wouldExceedHeightLimit = (newText: string): boolean => {
    if (!inputRef.current) return false;
    
    // Create a temporary textarea to test the height
    const testTextarea = document.createElement('textarea');
    const computedStyle = window.getComputedStyle(inputRef.current);
    
    // Copy relevant styles
    testTextarea.style.position = 'absolute';
    testTextarea.style.visibility = 'hidden';
    testTextarea.style.height = 'auto';
    testTextarea.style.width = inputRef.current.offsetWidth + 'px';
    testTextarea.style.padding = computedStyle.padding;
    testTextarea.style.border = computedStyle.border;
    testTextarea.style.fontSize = computedStyle.fontSize;
    testTextarea.style.fontFamily = computedStyle.fontFamily;
    testTextarea.style.lineHeight = computedStyle.lineHeight;
    testTextarea.style.boxSizing = computedStyle.boxSizing;
    
    // Set the test text
    testTextarea.value = newText;
    
    // Add to DOM temporarily to measure
    document.body.appendChild(testTextarea);
    const wouldExceed = testTextarea.scrollHeight > MAX_TEXTAREA_HEIGHT;
    document.body.removeChild(testTextarea);
    
    return wouldExceed;
  };

  // Auto-focus the textarea when entering transcribed state
  useEffect(() => {
    if (recordingState === 'transcribed' && inputRef.current) {
      // Simple focus with minimal delay
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          // Position cursor at the end of the text
          const length = transcribedText.length;
          inputRef.current.setSelectionRange(length, length);
          // Auto-resize the textarea
          autoResize(inputRef.current);
        }
      }, 100);
    }
  }, [recordingState, transcribedText]);

  // Wave animation component
  const WaveAnimation = () => (
    <div className="flex items-center justify-center gap-1 h-6">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary/60 rounded-full animate-pulse"
          style={{
            height: Math.random() * 16 + 8 + 'px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.8s',
          }}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Button Section - Changes based on state */}
      <div className="flex items-center gap-3 w-full max-w-full overflow-hidden">
        {recordingState === 'idle' ? (
          <>
            {/* Default State: Add Exercise Button */}
            <button
              onClick={handleAddExerciseClick}
              className="flex-1 button-uber-secondary h-12 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span>Add exercise</span>
            </button>

            {/* Microphone Button */}
            <button
              onClick={handleMicrophoneClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-primary text-primary-foreground hover:scale-105"
            >
              <Mic className="w-5 h-5" />
            </button>
          </>
        ) : recordingState === 'recording' ? (
          <>
            {/* Discard Button */}
            <button
              onClick={handleDiscardClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-destructive text-destructive-foreground hover:scale-105 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Recording State: Wave Animation Button */}
            <div className="flex-1 button-uber-secondary h-12 flex items-center justify-center">
              <WaveAnimation />
            </div>

            {/* Done Button */}
            <button
              onClick={handleDoneClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-primary text-primary-foreground hover:scale-105 flex-shrink-0"
            >
              <Check className="w-5 h-5" />
            </button>
          </>
        ) : (
          <>
            {/* Discard Button */}
            <button
              onClick={handleDiscardClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-destructive text-destructive-foreground hover:scale-105 flex-shrink-0"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Transcribed State: Editable transcribed text */}
            <div className="flex-1 button-uber-secondary flex flex-col px-4 py-3 min-w-0">
              {/* Truncation warning */}
              {wasTruncated && (
                <div className="flex items-center gap-1 mb-2 text-xs text-orange-500">
                  <span>⚠️</span>
                  <span>Text was trimmed to fit limits</span>
                </div>
              )}
              
              <textarea
                ref={inputRef}
                value={transcribedText}
                onChange={handleTranscribedTextChange}
                onKeyDown={handleInputKeyDown}
                placeholder="Edit your transcribed text..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground resize-none leading-5 min-h-[20px] overflow-hidden"
                style={{ 
                  minHeight: '20px',
                  maxHeight: `${MAX_TEXTAREA_HEIGHT}px`
                }}
                rows={1}
                inputMode="text"
                autoCapitalize="sentences"
                autoCorrect="on"
                spellCheck="true"
                autoComplete="off"
              />
              
              {/* Character counter - only show when at 90% of limit */}
              {getTranscribedCharacterInfo().isAt90Percent && (
                <div className="flex justify-end mt-2">
                  <span className={`text-xs ${
                    getTranscribedCharacterInfo().isAtLimit 
                      ? 'text-destructive' 
                      : getTranscribedCharacterInfo().isNearLimit 
                        ? 'text-orange-500' 
                        : 'text-muted-foreground'
                  }`}>
                    {getTranscribedCharacterInfo().current}/{getTranscribedCharacterInfo().max}
                  </span>
                </div>
              )}
            </div>

            {/* Send Button */}
            <button
              onClick={handleSendClick}
              className="relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 bg-primary text-primary-foreground hover:scale-105 flex-shrink-0"
            >
              <ArrowUp className="w-5 h-5" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}