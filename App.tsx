
import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { doc, getDoc, setDoc, onSnapshot, collection, query, where, limit, orderBy } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { auth, db, googleProvider } from './services/firebase';
import { UserProfile } from './types';
import Dashboard from './components/Dashboard';
import FriendsList from './components/FriendsList';
import History from './components/History';
import NotificationCenter from './components/NotificationCenter';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'dashboard' | 'friends' | 'history'>('dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        // Sync user profile
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            email: firebaseUser.email,
            lastCigTime: null,
            dailyCount: 0,
            friends: [],
          };
          await setDoc(userRef, newProfile);
          setProfile(newProfile);
        } else {
          // Realtime listener for profile changes
          onSnapshot(userRef, (doc) => {
            setProfile(doc.data() as UserProfile);
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const logout = () => signOut(auth);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-900">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🚬</div>
          <h1 className="text-4xl font-bold text-white mb-2">CigCounter</h1>
          <p className="text-slate-400">Track your habit, connect with friends, quit together.</p>
        </div>
        <button
          onClick={login}
          className="flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-bold shadow-xl hover:bg-slate-100 transition-all active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" className="w-6 h-6" alt="Google" />
          Sign in with Google
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white pb-24">
      <NotificationCenter profile={profile} />
      
      <header className="p-4 flex justify-between items-center border-b border-slate-800 sticky top-0 bg-slate-900/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-600 bg-clip-text text-transparent">CigCounter</span>
        </div>
        <button onClick={logout} className="text-slate-400 hover:text-white transition-colors">
          <i className="fa-solid fa-right-from-bracket"></i>
        </button>
      </header>

      <main className="max-w-md mx-auto p-4">
        {view === 'dashboard' && profile && <Dashboard profile={profile} />}
        {view === 'friends' && profile && <FriendsList profile={profile} />}
        {view === 'history' && profile && <History profile={profile} />}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-slate-800/90 backdrop-blur-lg border-t border-slate-700 flex justify-around items-center p-4 z-50">
        <button 
          onClick={() => setView('dashboard')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-house text-xl"></i>
          <span className="text-xs">Home</span>
        </button>
        <button 
          onClick={() => setView('history')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'history' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-calendar-days text-xl"></i>
          <span className="text-xs">History</span>
        </button>
        <button 
          onClick={() => setView('friends')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'friends' ? 'text-orange-500' : 'text-slate-400'}`}
        >
          <i className="fa-solid fa-users text-xl"></i>
          <span className="text-xs">Friends</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
