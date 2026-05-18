import React from "react";
import { Cpu, RefreshCw, AlertTriangle, GraduationCap, Code2, ShieldAlert, Zap } from "lucide-react";

const PERSONAS = {
  1: {
    title: "Student",
    subtitle: "Analogy-heavy, conversational, simple everyday models",
    color: "text-teal-400 border-teal-500/20 bg-teal-950/20",
    sliderColor: "bg-teal-500",
    icon: GraduationCap
  },
  2: {
    title: "Junior Developer",
    subtitle: "Practical code samples, standard syntax, common bugs to avoid",
    color: "text-cyan-400 border-cyan-500/20 bg-cyan-950/20",
    sliderColor: "bg-cyan-500",
    icon: Code2
  },
  3: {
    title: "Senior Developer",
    subtitle: "Design patterns, trade-offs, testing, maintainability and clean patterns",
    color: "text-indigo-400 border-indigo-500/20 bg-indigo-950/20",
    sliderColor: "bg-indigo-500",
    icon: Zap
  },
  4: {
    title: "Expert Architect",
    subtitle: "Engine internals, performance, memory layouts, low-level mechanics",
    color: "text-violet-400 border-violet-500/20 bg-violet-950/20",
    sliderColor: "bg-violet-500",
    icon: ShieldAlert
  }
};

export default function ConfigPanel({
  models,
  selectedModel,
  onSelectModel,
  explanationLevel,
  onChangeLevel,
  isFetchingModels,
  onRefreshModels,
  modelSource,
  isStreaming
}) {
  const currentPersona = PERSONAS[explanationLevel];
  const PersonaIcon = currentPersona.icon;

  return (
    <div className="glass rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row gap-6 lg:gap-8 items-stretch">
      {/* Model Selector Card */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-slate-400 font-semibold font-display text-xs tracking-wider uppercase flex items-center gap-2">
            <Cpu className="w-4 h-4 text-violet-400" />
            <span>LLM Engine</span>
          </label>
          
          <button
            onClick={onRefreshModels}
            disabled={isFetchingModels || isStreaming}
            className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400 hover:text-violet-400 bg-white/[0.02] border border-white/5 px-2.5 py-1 rounded-lg active:scale-95 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3 h-3 ${isFetchingModels ? "animate-spin text-violet-400" : ""}`} />
            <span>Sync</span>
          </button>
        </div>

        <div className="relative">
          <select
            value={selectedModel || ""}
            onChange={(e) => onSelectModel(e.target.value)}
            disabled={isStreaming || models.length === 0}
            className="w-full bg-slate-900/90 border border-white/10 rounded-xl px-4 py-3 text-sm font-medium text-slate-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/35 transition-all appearance-none cursor-pointer disabled:opacity-50"
          >
            {models.length === 0 ? (
              <option value="">No models available</option>
            ) : (
              models.map((modelId) => (
                <option key={modelId} value={modelId}>
                  {modelId}
                </option>
              ))
            )}
          </select>
          {/* Custom Arrow */}
          <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* Connection warnings if in fallback mode */}
        {modelSource === "fallback" && (
          <div className="flex items-start gap-2.5 p-3 rounded-xl border border-amber-500/20 bg-amber-950/20 text-amber-300 text-[11px] leading-relaxed">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
            <div>
              <span className="font-semibold">LM Studio Down:</span> Displaying demo tutor engines. Launch LM Studio on port 1234 to connect local weights.
            </div>
          </div>
        )}
      </div>

      {/* Explanation Level Slider Card */}
      <div className="flex-1 flex flex-col gap-4">
        <label className="text-slate-400 font-semibold font-display text-xs tracking-wider uppercase flex items-center justify-between">
          <span>TUTOR Persona & Depth</span>
          <span className="text-[10px] font-bold text-violet-400 bg-violet-950/40 px-2 py-0.5 rounded border border-violet-500/10">
            Level {explanationLevel} of 4
          </span>
        </label>

        {/* Range Slider */}
        <div className="flex flex-col gap-2 relative mt-2 px-1">
          <input
            type="range"
            min="1"
            max="4"
            step="1"
            value={explanationLevel}
            onChange={(e) => onChangeLevel(parseInt(e.target.value))}
            disabled={isStreaming}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer outline-none transition-all disabled:opacity-50 accent-violet-500"
            style={{
              background: `linear-gradient(to right, #8b5cf6 0%, #8b5cf6 ${(explanationLevel - 1) * 33.3}%, #1e293b ${(explanationLevel - 1) * 33.3}%, #1e293b 100%)`
            }}
          />
          {/* Label Tickmarks */}
          <div className="flex justify-between text-[10px] font-bold text-slate-500 mt-1 select-none">
            <span className={explanationLevel === 1 ? "text-teal-400" : ""}>Student</span>
            <span className={explanationLevel === 2 ? "text-cyan-400" : ""}>Junior</span>
            <span className={explanationLevel === 3 ? "text-indigo-400" : ""}>Senior</span>
            <span className={explanationLevel === 4 ? "text-violet-400" : ""}>Expert</span>
          </div>
        </div>

        {/* Active Persona Banner */}
        <div className={`mt-2 flex gap-3.5 p-3.5 rounded-xl border transition-all duration-300 ${currentPersona.color}`}>
          <div className="shrink-0 mt-0.5">
            <PersonaIcon className="w-5 h-5" />
          </div>
          <div className="flex flex-col gap-0.5">
            <h4 className="text-xs font-bold uppercase tracking-wider font-display">
              {currentPersona.title} persona
            </h4>
            <p className="text-[11px] opacity-80 leading-relaxed font-medium">
              {currentPersona.subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
