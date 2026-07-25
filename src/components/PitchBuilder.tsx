import React, { useState } from 'react';
import { PitchInput, PitchOutput, HardballQuestion } from '../types';
import { Layers, Sparkles, Copy, Check, ShieldAlert, Zap, HelpCircle, ArrowRight } from 'lucide-react';

export const PitchBuilder: React.FC = () => {
  const [pitchInput, setPitchInput] = useState<PitchInput>({
    productName: 'PrepMind AI',
    tagline: 'AI-Powered Interactive Interview & Pitch Studio',
    targetAudience: 'Job candidates, startup founders, and students preparing for high-stakes presentations.',
    problem: 'People struggle with rambling answers, poor STAR formatting, and handling tough investor/interviewer follow-up interrogation.',
    solution: 'Live AI recruiter simulations, real-time STAR framing engine, and custom pitch generators with instant feedback.',
    traction: '10,000+ practice sessions completed, 85% offer conversion rate in user trial.',
    ask: '$500k seed funding to scale enterprise university & recruitment partnerships.',
  });

  const [activeTab, setActiveTab] = useState<'scripts' | 'hardball'>('scripts');
  const [isGenerating, setIsGenerating] = useState(false);
  const [pitchOutput, setPitchOutput] = useState<PitchOutput | null>(null);
  const [hardballQuestions, setHardballQuestions] = useState<HardballQuestion[]>([]);
  const [isLoadingHardball, setIsLoadingHardball] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleGeneratePitch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      const res = await fetch('/api/pitch/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pitchInput }),
      });

      const data = await res.json();
      setPitchOutput(data);
    } catch (err) {
      console.error('Error generating pitch:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFetchHardball = async () => {
    setIsLoadingHardball(true);
    try {
      const res = await fetch('/api/pitch/hardball', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          context: `Product: ${pitchInput.productName}, Problem: ${pitchInput.problem}, Solution: ${pitchInput.solution}, Traction: ${pitchInput.traction}`,
        }),
      });

      const data = await res.json();
      setHardballQuestions(data.hardballQuestions || []);
    } catch (err) {
      console.error('Error fetching hardball questions:', err);
    } finally {
      setIsLoadingHardball(false);
    }
  };

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <Layers className="w-3.5 h-3.5" />
          <span>Pitch & Elevator Pitch Studio</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Craft High-Impact Pitches & Simulate VC Hardball Questions
        </h1>
        <p className="text-sm text-slate-400">
          Generate tailor-made 30s, 60s, and 3-min elevator pitch scripts, plus bulletproof answers to tough investor interrogation questions.
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
            <Zap className="w-4 h-4 text-indigo-400" />
            Product & Pitch Blueprint
          </h3>

          <form onSubmit={handleGeneratePitch} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Product / App Name</label>
              <input
                type="text"
                value={pitchInput.productName}
                onChange={(e) => setPitchInput({ ...pitchInput, productName: e.target.value })}
                required
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Tagline / One-Liner</label>
              <input
                type="text"
                value={pitchInput.tagline}
                onChange={(e) => setPitchInput({ ...pitchInput, tagline: e.target.value })}
                required
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Target Audience</label>
              <input
                type="text"
                value={pitchInput.targetAudience}
                onChange={(e) => setPitchInput({ ...pitchInput, targetAudience: e.target.value })}
                required
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Problem Statement</label>
              <textarea
                value={pitchInput.problem}
                onChange={(e) => setPitchInput({ ...pitchInput, problem: e.target.value })}
                required
                rows={2}
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Solution Description</label>
              <textarea
                value={pitchInput.solution}
                onChange={(e) => setPitchInput({ ...pitchInput, solution: e.target.value })}
                required
                rows={2}
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Traction / Validation</label>
              <input
                type="text"
                value={pitchInput.traction}
                onChange={(e) => setPitchInput({ ...pitchInput, traction: e.target.value })}
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Goal / Strategic Ask</label>
              <input
                type="text"
                value={pitchInput.ask}
                onChange={(e) => setPitchInput({ ...pitchInput, ask: e.target.value })}
                className="w-full px-3.5 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Synthesizing Pitch Scripts...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Pitch Scripts</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Pitch Results & Hardball Simulator (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub-navigation tabs */}
          <div className="flex items-center space-x-2 border-b border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('scripts')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                activeTab === 'scripts'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Elevator Pitches (30s / 60s / 3m)
            </button>

            <button
              onClick={() => {
                setActiveTab('hardball');
                if (hardballQuestions.length === 0) handleFetchHardball();
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                activeTab === 'hardball'
                  ? 'bg-amber-600 text-white shadow-lg shadow-amber-600/20'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Investor Hardball Simulator</span>
            </button>
          </div>

          {activeTab === 'scripts' && (
            <div className="space-y-6">
              {!pitchOutput ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-200">Generate Your Custom Pitch</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto">
                    Submit your pitch parameters on the left to unlock instant 30-second, 60-second, and 3-minute pitch scripts.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* 30 Sec Pitch */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        ⏱️ 30-Second Punchy Pitch
                      </span>
                      <button
                        onClick={() => handleCopyText(pitchOutput.thirtySecPitch, '30s')}
                        className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === '30s' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === '30s' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-medium">
                      "{pitchOutput.thirtySecPitch}"
                    </p>
                  </div>

                  {/* 60 Sec Pitch */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
                        ⏱️ 60-Second Elevator Pitch
                      </span>
                      <button
                        onClick={() => handleCopyText(pitchOutput.oneMinPitch, '60s')}
                        className="flex items-center space-x-1 text-[11px] text-slate-400 hover:text-slate-200"
                      >
                        {copiedKey === '60s' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === '60s' ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800 font-medium">
                      "{pitchOutput.oneMinPitch}"
                    </p>
                  </div>

                  {/* Key Hooks */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 block">
                      🎯 Key Strategic Hooks
                    </span>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {pitchOutput.keyHooks.map((hook, idx) => (
                        <li key={idx} className="flex items-center space-x-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{hook}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'hardball' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">VC / Interrogator Questions</span>
                <button
                  onClick={handleFetchHardball}
                  disabled={isLoadingHardball}
                  className="flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Regenerate Questions</span>
                </button>
              </div>

              {isLoadingHardball ? (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-3">
                  <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-xs text-slate-400">Interrogating business model for hardball questions...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {hardballQuestions.map((hb, idx) => (
                    <div key={hb.id || idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 shadow-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {hb.category}
                        </span>
                        <span className="text-[11px] text-slate-400 font-semibold">Framework: {hb.frameworkToAnswer}</span>
                      </div>

                      <h4 className="text-sm font-bold text-slate-100">
                        "{hb.question}"
                      </h4>

                      <p className="text-xs text-slate-400 italic bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        🧐 <strong>Why They Ask:</strong> {hb.whyTheyAskIt}
                      </p>

                      <div className="space-y-1">
                        <span className="text-xs font-semibold text-emerald-400 block">Bulletproof Response Points:</span>
                        <ul className="space-y-1 text-xs text-slate-300 pl-4 list-disc">
                          {hb.idealResponseBulletPoints.map((pt, pIdx) => (
                            <li key={pIdx}>{pt}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
