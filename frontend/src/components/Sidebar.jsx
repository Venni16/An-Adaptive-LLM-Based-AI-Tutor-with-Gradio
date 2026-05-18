import React from "react";
import { MessageSquare, Sparkles, Trash2, History, Code, Globe, HelpCircle } from "lucide-react";

const SUGGESTED_PROMPTS = [
  {
    icon: Code,
    label: "React Reconciliation",
    text: "Explain how React's Virtual DOM reconciliation algorithm works under the hood.",
    category: "Web Dev"
  },
  {
    icon: Globe,
    label: "Vector Databases",
    text: "How do vector databases (like Pinecone or Milvus) store and query high-dimensional embeddings for RAG?",
    category: "AI & RAG"
  },
  {
    icon: HelpCircle,
    label: "Pointers in C",
    text: "Can you explain pointers, memory addresses, and dereferencing in C with clear visuals?",
    category: "Systems"
  },
  {
    icon: Sparkles,
    label: "Binary Search",
    text: "Show me how to implement binary search in Python and explain its logarithmic O(log n) time complexity.",
    category: "Algorithms"
  }
];

export default function Sidebar({ history, onSelectHistoryItem, onClearHistory, onSelectSuggestion, isStreaming }) {
  return (
    <aside className="w-full lg:w-80 flex flex-col gap-6 shrink-0">
      {/* Suggestions Section */}
      <div className="glass rounded-2xl p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2 text-violet-400 font-semibold font-display text-sm tracking-wide uppercase">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>Quick Tutorials</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
          {SUGGESTED_PROMPTS.map((prompt, idx) => {
            const Icon = prompt.icon;
            return (
              <button
                key={idx}
                disabled={isStreaming}
                onClick={() => onSelectSuggestion(prompt.text)}
                className="flex flex-col text-left p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.06] hover:border-violet-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none group"
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <span className="text-[10px] font-semibold tracking-wider text-cyan-400 uppercase font-display bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-500/10">
                    {prompt.category}
                  </span>
                  <Icon className="w-3.5 h-3.5 text-slate-500 group-hover:text-violet-400 transition-colors" />
                </div>
                <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors mb-1">
                  {prompt.label}
                </span>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {prompt.text}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* History Section */}
      <div className="glass rounded-2xl p-5 flex-1 flex flex-col gap-4 min-h-[300px] lg:min-h-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400 font-semibold font-display text-sm uppercase tracking-wider">
            <History className="w-4 h-4" />
            <span>Tutor Log</span>
          </div>
          {history.length > 0 && (
            <button
              onClick={onClearHistory}
              disabled={isStreaming}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50"
              title="Clear all logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 max-h-[400px] lg:max-h-none">
          {history.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 border border-dashed border-white/5 rounded-xl bg-white/[0.01] sm:col-span-2 lg:col-span-1">
              <MessageSquare className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
              <span className="text-xs font-semibold text-slate-400 mb-1">No past sessions</span>
              <p className="text-[10px] text-slate-500 max-w-[160px] leading-relaxed">
                Your explanations and learning topics will appear here.
              </p>
            </div>
          ) : (
            history.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelectHistoryItem(item)}
                disabled={isStreaming}
                className="flex items-start gap-3 text-left p-3 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.04] hover:border-white/10 active:scale-[0.99] transition-all disabled:opacity-50 group"
              >
                <div className="p-1.5 rounded-lg bg-violet-950/40 text-violet-400 border border-violet-500/15 shrink-0 mt-0.5">
                  <MessageSquare className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-300 truncate group-hover:text-white transition-colors">
                    {item.question}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[9px] font-semibold bg-violet-950/50 text-violet-400 px-1.5 py-0.5 rounded border border-violet-500/10">
                      Lvl {item.explanation_level}
                    </span>
                    <span className="text-[9px] font-medium text-slate-500 truncate">
                      {item.model}
                    </span>
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
