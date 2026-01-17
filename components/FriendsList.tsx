
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, arrayUnion, onSnapshot } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { db } from '../services/firebase';
import { UserProfile } from '../types';

interface FriendsListProps {
  profile: UserProfile;
}

const FriendsList: React.FC<FriendsListProps> = ({ profile }) => {
  const [friendProfiles, setFriendProfiles] = useState<UserProfile[]>([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (profile.friends && profile.friends.length > 0) {
      const q = query(collection(db, 'users'), where('uid', 'in', profile.friends));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const friends: UserProfile[] = [];
        snapshot.forEach((doc) => friends.push(doc.data() as UserProfile));
        setFriendProfiles(friends);
      });
      return () => unsubscribe();
    }
  }, [profile.friends]);

  const addFriend = async () => {
    if (!searchEmail) return;
    setLoading(true);
    setMessage('');
    try {
      const q = query(collection(db, 'users'), where('email', '==', searchEmail));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setMessage('User not found.');
      } else {
        const friendUid = querySnapshot.docs[0].id;
        if (friendUid === profile.uid) {
          setMessage("You can't add yourself.");
        } else if (profile.friends.includes(friendUid)) {
          setMessage("Already friends!");
        } else {
          const userRef = doc(db, 'users', profile.uid);
          await updateDoc(userRef, {
            friends: arrayUnion(friendUid)
          });
          setMessage('Friend added!');
          setSearchEmail('');
        }
      }
    } catch (err) {
      setMessage('Error adding friend.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Friends</h2>

      <div className="flex gap-2">
        <input 
          type="email" 
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          placeholder="Enter friend's email..."
          className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 focus:ring-2 ring-orange-500 outline-none transition-all"
        />
        <button 
          onClick={addFriend}
          disabled={loading}
          className="bg-orange-500 px-6 py-3 rounded-xl font-bold active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : 'Add'}
        </button>
      </div>
      {message && <p className={`text-sm ${message.includes('Error') || message.includes('not') ? 'text-red-400' : 'text-green-400'}`}>{message}</p>}

      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Your Crew</h3>
        {friendProfiles.length === 0 ? (
          <div className="text-center py-10 text-slate-500">
            <i className="fa-solid fa-user-plus text-4xl mb-4 opacity-20"></i>
            <p>Add friends to see their smoking status and motivate each other.</p>
          </div>
        ) : (
          friendProfiles.map((friend) => (
            <div key={friend.uid} className="bg-slate-800/50 border border-slate-700 p-4 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={friend.photoURL || `https://picsum.photos/seed/${friend.uid}/100/100`} className="w-12 h-12 rounded-full border-2 border-orange-500/30" alt={friend.displayName || ''} />
                <div>
                  <div className="font-bold">{friend.displayName}</div>
                  <div className="text-xs text-slate-400">
                    {friend.lastCigTime ? `Last: ${new Date(friend.lastCigTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not smoked yet'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-orange-400">{friend.dailyCount}</div>
                <div className="text-[10px] text-slate-500 font-bold uppercase">Today</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FriendsList;
