import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, ShieldCheck, AlertCircle, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-primary-blue p-3 rounded-2xl shadow-lg">
            <ShieldCheck size={40} className="text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">NexTest Portal</h2>
        <p className="mt-2 text-sm text-gray-600 font-medium">
          Digital Examination & Assessment System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-10 shadow-xl rounded-2xl border border-gray-100">
          <form className="space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-center gap-3">
                <AlertCircle className="text-red-500 shrink-0" size={20} />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                placeholder="e.g. user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide mb-1">
                Password
              </label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-blue focus:border-transparent outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-md text-sm font-bold text-white bg-primary-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue transition-all active:scale-95 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <LogIn size={18} /> SIGN IN TO EXAM
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-400 uppercase font-bold text-[10px] tracking-widest">Authorized Access Only</span>
              </div>
            </div>
          </div>
        </div>
        <p className="mt-8 text-center text-xs text-gray-400 font-medium">
          &copy; 2026 NexTest Assessment Solutions. All rights reserved.
        </p>
      </div>
    </div>
  );
};
