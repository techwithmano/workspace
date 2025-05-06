'use client';

import { useAuth } from '@/lib/firebase/auth';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FaHeartbeat } from 'react-icons/fa';
import Link from 'next/link';

export function Navbar() {
  const router = useRouter();
  const { user, logOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await logOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <FaHeartbeat className="text-blue-600 text-2xl" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                ManoMed AI
              </span>
            </div>
          </div>

          <div className="flex items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {user.email}
                </span>
                <Button
                  variant="outline"
                  onClick={handleSignOut}
                  className="text-sm"
                >
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/login')}
                  className="text-sm"
                >
                  Sign In
                </Button>
                <Button
                  onClick={() => router.push('/signup')}
                  className="text-sm"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
} 