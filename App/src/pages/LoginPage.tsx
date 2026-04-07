import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { ThemeToggle } from '../components/ThemeToggle';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true); // Start with loading to check session
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/dashboard');
      } else {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-main)] flex flex-col justify-center py-12 px-6 lg:px-8 font-sans transition-colors duration-300">
      <div className="absolute top-8 right-8">
        <ThemeToggle />
      </div>
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-blue p-4 rounded-2xl shadow-xl shadow-blue-500/20">
            <ShieldCheck size={40} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">NexTest Portal</h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] font-medium">
          Digital Examination & Assessment System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-[var(--bg-card)] py-10 px-10 shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 transition-all duration-300">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-rose-500/10 border-l-4 border-rose-500 p-4 flex items-center gap-3 rounded-r-lg">
                <AlertCircle className="text-rose-500 shrink-0" size={20} />
                <p className="text-sm text-rose-600 dark:text-rose-400 font-bold">{error}</p>
              </div>
            )}

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Access Identifier
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Security Key
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-[var(--bg-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-primary-blue/20 focus:border-primary-blue outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-600"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-3 py-4 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/25 text-sm font-black text-white bg-primary-blue hover:bg-blue-700 hover:-translate-y-0.5 focus:outline-none transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-widest"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <LogIn size={18} /> Authenticate
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="px-3 bg-[var(--bg-card)] text-slate-400 font-black uppercase tracking-[0.3em]">Authorized Access Only</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-10 text-center text-[10px] text-slate-400 font-bold uppercase tracking-widest">
          &copy; 2026 NexTest Intelligence Systems
        </p>
      </div>
    </div>
  );
};
