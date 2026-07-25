'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getAdminToken, isTokenValid } from '@/lib/adminAuth';

// Клиентская проверка токена — это UX-удобство (не пускаем на страницу с явно
// просроченным/отсутствующим токеном), а не граница безопасности. Реальная защита —
// на backend: каждый /admin/* запрос проверяется JWT-миддлварой независимо от этой проверки.
export function useAdminGuard() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = getAdminToken();
    if (!isTokenValid(token)) {
      router.replace('/admin/login/');
      return;
    }
    setReady(true);
  }, [router]);

  return ready;
}
