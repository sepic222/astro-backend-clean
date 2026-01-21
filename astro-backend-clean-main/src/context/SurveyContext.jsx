import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { surveySections } from '../config/surveyData';

const SurveyContext = createContext(undefined);

// Debounce utility
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export const SurveyProvider = ({ children }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [submissionId, setSubmissionId] = useState(null);
  const [chartId, setChartId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);

  const saveTimeoutRef = useRef({});

  const totalSteps = surveySections.length;

  // Real-time save function (debounced)
  const saveAnswerToServer = useCallback(async (questionId, value, submissionId, userEmail) => {
    if (!submissionId) return; // Can't save without submission ID

    // Skip birth data and cosmic keys
    if (['date', 'time', 'latitude', 'longitude', 'city', 'country', 'username', 'time_accuracy'].includes(questionId)) {
      return;
    }

    // Handle top3 fields specially (they combine into one answer)
    if (questionId === 'top3_films' || questionId === 'top3_series' || questionId === 'top3_docs') {
      // Don't save individually, will be handled on final submit
      return;
    }

    try {
      const apiBase = import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : '');
      const response = await fetch(`${apiBase}/api/survey/save-answer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          submissionId,
          questionKey: questionId,
          answerValue: value,
          userEmail: userEmail,
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.warn(`⚠️ Failed to save answer for ${questionId}:`, error);
      }
      // Silent success - don't log every save
    } catch (error) {
      console.warn(`⚠️ Error saving answer for ${questionId}:`, error.message);
    }
  }, []);

  // Debounced version of save function (500ms delay)
  const debouncedSave = useCallback(
    debounce((questionId, value, submissionId, userEmail) => {
      saveAnswerToServer(questionId, value, submissionId, userEmail);
    }, 500),
    [saveAnswerToServer]
  );

  const setAnswer = useCallback((questionId, value) => {
    setAnswers((prev) => {
      const newAnswers = {
        ...prev,
        [questionId]: value,
      };

      // Save to server in real-time (if submission exists)
      if (submissionId) {
        debouncedSave(questionId, value, submissionId, userEmail);
      }

      return newAnswers;
    });
  }, [submissionId, userEmail, debouncedSave]);

  const nextStep = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const value = {
    currentStep,
    totalSteps,
    answers,
    setAnswer,
    nextStep,
    prevStep,
    currentSection: surveySections[currentStep],
    submissionId,
    setSubmissionId,
    chartId,
    setChartId,
    userEmail,
    setUserEmail,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
};

export const useSurvey = () => {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
};


