import React from 'react';
import { ShieldCheck, Zap, Lock, LogOut, User as UserIcon, Crown, Activity, BarChart3, Wallet } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  currentUser: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  activeTab: 'predict' | 'feed' | 'admin';
  setActiveTab: (tab: 'predict' | 'feed' | 'admin') => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentUser, onOpenAuth, onLogout, activeTab, setActiveTab }) => {
  return (
    <nav className="h-auto min-h-16 border-b border-white/10 flex items-center justify-between px-6 sm:px-8 bg-[#0a0a0a] sticky top-0 z-50 select-none py-3">
      
      {/* Left: Brand & Version */}
      <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('predict')}>
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold italic text-white shadow-lg shadow-blue-600/30">S</div>
        <span className="text-xl font-bold tracking-tighter uppercase text-white">Sport<span className="text-blue-500">IQ</span></span>
        <div className="hidden sm:block ml-2 px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400 font-mono tracking-wider">AI v4.2 PRO</div>
      </div>

      {/* Middle: Navigation Tabs */}
      <div className="flex items-center gap-2 sm:gap-6 text-sm font-medium text-gray-400">
        <button onClick={() => setActiveTab('predict')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'predict' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 font-semibold' : 'hover:text-white hover:bg-white/5'}`}>
          <Zap className="w-4 h-4" /><span>Predictions</span>
        </button>
        <button onClick={() => setActiveTab('feed')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'feed' ? 'text-blue-400 bg-blue-500/10 border border-blue-500/20 font-semibold' : 'hover:text-white hover:bg-white/5'}`}>
          <BarChart3 className="w-4 h-4" /><span>Market Feed</span>
        </button>
        {currentUser?.role === 'admin' && (
          <>
            <div className="hidden md:block h-4 w-[1px] bg-white/10 mx-1"></div>
            <button onClick={() => setActiveTab('admin')} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${activeTab === 'admin' ? 'text-amber-400 bg-amber-500/10 border border-amber-500/30 font-semibold' : 'text-amber-300/70 hover:text-amber-300 hover:bg-amber-500/5'}`}>
              <Crown className="w-4 h-4 text-amber-400 animate-pulse" /><span>Admin</span>
            </button>
          </>
        )}
      </div>

      {/* Right: Account */}
      <div className="flex items-center gap-4">
        {currentUser ? (
          <div className="flex items-center gap-3">
            {currentUser.role === 'admin' ? (
              <span className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded text-[10px] font-mono font-bold text-amber-400"><Crown className="w-3 h-3" />ADMIN</span>
            ) : currentUser.isApproved ? (
              <span className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] font-mono font-bold text-blue-400"><ShieldCheck className="w-3 h-3" />VIP ACTIVE</span>
            ) : (
              <span className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/30 rounded text-[10px] font-mono font-bold text-red-400 animate-pulse"><Lock className="w-3 h-3" />VIP PENDING</span>
            )}

            <div className="flex flex-col items-center gap-1 pl-3 border-l border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold text-white uppercase border border-white/20">
                  {currentUser.username.slice(0, 2)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-bold text-gray-200 leading-none">{currentUser.username}</div>
                  <div className="text-[9px] font-mono text-gray-500 uppercase mt-0.5">{currentUser.role === 'admin' ? 'Super Admin' : currentUser.isApproved ? 'Tier: VIP Pro' : 'Tier: Guest'}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1 px-2 py-1 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-lg text-[10px] font-bold text-red-400 transition-colors w-full justify-center"
              >
                <LogOut className="w-3 h-3" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        ) : (
          <button onClick={onOpenAuth} className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
            <Wallet className="w-3.5 h-3.5" /><span>Connect / Sign In</span>
          </button>
        )}
      </div>
    </nav>
  );
};
