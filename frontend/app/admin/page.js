'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminGuard } from './useAdminGuard';
import AdminNav from './AdminNav';
import { adminFetch } from '@/lib/adminApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const CARDS = [
  { href: '/admin/orders/', label: 'Заказы', key: 'orders' },
  { href: '/admin/content/', label: 'Контент страниц', key: 'content' },
  { href: '/admin/materials/', label: 'Материалы', key: 'materials' },
  { href: '/admin/catalog/', label: 'Каталог камня', key: 'stones' },
  { href: '/admin/products/', label: 'Виды изделий', key: 'products' },
];

export default function AdminDashboardPage() {
  const ready = useAdminGuard();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;

    Promise.all([
      adminFetch(API_URL, '/api/v1/admin/orders'),
      adminFetch(API_URL, '/api/v1/admin/content'),
      adminFetch(API_URL, '/api/v1/admin/materials'),
      adminFetch(API_URL, '/api/v1/admin/catalog/stones'),
      adminFetch(API_URL, '/api/v1/admin/catalog/products'),
    ])
      .then(([orders, content, materials, stones, products]) => {
        setStats({
          orders: { total: orders.length, new: orders.filter((o) => o.status === 'new').length },
          content: { total: content.length },
          materials: { total: materials.length },
          stones: { total: stones.length },
          products: { total: products.length },
        });
      })
      .catch((err) => setError(err.message));
  }, [ready]);

  if (!ready) return null;

  const statLine = (key) => {
    if (!stats) return '…';
    if (key === 'orders') return `${stats.orders.total} всего, ${stats.orders.new} новых`;
    if (key === 'content') return `${stats.content.total} секций`;
    if (key === 'materials') return `${stats.materials.total} материалов`;
    if (key === 'stones') return `${stats.stones.total} позиций`;
    if (key === 'products') return `${stats.products.total} позиций`;
    return '';
  };

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель</div>
          <h1>Панель управления.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminNav />

          {error && <p className="calc-hint calc-hint-warning">{error}</p>}

          <div className="admin-dashboard-grid">
            {CARDS.map((card) => (
              <Link className="admin-dashboard-card" href={card.href} key={card.key}>
                <span className="admin-dashboard-card-label">{card.label}</span>
                <span className="admin-dashboard-card-stat">{statLine(card.key)}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
