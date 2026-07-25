'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomerToken, isTokenValid } from '@/lib/customerAuth';

// Клиентская проверка — UX-удобство, не граница безопасности (см. useAdminGuard).
// Реальная защита — backend, каждый /me/* запрос проверяется customer-JWT middleware.
export function useCustomerGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getCustomerToken();
    if (!isTokenValid(token)) {
      router.replace('/account/login/');
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}
