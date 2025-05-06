import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Only initialize Firebase Admin on the server side
let app;
let auth;

if (typeof window === 'undefined') {
  try {
    const firebaseAdminConfig = {
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    };

    app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0];
    auth = getAuth(app);
  } catch (error) {
    console.error('Firebase Admin initialization error:', error);
  }
}

export { app, auth }; 