'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_STONES = [
  { id: 'marble', slug: 'marble', name: 'Мрамор', tag: 'Элегантность', imageUrl: 'https://images.unsplash.com/photo-1550053808-52a75a05955d?auto=format&fit=crop&w=1000&q=85' },
  { id: 'granite', slug: 'granite', name: 'Гранит', tag: 'Прочность', imageUrl: 'https://images.unsplash.com/photo-1733085097233-66441dedba94?auto=format&fit=crop&w=1000&q=85' },
  { id: 'travertine', slug: 'travertine', name: 'Травертин', tag: 'Природная фактура', imageUrl: 'https://images.unsplash.com/photo-1669577130208-a0a7cce8584f?auto=format&fit=crop&w=1000&q=85' },
  { id: 'onyx', slug: 'onyx', name: 'Оникс', tag: 'Свет и глубина', imageUrl: 'https://images.unsplash.com/photo-1701251786408-d0320ecaad8d?auto=format&fit=crop&w=1000&q=85' },
  { id: 'quartzite', slug: 'quartzite', name: 'Кварцит', tag: 'Выразительность', imageUrl: 'https://images.unsplash.com/photo-1525468568166-6f2cd17c7ec9?auto=format&fit=crop&w=1000&q=85' },
  { id: 'slabs', slug: 'slabs', name: 'Слэбы', tag: 'Для особых проектов', imageUrl: 'https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?auto=format&fit=crop&w=1000&q=85' },
];

export default function CatalogContent() {
  const [stones, setStones] = useState(FALLBACK_STONES);

  useEffect(() => {
    if (!API_URL) return;
    let cancelled = false;
    fetch(`${API_URL}/api/v1/catalog/stones`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setStones(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Каталог камня</div>
          <h1>Материалы с характером.</h1>
          <p>Подбираем камень под атмосферу пространства, технические требования и ваш бюджет.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="catalog-list">
            {stones.map((stone) => (
              <Link className="stone-card" href="/contacts/" key={stone.id}>
                <img src={stone.imageUrl} alt={stone.name} />
                <div className="stone-info">
                  <span>{stone.tag}</span>
                  <h3>{stone.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
