import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAERZVfN3aKx868XUmvtHWpz_LGVUnX5cU",
  authDomain: "manomedai-13576.firebaseapp.com",
  projectId: "manomedai-13576",
  storageBucket: "manomedai-13576.appspot.com",
  messagingSenderId: "509581205118",
  appId: "1:509581205118:web:acb929f38457f03ccac22f"
};

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db }; 