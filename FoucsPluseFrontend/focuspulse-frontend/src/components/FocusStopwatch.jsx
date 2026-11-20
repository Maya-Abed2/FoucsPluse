import React, { useState, useEffect } from 'react';

const FocusStopwatch = ({ taskId, taskTitle, partnerName, estimatedMinutes, onTaskCompleted }) => {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);


  useEffect(() => {
    let interval = null;
    if (isActive) {
      interval = setInterval(() => {
        setSeconds((prevSeconds) => prevSeconds + 1);
      }, 1000);
    } else if (!isActive && seconds !== 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isActive, seconds]);


  const formatTime = () => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsActive(!isActive);
  };

  const handleReset = () => {
    setIsActive(false);
    setSeconds(0);
  };

 
  const handleCompleteTask = async () => {
    setIsActive(false);
    setIsSubmitting(true);

    const actualDurationMinutes = Math.max(1, Math.round(seconds / 60)); 

    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}/complete-with-timer`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actualDurationMinutes: actualDurationMinutes,
          isCompleted: true,
        }),
      });

      const data = await response.json();

      if (response.ok) {
      
        if (data.whatsappUrl) {
          window.open(data.whatsappUrl, '_blank');
        }

        if (onTaskCompleted) {
          onTaskCompleted(data.task);
        }
      } else {
        alert(data.message || 'Error saving time');
      }
    } catch (error) {
      console.error('Error completing task:', error);
      alert('Failed to connect to the server.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-800 text-white p-6 rounded-2xl shadow-lg max-w-md mx-auto my-4 text-center border border-purple-500/30">
      <h3 className="text-xl font-bold mb-2 text-purple-300">🎯 {taskTitle}</h3>
      
      {partnerName && (
        <p className="text-sm text-slate-400 mb-4">
          Partner: <span className="text-purple-400 font-semibold">{partnerName}</span> 🤝
        </p>
      )}

      {/*Timer */}
      <div className="text-5xl font-extrabold my-6 font-mono tracking-wider text-emerald-400 bg-slate-900/80 py-4 rounded-xl border border-emerald-500/20 shadow-inner">
        {formatTime()}
      </div>

      <p className="text-xs text-slate-400 mb-6">
       suggested: {estimatedMinutes} min
      </p>

      
      <div className="flex justify-center gap-3">
        <button
          onClick={handleStartPause}
          className={`px-5 py-2.5 rounded-xl font-bold transition-all shadow-md ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-slate-900'
              : 'bg-emerald-500 hover:bg-emerald-600 text-slate-900'
          }`}
        >
          {isActive ? '⏸️ Pause' : seconds > 0 ? '▶️ Resume' : '🚀 Start'}
        </button>

        {seconds > 0 && (
          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-xl font-semibold transition-all"
          >
            🔄 Reset
          </button>
        )}

        <button
          onClick={handleCompleteTask}
          disabled={isSubmitting}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:bg-slate-600 text-white rounded-xl font-bold transition-all shadow-md"
        >
          {isSubmitting ? 'Saving...' : '🎉 Complete & Send Report'}
        </button>
      </div>
    </div>
  );
};

export default FocusStopwatch;