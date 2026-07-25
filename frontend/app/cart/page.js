'use client';

import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { formatTenge } from '@/lib/formatCurrency';

function describeServices(item) {
  const parts = [];
  if (item.sinkCutoutCount > 0) parts.push(`вырез под мойку × ${item.sinkCutoutCount}`);
  if (item.hobCutoutCount > 0) parts.push(`вырез под варочную панель × ${item.hobCutoutCount}`);
  if (item.holesCount > 0) parts.push(`отверстия × ${item.holesCount}`);
  if (item.installation) parts.push('монтаж');
  if (item.delivery) parts.push('доставка');
  return parts.length > 0 ? parts.join(', ') : '—';
}

function CartItemCard({ item, onRemove, onQuantityChange }) {
  return (
    <div className="cart-item">
      <div className="cart-item-details">
        <div className="cart-item-row">
          <div>
            <span className="cart-item-label">Материал</span>
            <b>{item.materialName}</b>
          </div>
          <div>
            <span className="cart-item-label">Толщина</span>
            <b>{item.thickness} мм</b>
          </div>
          <div>
            <span className="cart-item-label">Площадь</span>
            <b>{item.area} м²</b>
          </div>
        </div>
        <div className="cart-item-row">
          <div>
            <span className="cart-item-label">Обработка торца</span>
            <b>{item.edgeTypeName}</b>
          </div>
          <div>
            <span className="cart-item-label">Длина обработки</span>
            <b>{item.edgeLength} пог.м</b>
          </div>
          <div>
            <span className="cart-item-label">Дополнительные работы</span>
            <b>{describeServices(item)}</b>
          </div>
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
            <span>Обработка торца</span>
            <b>{formatTenge(item.edgeCost)}</b>
          </div>
          <div className="calc-line">
            <span>Доп. работы</span>
            <b>{formatTenge(item.servicesCost)}</b>
          </div>
        </div>

        <div className="cart-item-footer">
          <label className="cart-item-qty">
            Количество
            <input
              type="number"
              min={1}
              step={1}
              value={item.quantity}
              onChange={(e) => onQuantityChange(item.id, Number(e.target.value))}
            />
          </label>
          <button type="button" className="cart-item-remove" onClick={() => onRemove(item.id)}>
            Удалить
          </button>
        </div>
      </div>

      <div className="cart-item-total">
        <span>Итого изделие</span>
        <strong>{formatTenge(item.totalPrice * item.quantity)}</strong>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { items, removeItem, updateQuantity, subtotal, hydrated } = useCart();

  return (
    <>
      <section className="page-hero">
        <div className="container">
          <div className="breadcrumb">Главная / Корзина</div>
          <h1>Корзина.</h1>
          <p>Проверьте параметры расчёта перед оформлением заказа.</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          {!hydrated ? null : items.length === 0 ? (
            <div className="cart-empty">
              <p>Корзина пуста.</p>
              <Link className="btn btn-primary" href="/calculator/">
                Перейти к калькулятору
              </Link>
            </div>
          ) : (
            <div className="cart-layout">
              <div className="cart-items">
                {items.map((item) => (
                  <CartItemCard
                    key={item.id}
                    item={item}
                    onRemove={removeItem}
                    onQuantityChange={updateQuantity}
                  />
                ))}
              </div>

              <aside className="calc-summary cart-summary">
                <h3>Итого по заказу</h3>
                <div className="calc-total">
                  <span>Сумма</span>
                  <strong>{formatTenge(subtotal)}</strong>
                </div>
                <Link className="btn btn-light calc-cta" href="/checkout/">
                  Оформить заказ
                </Link>
                <Link className="btn btn-outline-light calc-cta" href="/calculator/">
                  Вернуться к калькулятору
                </Link>
              </aside>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
