'use client';

import { Suspense, useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAdminGuard } from '../../useAdminGuard';
import AdminNav from '../../AdminNav';
import { adminFetch } from '@/lib/adminApi';
import { formatTenge } from '@/lib/formatCurrency';
import { STATUS_LABELS, STATUS_OPTIONS } from '@/lib/orderStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const ready = useAdminGuard();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const load = useCallback(() => {
    if (!ready || !id) return;
    adminFetch(API_URL, `/api/v1/admin/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [ready, id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleStatusChange = async (e) => {
    const status = e.target.value;
    setUpdating(true);
    setError('');
    try {
      await adminFetch(API_URL, `/api/v1/admin/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (!ready) return null;
  if (!id) return <p className="calc-hint calc-hint-warning">Не указан заказ.</p>;
  if (error) return <p className="calc-hint calc-hint-warning">{error}</p>;
  if (!order) return <p className="calc-hint">Загрузка…</p>;

  return (
    <div className="admin-order-detail">
      <div className="admin-order-head">
        <div>
          <h2>№ {order.orderNumber}</h2>
          <p className="calc-hint">{new Date(order.createdAt).toLocaleString('ru-RU')}</p>
        </div>
        <label className="calc-field admin-status-select">
          <span>Статус</span>
          <select value={order.status} onChange={handleStatusChange} disabled={updating}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="admin-order-section">
        <h3>Клиент</h3>
        <div className="admin-kv">
          <span>Имя</span>
          <b>{order.customerName}</b>
        </div>
        <div className="admin-kv">
          <span>Телефон</span>
          <b>{order.customerPhone}</b>
        </div>
        <div className="admin-kv">
          <span>Email</span>
          <b>{order.customerEmail || '—'}</b>
        </div>
        <div className="admin-kv">
          <span>Город</span>
          <b>{order.city || '—'}</b>
        </div>
        <div className="admin-kv">
          <span>Адрес</span>
          <b>{order.address || '—'}</b>
        </div>
        <div className="admin-kv">
          <span>Комментарий</span>
          <b>{order.comment || '—'}</b>
        </div>
      </div>

      <div className="admin-order-section">
        <h3>Изделия</h3>
        {order.items.map((item, idx) => (
          <div className="cart-item" key={item.id}>
            <div className="cart-item-details">
              <h4>Изделие №{idx + 1}</h4>
              <div className="admin-kv">
                <span>Материал</span>
                <b>{item.materialName}</b>
              </div>
              <div className="admin-kv">
                <span>Тип камня</span>
                <b>{item.stoneType || '—'}</b>
              </div>
              <div className="admin-kv">
                <span>Толщина</span>
                <b>{item.thickness} мм</b>
              </div>
              <div className="admin-kv">
                <span>Площадь</span>
                <b>{item.area} м²</b>
              </div>
              <div className="admin-kv">
                <span>Обработка торца</span>
                <b>{item.edgeType}</b>
              </div>
              <div className="admin-kv">
                <span>Длина обработки</span>
                <b>{item.edgeLength} м</b>
              </div>
              {item.configuration && (
                <>
                  <div className="admin-kv">
                    <span>Вырез под мойку</span>
                    <b>{item.configuration.sinkCutoutCount}</b>
                  </div>
                  <div className="admin-kv">
                    <span>Вырез под варочную панель</span>
                    <b>{item.configuration.hobCutoutCount}</b>
                  </div>
                  <div className="admin-kv">
                    <span>Отверстия</span>
                    <b>{item.configuration.holesCount}</b>
                  </div>
                  <div className="admin-kv">
                    <span>Монтаж</span>
                    <b>{item.configuration.installation ? 'да' : 'нет'}</b>
                  </div>
                  <div className="admin-kv">
                    <span>Доставка</span>
                    <b>{item.configuration.delivery ? 'да' : 'нет'}</b>
                  </div>
                </>
              )}

              <div className="cart-item-breakdown">
                <div className="calc-line">
                  <span>Материал</span>
                  <b>{formatTenge(item.materialCost)}</b>
                </div>
                <div className="calc-line">
                  <span>Распил</span>
                  <b>{formatTenge(item.cuttingCost)}</b>
                </div>
                <div className="calc-line">
                  <span>Фаска</span>
                  <b>{formatTenge(item.edgeCost)}</b>
                </div>
                <div className="calc-line">
                  <span>Дополнительные работы</span>
                  <b>{formatTenge(item.servicesCost)}</b>
                </div>
              </div>
            </div>
            <div className="cart-item-total">
              <span>Итого</span>
              <strong>{formatTenge(item.lineTotal)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="calc-total admin-order-total">
        <span>ОБЩАЯ СУММА ЗАКАЗА</span>
        <strong>{formatTenge(order.totalAmount)}</strong>
      </div>
    </div>
  );
}

export default function AdminOrderDetailPage() {
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Админ-панель / Заказы / Детали</div>
          <h1>Детали заказа.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <AdminNav />
          <Suspense fallback={<p className="calc-hint">Загрузка…</p>}>
            <OrderDetailContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}
