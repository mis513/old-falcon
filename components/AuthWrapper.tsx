import React, { useEffect, useState } from 'react';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { auth } from '../firebase';
import { isAllowedUser } from '../allowedUsers';
import Login from './Login';

export default function AuthWrapper({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser && !isAllowedUser(currentUser)) {
        setNotice(`${currentUser.email || 'This account'} is not allowed to use this app. Please sign in with an authorised account.`);
        setUser(null);
        setLoading(false);
        signOut(auth).catch((err) => console.error('Sign-out failed:', err));
        return;
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center">
        <p className="text-gray-600 font-medium">Loading Falcon Overseas...</p>
      </div>
    );
  }

  if (!user) {
    return <Login notice={notice} />;
  }

  return <>{children}</>;
}
