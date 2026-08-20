'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchCatalogItemBySlug } from '@/lib/fetchCatalog';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Карточка реальной позиции каталога (камень или вид изделия) для SEO-лендингов.
// Заголовок/текст секции — редакционные (см. lib/landingPages.js) и рендерятся
// сервером всегда; здесь подгружается только сама карточка с бэкенда, без
// статичных заглушек с выдуманными названием/фото — при ошибке честно
// показывается, что ассортимент временно недоступен.
export default function CatalogSpotlight({ kicker, heading, kind, slug, body, href, linkText }) {
  const [item, setItem] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    if (API_URL === undefined) {
      setStatus('error');
      return;
    }
    let cancelled = false;
    fetchCatalogItemBySlug(API_URL, kind, slug)
      .then((data) => {
        if (cancelled) return;
        if (data) {
          setItem(data);
          setStatus('ok');
        } else {
          setStatus('empty');
        }
      })
      .catch(() => {
        if (!cancelled) setStatus('error');
      });
    return () => {
      cancelled = true;
    };
  }, [kind, slug]);

  return (
    <>
      <div className="feature-image">
        {status === 'ok' && item?.imageUrl ? (
          <img src={item.imageUrl} alt={`${item.name} — BAS TAS`} loading="lazy" />
        ) : (
          <div className="catalog-unavailable">Фото уточняйте у BAS TAS</div>
        )}
      </div>
      <div>
        <div className="section-head">
          <div className="section-kicker">{kicker}</div>
          <h2>{heading}</h2>
        </div>
        {status === 'ok' && item && (
          <div className="catalog-caption">{item.tag ? `${item.tag} · ` : ''}{item.name}</div>
        )}
        <p className="landing-text">{body}</p>
        {(status === 'error' || status === 'empty') && (
          <p className="catalog-note">Ассортимент временно недоступен. Свяжитесь с BAS TAS для уточнения наличия.</p>
        )}
        <Link className="text-link" href={href}>{linkText}</Link>
      </div>
    </>
  );
}
