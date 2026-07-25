import React from 'react';
import { InterviewSession } from '../types';
import { History, Award, Trash2, Calendar, Briefcase, ArrowRight } from 'lucide-react';

interface HistoryDrawerProps {
  sessions: InterviewSession[];
  onSelectSession: (session: InterviewSession) => void;
  onClearHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  sessions,
  onSelectSession,
  onClearHistory,
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <History className="w-6 h-6 text-indigo-400" />
            Practice Session History
          </h1>
          <p className="text-xs text-slate-400">Review your past mock interviews, transcripts, and scorecards.</p>
        </div>

        {sessions.length > 0 && (
          <button
            onClick={onClearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-semibold hover:bg-red-500/20 transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
          <History className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-slate-300">No Saved Sessions Yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Completed interview sessions and executive scorecards will automatically be archived here for your review.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => {
            const score = s.overallReport?.overallScore || 0;
            return (
              <div
                key={s.id}
                onClick={() => onSelectSession(s)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-indigo-500/50 transition cursor-pointer space-y-4 shadow-lg group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-indigo-400" />
                    {new Date(s.createdAt).toLocaleDateString()}
                  </span>

                  {score > 0 && (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                      {score}/100
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-100 group-hover:text-indigo-300 transition">
                    {s.config.targetRole}
                  </h3>
                  <p className="text-xs text-slate-400">{s.config.companyName || 'Target Company'}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px] text-slate-400">
                  <span>{s.turns.length} Q&A Turns</span>
                  <span className="flex items-center space-x-1 text-indigo-400 group-hover:translate-x-1 transition">
                    <span>View Report</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
