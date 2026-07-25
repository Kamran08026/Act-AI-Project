import React from 'react';
import { SessionReportData, InterviewSession } from '../types';
import { Award, CheckCircle, AlertCircle, X, Download, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';

interface SessionReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SessionReportData;
  session: InterviewSession;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  isOpen,
  onClose,
  report,
  session,
}) => {
  if (!isOpen) return null;

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ session, report }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `PrepMind-Report-${session.id.slice(0, 8)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score >= 70) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-red-400 bg-red-500/10 border-red-500/20';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-100">Executive Performance Scorecard</h2>
              <p className="text-xs text-slate-400">
                Session Report for <strong className="text-slate-200">{session.config.targetRole}</strong> at{' '}
                <strong className="text-slate-200">{session.config.companyName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Top Score Banner */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 block">
                Overall Performance Readiness
              </span>
              <h3 className="text-2xl font-extrabold text-slate-100">
                {report.summaryVerdict}
              </h3>
              <p className="text-xs text-slate-400">
                Evaluated based on {session.turns.length} interaction turns in {session.config.difficulty}.
              </p>
            </div>

            {/* Score Ring / Gauge Badge */}
            <div className="flex-shrink-0 flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center min-w-[130px]">
              <span className="text-3xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-400 bg-clip-text text-transparent">
                {report.overallScore}
              </span>
              <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">
                Out of 100
              </span>
            </div>
          </div>

          {/* Dimension Breakdown Bars */}
          <div className="space-y-3 bg-slate-950 p-5 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
              Dimension Evaluation Breakdown
            </h4>

            <div className="space-y-2.5">
              {[
                { label: 'Clarity & Structure', score: report.clarityScore },
                { label: 'STAR Alignment', score: report.starAlignmentScore },
                { label: 'Confidence & Delivery', score: report.confidenceScore },
                { label: 'Domain Depth', score: report.domainDepthScore },
                { label: 'Executive Presence', score: report.executivePresenceScore },
              ].map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-300 font-medium">{item.label}</span>
                    <span className="font-bold text-slate-100">{item.score}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${item.score}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths & Growth Areas */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Top Strengths */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" />
                Key Demonstrated Strengths
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.topStrengths.map((str, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Critical Growth Areas */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4" />
                Critical Growth Areas
              </span>
              <ul className="space-y-2 text-xs text-slate-300">
                {report.criticalGrowthAreas.map((area, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{area}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Recommended Next Prep Steps */}
          {report.recommendedPreparation && (
            <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-5 space-y-2">
              <span className="text-xs font-bold text-indigo-300 block">
                🎯 Recommended Next Action Items:
              </span>
              <ul className="space-y-1.5 text-xs text-indigo-200">
                {report.recommendedPreparation.map((prep, idx) => (
                  <li key={idx} className="flex items-center space-x-2">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>{prep}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Export Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-slate-800">
            <button
              onClick={handleExportJSON}
              className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-4 py-2 rounded-xl text-xs font-semibold transition"
            >
              <Download className="w-4 h-4" />
              <span>Export Full Transcript (JSON)</span>
            </button>

            <button
              onClick={onClose}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-2 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition"
            >
              Done & Save Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
