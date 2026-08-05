'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ThemeToggle from './ThemeToggle';
import { useCart } from '../context/CartContext';
import { getCustomerToken, isTokenValid } from '@/lib/customerAuth';

const NAV_LINKS = [
  { href: '/', label: 'Главная' },
  { href: '/about/', label: 'О компании' },
  { href: '/catalog/', label: 'Каталог камня' },
  { href: '/products/', label: 'Виды изделий' },
  { href: '/calculator/', label: 'Калькулятор' },
  { href: '/advantages/', label: 'Преимущества' },
  { href: '/contacts/', label: 'Контакты' },
];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { positionsCount } = useCart();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    setLoggedIn(isTokenValid(getCustomerToken()));
  }, [pathname]);

  return (
    <header className="site-header">
      <div className="container nav-wrap">
        <Link className="brand" href="/">
          <img src="/logo.png" alt="BAS TAS" />
        </Link>
        <nav className={open ? 'nav open' : 'nav'}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={pathname === link.href ? 'active' : undefined}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="nav-cta">
          <div className="nav-phones">
            <a className="nav-phone" href="tel:+77014657070">+7 (701) 465 70 70</a>
            <a className="nav-phone" href="tel:+77024369056">+7 (702) 436 90 56</a>
          </div>
          <Link className="btn btn-primary" href="/calculator/">Рассчитать проект</Link>
        </div>
        <Link className="cart-link" href="/cart/" aria-label={`Корзина, ${positionsCount} позиций`}>
          🛒
          {positionsCount > 0 && <span className="cart-badge">{positionsCount}</span>}
        </Link>
        <Link
          className="cart-link"
          href={loggedIn ? '/account/' : '/account/login/'}
          aria-label={loggedIn ? 'Личный кабинет' : 'Войти'}
        >
          👤
        </Link>
        <ThemeToggle />
        <button className="menu-toggle" aria-label="Меню" onClick={() => setOpen((v) => !v)}>
          ☰
        </button>
      </div>
    </header>
  );
}
