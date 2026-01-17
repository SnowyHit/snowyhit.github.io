
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const firebaseConfig = {
  apiKey: "AIzaSyB5osqWp_LCcVH_RQukV18YYQr2QO1SZ7w",
  authDomain: "cigcounter-6a722.firebaseapp.com",
  projectId: "cigcounter-6a722",
  storageBucket: "cigcounter-6a722.firebasestorage.app",
  messagingSenderId: "849870731940",
  appId: "1:849870731940:web:f821367368433d63648431",
  measurementId: "G-ZKT49P6XN8"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
