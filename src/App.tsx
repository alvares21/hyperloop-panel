import { useState, useEffect } from 'react';
import { useHyperloop } from './useHyperloop';
import { AlertTriangle, Power, Square } from 'lucide-react';

const matrixLines = Array.from({ length: 60 }).map((_, i) => ({
  id: i,
  left: Math.random() * 100,
  baseDuration: Math.random() * 3 + 1.5,
  delay: Math.random() * -5,
  height: Math.floor(Math.random() * 40) + 10,
  opacity: Math.random() * 0.6 + 0.2
}));

function App() {
  const { speed, temperature, pressure, systemState, handleStart, handleStop, handleEmergency } = useHyperloop();
  
  const [displaySpeed, setDisplaySpeed] = useState(0);

  useEffect(() => {
    let frameId: number;
    const updateSmoothSpeed = () => {
      setDisplaySpeed(prev => {
        const diff = speed - prev;
        if (Math.abs(diff) < 0.5) return speed;
        return prev + diff * 0.08;
      });
      frameId = requestAnimationFrame(updateSmoothSpeed);
    };
    frameId = requestAnimationFrame(updateSmoothSpeed);
    return () => cancelAnimationFrame(frameId);
  }, [speed]);

  const getStatusColor = (state: string) => {
    switch (state) {
      case 'ACCELERATING': return 'text-cyan-400';
      case 'CRUISING': return 'text-blue-400';
      case 'DECELERATING': return 'text-amber-400';
      case 'EMERGENCY_STOP': return 'text-red-500 animate-pulse';
      default: return 'text-slate-500';
    }
  };

  const getTempGlow = (temp: number) => {
    if (temp > 35) return 'text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]';
    if (temp > 30) return 'text-amber-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)]';
    return 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.5)]';
  };

  const speedPercent = Math.min((displaySpeed / 1200) * 100, 100);
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (speedPercent / 100) * circumference;

  const tempHeight = Math.min(((temperature - 20) / 30) * 100, 100);
  const pressureHeight = Math.min((pressure / 150) * 100, 100);

  const speedMultiplier = 0.5 + (displaySpeed / 1200) * 4.5;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center font-sans text-slate-200 overflow-hidden relative">
      
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <style>
          {`
            @keyframes stream {
              0% { transform: translateY(-100vh); opacity: 0; }
              10% { opacity: var(--max-opacity); }
              90% { opacity: var(--max-opacity); }
              100% { transform: translateY(100vh); opacity: 0; }
            }
            .data-line {
              position: absolute;
              width: 2px;
              background: linear-gradient(to bottom, transparent, rgba(34, 211, 238, 1), transparent);
              animation: stream linear infinite;
              filter: drop-shadow(0 0 10px rgba(34,211,238,0.8));
            }
          `}
        </style>
        {matrixLines.map(line => (
          <div 
            key={line.id} 
            className="data-line" 
            style={{
              left: `${line.left}%`, 
              height: `${line.height}vh`,
              top: `-${line.height}vh`,
              animationDuration: `${line.baseDuration / speedMultiplier}s`, 
              animationDelay: `${line.delay}s`,
              '--max-opacity': line.opacity
            } as React.CSSProperties}
          />
        ))}
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(2,6,23,0.8)_100%)]"></div>
      </div>

      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-4 tracking-[0.3em] uppercase z-10">
        <span className="text-slate-500 text-xs">System State</span>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor(systemState)} bg-current shadow-[0_0_10px_currentColor]`}></div>
          <span className={`font-bold text-sm ${getStatusColor(systemState)}`}>{systemState}</span>
        </div>
      </div>

      <div className="flex items-center justify-center gap-12 md:gap-24 w-full max-w-6xl px-8 z-10 mt-12">
        
        <div className="flex flex-col items-end gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500">Hull Temp</span>
          <div className={`text-3xl font-mono ${getTempGlow(temperature)} transition-all duration-300`}>
            {temperature.toFixed(1)}°
          </div>
          <div className="h-48 w-1 bg-slate-900 rounded-full relative mt-4 overflow-hidden">
            <div 
              className={`absolute bottom-0 w-full transition-all duration-500 ease-out bg-current ${getTempGlow(temperature)}`}
              style={{ height: `${tempHeight}%` }}
            ></div>
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <div className={`absolute w-[340px] h-[340px] border border-slate-800 rounded-full border-t-cyan-500/30 ${systemState === 'ACCELERATING' ? 'animate-[spin_3s_linear_infinite]' : systemState === 'DECELERATING' ? 'animate-[spin_4s_linear_infinite_reverse]' : ''}`}></div>
          
          <svg className="w-[300px] h-[300px] transform -rotate-90">
            <circle cx="150" cy="150" r={radius} stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-900" />
            
            <circle 
              cx="150" 
              cy="150" 
              r={radius} 
              stroke="currentColor" 
              strokeWidth="12" 
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.6)] transition-all duration-75 ease-linear"
            />
          </svg>

          <div className="absolute flex flex-col items-center">
            <span className="text-slate-500 text-xs uppercase tracking-[0.2em] mb-1">Velocity</span>
            <div className="text-7xl font-mono font-light text-white tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
              {Math.floor(displaySpeed).toString().padStart(4, '0')}
            </div>
            <span className="text-cyan-500/50 text-sm tracking-widest mt-1">KM/H</span>
          </div>
        </div>

        <div className="flex flex-col items-start gap-2">
          <span className="text-xs uppercase tracking-widest text-slate-500">Pressure</span>
          <div className="text-3xl font-mono text-teal-400 drop-shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-300">
            {pressure.toFixed(1)}
          </div>
          <div className="h-48 w-1 bg-slate-900 rounded-full relative mt-4 overflow-hidden">
            <div 
              className="absolute bottom-0 w-full bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.8)] transition-all duration-500 ease-out"
              style={{ height: `${pressureHeight}%` }}
            ></div>
          </div>
        </div>

      </div>

      <div className="absolute bottom-12 flex gap-6 z-10">
        <button 
          onClick={handleStart}
          disabled={systemState !== 'IDLE' && systemState !== 'EMERGENCY_STOP'}
          className="group relative px-10 py-4 bg-slate-900/50 hover:bg-cyan-950/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-95
          [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]
          border-l-2 border-b-2 border-cyan-500/30 hover:border-cyan-400"
        >
          <div className="flex items-center gap-3 text-cyan-500 group-hover:text-cyan-300 text-sm font-bold tracking-[0.2em]">
            <Power className="w-4 h-4" /> ENGAGE
          </div>
        </button>
        
        <button 
          onClick={handleStop}
          disabled={systemState === 'IDLE' || systemState === 'DECELERATING'}
          className="group relative px-10 py-4 bg-slate-900/50 hover:bg-amber-950/40 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-300 active:scale-95
          [clip-path:polygon(15px_0,100%_0,100%_calc(100%-15px),calc(100%-15px)_100%,0_100%,0_15px)]
          border-l-2 border-b-2 border-amber-500/30 hover:border-amber-400"
        >
          <div className="flex items-center gap-3 text-amber-500 group-hover:text-amber-300 text-sm font-bold tracking-[0.2em]">
            <Square className="w-4 h-4" /> BRAKE
          </div>
        </button>
        
        <button 
          onClick={handleEmergency}
          className="group relative px-12 py-4 bg-red-950/20 hover:bg-red-900/40 transition-all duration-300 active:scale-95
          [clip-path:polygon(20px_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%,0_20px)]
          border-l-2 border-b-2 border-red-500 hover:shadow-[0_0_30px_rgba(220,38,38,0.3)]"
        >
          <div className="flex items-center gap-3 text-red-500 group-hover:text-red-400 text-sm font-bold tracking-[0.3em]">
            <AlertTriangle className="w-5 h-5 animate-pulse" /> E-STOP
          </div>
        </button>
      </div>

    </div>
  );
}

export default App;