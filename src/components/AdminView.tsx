import React, { useState } from 'react';
import { Crown, CheckCircle2, XCircle, Sliders, Save, ShieldCheck, Clock, Users, ExternalLink, RefreshCw, Copy, Check } from 'lucide-react';
import { User, AdminSettings } from '../types';

interface AdminViewProps {
  users: User[];
  settings: AdminSettings;
  onRefreshUsers: () => void;
  onUpdateSettings: (newSettings: Partial<AdminSettings>) => void;
  currentUser: User | null;
}

export const AdminView: React.FC<AdminViewProps> = ({
  users,
  settings,
  onRefreshUsers,
  onUpdateSettings,
  currentUser
}) => {
  const [usdtAddress, setUsdtAddress] = useState(settings.usdtAddress);
  const [weeklyFee, setWeeklyFee] = useState(settings.weeklyFeeUsdt);
  const [aiModel, setAiModel] = useState(settings.aiModel);
  const [systemPrompt, setSystemPrompt] = useState(settings.systemPrompt);
  const [noticeBanner, setNoticeBanner] = useState(settings.noticeBanner);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState('');
  const [togglingId, setTogglingId] = useState<string | null>(null);

  if (currentUser?.role !== 'admin') {
    return (
      <main className="flex-1 p-8 bg-[#050505] flex items-center justify-center">
        <div className="p-8 rounded-2xl bg-red-500/10 border border-red-500/30 text-center max-w-md">
          <Crown className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white uppercase tracking-wider">Access Denied</h2>
          <p className="text-xs text-gray-400 mt-2">Only Super Admin can access the VIP subscription approval dashboard.</p>
        </div>
      </main>
    );
  }

  const handleToggleApprove = async (userId: string, targetState: boolean) => {
    setTogglingId(userId);
    try {
      const res = await fetch('/api/admin/user/toggle-approve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.username}`
        },
        body: JSON.stringify({ userId, isApproved: targetState })
      });
      if (res.ok) {
        onRefreshUsers();
      } else {
        alert('Failed to update user approval status');
      }
    } catch (err) {
      alert('Connection error');
    } finally {
      setTogglingId(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMsg('');
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentUser.username}`
        },
        body: JSON.stringify({
          usdtAddress,
          weeklyFeeUsdt: Number(weeklyFee),
          aiModel,
          systemPrompt,
          noticeBanner
        })
      });
      if (res.ok) {
        onUpdateSettings({
          usdtAddress,
          weeklyFeeUsdt: Number(weeklyFee),
          aiModel,
          systemPrompt,
          noticeBanner
        });
        setSaveMsg('✅ Engine settings saved successfully!');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    } catch (err) {
      alert('Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  const pendingCount = users.filter((u) => u.role !== 'admin' && !u.isApproved).length;
  const approvedCount = users.filter((u) => u.role !== 'admin' && u.isApproved).length;

  return (
    <main className="flex-1 p-6 sm:p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto select-none font-sans">
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        
        {/* Title & Stats */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between pb-4 border-b border-white/10 gap-4">
          <div>
            <div className="flex items-center gap-2 text-amber-400 font-mono text-xs font-bold uppercase tracking-widest mb-1">
              <Crown className="w-4 h-4" />
              <span>Super Administrator Command</span>
            </div>
            <h1 className="text-3xl font-bold text-white tracking-tight">VIP Subscription Approvals</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
              ⏳ {pendingCount} PENDING
            </div>
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
              ✓ {approvedCount} ACTIVE VIPs
            </div>
            <button
              onClick={onRefreshUsers}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
              title="Refresh Users"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SECTION 1: USER APPROVAL TABLE */}
        <div className="border border-white/10 rounded-2xl bg-[#080808] overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-gray-200">
              <Users className="w-4 h-4 text-blue-500" />
              <span>Weekly USDT VIP Verification Gate</span>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">Fee: 5 USDT / week</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-gray-500 font-mono uppercase bg-black/40">
                  <th className="p-4">User</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">USDT Proof (TX Hash)</th>
                  <th className="p-4">Submitted At</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Admin Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] text-blue-400 border border-slate-700">
                        {u.username.slice(0, 2).toUpperCase()}
                      </span>
                      <span>{u.username}</span>
                    </td>
                    
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-slate-300'}`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="p-4 max-w-xs truncate text-blue-400">
                      {u.usdtTxHash ? (
                        <span className="bg-blue-950/40 px-2 py-1 rounded border border-blue-500/30 select-all font-mono text-[11px]" title={u.usdtTxHash}>
                          {u.usdtTxHash}
                        </span>
                      ) : (
                        <span className="text-gray-600 italic">No TX submitted yet</span>
                      )}
                    </td>

                    <td className="p-4 text-gray-500 text-[11px]">
                      {u.submittedAt ? new Date(u.submittedAt).toLocaleTimeString() : '--'}
                    </td>

                    <td className="p-4">
                      {u.role === 'admin' ? (
                        <span className="text-amber-400 font-bold">SUPER ADMIN</span>
                      ) : u.isApproved ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>APPROVED</span>
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>PENDING 5 USDT</span>
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleApprove(u.id, !u.isApproved)}
                          disabled={togglingId === u.id}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                            u.isApproved
                              ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30'
                              : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
                          }`}
                        >
                          {togglingId === u.id
                            ? 'Updating...'
                            : u.isApproved
                            ? 'Revoke Access'
                            : 'Approve 5 USDT VIP'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2: ADVANCED QUANT SETTINGS */}
        <div className="border border-white/10 rounded-2xl bg-[#080808] overflow-hidden shadow-2xl p-6">
          <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-amber-400 mb-6 pb-3 border-b border-white/10">
            <Sliders className="w-5 h-5 text-amber-400" />
            <span>Advanced AI Engine & Subscription Configuration</span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-2">
                  Admin USDT Wallet Address (Polygon / ERC20)
                </label>
                <input
                  type="text"
                  required
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-blue-400 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-2">
                  Weekly Subscription Fee (USDT)
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  max="1000"
                  value={weeklyFee}
                  onChange={(e) => setWeeklyFee(Number(e.target.value))}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-emerald-400 font-mono focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-2">
                  Gemini Vision Model
                </label>
                <select
                  value={aiModel}
                  onChange={(e) => setAiModel(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-amber-400 focus:outline-none"
                >
                  <option value="gemini-3.5-flash">gemini-3.5-flash (Ultra Fast & Vision Quant)</option>
                  <option value="gemini-2.5-pro">gemini-2.5-pro (Deep Tactical Reasoning)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-2">
                  Top Announcement Banner
                </label>
                <input
                  type="text"
                  value={noticeBanner}
                  onChange={(e) => setNoticeBanner(e.target.value)}
                  className="w-full bg-black border border-white/15 rounded-xl px-4 py-2.5 text-xs text-white font-sans focus:border-amber-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-gray-400 font-bold block mb-2">
                AI Quant System Prompt (Match Analysis Rules)
              </label>
              <textarea
                rows={5}
                required
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="w-full bg-black border border-white/15 rounded-xl p-4 text-xs text-gray-300 font-mono leading-relaxed focus:border-amber-400 focus:outline-none"
              />
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-white/10">
              <div>
                {saveMsg && <span className="text-xs text-emerald-400 font-mono font-bold animate-pulse">{saveMsg}</span>}
              </div>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-amber-500/20 transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving Config...' : 'Save Advanced Config'}</span>
              </button>
            </div>

          </form>
        </div>

      </div>
    </main>
  );
};
