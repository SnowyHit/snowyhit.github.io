
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../services/firebase';
import { UserProfile, CigLog } from '../types';

interface HistoryProps {
  profile: UserProfile;
}

const History: React.FC<HistoryProps> = ({ profile }) => {
  const [logs, setLogs] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    const fetchLogs = async () => {
      const logsRef = collection(db, 'logs');
      const q = query(logsRef, where('uid', '==', profile.uid), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const counts: Record<string, number> = {};
      querySnapshot.forEach((doc) => {
        const log = doc.data() as CigLog;
        counts[log.dateStr] = (counts[log.dateStr] || 0) + 1;
      });
      setLogs(counts);
      setLoading(false);
    };
    fetchLogs();
  }, [profile.uid]);

  // Generate last 90 days
  const generateGrid = () => {
    const grid = [];
    for (let i = 89; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = logs[dateStr] || 0;
      grid.push({ date: dateStr, count });
    }
    return grid;
  };

  const getColor = (count: number) => {
    if (count === 0) return 'bg-slate-800';
    if (count < 5) return 'bg-orange-900';
    if (count < 10) return 'bg-orange-700';
    if (count < 15) return 'bg-orange-500';
    return 'bg-orange-300';
  };

  if (loading) return <div className="p-8 text-center text-slate-500 italic">Analyzing history...</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <i className="fa-solid fa-chart-line text-orange-500"></i>
        Smoking History
      </h2>

      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700">
        <div className="flex flex-wrap gap-1 mb-4 justify-center">
          {generateGrid().map((day) => (
            <div
              key={day.date}
              onClick={() => setSelectedDay(day)}
              className={`w-3 h-3 rounded-sm heatmap-cell cursor-pointer ${getColor(day.count)} ${selectedDay?.date === day.date ? 'ring-2 ring-white' : ''}`}
              title={`${day.date}: ${day.count} smoked`}
            ></div>
          ))}
        </div>
        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-bold px-2">
          <span>90 Days Ago</span>
          <span>Today</span>
        </div>
      </div>

      {selectedDay && (
        <div className="bg-orange-500 text-white p-6 rounded-2xl shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-lg">{new Date(selectedDay.date).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            <button onClick={() => setSelectedDay(null)} className="text-white/80 hover:text-white">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
          <div className="text-4xl font-black">{selectedDay.count}</div>
          <p className="opacity-90 mt-1">Total cigarettes smoked on this day.</p>
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Recent Activity</h3>
        {Object.entries(logs).slice(0, 5).map(([date, count]) => (
          <div key={date} className="bg-slate-800/30 p-4 rounded-xl flex justify-between items-center border border-slate-700/50">
            <span>{date}</span>
            <span className="font-bold">{count} smoked</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;
