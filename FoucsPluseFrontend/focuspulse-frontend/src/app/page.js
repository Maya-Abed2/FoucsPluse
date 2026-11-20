'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import FocusTimer from '@/components/FocusTimer';
import SoundscapesPlayer from '@/components/SoundscapesPlayer';
import PanicButton from '@/components/PanicButton';
import TaskManager from '@/components/TaskManager';
import AiRobotCompanion from '@/components/AiRobotCompanion';
import { LogOut, User } from 'lucide-react';
import Image from 'next/image';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/register');
      return;
    }

    const userData = localStorage.getItem('user');
    if (userData) {
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/register');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-rose-50/50 text-slate-800 flex items-center justify-center">
        <p className="text-emerald-600 animate-pulse text-sm font-medium">جاري التحقق من الجلسة...</p>
      </div>
    );
  }

  return (
    <main 
      className="min-h-screen text-slate-800 flex flex-col items-center justify-start p-6 relative bg-cover bg-center bg-fixed bg-no-repeat"
      style={{ backgroundImage: "url('/bg1.png')" }} 
    >
     {/* Nav */}
      <div className="w-full max-w-4xl flex items-center justify-between mb-8">
        <Image src="/logo1.png" alt="FocusPulse Logo" width={300} height={300} className="rounded-full" />
        <div className="flex items-center gap-4  bg-white/80 border border-emerald-100 px-6 py-3 rounded-4xl backdrop-blur-md shadow-sm">
        <div className="flex items-center gap-2 text-xs text-emerald-700 font-semibold">
          <div className="w-8 h-8 bg-emerald-100   rounded-full flex items-center justify-center">
            <User className="w-4 h-4 text-emerald-600" />
          </div>
          <span>{user?.username ||'Stranger'}</span>
          {user?.level && (
            <span className="bg-rose-100 text-rose-700 px-2 py-1 rounded-lg border border-rose-200 ml-2 font-bold">
              Level {user.level} | XP: {user.xp}
            </span>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition-all font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
          </div>
      </div>
    {/* Components */}
      <div className="w-full max-w-3xl flex flex-col gap-6 items-center">
        <div className="w-full flex flex-col md:flex-row gap-6 justify-center items-center">
        <FocusTimer  className=""/>
        <TaskManager />
        </div>
         <div className="flex sm:flex-row items-center  justify-between gap-6 w-full">
          <SoundscapesPlayer />
          <PanicButton />
          </div>
           <AiRobotCompanion />
      </div>
    </main>
  );
}