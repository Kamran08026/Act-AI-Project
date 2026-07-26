import profileImg from '../Profile Photo.jpg';
import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { SessionSetupModal } from './components/SessionSetupModal';
import { LiveInterviewRoom } from './components/LiveInterviewRoom';
import { AnswerFramer } from './components/AnswerFramer';
import { PitchBuilder } from './components/PitchBuilder';
import { QuestionBankView } from './components/QuestionBankView';
import { SessionReportModal } from './components/SessionReportModal';
import { HistoryDrawer } from './components/HistoryDrawer';
import { InterviewSession, SessionConfig, InterviewTurn, SessionReportData } from './types';
import { Sparkles, Mic, Play, ArrowRight, ShieldCheck, Flame, BookOpen, Layers } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'interview' | 'framer' | 'pitch' | 'bank' | 'history'>('interview');
  const [activeSession, setActiveSession] = useState<InterviewSession | null>(null);
  const [sessionsHistory, setSessionsHistory] = useState<InterviewSession[]>([]);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isProcessingTurn, setIsProcessingTurn] = useState(false);
  const [activeReport, setActiveReport] = useState<SessionReportData | null>(null);
  const [streakCount, setStreakCount] = useState(3);

  // Load saved history & streak on mount
  useEffect(() => {
    const saved = localStorage.getItem('prepmind_sessions_history');
    if (saved) {
      try {
        setSessionsHistory(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const savedStreak = localStorage.getItem('prepmind_streak');
    if (savedStreak) {
      setStreakCount(parseInt(savedStreak, 10) || 3);
    }
  }, []);

  // Save history helper
  const saveSessions = (updated: InterviewSession[]) => {
    setSessionsHistory(updated);
    localStorage.setItem('prepmind_sessions_history', JSON.stringify(updated));
  };

  // Start Session Handler
  const handleStartSession = async (config: SessionConfig) => {
    setIsStartingSession(true);
    try {
      const res = await fetch('/api/interview/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      });

      const data = await res.json();

      const newSession: InterviewSession = {
        id: `sess-${Date.now()}`,
        createdAt: new Date().toISOString(),
        config,
        status: 'active',
        turns: [
          {
            id: `turn-0`,
            turnIndex: 0,
            question: data.firstQuestion || 'To begin, please introduce yourself and walk me through your background.',
            questionContext: data.questionContext || 'Highlight core values, relevant achievements, and career trajectory.',
            userAnswer: '',
            timestamp: new Date().toLocaleTimeString(),
          },
        ],
      };

      setActiveSession(newSession);
      setIsSetupModalOpen(false);
      setActiveTab('interview');
    } catch (err) {
      console.error('Error starting session:', err);
    } finally {
      setIsStartingSession(false);
    }
  };

  // Turn Answer Handler
  const handleSendAnswer = async (answerText: string) => {
    if (!activeSession) return;
    setIsProcessingTurn(true);

    const currentTurnIndex = activeSession.turns.length - 1;
    const currentTurn = activeSession.turns[currentTurnIndex];

    try {
      const res = await fetch('/api/interview/turn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config: activeSession.config,
          previousTurns: activeSession.turns,
          currentQuestion: currentTurn.question,
          userAnswer: answerText,
        }),
      });

      const data = await res.json();

      const updatedTurns = [...activeSession.turns];
      updatedTurns[currentTurnIndex] = {
        ...currentTurn,
        userAnswer: answerText,
        aiFeedback: {
          overallScore: data.overallScore || 80,
          clarityScore: data.clarityScore || 80,
          starScore: data.starScore || 75,
          depthScore: data.depthScore || 78,
          feedbackSummary: data.feedbackSummary || 'Good structural response.',
          starBreakdown: data.starBreakdown,
          improvedAnswerSample: data.improvedAnswerSample,
        },
        followUpQuestion: data.followUpQuestion,
      };

      // Push next question turn
      if (data.followUpQuestion) {
        updatedTurns.push({
          id: `turn-${updatedTurns.length}`,
          turnIndex: updatedTurns.length,
          question: data.followUpQuestion,
          userAnswer: '',
          timestamp: new Date().toLocaleTimeString(),
        });
      }

      setActiveSession({
        ...activeSession,
        turns: updatedTurns,
      });
    } catch (err) {
      console.error('Error processing answer turn:', err);
    } finally {
      setIsProcessingTurn(false);
    }
  };

  // End Session Handler
  const handleEndSession = async () => {
    if (!activeSession) return;

    try {
      const res = await fetch('/api/interview/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: activeSession }),
      });

      const reportData: SessionReportData = await res.json();

      const completedSession: InterviewSession = {
        ...activeSession,
        status: 'completed',
        overallReport: reportData,
      };

      setActiveReport(reportData);
      setIsReportModalOpen(true);

      const updatedHistory = [completedSession, ...sessionsHistory.filter((s) => s.id !== completedSession.id)];
      saveSessions(updatedHistory);

      // Increment streak
      const newStreak = streakCount + 1;
      setStreakCount(newStreak);
      localStorage.setItem('prepmind_streak', newStreak.toString());
    } catch (err) {
      console.error('Error evaluating session:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onNewSession={() => setIsSetupModalOpen(true)}
        streakCount={streakCount}
        activeSessionRole={activeSession?.config.targetRole}
      />

      {/* Main Content Area */}
      <main className="flex-1">
                {/* Professional Profile Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', width: '100%', padding: '16px 24px', boxSizing: 'border-box' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '6px 14px', backgroundColor: '#1e293b', borderRadius: '30px', border: '1px solid #334155' }}>
          <img src={profileImg} alt="Kamran Khan" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover', border: '1px solid #3b82f6' }} />
          <span style={{ color: '#f8fafc', fontSize: '0.9rem', fontWeight: '500', paddingRight: '4px' }}>Kamran Khan</span>
        </div>
      </div>


        {activeTab === 'interview' && (
          <>
            {!activeSession ? (
              /* Welcome Hero Landing */
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-12">
                <div className="space-y-4 max-w-3xl mx-auto">
                  <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Next-Gen Interactive AI Interviewer & Pitch Panel</span>
                  </div>

                  <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-100 leading-none">
                    Ace Your Next Interview with{' '}
                    <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                      AI Recruiter Simulations
                    </span>
                  </h1>

                  <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                    Practice with realistic AI personas (Staff Engineers, VC Partners, Executive Recruiters), receive instant STAR answer reframing, and analyze your performance scorecards.
                  </p>

                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => setIsSetupModalOpen(true)}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-8 py-3.5 rounded-2xl text-sm font-bold shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Play className="w-4 h-4 fill-white" />
                      <span>Start Custom Mock Interview</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('framer')}
                      className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 border border-slate-800 text-slate-300 hover:text-slate-100 px-6 py-3.5 rounded-2xl text-sm font-semibold transition"
                    >
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span>Try STAR Answer Framer</span>
                    </button>
                  </div>
                </div>

                {/* Feature Highlights Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-5xl mx-auto pt-8">
                  <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3 shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                      <Mic className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">Interactive Speech & Audio</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Speak your responses naturally into the microphone or listen to the AI persona's questions synthesized aloud.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3 shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">Real-Time STAR Metrics</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Every turn evaluates Situation, Task, Action, and Result completeness, detects filler words, and provides sample rewrites.
                    </p>
                  </div>

                  <div className="bg-slate-900/60 border border-slate-800/80 p-6 rounded-2xl space-y-3 shadow-lg">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">Executive Scorecard</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Receive comprehensive scorecards across 5 core dimensions with strengths, growth areas, and actionable takeaways.
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <LiveInterviewRoom
                session={activeSession}
                onSendAnswer={handleSendAnswer}
                onEndSession={handleEndSession}
                isProcessing={isProcessingTurn}
              />
            )}
          </>
        )}

        {activeTab === 'framer' && <AnswerFramer />}

        {activeTab === 'pitch' && <PitchBuilder />}

        {activeTab === 'bank' && <QuestionBankView />}

        {activeTab === 'history' && (
          <HistoryDrawer
            sessions={sessionsHistory}
            onSelectSession={(sess) => {
              if (sess.overallReport) {
                setActiveReport(sess.overallReport);
                setActiveSession(sess);
                setIsReportModalOpen(true);
              }
            }}
            onClearHistory={() => saveSessions([])}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 PrepMind AI — Interactive AI Interview & Pitch Coach. Powered by Gemini AI.</p>
          <div className="flex items-center space-x-4">
            <span className="text-slate-400">Server-Side Gemini API Integrated</span>
            <span>•</span>
            <span className="text-slate-400">Full Stack Express + Vite</span>
          </div>
        </div>
      </footer>

      {/* Setup Modal */}
      <SessionSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
        onStartSession={handleStartSession}
        isLoading={isStartingSession}
      />

      {/* Scorecard Report Modal */}
      {activeReport && activeSession && (
        <SessionReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          report={activeReport}
          session={activeSession}
        />
      )}
    </div>
  );
}
