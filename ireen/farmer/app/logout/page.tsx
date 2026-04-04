'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api-client';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    const logout = async () => {
      try {
        await apiClient.logout();
      } catch {
        // ignore logout failure and still redirect to login
      } finally {
        router.replace('/login');
      }
    };

    logout();
  }, [router]);

  return <div className="p-6 text-muted-foreground">Signing out...</div>;
}
