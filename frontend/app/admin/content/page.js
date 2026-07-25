'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminGuard } from '../useAdminGuard';
import AdminNav from '../AdminNav';
import { adminFetch } from '@/lib/adminApi';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PAGE_LABELS = {
  home: 'Главная',
  about: 'О компании',
  advantages: 'Преимущества',
  contacts: 'Контакты',
};

export default function AdminContentPage() {
  const ready = useAdminGuard();
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    adminFetch(API_URL, '/api/v1/admin/content')
      .then(setSections)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready]);

  if (!ready) return null;

  const byPage = sections.reduce((acc, s) => {
    (acc[s.page] ||= []).push(s);
    return acc;
  }, {});

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель / Контент страниц</div>
          <h1>Контент страниц.</h1>
          <p>Тексты и фото секций главной, «О компании», «Преимуществ» и «Контактов».</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminNav />

          {error && <p className="calc-hint calc-hint-warning">{error}</p>}
          {loading ? (
            <p className="calc-hint">Загрузка…</p>
          ) : (
            Object.entries(byPage).map(([page, items]) => (
              <div key={page} className="admin-order-section">
                <h3>{PAGE_LABELS[page] || page}</h3>
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Секция</th>
                        <th>Заголовок</th>
                        <th>Элементов</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((s) => (
                        <tr key={s.id}>
                          <td>{s.sectionKey}</td>
                          <td>{(s.title || s.body || '—').slice(0, 60)}</td>
                          <td>{Array.isArray(s.items) ? s.items.length : 0}</td>
                          <td className="admin-row-actions">
                            <Link className="cart-item-remove" href={`/admin/content/edit/?id=${s.id}`}>
                              Редактировать
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
