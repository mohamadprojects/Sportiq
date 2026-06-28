import React, { useState } from 'react';
import { ShieldAlert, CheckCircle2, Copy, Send, ExternalLink, Crown, Sliders, Wallet, Check } from 'lucide-react';
import { User, AdminSettings } from '../types';

const API = 'https://sportiq-7626.onrender.com';

interface SidebarProps {
  currentUser: User | null;
  settings: AdminSettings;
  onUserUpdate: (user: User) => void;
  onOpenAuth: () => void;
  setActiveTab: (tab: 'predict' | 'feed' | 'admin') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentUser, settings, onUserUpdate, onOpenAuth, setActiveTab }) => {
  const [txHash, setTxHash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText(settings.usdtAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) { onOpenAuth(); return; }
    if (!txHash.trim()) return;
    setSubmitting(true);
    setSubmitSuccess('');
    try {
      const res = await fetch(`${API}/api/vip/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.username}` },
        body: JSON.stringify({ txHash })
      });
      const data = await res.json();
      if (res.ok) {
        onUserUpdate(data.user);
        setSubmitSuccess('Payment ID submitted! Awaiting Admin verification.');
        setTxHash('');
      } else {
        alert(data.error || 'Submission failed');
      }
    } catch (err) {
      alert('Could not connect to server');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <aside className="w-full lg:w-72 border-b lg:border-b-0 lg:border-r border-white/10 bg-[#080808] p-6 flex flex-col flex-shrink-0 select-none">
      <div className="flex-1 space-y-6">
        {currentUser?.role === 'admin' ? (
          <div className="p-4 rounded-xl border border-amber-500/40 bg-amber-500/10">
            <div className="text-[10px] uppercase tracking-wider text-amber-400 font-bold mb-1 flex items-center gap-1.5">
              <Crown className="w-3.5 h-3.5" /><span>Admin Privileges</span>
            </div>
            <div className="text-base font-bold text-white">Full Quant Control</div>
            <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">You bypass subscription gates and can manage user VIP approvals.</p>
          </div>
        ) : currentUser?.isApproved ? (
          <div className="p-4 rounded-xl border border-blue-500/40 bg-blue-500/10">
            <div className="text-[10px] uppercase tracking-wider text-blue-400 font-bold mb-1 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" /><span>Access Status</span>
            </div>
            <div className="text-base font-bold text-white">VIP Active</div>
            <p className="text-xs text-blue-200/70 mt-1 leading-relaxed">Unlimited AI Match predictions active{currentUser.approvedUntil ? ` until ${currentUser.approvedUntil}` : ''}.</p>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
            <div className="text-[10px] uppercase tracking-wider text-red-400 font-bold mb-1 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-red-400" /><span>Access Status</span>
            </div>
            <div className="text-lg font-bold text-white">Subscription Required</div>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">
              {currentUser ? currentUser.usdtTxHash ? '⏳ Payment ID submitted! Waiting for admin approval.' : 'Your account is pending admin approval for the AI engine.' : 'Sign in & submit weekly USDT fee to activate AI predict button.'}
            </p>
          </div>
        )}

        <div>
          <label className="text-[10px] uppercase tracking-widest text-gray-500 font-bold block mb-3">Secure Payment Details</label>
          <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-white/5">
              <span className="text-xs text-gray-400">Weekly VIP Pass</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{settings.weeklyFeeUsdt}.00 USDT</span>
            </div>
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 block font-medium">Send USDT (Polygon / ERC20 / BEP20):</span>
              <div className="relative group">
                <div className="bg-black p-2.5 pr-8 rounded-lg text-[10px] font-mono break-all text-blue-400 border border-blue-500/20 leading-tight select-all">{settings.usdtAddress}</div>
                <button type="button" onClick={handleCopy} title="Copy USDT Address" className="absolute right-1.5 top-1.5 p-1 rounded bg-blue-500/20 hover:bg-blue-500/40 text-blue-300 transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              {copied && <span className="text-[10px] text-emerald-400 font-mono">Address copied to clipboard!</span>}
            </div>
            <form onSubmit={handlePaymentSubmit} className="pt-2 space-y-2">
              <input type="text" required value={txHash} onChange={(e) => setTxHash(e.target.value)} placeholder="Paste TX Hash (e.g. 0x82f...)" className="w-full bg-black border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-blue-500" />
              <button type="submit" disabled={submitting || !txHash.trim()} className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 text-white shadow-md shadow-blue-600/20">
                <Send className="w-3 h-3" /><span>{submitting ? 'Submitting...' : 'Submit Payment ID'}</span>
              </button>
            </form>
            {submitSuccess && <div className="text-[11px] text-blue-400 bg-blue-500/10 p-2 rounded font-mono border border-blue-500/20">{submitSuccess}</div>}
          </div>
        </div>

        {currentUser?.role === 'admin' && (
          <div>
            <label className="text-[10px] uppercase tracking-widest text-amber-500/80 font-bold block mb-3">Admin Control Panel</label>
            <div className="space-y-2">
              <button onClick={() => setActiveTab('admin')} className="w-full text-left p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-xs text-amber-300 font-medium flex items-center gap-3 transition-colors">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span><span>Review Pending VIP Users</span>
              </button>
              <button onClick={() => setActiveTab('admin')} className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-gray-300 flex items-center gap-3 transition-colors">
                <Sliders className="w-3.5 h-3.5 text-gray-400" /><span>Engine & AI Prompt Setup</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="pt-6 mt-6 border-t border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-800 to-gray-700 border border-white/20 flex items-center justify-center font-mono font-bold text-white text-sm">
          {currentUser ? currentUser.username.slice(0, 2).toUpperCase() : 'G'}
        </div>
        <div>
          <div className="text-sm font-bold text-white">{currentUser ? currentUser.username : 'Guest Visitor'}</div>
          <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tight">
            {currentUser?.role === 'admin' ? 'Role: Administrator' : currentUser?.isApproved ? 'Tier: VIP Member' : 'Tier: Guest (Unapproved)'}
          </div>
        </div>
      </div>
    </aside>
  );
};
