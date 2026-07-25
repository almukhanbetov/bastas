'use client';

import { useEffect, useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FALLBACK_PRODUCTS = [
  { id: 'countertops', name: 'Столешницы', description: 'Кухонные и ванные поверхности', imageUrl: 'https://images.unsplash.com/photo-1556912167-f556f1f39fdf?auto=format&fit=crop&w=850&q=85' },
  { id: 'stairs', name: 'Лестницы', description: 'Ступени и лестничные марши', imageUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=850&q=85' },
  { id: 'cladding', name: 'Облицовка стен', description: 'Интерьеры, холлы, санузлы', imageUrl: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=850&q=85' },
  { id: 'facade', name: 'Фасады', description: 'Архитектурная облицовка', imageUrl: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?auto=format&fit=crop&w=850&q=85' },
  { id: 'windowsills', name: 'Подоконники', description: 'Практичные детали интерьера', imageUrl: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=850&q=85' },
  { id: 'mosaic', name: 'Панно и мозаика', description: 'Акцентные поверхности', imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=850&q=85' },
];

export default function ProductsContent() {
  const [products, setProducts] = useState(FALLBACK_PRODUCTS);

  useEffect(() => {
    if (!API_URL) return;
    let cancelled = false;
    fetch(`${API_URL}/api/v1/catalog/products`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled && Array.isArray(data) && data.length > 0) setProducts(data);
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
          <div className="breadcrumb">Главная / Виды изделий</div>
          <h1>Решения из камня<br />для каждого масштаба.</h1>
          <p>От одной столешницы до облицовки фасада. Проектируем и изготавливаем изделия по вашим размерам.</p>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="projects">
            {products.map((p) => (
              <div className="project-card" key={p.id}>
                <img src={p.imageUrl} alt={p.name} />
                <div>
                  <h3>{p.name}</h3>
                  <p>{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
