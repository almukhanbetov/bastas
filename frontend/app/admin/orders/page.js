'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAdminGuard } from '../useAdminGuard';
import AdminNav from '../AdminNav';
import { adminFetch } from '@/lib/adminApi';
import { formatTenge } from '@/lib/formatCurrency';
import { STATUS_LABELS } from '@/lib/orderStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const FILTERS = [
  { value: '', label: 'Все' },
  { value: 'new', label: 'Новые' },
  { value: 'confirmed', label: 'Подтверждённые' },
  { value: 'in_production', label: 'В производстве' },
  { value: 'ready', label: 'Готовые' },
  { value: 'completed', label: 'Завершённые' },
  { value: 'cancelled', label: 'Отменённые' },
];

export default function AdminOrdersPage() {
  const ready = useAdminGuard();
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready) return;
    setLoading(true);
    setError('');
    const query = filter ? `?status=${filter}` : '';
    adminFetch(API_URL, `/api/v1/admin/orders${query}`)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready, filter]);

  if (!ready) return null;

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель / Заказы</div>
          <h1>Заказы.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <AdminNav />
          <div className="admin-filters">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                className={filter === f.value ? 'tab active' : 'tab'}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {error && <p className="calc-hint calc-hint-warning">{error}</p>}

          {loading ? (
            <p className="calc-hint">Загрузка…</p>
          ) : orders.length === 0 ? (
            <p className="calc-hint">Заказов нет.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>№ заказа</th>
                    <th>Дата</th>
                    <th>Клиент</th>
                    <th>Телефон</th>
                    <th>Город</th>
                    <th>Позиций</th>
                    <th>Сумма</th>
                    <th>Статус</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id}>
                      <td>
                        <Link href={`/admin/orders/detail/?id=${o.id}`}>{o.orderNumber}</Link>
                      </td>
                      <td>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
                      <td>{o.customerName}</td>
                      <td>{o.customerPhone}</td>
                      <td>{o.city || '—'}</td>
                      <td>{o.itemsCount}</td>
                      <td>{formatTenge(o.totalAmount)}</td>
                      <td>
                        <span className={`status-badge status-${o.status}`}>
                          {STATUS_LABELS[o.status]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
