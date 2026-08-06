'use client';

import { useEffect, useState } from 'react';
import { fetchPageContent } from '@/lib/fetchContent';
import { staticContent } from '@/lib/staticContent';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Отдаёт статический фоллбэк сразу (без мигания пустой страницей), затем
// подменяет секции на актуальные из БД, если backend доступен — секция за секцией,
// так что если в базе не хватает какой-то секции, для неё остаётся фоллбэк.
export function usePageContent(page) {
  const [content, setContent] = useState(staticContent[page]);

  useEffect(() => {
    if (API_URL === undefined) return;
    let cancelled = false;

    fetchPageContent(API_URL, page)
      .then((data) => {
        if (!cancelled) setContent({ ...staticContent[page], ...data });
      })
      .catch(() => {
        // backend недоступен — остаёмся на статическом контенте
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  return content;
}
