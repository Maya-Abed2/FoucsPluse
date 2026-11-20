'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser, registerUser } from '@/services/authService';
import { Lock, Mail, User, Sparkles, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await loginUser(email, password);
      } else {
        await registerUser(username, email, password);
      }
     
      router.push('/');
    } catch (err) {
      setError(err.message || 'حدث خطأ ما، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-cyan-500/10 border border-cyan-500/30 rounded-2xl text-cyan-400 mb-3 shadow-inner">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-white">
            {isLogin ? ' welcome back to FocusPulse' : 'join FocusPulse'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'log in to FocusPulse' : 'create an account to start your journey and earn XP!'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-400 text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-xs text-slate-300 mb-1.5 font-medium">اسم المستخدم</label>
              <div className="relative">
                <User className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="اكتب اسمك هنا..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs text-slate-300 mb-1.5 font-medium">البريد الإلكتروني</label>
            <div className="relative">
              <Mail className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1.5 font-medium">كلمة المرور</label>
            <div className="relative">
              <Lock className="absolute right-3 top-3 w-4 h-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 pr-10 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-medium py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs disabled:opacity-50"
          >
            <span>{loading ? 'processing...' : isLogin ? 'login' : 'create account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            {isLogin ? 'Don\'t have an account? Click here to join' : 'Already have an account? Log in here'}
          </button>
        </div>

      </div>
    </div>
  );
}