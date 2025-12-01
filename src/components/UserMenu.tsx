'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface UserMenuProps {
  userEmail: string | undefined;
}

export default function UserMenu({ userEmail }: UserMenuProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      router.push('/auth/login');
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      {userEmail && (
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {userEmail}
        </span>
      )}
      <button
        onClick={handleSignOut}
        disabled={loading}
        className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors disabled:opacity-50"
      >
        {loading ? 'Signing out...' : 'Sign out'}
      </button>
    </div>
  );
}

