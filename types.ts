
export interface UserProfile {
  uid: string;
  displayName: string | null;
  photoURL: string | null;
  email: string | null;
  lastCigTime: number | null;
  dailyCount: number;
  friends: string[];
}

export interface CigLog {
  id: string;
  uid: string;
  timestamp: number;
  dateStr: string; // YYYY-MM-DD for easier grouping
}

export interface FriendActivity {
  id: string;
  uid: string;
  displayName: string;
  timestamp: number;
  type: 'SMOKE';
}
