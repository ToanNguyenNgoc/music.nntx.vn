import React, { useState } from 'react';
import { authService } from '../../services/api';
import { useAuthStore } from '../../store/useAuthStore';
import { Loader2, Music as MusicIcon, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginFormProps {
  onSwitchToRegister: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister }) => {
  const [email, setEmail] = useState('ngoctoan06011998@gmail.com');
  const [password, setPassword] = useState('06011998');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await authService.login(email, password);
      if (response.success) {
        setAuth(response.context.data, response.context.accessToken, response.context.expiredAt);
      } else {
        setError('Invalid email or password');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black p-4 transition-colors duration-300">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-spotify-dark p-6 sm:p-10 rounded-xl shadow-2xl border border-black/5 dark:border-white/5 transition-colors duration-300"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-spotify-green rounded-full flex items-center justify-center mb-4 shadow-lg shadow-spotify-green/20">
            <MusicIcon size={32} className="text-black" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-app-text transition-colors">Log in to Spotify</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-spotify-gray">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-spotify-light border border-black/10 dark:border-white/10 rounded-md py-3 px-4 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 outline-none transition-all text-app-text"
              placeholder="Email address"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-spotify-gray">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-spotify-light border border-black/10 dark:border-white/10 rounded-md py-3 px-4 focus:ring-2 focus:ring-black/10 dark:focus:ring-white/20 outline-none transition-all pr-12 text-app-text"
                placeholder="Password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-spotify-gray hover:text-app-text transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100 flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-black/10 dark:border-white/10 text-center">
          <p className="text-spotify-gray text-sm">
            Don't have an account? <span onClick={onSwitchToRegister} className="text-app-text hover:text-spotify-green cursor-pointer underline font-bold transition-colors">Sign up for Spotify</span>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
