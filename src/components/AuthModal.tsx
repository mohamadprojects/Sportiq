import React, { useState } from 'react';
import { Lock, User as UserIcon, Key, ArrowRight, X, ShieldAlert } from 'lucide-react';
import { User } from '../types';

const API = 'https://sportiq-7626.onrender.com';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const endpoint = isLogin ? `${API}/api/auth/login` : `${API}/api/auth/register`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      localStorage.setItem('sportiq_token', data.user.username);
      onSuccess(data.user);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <button onClick={onClose} className="absolute top-5 right-5 p-1 text-gray-500 hover:text-white rounded-lg transition-colors">
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600/10 border border-blue-500/30 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold text-white uppercase tracking-tight">
            {isLogin ? 'Sign Into SportIQ' : 'Create Account'}
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            {isLogin ? 'Access world-class neural match quant prediction engine.' : 'Register to unlock weekly USDT VIP subscription.'}
          </p>
        </div>
        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center gap-3 text-red-400 text-xs">
            <ShieldAlert className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Username</label>
            <div className="relative">
              <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter username" className="w-full bg-[#050505] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1.5">Password</label>
            <div className="relative">
              <Key className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
              <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[#050505] border border-white/10 rounded-xl px-10 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 transition-colors" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 mt-6">
            <span>{loading ? 'Authenticating...' : isLogin ? 'Enter Predictor' : 'Register Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-6 text-center">
          <button type="button" onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-xs text-gray-400 hover:text-blue-400 transition-colors">
            {isLogin ? "Don't have an account? Sign up" : 'Already registered? Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
};
