'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCustomerGuard } from './useCustomerGuard';
import { customerFetch } from '@/lib/customerApi';
import { clearCustomerToken } from '@/lib/customerAuth';
import { formatTenge } from '@/lib/formatCurrency';
import { STATUS_LABELS } from '@/lib/orderStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function AccountPage() {
  const ready = useCustomerGuard();
  const router = useRouter();
  const [customer, setCustomer] = useState(null);
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ready) return;
    Promise.all([customerFetch(API_URL, '/api/v1/me'), customerFetch(API_URL, '/api/v1/me/orders')])
      .then(([me, myOrders]) => {
        setCustomer(me);
        setOrders(myOrders);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [ready]);

  const handleLogout = () => {
    clearCustomerToken();
    router.push('/account/login/');
  };

  if (!ready) return null;

  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Личный кабинет</div>
          <h1>Личный кабинет.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {error && <p className="calc-hint calc-hint-warning">{error}</p>}

          {customer && (
            <div className="admin-order-section">
              <h3>Профиль</h3>
              <div className="admin-kv">
                <span>Имя</span>
                <b>{customer.name}</b>
              </div>
              <div className="admin-kv">
                <span>Телефон</span>
                <b>{customer.phone}</b>
              </div>
              <div className="admin-kv">
                <span>Email</span>
                <b>{customer.email || '—'}</b>
              </div>
              <button type="button" className="cart-item-remove" onClick={handleLogout} style={{ marginTop: 14 }}>
                Выйти
              </button>
            </div>
          )}

          <div className="admin-order-section">
            <h3>Мои заказы</h3>
            {loading ? (
              <p className="calc-hint">Загрузка…</p>
            ) : orders.length === 0 ? (
              <p className="calc-hint">
                Заказов пока нет. <Link href="/calculator/">Рассчитать изделие</Link>
              </p>
            ) : (
              <div className="admin-table-wrap">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>№ заказа</th>
                      <th>Дата</th>
                      <th>Позиций</th>
                      <th>Сумма</th>
                      <th>Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o.id}>
                        <td>
                          <Link href={`/account/orders/detail/?id=${o.id}`}>{o.orderNumber}</Link>
                        </td>
                        <td>{new Date(o.createdAt).toLocaleString('ru-RU')}</td>
                        <td>{o.itemsCount}</td>
                        <td>{formatTenge(o.totalAmount)}</td>
                        <td>
                          <span className={`status-badge status-${o.status}`}>{STATUS_LABELS[o.status]}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
