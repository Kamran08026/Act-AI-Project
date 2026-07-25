import React from 'react';
import { Bot, Sparkles, MessageSquareCode, Layers, BookOpen, Mic, Flame, PlusCircle, History } from 'lucide-react';

interface NavbarProps {
  activeTab: 'interview' | 'framer' | 'pitch' | 'bank' | 'history';
  setActiveTab: (tab: 'interview' | 'framer' | 'pitch' | 'bank' | 'history') => void;
  onNewSession: () => void;
  streakCount: number;
  activeSessionRole?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onNewSession,
  streakCount,
  activeSessionRole,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('interview')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Bot className="w-5 h-5 text-indigo-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
                  PrepMind
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-md">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Interview & Pitch Studio</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'interview'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Live Interview Room</span>
            </button>

            <button
              onClick={() => setActiveTab('framer')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'framer'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>STAR Answer Framer</span>
            </button>

            <button
              onClick={() => setActiveTab('pitch')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'pitch'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Pitch Builder</span>
            </button>

            <button
              onClick={() => setActiveTab('bank')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'bank'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>History</span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Streak Badge */}
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold" title="Days of practice streak">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
              <span>{streakCount} Day Streak</span>
            </div>

            {/* New Session Button */}
            <button
              onClick={onNewSession}
              className="flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all duration-200 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">New Session</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="md:hidden flex items-center justify-between py-2 border-t border-slate-800/60 overflow-x-auto space-x-1">
          <button
            onClick={() => setActiveTab('interview')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'interview' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Live Interview
          </button>
          <button
            onClick={() => setActiveTab('framer')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'framer' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            STAR Framer
          </button>
          <button
            onClick={() => setActiveTab('pitch')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'pitch' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Pitch Studio
          </button>
          <button
            onClick={() => setActiveTab('bank')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'bank' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            Questions
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400'
            }`}
          >
            History
          </button>
        </div>
      </div>
    </header>
  );
};
