import React, { useMemo } from "react";

export default function GlowingBackground({ explanationLevel }) {
  // Compute color classes based on explanation level
  const glowConfig = useMemo(() => {
    switch (explanationLevel) {
      case 1: // Student - Calming teal & emerald
        return {
          glow1: "bg-teal-500/15 shadow-teal-500/5",
          glow2: "bg-emerald-500/15 shadow-emerald-500/5",
          accentLine: "from-teal-500 to-emerald-500"
        };
      case 2: // Junior - Energetic cyan & blue
        return {
          glow1: "bg-cyan-500/15 shadow-cyan-500/5",
          glow2: "bg-blue-500/15 shadow-blue-500/5",
          accentLine: "from-cyan-500 to-blue-500"
        };
      case 3: // Senior - Structured royal blue & indigo
        return {
          glow1: "bg-indigo-600/15 shadow-indigo-600/5",
          glow2: "bg-blue-600/15 shadow-blue-600/5",
          accentLine: "from-indigo-500 to-blue-600"
        };
      case 4: // Expert - Intense purple & violet
        return {
          glow1: "bg-violet-600/20 shadow-violet-600/5",
          glow2: "bg-fuchsia-600/15 shadow-fuchsia-600/5",
          accentLine: "from-violet-500 to-fuchsia-500"
        };
      default:
        return {
          glow1: "bg-violet-600/15 shadow-violet-600/5",
          glow2: "bg-cyan-600/15 shadow-cyan-600/5",
          accentLine: "from-violet-500 to-cyan-500"
        };
    }
  }, [explanationLevel]);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 bg-darkBg">
      {/* Dynamic ambient blobs */}
      <div
        className={`absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[120px] mix-blend-screen animate-glow-slow transition-all duration-1000 ${glowConfig.glow1}`}
      />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] rounded-full blur-[140px] mix-blend-screen animate-pulse-slow transition-all duration-1000 ${glowConfig.glow2}`}
      />
      
      {/* Decorative fine grid overlay */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.15) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}
      />
    </div>
  );
}
