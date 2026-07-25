import React, { useState, useEffect } from 'react';
import { PracticeQuestion } from '../types';
import { PRACTICE_QUESTIONS } from '../data/defaultData';
import { BookOpen, Search, Filter, Clock, CheckCircle2, ChevronDown, ChevronUp, Sparkles, Save } from 'lucide-react';

export const QuestionBankView: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(PRACTICE_QUESTIONS[0].id);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});
  const [timers, setTimers] = useState<Record<string, number>>({});
  const [activeTimerId, setActiveTimerId] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('prepmind_question_notes');
    if (saved) {
      try {
        setUserNotes(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const handleSaveNote = (id: string, text: string) => {
    const updated = { ...userNotes, [id]: text };
    setUserNotes(updated);
    localStorage.setItem('prepmind_question_notes', JSON.stringify(updated));
  };

  const categories = ['All', 'Behavioral', 'System Design', 'Product Strategy', 'Leadership', 'Pitch & Venture'];

  const filtered = PRACTICE_QUESTIONS.filter((q) => {
    const matchCat = selectedCategory === 'All' || q.category === selectedCategory;
    const matchSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        q.prompt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Title Header */}
      <div className="text-center max-w-3xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Interactive Question Bank & Practice Library</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">
          Master Top Industry Questions & Practice High-Impact Answers
        </h1>
        <p className="text-sm text-slate-400">
          Curated behavioral, technical, and strategic questions paired with framework recommendations and personal scratchpad notes.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-lg">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search questions or keywords..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Question Cards List */}
      <div className="space-y-4">
        {filtered.map((q) => {
          const isExpanded = expandedId === q.id;
          const noteText = userNotes[q.id] || '';

          return (
            <div
              key={q.id}
              className={`bg-slate-900 border rounded-2xl transition-all duration-200 shadow-lg overflow-hidden ${
                isExpanded ? 'border-indigo-500/50 ring-1 ring-indigo-500/30' : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* Card Header Bar */}
              <div
                onClick={() => setExpandedId(isExpanded ? null : q.id)}
                className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-slate-800/30 transition"
              >
                <div className="flex items-center space-x-3">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${
                      q.difficulty === 'Easy'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : q.difficulty === 'Medium'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                        : 'bg-red-500/10 text-red-400 border-red-500/20'
                    }`}
                  >
                    {q.difficulty}
                  </span>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-bold text-slate-100">{q.title}</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-medium">
                        {q.category}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <span className="text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-lg border border-indigo-500/20 hidden sm:inline">
                    Framework: {q.frameworkType}
                  </span>

                  {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                </div>
              </div>

              {/* Card Body */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-slate-800/80 space-y-4 bg-slate-950/40">
                  {/* Prompt Box */}
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-indigo-300 block">Interview Question Prompt:</span>
                    <p className="text-sm text-slate-100 leading-relaxed font-medium">
                      "{q.prompt}"
                    </p>
                  </div>

                  {/* Keywords & Tips */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1.5">
                      <span className="text-xs font-semibold text-emerald-400 block">Key Concept Keywords:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {q.idealKeywords.map((kw, idx) => (
                          <span key={idx} className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-1">
                      <span className="text-xs font-semibold text-amber-400 block">Coach Tip:</span>
                      <p className="text-xs text-slate-300">{q.tips}</p>
                    </div>
                  </div>

                  {/* Scratchpad Notes */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold text-slate-300">
                        Your Draft Notes / Outline Scratchpad:
                      </label>
                      <span className="text-[10px] text-slate-500">Auto-saved to local storage</span>
                    </div>

                    <textarea
                      value={noteText}
                      onChange={(e) => handleSaveNote(q.id, e.target.value)}
                      rows={3}
                      placeholder="Type your bullet points, STAR story outline, or memory triggers for this question..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition resize-none"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
