import React, { useState, useEffect } from "react";
import GlowingBackground from "./components/GlowingBackground";
import ConfigPanel from "./components/ConfigPanel";
import ChatWorkspace from "./components/ChatWorkspace";
import Sidebar from "./components/Sidebar";
import { fetchModels, streamExplanation } from "./utils/api";
import { Sparkles, HelpCircle, Terminal } from "lucide-react";
import vortexLogo from "./assets/vortex_logo.png";

export default function App() {
  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("");
  const [explanationLevel, setExplanationLevel] = useState(3); // Default level 3 (Senior)
  const [question, setQuestion] = useState("");
  const [explanation, setExplanation] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [modelSource, setModelSource] = useState("lm-studio");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Automatically manage sidebar visibility based on responsive breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    handleResize(); // run on initial mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  
  // History is loaded from localStorage on startup
  const [history, setHistory] = useState(() => {
    try {
      const stored = localStorage.getItem("vortex_tutor_history");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error("Failed to parse history from localStorage", e);
      return [];
    }
  });

  // Fetch available models from backend on startup
  useEffect(() => {
    loadModelsList();
  }, []);

  const loadModelsList = async () => {
    setIsFetchingModels(true);
    try {
      const data = await fetchModels();
      setModels(data.models || []);
      setModelSource(data.source || "lm-studio");
      if (data.models && data.models.length > 0) {
        // Retain selection if valid, else pick first available
        if (!data.models.includes(selectedModel)) {
          setSelectedModel(data.models[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load models list", err);
    } finally {
      setIsFetchingModels(false);
    }
  };

  // Submit query and stream explanation
  const handleSubmitExplanation = () => {
    if (!question.trim() || !selectedModel) return;

    setExplanation("");
    setIsStreaming(true);

    let accumulatedText = "";

    streamExplanation(
      question,
      selectedModel,
      explanationLevel,
      // onChunk
      (chunk) => {
        accumulatedText += chunk;
        setExplanation(accumulatedText);
      },
      // onError
      (error) => {
        setExplanation(
          (prev) =>
            prev +
            `\n\n⚠️ **Tutor Interface Error**: Connection to tutor engine failed.\nDetail: ${error.message}`
        );
        setIsStreaming(false);
      },
      // onComplete
      () => {
        setIsStreaming(false);
        // Persist interaction to History
        const newHistoryItem = {
          id: Date.now().toString(),
          question: question.trim(),
          explanation: accumulatedText,
          explanation_level: explanationLevel,
          model: selectedModel,
          timestamp: new Date().toISOString()
        };
        
        setHistory((prev) => {
          const updated = [newHistoryItem, ...prev];
          localStorage.setItem("vortex_tutor_history", JSON.stringify(updated));
          return updated;
        });
      }
    );
  };

  const handleSelectHistoryItem = (item) => {
    setQuestion(item.question);
    setExplanation(item.explanation);
    setExplanationLevel(item.explanation_level);
    if (models.includes(item.model)) {
      setSelectedModel(item.model);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your tutor session logs?")) {
      setHistory([]);
      localStorage.removeItem("vortex_tutor_history");
    }
  };

  const handleSelectSuggestion = (promptText) => {
    setQuestion(promptText);
  };

  const handleClearScreen = () => {
    setExplanation("");
  };

  return (
    <div className="w-full min-h-screen bg-darkBg relative overflow-x-hidden flex flex-col z-10">
      {/* Dynamic colorful blobs based on difficulty levels - spans entire viewport */}
      <GlowingBackground explanationLevel={explanationLevel} />

      {/* Structured Centered Content Wrapper */}
      <div className="w-full max-w-7xl mx-auto flex-1 flex flex-col px-4 md:px-8 py-6">
        {/* Main App Navigation Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 select-none">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-violet-500 to-cyan-400 p-[1px] shadow-[0_0_20px_rgba(139,92,246,0.25)]">
              <div className="w-full h-full bg-slate-950 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={vortexLogo} alt="Vortex AI Logo" className="w-full h-full object-cover rounded-xl" />
              </div>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-extrabold font-display tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent flex items-center gap-2">
                VORTEX <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 tracking-wider">AI TUTOR</span>
              </h1>
              <span className="text-[10px] font-semibold text-slate-500 tracking-wider uppercase">
                Adaptive LLM Pedagogical Assistant
              </span>
            </div>
          </div>

          {/* Server Status Badges */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-white/5 text-[11px] font-semibold text-slate-400">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>LM Studio API:</span>
              <span className={`w-1.5 h-1.5 rounded-full ${modelSource === "lm-studio" ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
              <span className={modelSource === "lm-studio" ? "text-emerald-400" : "text-amber-400"}>
                {modelSource === "lm-studio" ? "Online" : "Fallback Mode"}
              </span>
            </div>
          </div>
        </header>

        {/* Configuration Control Panel */}
        <section className="mb-8">
          <ConfigPanel
            models={models}
            selectedModel={selectedModel}
            onSelectModel={setSelectedModel}
            explanationLevel={explanationLevel}
            onChangeLevel={setExplanationLevel}
            isFetchingModels={isFetchingModels}
            onRefreshModels={loadModelsList}
            modelSource={modelSource}
            isStreaming={isStreaming}
          />
        </section>

        {/* Main Core Dashboard layout */}
        <main className="flex-1 flex flex-col lg:flex-row gap-8 items-stretch mb-4 min-h-0 w-full">
          {/* Chat / Coding Workspace */}
          <div className="flex-1 min-w-0 transition-all duration-300">
            <ChatWorkspace
              question={question}
              setQuestion={setQuestion}
              explanation={explanation}
              isStreaming={isStreaming}
              onSubmit={handleSubmitExplanation}
              onClear={handleClearScreen}
              explanationLevel={explanationLevel}
              activeModel={selectedModel}
              isSidebarOpen={isSidebarOpen}
              onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            />
          </div>

          {/* Suggested prompts and History Sidebar */}
          {isSidebarOpen && (
            <div className="w-full lg:w-80 shrink-0 transition-all duration-300 animate-in fade-in slide-in-from-right-5 duration-200">
              <Sidebar
                history={history}
                onSelectHistoryItem={handleSelectHistoryItem}
                onClearHistory={handleClearHistory}
                onSelectSuggestion={handleSelectSuggestion}
                isStreaming={isStreaming}
              />
            </div>
          )}
        </main>

        {/* App Footer */}
        <footer className="mt-8 pt-4 border-t border-white/5 text-center flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] text-slate-600 font-semibold select-none">
          <span>© 2026 Vortex AI. Made for LLM Engineering, RAG & Agents Masterclass.</span>
          <div className="flex gap-4">
            <a href="#" className="hover:text-violet-400 transition-colors">Documentation</a>
            <a href="#" className="hover:text-violet-400 transition-colors">API References</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
