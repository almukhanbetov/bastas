'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');

  return (
    <section className="section">
      <div className="container">
        <div className="order-success">
          {orderNumber && (
            <p className="order-success-number">
              Номер заказа:
              <br />
              <strong>{orderNumber}</strong>
            </p>
          )}
          <p>Мы свяжемся с вами для подтверждения расчёта.</p>
          <Link className="btn btn-primary" href="/">
            На главную
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function OrderSuccessPage() {
  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Заказ оформлен</div>
          <h1>Спасибо! Ваш заказ принят.</h1>
        </div>
      </section>
      <Suspense fallback={null}>
        <OrderSuccessContent />
      </Suspense>
    </>
  );
}
