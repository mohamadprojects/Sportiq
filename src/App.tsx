import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PredictionView } from './components/PredictionView';
import { FeedView } from './components/FeedView';
import { AdminView } from './components/AdminView';
import { AuthModal } from './components/AuthModal';
import { User, PredictionResult, AdminSettings } from './types';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'predict' | 'feed' | 'admin'>('predict');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [predictions, setPredictions] = useState<PredictionResult[]>([]);
  const [latestPrediction, setLatestPrediction] = useState<PredictionResult | null>(null);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [settings, setSettings] = useState<AdminSettings>({
    usdtAddress: '0xd9eea15e29b1fa0536af0cb454e47196fd12e495',
    weeklyFeeUsdt: 5,
    aiModel: 'gemini-3.5-flash',
    systemPrompt: 'You are SportiQ AI Quant Coach, an elite, hyper-confident world-class tactical football quant and match predictor. Analyze the uploaded image with absolute authority. Search the live web for verified player injuries, tactical formations, and trending match news. Give definitive recommendations without hesitation.',
    noticeBanner: '⚡ Weekly VIP Access: Send 5 USDT to Admin address for instant approval & unlimited AI Vision predictions.'
  });

  // Initial Data Load
  useEffect(() => {
    fetchData();
    checkExistingSession();
  }, []);

  const fetchData = async () => {
    try {
      // Get settings
      const setRes = await fetch('/api/settings');
      if (setRes.ok) {
        const setData = await setRes.json();
        if (setData.settings) setSettings(setData.settings);
      }

      // Get predictions
      const predRes = await fetch('/api/predictions');
      if (predRes.ok) {
        const predData = await predRes.json();
        if (predData.predictions) {
          setPredictions(predData.predictions);
          if (predData.predictions.length > 0) {
            setLatestPrediction(predData.predictions[0]);
          }
        }
      }
    } catch (err) {
      console.error('Error fetching initial data:', err);
    }
  };

  const checkExistingSession = async () => {
    const savedToken = localStorage.getItem('sportiq_token');
    if (!savedToken) return;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${savedToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data.user);
        if (data.user.role === 'admin') {
          fetchAdminUsers(data.user.username);
        }
      } else {
        localStorage.removeItem('sportiq_token');
      }
    } catch (err) {
      console.error('Session restore error:', err);
    }
  };

  const fetchAdminUsers = async (token?: string) => {
    const t = token || localStorage.getItem('sportiq_token');
    if (!t) return;
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsersList(data.users);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      fetchAdminUsers(user.username);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('sportiq_token');
    setCurrentUser(null);
    if (activeTab === 'admin') setActiveTab('predict');
  };

  const handleNewPrediction = (pred: PredictionResult) => {
    setLatestPrediction(pred);
    setPredictions((prev) => [pred, ...prev]);
  };

  const handleSelectFeedItem = (pred: PredictionResult) => {
    setLatestPrediction(pred);
    setActiveTab('predict');
  };

  return (
    <div className="bg-[#050505] text-gray-100 min-h-screen w-full font-sans flex flex-col overflow-x-hidden selection:bg-blue-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <Navbar
        currentUser={currentUser}
        onOpenAuth={() => setAuthModalOpen(true)}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Layout */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Sidebar: VIP Subscription & Payment Info */}
        <Sidebar
          currentUser={currentUser}
          settings={settings}
          onUserUpdate={(updated) => setCurrentUser(updated)}
          onOpenAuth={() => setAuthModalOpen(true)}
          setActiveTab={setActiveTab}
        />

        {/* Dynamic Center Stage */}
        {activeTab === 'predict' && (
          <PredictionView
            currentUser={currentUser}
            settings={settings}
            onOpenAuth={() => setAuthModalOpen(true)}
            onNewPrediction={handleNewPrediction}
            latestPrediction={latestPrediction}
          />
        )}

        {activeTab === 'feed' && (
          <FeedView
            predictions={predictions}
            onSelectPrediction={handleSelectFeedItem}
          />
        )}

        {activeTab === 'admin' && (
          <AdminView
            users={usersList}
            settings={settings}
            onRefreshUsers={() => fetchAdminUsers()}
            onUpdateSettings={(newSet) => setSettings((prev) => ({ ...prev, ...newSet }))}
            currentUser={currentUser}
          />
        )}

      </div>

      {/* Bottom Status Bar */}
      <footer className="h-8 bg-blue-600 flex items-center justify-between px-6 select-none flex-shrink-0 text-white z-40">
        <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest">
          <span>Market Status: Open</span>
          <span className="hidden sm:inline">Global Servers: Optimal</span>
          <span>Active Predictions: {predictions.length || 1294}</span>
        </div>
        <div className="text-[10px] text-blue-100 font-medium">
          SportIQ Proprietary Engine © 2026
        </div>
      </footer>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />

    </div>
  );
}

