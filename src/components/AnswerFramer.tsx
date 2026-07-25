import React, { useState } from 'react';
import { Sparkles, Copy, Check, ArrowRight, Layers, FileText, Zap, RefreshCw, BarChart } from 'lucide-react';

interface ReframeResult {
  originalWordCount: number;
  formattedWordCount: number;
  originalRaw: string;
  situation: string;
  task: string;
  action: string;
  result: string;
  fullPolishedScript: string;
  executiveSummary: string;
  fillerWordsRemoved: string[];
  impactScore: number;
  coachKeyTip: string;
}

export const AnswerFramer: React.FC = () => {
  const [rawAnswer, setRawAnswer] = useState('');
  const [targetFormat, setTargetFormat] = useState<'STAR' | 'Executive Summary' | 'Rule of 3' | 'Pyramid Principle'>('STAR');
  const [roleContext, setRoleContext] = useState('Senior Software Engineer / Product Lead');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReframeResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleReframe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawAnswer.trim()) return;

    setIsProcessing(true);
    try {
      const res = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawAnswer,
          targetFormat,
          roleContext,
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error('Error reframing answer:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.fullPolishedScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Answer Transformer & STAR Framer</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Transform Unstructured Notes into Executive-Ready Scripts
        </h1>
        <p className="text-sm text-slate-400">
          Paste rambly thoughts, meeting notes, or rough voice transcripts. AI reframes them into structured, high-impact answers in seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Input (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
          <form onSubmit={handleReframe} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Target Role / Context
              </label>
              <input
                type="text"
                value={roleContext}
                onChange={(e) => setRoleContext(e.target.value)}
                placeholder="e.g., Staff Engineer, VC Pitch, PM Behavioral"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Select Structuring Framework
              </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="STAR">STAR Method (Situation, Task, Action, Result)</option>
                <option value="Executive Summary">Executive Elevator Summary</option>
                <option value="Rule of 3">Rule of 3 (Pillars & Impact)</option>
                <option value="Pyramid Principle">Pyramid Principle (Top-down Answer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Raw Answer Draft / Rambly Notes
              </label>
              <textarea
                value={rawAnswer}
                onChange={(e) => setRawAnswer(e.target.value)}
                required
                rows={10}
                placeholder="Paste your raw, messy notes here. For example: 'So basically last year we had this huge crash on Black Friday because the database got flooded with requests. My manager asked me to fix it. I worked all night, implemented Redis caching, and then the site came back up and didn't crash again.'"
                className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={!rawAnswer.trim() || isProcessing}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-3 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Reframing Script...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Transform into {targetFormat} Script</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Presets */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-400 block mb-2">Try Sample Drafts:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRawAnswer("We had a technical dispute with product management over whether to rebuild our backend in Rust or Node. They wanted Node for speed, but I knew Rust was needed for our high throughput. I built a benchmark demo over the weekend to show memory usage differences.")}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-indigo-500/50 transition"
              >
                Tech Conflict Sample
              </button>
              <button
                type="button"
                onClick={() => setRawAnswer("Our customer churn spiked by 15% last quarter because onboarding was confusing. I interviewed 20 users, redesigned the 3-step setup wizard, and churn dropped back down to 4%.")}
                className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 hover:border-indigo-500/50 transition"
              >
                Product Churn Sample
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Reframed Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                <Layers className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-200">Ready to Frame Your Answer</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Fill in your raw notes on the left and click Transform. Your polished, structured script with impact metrics will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Stats Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Impact Score</span>
                  <span className="text-lg font-bold text-emerald-400">{result.impactScore}/100</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Original Words</span>
                  <span className="text-lg font-bold text-slate-300">{result.originalWordCount}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Polished Words</span>
                  <span className="text-lg font-bold text-indigo-400">{result.formattedWordCount}</span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 text-center">
                  <span className="text-[10px] text-slate-400 block">Fillers Cut</span>
                  <span className="text-lg font-bold text-amber-400">{result.fillerWordsRemoved.length}</span>
                </div>
              </div>

              {/* Ready-to-Speak Polished Script Box */}
              <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-2xl p-6 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" />
                    Ready-To-Speak Script
                  </span>

                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1.5 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-semibold transition"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied Script!' : 'Copy Script'}</span>
                  </button>
                </div>

                <p className="text-sm sm:text-base text-slate-100 leading-relaxed font-medium bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                  "{result.fullPolishedScript}"
                </p>

                <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl text-xs text-indigo-300">
                  <strong className="block font-semibold mb-0.5">📌 1-Sentence Elevator Version:</strong>
                  "{result.executiveSummary}"
                </div>
              </div>

              {/* STAR Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs font-bold text-blue-400 block mb-1">Situation</span>
                  <p className="text-xs text-slate-300">{result.situation}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs font-bold text-amber-400 block mb-1">Task</span>
                  <p className="text-xs text-slate-300">{result.task}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs font-bold text-indigo-400 block mb-1">Action</span>
                  <p className="text-xs text-slate-300">{result.action}</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                  <span className="text-xs font-bold text-emerald-400 block mb-1">Result & Impact</span>
                  <p className="text-xs text-slate-300">{result.result}</p>
                </div>
              </div>

              {/* Coach Tip */}
              {result.coachKeyTip && (
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
                  <strong className="block font-bold mb-0.5">💡 Vocal Delivery Coach Tip:</strong>
                  {result.coachKeyTip}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
