import React, { useState, useEffect, useRef } from 'react';
import { InterviewSession, InterviewTurn } from '../types';
import { PERSONAS } from '../data/defaultData';
import {
  Mic, MicOff, Volume2, VolumeX, Send, Sparkles, CheckCircle2, AlertTriangle,
  Clock, Shield, ArrowRight, Award, RefreshCw, BarChart2, MessageSquare, Flame
} from 'lucide-react';

interface LiveInterviewRoomProps {
  session: InterviewSession;
  onSendAnswer: (answerText: string) => Promise<void>;
  onEndSession: () => void;
  isProcessing: boolean;
}

export const LiveInterviewRoom: React.FC<LiveInterviewRoomProps> = ({
  session,
  onSendAnswer,
  onEndSession,
  isProcessing,
}) => {
  const [userAnswer, setUserAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [autoSpeakQuestion, setAutoSpeakQuestion] = useState(true);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  const personaObj = PERSONAS.find((p) => p.id === session.config.persona) || PERSONAS[0];
  const lastTurn = session.turns[session.turns.length - 1];
  const currentQuestionText = lastTurn ? (lastTurn.followUpQuestion || lastTurn.question) : 'Loading question...';

  // Speech Recognition Setup
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => prev ? `${prev} ${transcript}` : transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  // Timer Effect
  useEffect(() => {
    if (isProcessing) {
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      setTimerSeconds(0);
      timerRef.current = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [session.turns.length, isProcessing]);

  // Text-to-Speech Function
  const handleSpeakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (isPlayingAudio) {
        setIsPlayingAudio(false);
        return;
      }

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsPlayingAudio(true);
      utterance.onend = () => setIsPlayingAudio(false);
      utterance.onerror = () => setIsPlayingAudio(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in this browser version. You can type your response directly.');
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error('Failed to start speech recognition:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAnswer.trim() || isProcessing) return;

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }

    const answerToSend = userAnswer;
    setUserAnswer('');
    await onSendAnswer(answerToSend);
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainingSecs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Banner: Persona Header & Session Config */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-60 h-60 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <img
                src={personaObj.avatar}
                alt={personaObj.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500/30 shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-2 border-slate-900 rounded-full animate-pulse" />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-slate-100">{personaObj.name}</h2>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${personaObj.badgeColor}`}>
                  {personaObj.tone}
                </span>
              </div>
              <p className="text-xs text-indigo-300 font-medium">{personaObj.role}</p>
              <div className="flex items-center space-x-3 mt-1 text-[11px] text-slate-400">
                <span>Role: <strong className="text-slate-200">{session.config.targetRole}</strong></span>
                <span>•</span>
                <span>Company: <strong className="text-slate-200">{session.config.companyName}</strong></span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Flame className="w-3 h-3" />
                  {session.config.difficulty}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={() => handleSpeakQuestion(currentQuestionText)}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition ${
                isPlayingAudio
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:text-slate-100 hover:bg-slate-800'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              <span>{isPlayingAudio ? 'Speaking Question...' : 'Listen Question'}</span>
            </button>

            <button
              onClick={onEndSession}
              disabled={session.turns.length === 0}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/20 transition active:scale-95 disabled:opacity-50"
            >
              <Award className="w-4 h-4" />
              <span>Finish & Analyze Scorecard</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Current AI Question & Response Input (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Question Box */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/20 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 shadow-xl relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3" />
                Interviewer Question #{session.turns.length + 1}
              </span>

              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span className="font-mono">{formatTimer(timerSeconds)}</span>
              </div>
            </div>

            <h3 className="text-base sm:text-lg font-semibold text-slate-100 leading-relaxed mb-3">
              "{currentQuestionText}"
            </h3>

            {lastTurn?.questionContext && (
              <p className="text-xs text-indigo-300/80 bg-indigo-950/40 p-2.5 rounded-xl border border-indigo-500/20">
                💡 <strong>Evaluation Focus:</strong> {lastTurn.questionContext}
              </p>
            )}
          </div>

          {/* User Response Area */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200 flex items-center space-x-2">
                <MessageSquare className="w-4 h-4 text-indigo-400" />
                <span>Your Answer Response (Speak or Type)</span>
              </label>

              <div className="flex items-center space-x-2">
                {/* Voice Mic Toggle */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    isRecording
                      ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-slate-100'
                  }`}
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                  <span>{isRecording ? 'Listening...' : 'Voice Input'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  disabled={isProcessing}
                  rows={6}
                  placeholder={
                    isRecording
                      ? 'Listening to your voice... Speak clearly into microphone.'
                      : 'Draft your response using the STAR framework (Situation, Task, Action, Result)... or click Voice Input to speak.'
                  }
                  className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition resize-none"
                />

                <div className="absolute bottom-3 right-3 text-[10px] text-slate-500 font-mono">
                  {userAnswer.length} chars | {userAnswer.trim().split(/\s+/).filter(Boolean).length} words
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  Tip: Include concrete numbers & metrics to maximize impact score!
                </p>

                <button
                  type="submit"
                  disabled={!userAnswer.trim() || isProcessing}
                  className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-40 ml-auto"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Interviewer Evaluating...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer</span>
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Live Session Transcript & Real-Time STAR Feedback (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-indigo-400" />
              Real-Time Session Feedback
            </h3>

            <span className="text-[11px] text-slate-400 font-medium">
              {session.turns.length} Turn{session.turns.length === 1 ? '' : 's'} Completed
            </span>
          </div>

          {session.turns.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-200">Your Session is Live!</h4>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                Answer the interviewer's opening question above to receive instant STAR metrics, filler word detection, and improved sample scripts.
              </p>
            </div>
          ) : (
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-1">
              {session.turns.map((turn, idx) => (
                <div
                  key={turn.id || idx}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-lg"
                >
                  {/* Question Title */}
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-[11px] font-semibold text-indigo-400">
                      Q{idx + 1}: {turn.question.slice(0, 45)}...
                    </span>

                    {turn.aiFeedback && (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        Score: {turn.aiFeedback.overallScore}/100
                      </span>
                    )}
                  </div>

                  {/* Candidate Answer excerpt */}
                  <p className="text-xs text-slate-300 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800/80">
                    "{turn.userAnswer}"
                  </p>

                  {/* AI Feedback Breakdown */}
                  {turn.aiFeedback && (
                    <div className="space-y-2 pt-1">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {turn.aiFeedback.feedbackSummary}
                      </p>

                      {/* STAR tags */}
                      {turn.aiFeedback.starBreakdown && (
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1">
                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="font-bold text-blue-400">Situation:</span>{' '}
                            <span className="text-slate-300">{turn.aiFeedback.starBreakdown.situation}</span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="font-bold text-amber-400">Task:</span>{' '}
                            <span className="text-slate-300">{turn.aiFeedback.starBreakdown.task}</span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="font-bold text-indigo-400">Action:</span>{' '}
                            <span className="text-slate-300">{turn.aiFeedback.starBreakdown.action}</span>
                          </div>

                          <div className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                            <span className="font-bold text-emerald-400">Result:</span>{' '}
                            <span className="text-slate-300">{turn.aiFeedback.starBreakdown.result}</span>
                          </div>
                        </div>
                      )}

                      {/* Improved Rewrite Sample */}
                      {turn.aiFeedback.improvedAnswerSample && (
                        <div className="mt-2 p-2.5 rounded-xl bg-purple-950/30 border border-purple-500/20 text-[11px] text-purple-200">
                          <strong className="block text-purple-300 font-semibold mb-0.5">
                            ✨ Recommended Reframed Answer:
                          </strong>
                          "{turn.aiFeedback.improvedAnswerSample}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
