'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '../context/CartContext';
import { createOrder } from '@/lib/ordersApi';
import { formatTenge } from '@/lib/formatCurrency';
import { customerFetch } from '@/lib/customerApi';
import { getCustomerToken, isTokenValid } from '@/lib/customerAuth';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialForm = { name: '', phone: '', email: '', city: '', address: '', comment: '' };

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, clearCart, hydrated } = useCart();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  // Если покупатель уже вошёл в личный кабинет — подставляем его данные
  // и потом привязываем заказ к аккаунту (см. handleSubmit). Гостевой чекаут
  // как был без аккаунта, так и остаётся полностью рабочим.
  useEffect(() => {
    const token = getCustomerToken();
    if (!isTokenValid(token) || !API_URL) return;
    setLoggedIn(true);
    customerFetch(API_URL, '/api/v1/me')
      .then((me) => {
        setForm((prev) => ({ ...prev, name: me.name, phone: me.phone, email: me.email || '' }));
      })
      .catch(() => {});
  }, []);

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.phone.trim()) {
      setError('Укажите имя и телефон.');
      return;
    }
    if (!API_URL) {
      setError('Сервис оформления заказов временно недоступен.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        customer: {
          name: form.name.trim(),
          phone: form.phone.trim(),
          email: form.email.trim(),
          city: form.city.trim(),
          address: form.address.trim(),
          comment: form.comment.trim(),
        },
        items: items.map((item) => ({
          materialId: item.materialId,
          thickness: item.thickness,
          area: item.area,
          edgeType: item.edgeType,
          edgeLength: item.edgeLength,
          sinkCutoutCount: item.sinkCutoutCount,
          hobCutoutCount: item.hobCutoutCount,
          holesCount: item.holesCount,
          installation: item.installation,
          delivery: item.delivery,
          quantity: item.quantity,
        })),
      };

      const order = await createOrder(API_URL, payload, loggedIn ? getCustomerToken() : null);
      clearCart();
      router.push(`/order-success/?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Корзина / Оформление заказа</div>
          <h1>Оформление заказа.</h1>
          <p>Оставьте контакты — мы свяжемся для подтверждения расчёта.</p>
          <p className="calc-hint">
            {loggedIn ? (
              'Заказ появится в вашем личном кабинете.'
            ) : (
              <>
                Есть аккаунт? <Link href="/account/login/">Войдите</Link>, чтобы отслеживать заказ в личном
                кабинете.
              </>
            )}
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {hydrated && items.length === 0 ? (
            <div className="cart-empty">
              <p>Корзина пуста — нечего оформлять.</p>
              <Link className="btn btn-primary" href="/calculator/">
                Перейти к калькулятору
              </Link>
            </div>
          ) : (
            <div className="calc-layout">
              <form className="calc-form" onSubmit={handleSubmit}>
                <div className="calc-row">
                  <label className="calc-field">
                    <span>
                      Имя<span className="calc-required"> *</span>
                    </span>
                    <input type="text" value={form.name} onChange={update('name')} required />
                  </label>
                  <label className="calc-field">
                    <span>
                      Телефон<span className="calc-required"> *</span>
                    </span>
                    <input
                      type="tel"
                      placeholder="+7 XXX XXX XX XX"
                      value={form.phone}
                      onChange={update('phone')}
                      required
                    />
                  </label>
                </div>

                <div className="calc-row">
                  <label className="calc-field">
                    <span>Email</span>
                    <input type="email" value={form.email} onChange={update('email')} />
                  </label>
                  <label className="calc-field">
                    <span>Город</span>
                    <input type="text" value={form.city} onChange={update('city')} />
                  </label>
                </div>

                <label className="calc-field">
                  <span>Адрес</span>
                  <input type="text" value={form.address} onChange={update('address')} />
                </label>

                <label className="calc-field">
                  <span>Комментарий</span>
                  <textarea rows={4} value={form.comment} onChange={update('comment')} />
                </label>

                {error && <p className="calc-hint calc-hint-warning">{error}</p>}

                <button type="submit" className="btn btn-primary calc-cta" disabled={submitting}>
                  {submitting ? 'Отправка…' : 'Отправить заказ'}
                </button>
              </form>

              <aside className="calc-summary">
                <h3>Ваш заказ</h3>
                <div className="calc-summary-lines">
                  {items.map((item) => (
                    <div className="calc-line" key={item.id}>
                      <span>
                        {item.materialName}, {item.area} м² × {item.quantity}
                      </span>
                      <b>{formatTenge(item.totalPrice * item.quantity)}</b>
                    </div>
                  ))}
                </div>
                <div className="calc-total">
                  <span>ИТОГО</span>
                  <strong>{formatTenge(subtotal)}</strong>
                </div>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
