'use client';

import { createContext, useContext, useEffect, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'bastas-cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  // Читаем localStorage только после монтирования — на сервере/при первом
  // рендере его нет, и это не должно вызывать hydration mismatch.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // повреждённые данные в localStorage — просто начинаем с пустой корзины
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const addItem = (item) => {
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now());
    setItems((prev) => [...prev, { ...item, id }]);
    return id;
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    const safeQty = Math.max(1, Math.round(quantity) || 1);
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: safeQty } : i)));
  };

  const clearCart = () => setItems([]);

  // positionsCount — число позиций (строк) в корзине, для бейджа "Корзина (N)".
  // totalQuantity — суммарное количество изделий с учётом quantity каждой позиции.
  const positionsCount = items.length;
  const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.totalPrice * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        positionsCount,
        totalQuantity,
        subtotal,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
