'use client';
import { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, } from 'lucide-react';
import Image from 'next/image';

export default function FocusTimer() {
  const totalTime = 25 * 60; // 25 دقيقة كافتراضي للعمل
  const [timeLeft, setTimeLeft] = useState(totalTime);
  const [isRunning, setIsRunning] = useState(false);
  const [mode, setMode] = useState('work'); // 'work' أو 'break'

  useEffect(() => {
    let timer = null;

    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            setIsRunning(false);
            alert(mode === 'work' ? 'انتهت جلسة التركيز! حان وقت الاستراحة 🌿' : 'انتهت الاستراحة، لنعود للعمل بقوة! 💪');
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, mode]);

 
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => setIsRunning((prev) => !prev);

  const resetTimer = (minutes, newMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(minutes * 60);
  };

  
  const currentTotal = mode === 'work' ? 25 * 60 : 5 * 60;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / currentTotal) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-white/90 backdrop-blur-md rounded-3xl shadow-xl border border-slate-100 max-w-md mx-auto mt-6 relative">
      
      
      <div className="flex items-center gap-2 mb-4 text-slate-900 font-bold">
        <Image src="/goal.png" alt="Focus Icon" width={32} height={32} />
        <h2 className="text-lg tracking-wide">Focus Session</h2>
      </div>

      {/* (SVG Circular Progress) */}
      <div className="relative flex items-center justify-center my-4">
        <svg className="w-64 h-64 transform -rotate-90">
          {/* الدائرة الخلفية الرمادية الفاتحة */}
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            className="text-slate-100 fill-none"
          />
          
          <circle
            cx="128"
            cy="128"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={`fill-none transition-all duration-1000 ${
              mode === 'work' ? 'text-blue-400' : 'text-emerald-400'
            }`}
          />
        </svg>

        {/* timer*/}
        <div className="absolute flex flex-col items-center justify-center">
          <div className="text-4xl  font-extrabold tracking-wider text-slate-900">
            {formatTime(timeLeft)}
          </div>
          <span className="text-xs text-slate-400 font-medium mt-1">min</span>
        </div>
      </div>

      {/* (Segmented Switch) */}
      <div className="flex bg-slate-100 p-1 rounded-full border border-slate-200 mb-6 w-full max-w-xs shadow-inner">
        <button
          onClick={() => resetTimer(25, 'work')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
            mode === 'work' 
              ? 'bg-blue-400 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
           Focus
        </button>
        <button
          onClick={() => resetTimer(5, 'break')}
          className={`flex-1 py-2 text-xs font-bold rounded-full transition-all ${
            mode === 'break' 
              ? 'bg-emerald-500 text-white shadow-md' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Break
        </button>
      </div>

      
      <div className="flex items-center gap-3 w-full max-w-xs">
        <button
          onClick={toggleTimer}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold text-white shadow-lg shadow-blue-500/20 transition-all ${
            isRunning ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
          {isRunning ? 'Pause' : (mode === 'work' ? 'Start Focus' : 'Start Break')}
        </button>

        <button
          onClick={() => resetTimer(mode === 'work' ? 25 : 5, mode)}
          className="p-3.5 bg-white hover:bg-slate-50 text-slate-600 rounded-2xl transition-all shadow-sm border border-slate-200"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}