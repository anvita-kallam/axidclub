import { useState, useEffect } from 'react';

// Helper function to safely compare values
function areValuesEqual(val1, val2) {
  if (val1 === null || val1 === undefined || val2 === null || val2 === undefined) {
    return val1 === val2;
  }
  return JSON.stringify(val1) === JSON.stringify(val2);
}

export default function Question({ question, options, type, onAnswer, onBack, canGoBack, questionNumber, totalQuestions, previousAnswer }) {
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Reset selected answer when question changes
  useEffect(() => {
    // Always reset first
    setSelectedAnswer(null);
    
    // Only restore previous answer if it's explicitly set (not undefined)
    // Check if previousAnswer is a valid value (not null, not undefined)
    if (previousAnswer !== undefined) {
      // Use a small delay to ensure the reset happens first
      const timer = setTimeout(() => {
        // Only set if it's not null (null means no answer was selected)
        if (previousAnswer !== null) {
          setSelectedAnswer(previousAnswer);
        }
      }, 10);
      return () => clearTimeout(timer);
    }
  }, [questionNumber, previousAnswer]);

  const handleAnswer = (value) => {
    setSelectedAnswer(value);
    onAnswer(value);
  };

  if (type === 'likert') {
    return (
      <div className="w-full max-w-2xl mx-auto px-4">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm text-cute-navy opacity-70 font-medium">
              Question {questionNumber} of {totalQuestions}
            </div>
            {canGoBack && (
              <button
                onClick={onBack}
                className="px-4 py-2 bg-white rounded-xl border-2 border-cute-blue border-opacity-30 text-cute-navy font-medium hover:bg-cute-light-blue hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-cute-blue focus:ring-offset-2"
                aria-label="Go back to previous question"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="w-full bg-white rounded-full h-3 shadow-inner border border-cute-blue border-opacity-30">
            <div 
              className="bg-gradient-to-r from-cute-blue to-cute-yellow h-3 rounded-full transition-all duration-300 shadow-sm"
              style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
            ></div>
          </div>
        </div>
        
        <h2 className="text-2xl md:text-3xl font-semibold text-cute-navy mb-8 text-center leading-tight">
          {question}
        </h2>
        
        <div className="space-y-3">
          {options.map((option, index) => {
            const isSelected = selectedAnswer !== null && 
                              selectedAnswer !== undefined &&
                              areValuesEqual(selectedAnswer, option.value);
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option.value)}
                className={`w-full p-5 rounded-2xl transition-all duration-200 text-left transform hover:scale-[1.02] scalloped-border relative ${
                  isSelected
                    ? 'scalloped-border-blue-selected bg-gradient-to-r from-cute-blue to-cute-yellow bg-opacity-20 shadow-lg'
                    : 'scalloped-border-blue bg-white hover:bg-cute-light-blue hover:bg-opacity-30 shadow-sm'
                }`}
                aria-label={option.label}
              >
                <span className="text-lg font-medium text-cute-navy relative z-10">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Multiple choice
  return (
    <div className="w-full max-w-2xl mx-auto px-4">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-cute-navy opacity-70 font-medium">
            Question {questionNumber} of {totalQuestions}
          </div>
          {canGoBack && (
            <button
              onClick={onBack}
              className="px-4 py-2 bg-white rounded-xl border-2 border-cute-blue border-opacity-30 text-cute-navy font-medium hover:bg-cute-light-blue hover:bg-opacity-30 transition-all duration-200 transform hover:scale-105 shadow-sm focus:outline-none focus:ring-2 focus:ring-cute-blue focus:ring-offset-2"
              aria-label="Go back to previous question"
            >
              ← Back
            </button>
          )}
        </div>
        <div className="w-full bg-white rounded-full h-3 shadow-inner border border-cute-blue border-opacity-30">
          <div 
            className="bg-gradient-to-r from-cute-blue to-cute-yellow h-3 rounded-full transition-all duration-300 shadow-sm"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          ></div>
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-semibold text-cute-navy mb-8 text-center leading-tight">
        {question}
      </h2>
      
      <div className="space-y-3">
        {options.map((option, index) => {
          const isSelected = selectedAnswer !== null && 
                            selectedAnswer !== undefined &&
                            areValuesEqual(selectedAnswer, option.value);
          return (
            <button
              key={index}
              onClick={() => handleAnswer(option.value)}
              className={`w-full p-5 rounded-2xl transition-all duration-200 text-left transform hover:scale-[1.02] scalloped-border relative ${
                isSelected
                  ? 'scalloped-border-blue-selected bg-gradient-to-r from-cute-blue to-cute-yellow bg-opacity-20 shadow-lg'
                  : 'scalloped-border-blue bg-white hover:bg-cute-light-blue hover:bg-opacity-30 shadow-sm'
              }`}
              aria-label={option.label}
            >
              <span className="text-lg font-medium text-cute-navy relative z-10">{option.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
