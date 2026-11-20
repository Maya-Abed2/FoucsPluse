"use client";
import { useState } from "react";
import {  X, CheckCircle2 } from "lucide-react";
import { getPanicTask } from "@/services/panicService";
import Image from "next/image";

export default function PanicButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [panicData, setPanicData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePanicClick = async () => {
    setIsOpen(true);
    setLoading(true);
    const data = await getPanicTask(1); 
    setPanicData(data);
    setLoading(false);
  };

  return (
    <>
      
      <div className="flex justify-center mt-6">
        <button
          onClick={handlePanicClick}
          className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl shadow-lg shadow-red-900/30 transition-all border border-red-500/30 animate-pulse"
        >
          <Image src="/sadTt.png" alt="Panic Icon" width={30} height={30} />
          <span>I feel extremely distracted! (Panic)</span>
        </button>
      </div>

      {/* نافذة الإنقاذ المنبثقة */}
      {isOpen && (
        <div className="fixed inset-0 bg-white-70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-red-300 p-6 rounded-2xl max-w-md w-full shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 left-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-rose-400 mb-4">
              <Image
                src="/char4.png"
                alt="Panic Icon"
                width={100}
                height={30}
              />
              <h3 className="text-lg font-bold">Focus Rescue Session 🚨</h3>
            </div>

            {loading ? (
              <div className="py-8 text-center text-slate-400">
                {" "}
                searching for the easiest step for you... ⏳
              </div>
            ) : panicData && panicData.microTaskId ? (
              <div className="space-y-4">
                <p className="text-sm text-red-700 font-medium bg-white p-3 rounded-xl border border-red-300">
                  {panicData.message}
                </p>

                <div className="p-4 bg-purple-200 rounded-xl space-y-2">
                  <span className="text-xs bg-purple-300 px-2 py-0.5 rounded">
                    From Task: {panicData.parentTaskTitle}
                  </span>
                  <h4 className="font-bold  text-base">
                    {panicData.title}
                  </h4>
                  <p className="text-sm">
                    {panicData.description}
                  </p>
                </div>

                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-md transition-all"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>I understand, I&apos;ll take this step now 💪</span>
                </button>
              </div>
            ) : (
              <div className="py-8 text-center space-y-3">
                <p className="text-emerald-400 font-semibold">
                  {panicData?.message ||
                    "Excellent! There are no remaining tasks for you right now 🎉"}
                </p>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold rounded-xl transition-all"
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
