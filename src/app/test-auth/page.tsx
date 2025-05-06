'use client';

import { useAuth } from '@/lib/firebase/auth';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function TestAuth() {
  const { user, logOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
            Authentication Test
          </h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Test your authentication status
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Alert>
            <AlertDescription>
              {user ? (
                <div>
                  <p>Signed in as: {user.email}</p>
                  <Button onClick={handleSignOut} className="mt-4">
                    Sign Out
                  </Button>
                </div>
              ) : (
                <p>Not signed in</p>
              )}
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
} 