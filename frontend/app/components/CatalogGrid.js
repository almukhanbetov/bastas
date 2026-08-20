'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCatalogItemBySlug } from '@/lib/fetchCatalog';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Сетка карточек реальных позиций каталога для SEO-лендингов. Ссылки и подписи
// карточек (label/href) — фиксированная навигация на уже существующие страницы
// (см. lib/landingPages.js), поэтому остаются кликабельными и до подгрузки данных.
// Фото и описание — реальные данные из БД через API; ничего не выдумывается,
// если бэкенд недоступен — просто не показываем фото/описание для карточки.
export default function CatalogGrid({ items }) {
  const [data, setData] = useState({});

  useEffect(() => {
    if (API_URL === undefined) return;
    let cancelled = false;

    Promise.all(
      items.map((item) => {
        const key = `${item.catalogRef.kind}:${item.catalogRef.slug}`;
        return fetchCatalogItemBySlug(API_URL, item.catalogRef.kind, item.catalogRef.slug)
          .then((result) => [key, result])
          .catch(() => [key, undefined]);
      })
    ).then((results) => {
      if (cancelled) return;
      setData(Object.fromEntries(results));
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="projects">
      {items.map((item) => {
        const key = `${item.catalogRef.kind}:${item.catalogRef.slug}`;
        const real = data[key];
        return (
          <Link className="project-card" href={item.href} key={key}>
            {real?.imageUrl ? (
              <img src={real.imageUrl} alt={`${real.name} — BAS TAS`} loading="lazy" />
            ) : (
              <div className="catalog-unavailable catalog-unavailable-card" />
            )}
            <div>
              <h3>{item.label}</h3>
              <p>{real?.description || ''}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
