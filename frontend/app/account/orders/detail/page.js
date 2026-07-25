'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCustomerGuard } from '../../useCustomerGuard';
import { customerFetch } from '@/lib/customerApi';
import { formatTenge } from '@/lib/formatCurrency';
import { STATUS_LABELS } from '@/lib/orderStatus';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function OrderDetailContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const ready = useCustomerGuard();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!ready || !id) return;
    customerFetch(API_URL, `/api/v1/me/orders/${id}`)
      .then(setOrder)
      .catch((err) => setError(err.message));
  }, [ready, id]);

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
        <span className={`status-badge status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
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

export default function AccountOrderDetailPage() {
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Личный кабинет / Заказ</div>
          <h1>Детали заказа.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Suspense fallback={<p className="calc-hint">Загрузка…</p>}>
            <OrderDetailContent />
          </Suspense>
        </div>
      </section>
    </>
  );
}
