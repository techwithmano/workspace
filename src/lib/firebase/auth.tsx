'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  AuthError
} from 'firebase/auth';
import { auth } from './config';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { db } from './config';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }): JSX.Element {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Get the ID token
        const idToken = await user.getIdToken();
        
        // Create session cookie
        try {
          const response = await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (!response.ok) {
            throw new Error('Failed to create session');
          }

          // Update user's last login time
          await setDoc(doc(db, 'users', user.uid), {
            lastLogin: new Date().toISOString(),
          }, { merge: true });
        } catch (error) {
          console.error('Error creating session:', error);
          setError('Failed to create session. Please try again.');
        }
      }
      
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setError(error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const clearError = () => setError(null);

  const signUp = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create a user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing up:', authError);
      setError(authError.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update last login
      await setDoc(doc(db, 'users', user.uid), {
        lastLogin: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing in:', authError);
      setError(authError.message);
      throw error;
    }
  };

  const logOut = async () => {
    try {
      setError(null);
      // Clear session cookie
      await fetch('/api/auth/session', {
        method: 'DELETE',
      });
      await signOut(auth);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error signing out:', authError);
      setError(authError.message);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      setError(null);
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const authError = error as AuthError;
      console.error('Error resetting password:', authError);
      setError(authError.message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    logOut,
    resetPassword,
    clearError,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 