
import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, limit, onSnapshot, Timestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

interface NotificationCenterProps {
  profile: UserProfile | null;
}

interface ActivityNotification {
  id: string;
  uid: string;
  displayName: string;
  photoURL: string;
  timestamp: number;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ profile }) => {
  const [activeNotification, setActiveNotification] = useState<ActivityNotification | null>(null);

  useEffect(() => {
    if (!profile || !profile.friends || profile.friends.length === 0) return;

    // Listen to activities from friends
    const activitiesRef = collection(db, 'activities');
    const q = query(
      activitiesRef,
      where('uid', 'in', profile.friends),
      orderBy('timestamp', 'desc'),
      limit(1)
    );

    let firstLoad = true;
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (firstLoad) {
        firstLoad = false;
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          // Only notify if it's very recent (within 10 seconds)
          if (Date.now() - data.timestamp < 10000) {
            setActiveNotification({
              id: change.doc.id,
              ...data
            } as ActivityNotification);

            // Auto-hide after 5 seconds
            setTimeout(() => {
              setActiveNotification(null);
            }, 5000);
          }
        }
      });
    });

    return () => unsubscribe();
  }, [profile?.friends]);

  if (!activeNotification) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-[100] animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="bg-slate-800 border-2 border-orange-500 shadow-[0_0_30px_rgba(249,115,22,0.4)] p-4 rounded-2xl flex items-center gap-4">
        <div className="relative">
          <img src={activeNotification.photoURL} className="w-12 h-12 rounded-full ring-2 ring-orange-500" alt="" />
          <div className="absolute -bottom-1 -right-1 bg-orange-500 rounded-full w-5 h-5 flex items-center justify-center border-2 border-slate-800">
            <i className="fa-solid fa-fire-smoke text-[10px] text-white"></i>
          </div>
        </div>
        <div className="flex-1">
          <p className="font-bold text-sm">
            <span className="text-orange-400">{activeNotification.displayName}</span> just smoked a cigarette.
          </p>
          <p className="text-xs text-slate-400">Activity detected just now</p>
        </div>
        <button onClick={() => setActiveNotification(null)} className="text-slate-500 hover:text-white p-2">
          <i className="fa-solid fa-xmark"></i>
        </button>
      </div>
    </div>
  );
};

export default NotificationCenter;
