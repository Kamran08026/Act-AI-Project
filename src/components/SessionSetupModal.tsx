import React, { useState } from 'react';
import { SessionConfig, PersonaType } from '../types';
import { PERSONAS } from '../data/defaultData';
import { X, Sparkles, UserCheck, ShieldAlert, Sliders, Briefcase, Building2, Flame } from 'lucide-react';

interface SessionSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartSession: (config: SessionConfig) => void;
  isLoading: boolean;
}

export const SessionSetupModal: React.FC<SessionSetupModalProps> = ({
  isOpen,
  onClose,
  onStartSession,
  isLoading,
}) => {
  const [targetRole, setTargetRole] = useState('Senior Software Engineer');
  const [companyName, setCompanyName] = useState('Google / Top Tech');
  const [industry, setIndustry] = useState('AI & Cloud Software');
  const [experienceLevel, setExperienceLevel] = useState<SessionConfig['experienceLevel']>('Mid-Senior');
  const [persona, setPersona] = useState<PersonaType>('tech_lead');
  const [difficulty, setDifficulty] = useState<SessionConfig['difficulty']>('Realistic Standard');
  const [customContext, setCustomContext] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSession({
      targetRole,
      companyName,
      industry,
      experienceLevel,
      persona,
      difficulty,
      customContext,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Configure AI Interview Studio</h2>
              <p className="text-xs text-slate-400">Tailor your interviewer persona and target role parameters</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Target Role & Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-indigo-400" />
                Target Role / Title
              </label>
              <input
                type="text"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                required
                placeholder="e.g. Lead Product Manager, Staff Engineer, Founder"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                Target Company / Org
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Stripe, OpenAI, YC Startup, McKinsey"
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
              />
            </div>
          </div>

          {/* Level & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Experience Seniority Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Entry-Level">Entry-Level / Junior</option>
                <option value="Mid-Senior">Mid-Senior Professional</option>
                <option value="Lead / Principal">Lead / Principal Staff</option>
                <option value="Executive / Founder">Executive / Founder / VP</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-400" />
                Interview Intensity / Style
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition"
              >
                <option value="Friendly & Supportive">Friendly & Coaching Mode</option>
                <option value="Realistic Standard">Realistic High-Bar Standard</option>
                <option value="Grill Mode / High Pressure">Grill Mode / High Pressure Interrogation</option>
              </select>
            </div>
          </div>

          {/* Select Persona */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              Select AI Interviewer Persona
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PERSONAS.map((p) => {
                const isSelected = persona === p.id;
                return (
                  <div
                    key={p.id}
                    onClick={() => setPersona(p.id)}
                    className={`relative p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500/50'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        src={p.avatar}
                        alt={p.name}
                        className="w-10 h-10 rounded-full object-cover border border-slate-700"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-slate-100 truncate">{p.name}</h4>
                          <span className={`text-[10px] px-2 py-0.5 rounded-md border ${p.badgeColor}`}>
                            {p.tone.split(' ')[0]}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">{p.role}</p>
                      </div>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2 line-clamp-2">{p.tagline}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Custom Context / Job Description / Resume excerpts */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Custom Job Description / Key Skills Context (Optional)
            </label>
            <textarea
              value={customContext}
              onChange={(e) => setCustomContext(e.target.value)}
              rows={3}
              placeholder="Paste job requirements or specific key topics you want to practice (e.g., System Design, Kubernetes, Distributed Databases, Behavioral Conflict)..."
              className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Preparing AI Persona...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Launch Live Session</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
