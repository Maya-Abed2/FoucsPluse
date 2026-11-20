"use client";
import { useState, useEffect } from "react";
import {
  PlusCircle,
  CheckCircle,
  Circle,
  Layers,
  Zap,
  Trash2,
  Clock,
  Share2,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import {
  createTask,
  getUserTasks,
  toggleMicroTask,
  deleteTask,
} from "@/services/taskService";
import axios from "axios";
import Image from "next/image";

export default function TaskManager() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requiredEnergy, setRequiredEnergy] = useState(2);
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [userStats, setUserStats] = useState({ totalXP: 0, level: 1 });
  const [activeTimers, setActiveTimers] = useState({});

  const getCurrentUserId = () => {
    if (typeof window === "undefined") return 1;
    
    const directId = localStorage.getItem("userId");
    if (directId) return Number(directId);

    const userObjStr = localStorage.getItem("user");
    if (userObjStr) {
      try {
        const userObj = JSON.parse(userObjStr);
        const parsedId = userObj.id || userObj.Id || userObj.userId;
        if (parsedId) return Number(parsedId);
      } catch (e) {
        console.error("Error parsing user from localStorage", e);
      }
    }

    return 1;
  };


  const loadTasks = async () => {
    const activeId = getCurrentUserId();
    const data = await getUserTasks(activeId);
    setTasks(data);
    if (data.length > 0 && data[0].user) {
      setUserStats({
        totalXP: data[0].user.totalXP || 0,
        level: data[0].user.level || 1,
      });
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTasks();
  }, []);

  useEffect(() => {
    const intervals = [];
    Object.keys(activeTimers).forEach((taskId) => {
      if (activeTimers[taskId]?.isActive) {
        intervals.push(
          setInterval(() => {
            setActiveTimers((prev) => ({
              ...prev,
              [taskId]: {
                ...prev[taskId],
                seconds: (prev[taskId]?.seconds || 0) + 1,
              },
            }));
          }, 1000),
        );
      }
    });
    return () => intervals.forEach((interval) => clearInterval(interval));
  }, [activeTimers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const activeId = getCurrentUserId();
    setLoading(true);
    try {
      await createTask({
        userId: activeId, 
        title,
        description,
        requiredEnergy: parseInt(requiredEnergy),
        partnerName: partnerName.trim() || null,
        partnerPhone: partnerPhone.trim() || null,
        estimatedDurationMinutes: 30,
        microTasks: [
          { title: " First Suggested Step ", estimatedMinutes: 10 },
          { title: "Second Suggested Step", estimatedMinutes: 20 },
        ],
      });
      setTitle("");
      setDescription("");
      setPartnerName("");
      setPartnerPhone("");
      await loadTasks();
    } catch (err) {
      alert(err.message || " failed to create task, please try again.");
    } finally {
      setLoading(false);
    }
  };

  // تبديل حالة الخطوة
const handleToggleStep = async (microTaskId) => {
    try {
      const res = await toggleMicroTask(microTaskId);
      
      const newStats = {
        totalXP: res.totalXP,
        level: res.level,
      };
      setUserStats(newStats);


      const userObjStr = localStorage.getItem("user");
      if (userObjStr) {
        try {
          const userObj = JSON.parse(userObjStr);
          userObj.totalXP = res.totalXP;
          userObj.xp = res.totalXP;
          userObj.level = res.level;
          localStorage.setItem("user", JSON.stringify(userObj));
        } catch (e) {
          console.error("Error updating localStorage user stats", e);
        }
      }

      await loadTasks();
    } catch (err) {
      console.error(err);
    }
  };

  // حذف مهمة
  const handleDeleteTask = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
        await loadTasks();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const toggleTimer = (taskId) => {
    setActiveTimers((prev) => ({
      ...prev,
      [taskId]: {
        seconds: prev[taskId]?.seconds || 0,
        isActive: !prev[taskId]?.isActive,
      },
    }));
  };

  const resetTimer = (taskId) => {
    setActiveTimers((prev) => ({
      ...prev,
      [taskId]: { seconds: 0, isActive: false },
    }));
  };


  
 const handleCompleteWithTimer = async (task) => {
    const timer = activeTimers[task.id] || { seconds: 0 };
    const actualMinutes = timer.seconds > 0 ? Math.max(1, Math.ceil(timer.seconds / 60)) : 1;
    const activeId = getCurrentUserId();

    try {
      const response = await axios.put(
        `http://localhost:5102/api/tasks/${task.id}/complete-with-timer`,
        {
          actualDurationMinutes: actualMinutes,
          isCompleted: true,
          userId: activeId 
        }
      );

      if (response.data && response.data.totalXP !== undefined) {
        const newStats = {
          totalXP: response.data.totalXP,
          level: response.data.level,
        };
        setUserStats(newStats);

        const userObjStr = localStorage.getItem("user");
        if (userObjStr) {
          try {
            const userObj = JSON.parse(userObjStr);
            userObj.totalXP = response.data.totalXP;
            userObj.xp = response.data.totalXP;
            userObj.level = response.data.level;
            localStorage.setItem("user", JSON.stringify(userObj));
          } catch (e) {
            console.error("Error updating user in localStorage", e);
          }
        }
      }

      alert(
        response.data.message ||
          "Task completed and report sent to partner successfully! 🎉"
      );

      await loadTasks();
    } catch (error) {
      console.error("Error completing task with timer:", error);
      alert("An error occurred while completing the task, please try again.");
    }
  };

  return (
    <div className="bg-white-50 backdrop-blur-md rounded-2xl border border-stone-200 shadow-xl max-w-lg mx-auto mt-6 text-black overflow-hidden">
      <div className="flex items-center justify-between mb-4 p-6">
        <div className="flex items-center gap-2 text-red-700">
          <Layers className="w-6 h-6" />
          <h3 className="text-lg font-bold">My Tasks</h3>
        </div>
        <div className="flex items-center gap-1.5 bg-yellow-100 px-3 py-1.5 rounded-full  text-xs font-bold text-amber-400">
         <Image src="/cup.png" alt="Trophy Icon" width={30} height={20} />
          <span>
             Level {userStats.level} ({userStats.totalXP} XP)
          </span>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-3 mb-6 p-4 rounded-xl m-6"
      >
        <input
          type="text"
          placeholder="your task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full  border border-red-300 rounded-lg px-3 py-2 text-sm text-red-950 focus:outline-none focus:border-red-500"
          required
        />
        <textarea
          placeholder="tell us more about your task (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm text-red-950 focus:outline-none focus:border-red-500 resize-none h-16"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="pt-2">
            <input
              type="text"
              placeholder="partner name or email"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              className="w-full  border border-red-300 rounded-lg px-3 py-2 text-xs text-red-950 focus:outline-none focus:border-red-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 m-2">
          <div className="flex items-center gap-1.5 text-xs ">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Energy:</span>
            <select
              value={requiredEnergy}
              onChange={(e) => setRequiredEnergy(e.target.value)}
              className=" border border-red-700 rounded px-2 py-1 text-xs"
            >
              <option value="1">low 🟢</option>
              <option value="2">medium 🟡</option>
              <option value="3">high 🔴</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-1 bg-green-400 hover:bg-green-500 text-white font-bold text-sm rounded-lg shadow transition-all disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? " Splitting..." : " Split Task "}</span>
          </button>
        </div>
      </form>

      {/* قائمة المهام */}
      <div className="space-y-4 max-h-112.5 overflow-y-auto pr-1 m-6">
        {tasks.length === 0 ? (
          <p className="text-center text-xs text-slate-400 py-4">
            No tasks available. Add your first task!
          </p>
        ) : (
          tasks.map((task) => {
            const timer = activeTimers[task.id] || {
              seconds: 0,
              isActive: false,
            };
            return (
              <div
                key={task.id}
                className=" p-4 rounded-xl border border-red-300 space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-red-700 text-sm">
                      {task.title}
                    </h4>
                    {task.estimatedDurationMinutes > 0 && (
                      <span className="text-[11px] text-purple-400 flex items-center gap-1 mt-0.5">
                        <Clock className="w-3 h-3" /> suggested time :{" "}
                        {task.estimatedDurationMinutes} min
                      </span>
                    )}
                    {task.partnerName && (
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <Share2 className="w-3 h-3 text-blue-400" /> your partner
                       : {task.partnerName}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors"
                    title=" Delete Task"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {task.description && (
                  <p className="text-xs text-slate-400">{task.description}</p>
                )}

                <div className="bg-linear-to-br from-[#304F9F] via-[#1D356B] to-[#123B59] p-3 rounded-xl flex items-center justify-between">
                  <div className="font-mono text-xl font-extrabold text-white">
                    {formatTime(timer.seconds)}
                  </div>
                  <p className="text-white text-2xl mx-2">|</p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleTimer(task.id)}
                      className={`px-3 py-3 rounded-full text-xs font-bold flex items-center gap-1 ${
                        timer.isActive
                          ? "bg-amber-500 text-slate-950"
                          : "bg-blue-600 hover:bg-blue-500 text-white"
                      }`}
                    >
                      {timer.isActive ? (
                        <Pause className="w-3.5 h-3.5" />
                      ) : (
                        <Play className="w-3.5 h-3.5" />
                      )}
                      
                    </button>
                    {timer.seconds > 0 && (
                      <button
                        onClick={() => resetTimer(task.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg"
                        title="Reset Timer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button
                      onClick={() => handleCompleteWithTimer(task)}
                      className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-bold shadow"
                    >
                      🎉 Complete and Send to Partner
                    </button>
                  </div>
                </div>

                {/* الخطوات المصغرة */}
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-[11px] text-slate-500 font-semibold">
                    Micro Steps:
                  </span>
                  {task.microTasks &&
                    task.microTasks.map((micro) => (
                      <div
                        key={micro.id}
                        onClick={() => handleToggleStep(micro.id)}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all border ${
                          micro.isCompleted
                            ? " border-blue-800/40 text-gray-600 line-through"
                            : " border-slate-700/50 hover:bg-slate-700/40 text-red-500"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium">
                            {micro.title}
                          </span>
                          {micro.estimatedMinutes > 0 && (
                            <span className="text-[10px] bg-slate-900 px-1.5 py-0.5 rounded text-green-300">
                              ~{micro.estimatedMinutes} minutes
                            </span>
                          )}
                        </div>
                        {micro.isCompleted ? (
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                        )}
                      </div>
                    ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      <Image src="/char6.png" alt="" width={600} height={50}  />
    </div>
  );
}