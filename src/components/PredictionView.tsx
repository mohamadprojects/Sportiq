import React, { useState, useRef } from 'react';
import { Upload, Zap, Lock, Sparkles, CheckCircle, AlertTriangle, ChevronRight, BarChart2, TrendingUp, ShieldCheck, HelpCircle } from 'lucide-react';
import { User, PredictionResult, AdminSettings } from '../types';

const API = 'https://sportiq-7626.onrender.com';

interface PredictionViewProps {
  currentUser: User | null;
  settings: AdminSettings;
  onOpenAuth: () => void;
  onNewPrediction: (pred: PredictionResult) => void;
  latestPrediction: PredictionResult | null;
}

export const PredictionView: React.FC<PredictionViewProps> = ({ currentUser, settings, onOpenAuth, onNewPrediction, latestPrediction }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>('image/jpeg');
  const [matchNotes, setMatchNotes] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
  };

  const handleFile = (file: File) => {
    setError('');
    if (!file.type.startsWith('image/')) { setError('Please upload a valid image file (PNG, JPG, WEBP)'); return; }
    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handlePredict = async () => {
    if (!currentUser) { onOpenAuth(); return; }
    if (currentUser.role !== 'admin' && !currentUser.isApproved) {
      setError('VIP Subscription Required! Please send 5 USDT weekly fee to admin address to activate the neural predictor.');
      return;
    }
    if (!selectedImage) { setError('Please upload a match screenshot or photo first.'); return; }
    setError('');
    setAnalyzing(true);
    try {
      const res = await fetch(`${API}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${currentUser.username}` },
        body: JSON.stringify({ imageBase64: selectedImage, mimeType, matchContextNotes: matchNotes })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || data.error || 'Prediction calculation failed');
      onNewPrediction(data.prediction);
    } catch (err: any) {
      setError(err.message || 'AI engine failed to parse match graphics. Try another photo.');
    } finally {
      setAnalyzing(false);
    }
  };

  const canPredict = currentUser && (currentUser.role === 'admin' || currentUser.isApproved);
  const activePred = latestPrediction;

  return (
    <main className="flex-1 p-6 sm:p-8 bg-gradient-to-b from-[#0a0a0a] to-[#050505] overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto flex flex-col h-full">
        {settings.noticeBanner && (
          <div className="mb-6 p-3 rounded-xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-blue-900/30 border border-blue-500/20 text-blue-300 text-xs font-medium flex items-center justify-between shadow-lg">
            <span className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-blue-400 animate-pulse" /><span>{settings.noticeBanner}</span></span>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-2 text-white">AI Match Prediction</h1>
            <p className="text-gray-400 text-sm">Upload live match odds, line-ups, stats, or broadcast scoreboards for instant neural quant analysis.</p>
          </div>
          <div className="sm:text-right flex sm:flex-col items-center sm:items-end justify-between bg-white/5 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-white/10">
            <div className="text-[11px] text-gray-500 uppercase font-bold tracking-widest sm:mb-1">Engine Quant Accuracy</div>
            <div className="text-2xl sm:text-3xl font-mono font-bold text-blue-500 flex items-center gap-1.5"><TrendingUp className="w-5 h-5 text-blue-400" /><span>88.4%</span></div>
          </div>
        </div>
        {error && (
          <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1"><div className="font-bold uppercase tracking-wider text-xs text-red-400 mb-0.5">Prediction Guard Notice</div><div>{error}</div></div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
          <div className="flex flex-col gap-4">
            <div onDragOver={(e) => e.preventDefault()} onDrop={handleDrop} onClick={() => fileInputRef.current?.click()} className={`flex-1 min-h-[260px] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-8 transition-all cursor-pointer group relative overflow-hidden ${selectedImage ? 'border-blue-500/50 bg-blue-500/5' : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.05]'}`}>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
              {selectedImage ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <img src={selectedImage} alt="Uploaded match" className="max-h-56 rounded-xl object-contain shadow-2xl border border-white/10 mb-3" />
                  <div className="text-xs text-blue-400 font-mono bg-black/80 px-3 py-1 rounded-full border border-blue-500/30 flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /><span>Photo loaded • Click to replace</span></div>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"><Upload className="w-8 h-8 text-blue-500" /></div>
                  <p className="text-sm font-medium text-gray-300">Drop match photo here</p>
                  <p className="text-[11px] text-gray-500 mt-1">PNG, JPG, WEBP odds screenshot up to 10MB</p>
                  <button type="button" className="mt-6 px-6 py-2 bg-white/10 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white/20 text-white transition-colors">Browse Files</button>
                </>
              )}
            </div>
            <div>
              <label className="text-[11px] font-mono uppercase text-gray-400 font-bold block mb-1.5">Optional Match Notes / League Info</label>
              <input type="text" value={matchNotes} onChange={(e) => setMatchNotes(e.target.value)} placeholder="e.g., Premier League, Arsenal missing Odegaard due to injury" className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 font-sans" />
            </div>
            <button type="button" onClick={handlePredict} disabled={analyzing || !selectedImage} className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-3 tracking-widest transition-all uppercase shadow-xl ${analyzing ? 'bg-blue-600/50 text-white cursor-wait animate-pulse' : !canPredict ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5' : !selectedImage ? 'bg-gray-800 text-gray-400 cursor-not-allowed border border-white/5' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30 transform active:scale-[0.99]'}`}>
              {analyzing ? (<><Sparkles className="w-5 h-5 animate-spin text-blue-200" /><span>NEURAL QUANT ANALYZING...</span></>) : !canPredict ? (<><Lock className="w-4 h-4 text-amber-400" /><span>START AI PREDICTION (VIP LOCKED)</span></>) : (<><Zap className="w-5 h-5 fill-current" /><span>START AI PREDICTION</span></>)}
            </button>
            <p className="text-[10px] text-center text-gray-500">* Requires Weekly 5 USDT VIP Verification by Administrator</p>
          </div>

          <div className="flex flex-col border border-white/10 rounded-2xl bg-black overflow-hidden shadow-2xl min-h-[460px]">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-blue-500" /><span>AI Output Log</span></span>
              <span className="flex items-center gap-1.5 bg-black px-2.5 py-1 rounded-full border border-white/10">
                <span className={`w-1.5 h-1.5 rounded-full ${analyzing ? 'bg-amber-400 animate-ping' : activePred ? 'bg-emerald-400' : 'bg-blue-500 animate-pulse'}`}></span>
                <span className="text-[10px] font-mono text-gray-300">{analyzing ? 'Processing Matrix' : activePred ? 'Calculated' : 'Awaiting Signal'}</span>
              </span>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
              {analyzing ? (
                <div className="my-auto space-y-6 animate-pulse">
                  <div className="text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mx-auto animate-spin"><Sparkles className="w-8 h-8 text-blue-400" /></div>
                    <div className="text-sm font-mono text-blue-400 font-bold">RUNNING COMPUTER VISION QUANT MODELS...</div>
                    <p className="text-xs text-gray-500">Extracting odds spread, team momentum, and tactical positioning...</p>
                  </div>
                  <div className="space-y-3 pt-6 border-t border-white/5"><div className="h-4 bg-white/10 rounded w-3/4 mx-auto"></div><div className="h-4 bg-white/10 rounded w-1/2 mx-auto"></div></div>
                </div>
              ) : activePred ? (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-start justify-between pb-4 border-b border-white/10 gap-2">
                    <div>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold border border-blue-500/30">{activePred.competition}</span>
                      <h3 className="text-xl font-bold text-white mt-2">{activePred.matchTitle}</h3>
                      <p className="text-xs text-gray-400 mt-1 italic">"{activePred.favoriteReason}"</p>
                    </div>
                    <div className="text-right flex-shrink-0 bg-blue-950/40 border border-blue-500/30 p-3 rounded-xl">
                      <div className="text-[10px] uppercase font-mono text-blue-400">Confidence</div>
                      <div className="text-2xl font-mono font-bold text-emerald-400">{activePred.confidenceScore}%</div>
                      <div className={`text-[9px] font-bold uppercase mt-0.5 ${activePred.riskLevel === 'Low' ? 'text-emerald-400' : activePred.riskLevel === 'Medium' ? 'text-amber-400' : 'text-rose-400'}`}>Risk: {activePred.riskLevel}</div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5 text-xs font-mono">
                      <span className="uppercase text-gray-400 font-bold">1X2 Moneyline Probabilities</span>
                      <span className="text-blue-400">1: {activePred.moneyline.homeWin}% | X: {activePred.moneyline.draw}% | 2: {activePred.moneyline.awayWin}%</span>
                    </div>
                    <div className="h-2.5 bg-white/10 rounded-full overflow-hidden flex shadow-inner">
                      <div style={{ width: `${activePred.moneyline.homeWin}%` }} className="h-full bg-blue-500" />
                      <div style={{ width: `${activePred.moneyline.draw}%` }} className="h-full bg-slate-500 border-l border-r border-black/30" />
                      <div style={{ width: `${activePred.moneyline.awayWin}%` }} className="h-full bg-teal-400" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">BTTS (Both Teams Score)</div>
                      <div className="flex items-baseline justify-between">
                        <span className={`text-lg font-mono font-bold ${activePred.btts.prediction === 'Yes' ? 'text-emerald-400' : 'text-rose-400'}`}>{activePred.btts.prediction}</span>
                        <span className="text-xs font-mono text-gray-400">{activePred.btts.probability}% prob</span>
                      </div>
                    </div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Match Favour</div>
                      <div className="text-base font-mono font-bold text-blue-400 truncate">{activePred.favorite}</div>
                      <div className="text-[10px] text-gray-500">{activePred.overUnder.line}: {activePred.overUnder.prediction}</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-emerald-950/40 border border-blue-500/30">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-widest flex items-center gap-1.5 mb-1"><Zap className="w-3.5 h-3.5 fill-current" /><span>Recommended Value Bet</span></div>
                    <div className="text-sm sm:text-base font-bold text-white font-mono">{activePred.recommendedBet}</div>
                  </div>
                  <div>
                    <div className="text-[10px] uppercase font-mono text-gray-400 font-bold mb-2 tracking-wider">Key Quant Tactical Insights</div>
                    <ul className="space-y-1.5 text-xs text-gray-300">
                      {activePred.keyTacticalAnalysis.map((insight, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/[0.02] p-2 rounded-lg border border-white/5"><ChevronRight className="w-3.5 h-3.5 text-blue-400 flex-shrink-0 mt-0.5" /><span>{insight}</span></li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="my-auto space-y-6">
                  <div>
                    <div className="flex justify-between items-end mb-1 opacity-40"><span className="text-xs font-mono uppercase text-gray-400 font-bold">Moneyline</span><span className="text-sm font-mono text-gray-400">--%</span></div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden"><div className="w-0 h-full bg-blue-500"></div></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 opacity-40">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">BTTS (Yes/No)</div><div className="text-lg font-mono text-gray-400">ANALYZING...</div></div>
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10"><div className="text-[10px] text-gray-500 uppercase font-bold mb-1">Match Favour</div><div className="text-lg font-mono text-gray-400">PENDING...</div></div>
                  </div>
                  <div className="mt-auto"><div className="text-[11px] text-blue-500/70 italic border-t border-white/5 pt-4 text-center">Neural network idling. Ready for visual data input. Upload match photo & click predict to generate real-time probability vectors.</div></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};
