'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { setCustomerToken } from '@/lib/customerAuth';
import PasswordField from '../../components/PasswordField';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/account/';
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        throw new Error(data?.error || 'Не удалось войти');
      }
      setCustomerToken(data.token);
      router.push(next);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="calc-form admin-login-form" onSubmit={handleSubmit}>
      <label className="calc-field">
        <span>Телефон</span>
        <input
          type="tel"
          placeholder="+7 XXX XXX XX XX"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
          autoFocus
        />
      </label>
      <PasswordField label="Пароль" value={password} onChange={setPassword} required />
      {error && <p className="calc-hint calc-hint-warning">{error}</p>}
      <button type="submit" className="btn btn-primary calc-cta" disabled={submitting}>
        {submitting ? 'Вход…' : 'Войти'}
      </button>
      <p className="calc-hint">
        Нет аккаунта?{' '}
        <Link href={`/account/register/?next=${encodeURIComponent(next)}`}>Зарегистрироваться</Link>
      </p>
    </form>
  );
}

export default function AccountLoginPage() {
  return (
    <>
      <section className="page-hero page-hero-compact">
        <div className="container">
          <div className="breadcrumb">Главная / Вход</div>
          <h1>Вход в личный кабинет.</h1>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <Suspense fallback={<p className="calc-hint">Загрузка…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </section>
    </>
  );
}
