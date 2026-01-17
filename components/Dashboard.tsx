
import React, { useState, useEffect } from 'react';
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

interface DashboardProps {
  profile: UserProfile;
}

const Dashboard: React.FC<DashboardProps> = ({ profile }) => {
  const [timeSince, setTimeSince] = useState<string>('');
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      if (profile.lastCigTime) {
        const diff = Date.now() - profile.lastCigTime;
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        setTimeSince(`${hours}h ${minutes}m`);
      } else {
        setTimeSince('Never');
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [profile.lastCigTime]);

  const trackCigarette = async () => {
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 500);

    const now = Date.now();
    const today = new Date().toISOString().split('T')[0];

    // Create log entry
    await addDoc(collection(db, 'logs'), {
      uid: profile.uid,
      timestamp: now,
      dateStr: today,
    });

    // Update user profile
    const userRef = doc(db, 'users', profile.uid);
    await updateDoc(userRef, {
      lastCigTime: now,
      dailyCount: profile.dailyCount + 1
    });

    // Create activity for friends
    await addDoc(collection(db, 'activities'), {
      uid: profile.uid,
      displayName: profile.displayName,
      photoURL: profile.photoURL,
      timestamp: now,
      type: 'SMOKE'
    });
  };

  return (
    <div className="space-y-8 py-4">
      {/* Quick Widget In-App */}
      <div className="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Today's Consumption</h3>
            <div className="text-6xl font-black mt-1">{profile.dailyCount}</div>
          </div>
          <div className="text-right">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">Since Last</h3>
            <div className="text-2xl font-bold mt-1 text-orange-400">{timeSince}</div>
          </div>
        </div>

        <button
          onClick={trackCigarette}
          disabled={isAnimating}
          className={`w-full py-6 rounded-2xl flex items-center justify-center gap-3 font-bold text-xl transition-all active:scale-95 ${
            isAnimating 
              ? 'bg-orange-600 scale-95 shadow-inner' 
              : 'bg-orange-500 hover:bg-orange-400 shadow-[0_8px_20px_-5px_rgba(249,115,22,0.4)]'
          }`}
        >
          <i className={`fa-solid fa-fire-smoke ${isAnimating ? 'animate-bounce' : ''}`}></i>
          {isAnimating ? 'Logged!' : 'I Smoked One'}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <i className="fa-solid fa-coins text-yellow-500 mb-2"></i>
          <div className="text-sm text-slate-400">Money Spent</div>
          <div className="text-lg font-bold">${(profile.dailyCount * 0.5).toFixed(2)}</div>
        </div>
        <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700">
          <i className="fa-solid fa-heart-pulse text-red-500 mb-2"></i>
          <div className="text-sm text-slate-400">Life Reduced</div>
          <div className="text-lg font-bold">{profile.dailyCount * 11} min</div>
        </div>
      </div>

      <div className="bg-blue-900/20 border border-blue-800/50 p-4 rounded-2xl flex items-center gap-4">
        <div className="bg-blue-500/20 p-3 rounded-full text-blue-400">
          <i className="fa-solid fa-lightbulb"></i>
        </div>
        <p className="text-sm text-blue-200">
          Try to wait 15 more minutes for your next one to improve heart health.
        </p>
      </div>
    </div>
  );
};

export default Dashboard;
