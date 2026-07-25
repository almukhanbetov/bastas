'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { clearAdminToken } from '@/lib/adminAuth';

const LINKS = [
  { href: '/admin/', label: 'Дашборд' },
  { href: '/admin/orders/', label: 'Заказы' },
  { href: '/admin/content/', label: 'Контент страниц' },
  { href: '/admin/materials/', label: 'Материалы' },
  { href: '/admin/catalog/', label: 'Каталог камня' },
  { href: '/admin/products/', label: 'Виды изделий' },
];

function isActive(pathname, href) {
  if (href === '/admin/') return pathname === '/admin/';
  return pathname?.startsWith(href);
}

export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    clearAdminToken();
    router.push('/admin/login/');
  };

  return (
    <div className="admin-nav">
      {LINKS.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={isActive(pathname, link.href) ? 'tab active' : 'tab'}
        >
          {link.label}
        </Link>
      ))}
      <button type="button" className="tab admin-nav-logout" onClick={handleLogout}>
        Выйти
      </button>
    </div>
  );
}
