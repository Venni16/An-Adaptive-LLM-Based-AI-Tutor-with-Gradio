import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Send, FileText, Copy, Check, Sparkles, X, ChevronRight, PanelRight, PanelRightClose } from "lucide-react";
import vortexLogo from "../assets/vortex_logo.png";

// Interactive Code Block Component with Copy-to-Clipboard functionality
function CustomCodeBlock({ code, language }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  };

  return (
    <div className="my-5 rounded-xl border border-white/10 overflow-hidden bg-slate-950/90 shadow-2xl font-mono">
      {/* Code Card Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-white/5 select-none">
        <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
          {language || "code"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 hover:text-white transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code Text Content */}
      <div className="p-4 overflow-x-auto text-[12.5px] leading-relaxed text-slate-300">
        <pre><code>{code}</code></pre>
      </div>
    </div>
  );
}

export default function ChatWorkspace({
  question,
  setQuestion,
  explanation,
  isStreaming,
  onSubmit,
  onClear,
  explanationLevel,
  activeModel,
  isSidebarOpen,
  onToggleSidebar
}) {
  const [copiedExplanation, setCopiedExplanation] = useState(false);
  const containerRef = useRef(null);
  const bottomRef = useRef(null);

  // Auto-scroll explanation output window down while streaming is active ONLY if user is already at the bottom
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      const scrollContainer = containerRef.current;
      const threshold = 120; // pixels from bottom threshold
      const isNearBottom = 
        scrollContainer.scrollHeight - 
        scrollContainer.scrollTop - 
        scrollContainer.clientHeight <= threshold;

      if (isNearBottom) {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: "auto" // Auto makes rapid text streaming scrolling feel much smoother than smooth scrolling
        });
      }
    }
  }, [explanation, isStreaming]);

  // Smooth scroll to bottom once when streaming starts
  useEffect(() => {
    if (isStreaming && containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [isStreaming]);

  const handleCopyExplanation = async () => {
    if (!explanation) return;
    try {
      await navigator.clipboard.writeText(explanation);
      setCopiedExplanation(true);
      setTimeout(() => setCopiedExplanation(false), 2000);
    } catch (err) {
      console.error("Failed to copy explanation!", err);
    }
  };

  // Custom renderer overrides for react-markdown
  const markdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "");
      const codeVal = String(children).replace(/\n$/, "");
      return !inline && match ? (
        <CustomCodeBlock code={codeVal} language={match[1]} />
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    }
  };

  const levelTag = () => {
    switch (explanationLevel) {
      case 1: return <span className="bg-teal-950/60 border border-teal-500/20 text-teal-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Student Persona</span>;
      case 2: return <span className="bg-cyan-950/60 border border-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Junior Dev</span>;
      case 3: return <span className="bg-indigo-950/60 border border-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Senior Dev</span>;
      case 4: return <span className="bg-violet-950/60 border border-violet-500/20 text-violet-400 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Expert Architect</span>;
      default: return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col gap-6">
      {/* Input Console */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (question.trim() && !isStreaming) onSubmit();
        }}
        className="glass rounded-2xl p-5 flex flex-col gap-3.5 relative"
      >
        <div className="flex items-center gap-2 text-slate-400 font-semibold font-display text-xs tracking-wider uppercase">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Curiosity Console</span>
        </div>

        <div className="relative">
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={isStreaming}
            placeholder="Type a programming topic or question here (e.g. 'How do closures work in JS?' or 'Explain binary tree traversal')..."
            rows={3}
            className="w-full bg-slate-950/40 border border-white/5 rounded-xl px-4 py-3 text-sm leading-relaxed text-slate-200 outline-none placeholder:text-slate-500 focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500/20 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
            onKeyDown={(e) => {
              // Submit on Enter (without Shift key)
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (question.trim() && !isStreaming) onSubmit();
              }
            }}
          />
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500 font-medium select-none hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded font-semibold text-slate-400 text-[9px] shadow-sm">Enter</kbd> to tutor, <kbd className="px-1.5 py-0.5 bg-slate-900 border border-white/10 rounded font-semibold text-slate-400 text-[9px] shadow-sm">Shift+Enter</kbd> for line break.
          </span>
          <div className="flex items-center gap-3 ml-auto">
            {question && (
              <button
                type="button"
                onClick={() => setQuestion("")}
                disabled={isStreaming}
                className="p-2 rounded-xl text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] active:scale-95 transition-all disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <button
              type="submit"
              disabled={isStreaming || !question.trim()}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold font-display text-xs text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 border border-violet-400/20 hover:border-violet-400/35 active:scale-[0.97] transition-all disabled:opacity-40 disabled:pointer-events-none shadow-[0_0_20px_rgba(139,92,246,0.15)] select-none"
            >
              <span>Consult Tutor</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </form>

      {/* Output Console (Explanation IDE Screen) */}
      <div className="glass rounded-2xl flex-1 flex flex-col min-h-[350px] sm:min-h-[450px] overflow-hidden">
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-4 border-b border-white/5 bg-slate-950/20 select-none">
          <div className="flex items-center gap-2.5">
            <div className="flex gap-1.5">
              <span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/30" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/30" />
              <span className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/30" />
            </div>
            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              <FileText className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold text-slate-300 font-display tracking-wider">TUTORIAL_OUT.md</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2">
              {levelTag()}
              {activeModel && (
                <span className="bg-slate-900 border border-white/5 text-slate-400 px-2 py-0.5 rounded text-[10px] font-medium max-w-[120px] truncate">
                  {activeModel}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-2 sm:pl-3">
              {explanation && (
                <>
                  <button
                    onClick={handleCopyExplanation}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] active:scale-95 transition-all"
                    title="Copy full explanation"
                  >
                    {copiedExplanation ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={onClear}
                    disabled={isStreaming}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 active:scale-95 transition-all disabled:opacity-50"
                    title="Clear screen"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              )}
              
              {/* Sidebar toggle button */}
              <button
                onClick={onToggleSidebar}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] active:scale-95 transition-all"
                title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
              >
                {isSidebarOpen ? (
                  <PanelRightClose className="w-4 h-4 text-violet-400" />
                ) : (
                  <PanelRight className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Text Area Output Screen */}
        <div ref={containerRef} className="flex-1 p-4 sm:p-6 overflow-y-auto max-h-[500px] lg:max-h-[650px] xl:max-h-[75vh] leading-relaxed relative bg-slate-950/10">
          {!explanation && !isStreaming ? (
            // Empty State
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/30 flex items-center justify-center overflow-hidden mb-4 shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:scale-105 transition-all">
                <img src={vortexLogo} alt="Vortex AI Logo" className="w-full h-full object-cover" />
              </div>
              <h3 className="text-sm font-bold text-slate-200 mb-1.5 font-display uppercase tracking-wider">
                Awaiting Tutor Inquiry
              </h3>
              <p className="text-xs text-slate-400 max-w-[280px] leading-relaxed">
                Submit a topic using the Curiosity Console or select one of our Quick Tutorials to generate an explanation.
              </p>
            </div>
          ) : (
            // Streamed Explanation Content
            <div className="prose-custom">
              <ReactMarkdown components={markdownComponents}>
                {explanation}
              </ReactMarkdown>

              {/* Streaming Cursor blinking effect */}
              {isStreaming && (
                <span className="inline-flex items-center ml-1 text-violet-400 animate-pulse font-bold">
                  <ChevronRight className="w-4 h-4 inline" />
                  <span className="w-2 h-4 bg-violet-400 rounded-sm inline-block animate-bounce" />
                </span>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
