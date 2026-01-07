import React, { useCallback, useState, useEffect, useRef } from 'react';
import { SurveyProvider, useSurvey } from '../context/SurveyContext';
import { QuestionRenderer } from './QuestionRenderer';
import { ErrorModal } from './ErrorModal';

const ProgressBar = () => {
  const { currentStep, totalSteps, currentSection } = useSurvey();

  // Hide progress bar on Intro Hero
  if (currentSection.id === 'intro-hero') return null;

  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full bg-zinc-900 h-1.5 mb-12 rounded-full overflow-hidden relative shadow-[0_0_15px_rgba(249,115,22,0.15)]">
      <div
        className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-slate-50 transition-all duration-700 ease-out relative"
        style={{ width: `${progress}%` }}
      >
        <div className="absolute right-0 top-0 h-full w-12 bg-white/40 blur-lg animate-pulse" />
      </div>
    </div>
  );
};

// Iframe component to isolate and render full HTML documents
const ResultIframe = ({ content, title }) => {
  const iframeRef = useRef(null);

  const adjustHeight = () => {
    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      const height = iframe.contentWindow.document.documentElement.scrollHeight;
      iframe.style.height = `${height + 50}px`; // Add buffer
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl bg-transparent">
      <iframe
        ref={iframeRef}
        title={title}
        srcDoc={content}
        className="w-full border-0"
        style={{ minHeight: '600px' }}
        onLoad={adjustHeight}
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
};

const ResultsDashboard = ({ results }) => {
  useEffect(() => {
    console.log("ResultsDashboard mounted with results:", results);
  }, [results]);

  return (
    <div
      className="min-h-screen bg-black text-white font-sans selection:bg-orange-500 selection:text-white p-6"
      style={{ backgroundColor: '#000000', minHeight: '100vh' }}
    >
      <div className="max-w-6xl mx-auto space-y-12 animate-fade-in">
        {/* Sticky top nav - Jony Ive Style */}
        <div className="sticky top-6 z-50 flex justify-center pb-8 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-1 p-1.5 rounded-full bg-zinc-900/80 backdrop-blur-xl border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] ring-1 ring-white/5 transition-all duration-500 hover:scale-[1.02]">
            <a href="#badge" className="px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
              Badge
            </a>
            {/* Chart nav hidden for now */}
            <a href="#reading1" className="px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
              Part I
            </a>
            <a href="#reading2" className="px-5 py-2.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-zinc-400 hover:text-white hover:bg-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-all duration-300">
              Part II
            </a>
          </div>
        </div>


        {/* Badge Section */}
        <div id="badge" className="flex justify-center mb-12">
          <div
            className="transform hover:scale-105 transition-transform duration-500"
            dangerouslySetInnerHTML={{ __html: results.badge }}
          />
        </div>

        {/* Chart Section hidden for now */}

        {/* Reading Content via Iframes */}
        <div className="space-y-12">
          {/* HTML 1 */}
          <div id="reading1" className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-orange-900/5">
            <ResultIframe content={results.html1} title="Cosmic Chart" />
          </div>

          {/* HTML 2 */}
          <div id="reading2" className="bg-gray-900/50 p-4 rounded-2xl border border-gray-800 shadow-2xl shadow-cyan-900/5">
            <ResultIframe content={results.html2} title="Chart Details" />
          </div>
        </div>

        {/* Replay Button */}
        <div className="text-center pt-12 pb-24">
          <button
            onClick={() => {
              // Clear URL and reload
              window.history.pushState({}, '', '/');
              window.location.reload();
            }}
            className="px-8 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-full font-bold tracking-wider transition-all"
          >
            Replay Survey
          </button>
        </div>

      </div>
    </div>
  );

};

const SurveyControls = ({ submitStatus, setSubmitStatus, setResults, setErrorModal }) => {
  const { currentStep, totalSteps, nextStep, prevStep, answers, currentSection, submissionId, setSubmissionId, setChartId, setUserEmail } = useSurvey();

  // Hide controls on Intro Hero
  if (currentSection.id === 'intro-hero') return null;

  const isLastStep = currentStep === totalSteps - 1;
  const isSubmitting = submitStatus === 'loading';

  const handleNext = async () => {
    // Validation for Section I (Astro Data)
    if (currentSection.id === 'astro-data') {
      const requiredFields = ['username', 'date', 'city', 'latitude', 'longitude', 'time_accuracy'];
      const missing = requiredFields.filter(field => !answers[field]);

      if (missing.length > 0) {
        setErrorModal({
          isOpen: true,
          title: 'Missing Information',
          message: `Please fill in all cosmic coordinates: ${missing.join(', ')}`,
          details: null
        });
        return;
      }

      // After Section 1: Compute chart and create submission (for real-time saving)
      try {
        const isUnknownTime = answers['time_accuracy'] === 'unknown';
        const chartPayload = {
          date: answers['date'],
          time: (isUnknownTime || !answers['time']) ? "12:00" : answers['time'],
          latitude: parseFloat(answers['latitude']),
          longitude: parseFloat(answers['longitude']),
          city: answers['city'],
          country: answers['country'] || 'Unknown',
          username: answers['username'],
          userEmail: answers['email'] || null,
          timeAccuracy: answers['time_accuracy'],
        };

        const apiBase = import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : '');

        // Create submission + chart via chart-to-svg endpoint (but don't fetch results yet)
        const response = await fetch(`${apiBase}/api/dev/chart-to-svg`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(chartPayload)
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          console.warn('⚠️ Chart computation failed (non-fatal, will retry on submit):', errorText);
          // Continue anyway - will retry on final submit
        } else {
          const data = await response.json();
          if (data.submissionId && data.chartId) {
            setSubmissionId(data.submissionId);
            setChartId(data.chartId);
            if (answers['email']) {
              setUserEmail(answers['email']);
            }
            console.log('✅ Chart computed, submission created:', data.submissionId);
          }
        }
      } catch (error) {
        console.warn('⚠️ Error computing chart (non-fatal, will retry on submit):', error.message);
        // Continue anyway - will retry on final submit
      }
    }

    if (isLastStep) {
      setSubmitStatus('loading');

      // 1. Logic: Handle Unknown Time
      const isUnknownTime = answers['time_accuracy'] === 'unknown';

      const payload = {
        date: answers['date'],
        // If unknown or empty, default to 12:00
        time: (isUnknownTime || !answers['time']) ? "12:00" : answers['time'],
        latitude: parseFloat(answers['latitude']),
        longitude: parseFloat(answers['longitude']),
        city: answers['city'],
        country: answers['country'] || 'Unknown', // Default if missing
        username: answers['username'],
        userEmail: answers['email'], // From Section IX
        timeAccuracy: answers['time_accuracy'], // Send the flag to backend
        fullResponses: answers
      };

      // If we already have a submissionId, ensure all answers are saved (especially top3)
      // Then use that submissionId instead of creating a new one
      let finalSubmissionId = submissionId;

      if (finalSubmissionId) {
        // Save top3 fields (combined into hall_of_fame)
        try {
          const apiBase = import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : '');
          const hallOfFameParts = [];
          if (answers.top3_films) hallOfFameParts.push(`TOP 3 FILMS:\n${answers.top3_films}`);
          if (answers.top3_series) hallOfFameParts.push(`TOP 3 SERIES:\n${answers.top3_series}`);
          if (answers.top3_docs) hallOfFameParts.push(`TOP 3 DOCS:\n${answers.top3_docs}`);

          if (hallOfFameParts.length > 0) {
            await fetch(`${apiBase}/api/survey/save-answer`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                submissionId: finalSubmissionId,
                questionKey: 'hall_of_fame', // Backend maps this to fit.hall_of_fame
                answerValue: hallOfFameParts.join('\n\n'),
                userEmail: answers['email'] || null,
              }),
            }).catch(error => {
              console.warn('⚠️ Failed to save hall_of_fame:', error);
            });
          }
        } catch (error) {
          console.warn('⚠️ Failed to save top3 fields:', error);
        }
      }

      console.log("Submitting Payload:", payload);
      console.log("Using submissionId:", finalSubmissionId || "will create new");

      try {
        const apiBase = import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : '');

        // 2. Call the Backend (will create new submission if we don't have one)
        // Backend will save all answers from fullResponses
        const response = await fetch(`${apiBase}/api/dev/chart-to-svg`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
          const errorText = await response.text().catch(() => 'Unknown error');
          throw new Error(`Chart generation failed: ${response.status} - ${errorText}`);
        }

        let data;
        try {
          data = await response.json();
        } catch (parseError) {
          throw new Error('Invalid JSON response from server');
        }

        const returnedSubmissionId = data.submissionId || finalSubmissionId;

        if (!returnedSubmissionId) {
          throw new Error('No submissionId returned from server. Response: ' + JSON.stringify(data));
        }

        // Update context if we got a new submissionId
        if (data.submissionId && !finalSubmissionId) {
          setSubmissionId(data.submissionId);
          if (data.chartId) setChartId(data.chartId);
        }

        // 3. Redirect to the Dashboard immediately
        if (data.htmlUrl) {
          window.location.href = data.htmlUrl;
          return;
        }

        /* Legacy client-side rendering logic removed in favor of direct redirect
        // 3. Fetch the Results (The backend auto-adjusts based on data)
        const [svgRes, badgeRes, html1Res, html2Res] = await Promise.all([
          fetch(`${apiBase}/reading/${returnedSubmissionId}/chart.svg`),
          fetch(`${apiBase}/reading/${returnedSubmissionId}/badge`),
          fetch(`${apiBase}/reading/${returnedSubmissionId}/html`),
          fetch(`${apiBase}/reading/${returnedSubmissionId}/html/2`)
        ]);

        // ... (rest of old logic)
        */

        setSubmitStatus('success');

      } catch (err) {
        console.error('Submission error details:', {
          message: err.message,
          stack: err.stack,
          name: err.name
        });
        const errorMessage = err.message || 'Unknown error occurred';
        setErrorModal({
          isOpen: true,
          title: 'Cosmic Interference!',
          message: errorMessage,
          details: err.stack || JSON.stringify(err, null, 2)
        });
        setSubmitStatus('error');
      }
    } else {
      nextStep();
    }
  };

  return (
    <div id="survey-controls" className="flex justify-between mt-12 pt-6 pb-12 md:pb-8 border-t border-gray-800">
      <button
        onClick={prevStep}
        disabled={currentStep === 0 || isSubmitting}
        className={`px-6 py-2 rounded-md font-medium transition-colors
          ${currentStep === 0
            ? 'text-gray-600 cursor-not-allowed'
            : 'text-white hover:text-cyan-400 border border-gray-700 hover:border-cyan-400'}`}
      >
        Previous
      </button>

      <button
        onClick={handleNext}
        disabled={isSubmitting}
        className={`px-6 py-2 rounded-md font-medium bg-white text-black hover:bg-cyan-400 transition-colors ${isSubmitting ? 'opacity-50 cursor-wait' : ''}`}
      >
        {isSubmitting ? 'Sending...' : (isLastStep ? 'Submit' : 'Next')}
      </button>
    </div>
  );
};

const CurrentSection = ({ nextStep }) => {
  const { currentSection, answers, setAnswer } = useSurvey();
  const isSwipeSection = currentSection.id === 'section-swipe';
  const isIntroHero = currentSection.id === 'intro-hero';

  // Task 2: Focus Scroll Auto-Advance
  const handleAutoAdvance = useCallback((questionId) => {
    // 1. Find the index of the question just answered
    const currentIndex = currentSection.questions.findIndex(q => q.id === questionId);

    // 2. Check if there is a next question in this section
    if (currentIndex !== -1 && currentIndex < currentSection.questions.length - 1) {
      const nextQuestion = currentSection.questions[currentIndex + 1];
      const nextElement = document.getElementById(`question-${nextQuestion.id}`);

      if (nextElement) {
        // 3. Smooth Scroll to it after a tiny delay
        setTimeout(() => {
          nextElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
      }
    } else {
      // If it's the last question, scroll to the controls at the bottom
      const controls = document.getElementById('survey-controls');
      if (controls) {
        setTimeout(() => {
          controls.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }, 150);
      }
    }
  }, [currentSection]);


  return (
    <div className="animate-fade-in">
      {!isSwipeSection && !isIntroHero && (
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400 mb-2">
            {currentSection.title}
          </h2>
          {currentSection.subtitle && (
            <p className="text-zinc-400 text-lg">{currentSection.subtitle}</p>
          )}
        </div>
      )}

      <div className={`space-y-12 ${!isIntroHero ? 'min-h-[300px]' : ''}`}>
        {currentSection.questions.length === 0 ? (
          <div className="p-8 border border-gray-800 border-dashed rounded-lg text-gray-500 text-center italic">
            Questions for this section loading...
          </div>
        ) : (
          <div className="space-y-10">
            {currentSection.questions.map((question) => (
              <div
                key={question.id}
                id={`question-${question.id}`}
                className={isIntroHero ? "" : "scroll-mt-24 transition-opacity duration-500"}
              >
                <QuestionRenderer
                  question={question}
                  value={answers[question.id]}
                  setGlobalAnswer={setAnswer}
                  onChange={(val) => {
                    setAnswer(question.id, val);
                    // Only auto-scroll for single-choice radio questions
                    if (question.type === 'radio') {
                      handleAutoAdvance(question.id);
                    }
                  }}
                  onNext={nextStep} // Pass nextStep for Hero Button
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const SurveyContent = ({ initialSubmissionId }) => {
  const { currentSection, currentStep, nextStep } = useSurvey();
  const [submitStatus, setSubmitStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [results, setResults] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, title: '', message: '', details: null });

  const isIntroHero = currentSection?.id === 'intro-hero';

  // Auto-scroll to top whenever the step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentStep]);

  // Load results from URL if submissionId is present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const submissionIdFromUrl = initialSubmissionId || params.get('submissionId');

    if (submissionIdFromUrl && !results && submitStatus === 'idle') {
      // Load results from URL
      const loadResultsFromSubmissionId = async (submissionId) => {
        try {
          setSubmitStatus('loading');

          const apiBase = import.meta.env.PUBLIC_API_BASE || (import.meta.env.DEV ? 'http://localhost:3001' : '');
          const [svgRes, badgeRes, html1Res, html2Res] = await Promise.all([
            fetch(`${apiBase}/reading/${submissionId}/chart.svg`),
            fetch(`${apiBase}/reading/${submissionId}/badge`),
            fetch(`${apiBase}/reading/${submissionId}/html`),
            fetch(`${apiBase}/reading/${submissionId}/html/2`)
          ]);

          // Check if all requests succeeded
          if (!svgRes.ok || !badgeRes.ok || !html1Res.ok || !html2Res.ok) {
            throw new Error('Failed to load results');
          }

          setResults({
            svg: await svgRes.text(),
            badge: await badgeRes.text(),
            html1: await html1Res.text(),
            html2: await html2Res.text()
          });

          setSubmitStatus('success');
        } catch (err) {
          console.error('Failed to load results from URL:', err);
          setSubmitStatus('error');
          // Don't clear URL automatically so user can refresh/debug
          // window.history.pushState({}, '', '/');
          setErrorModal({
            isOpen: true,
            title: 'Failed to Load Results',
            message: 'We could not retrieve your cosmic data.',
            details: err.message
          });
        }
      };

      loadResultsFromSubmissionId(submissionIdFromUrl);
    }
  }, []); // Only run on mount

  if (submitStatus === 'success' && results) {
    return <ResultsDashboard results={results} />;
  }

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-white flex flex-col items-center py-8 px-4 md:px-0 font-sans selection:bg-orange-500 selection:text-white">
      <div className="w-full max-w-2xl bg-transparent flex flex-col gap-8">
        {!isIntroHero && (
          <header className="mb-16 flex flex-col items-center">
            <div className="w-20 h-20 md:w-24 md:h-24 relative group mb-4">
              <div className="absolute inset-0 bg-orange-500/10 blur-2xl rounded-full scale-75" />
              <img
                src="/assets/fateflix-planet.png"
                alt="FateFlix Logo"
                className="w-full h-full object-contain relative z-10 drop-shadow-[0_0_20px_rgba(249,115,22,0.2)]"
              />
            </div>
            <h2 className="text-[8px] md:text-[10px] tracking-[0.6em] text-zinc-500 font-bold uppercase">
              CINEMATIC TASTE SURVEY
            </h2>
          </header>
        )}

        <ProgressBar />

        <div className={`${!isIntroHero ? '' : ''} w-full max-w-2xl bg-transparent flex flex-col gap-8 p-8 md:p-12 transition-all duration-500`}>
          <CurrentSection nextStep={nextStep} />
          <SurveyControls
            submitStatus={submitStatus}
            setSubmitStatus={setSubmitStatus}
            setResults={setResults}
            setErrorModal={setErrorModal}
          />
        </div>
      </div>

      {/* Error Modal */}
      <ErrorModal
        isOpen={errorModal.isOpen}
        onClose={() => setErrorModal({ isOpen: false, title: '', message: '', details: null })}
        title={errorModal.title}
        message={errorModal.message}
        details={errorModal.details}
      />
    </div>
  );
};

export default function FateFlixSurvey({ initialSubmissionId }) {
  return (
    <SurveyProvider>
      <SurveyContent initialSubmissionId={initialSubmissionId} />
    </SurveyProvider>
  );
}
